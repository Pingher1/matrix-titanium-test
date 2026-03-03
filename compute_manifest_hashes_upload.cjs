#!/usr/bin/env node
// compute_manifest_hashes_upload.cjs
// Usage:
// node compute_manifest_hashes_upload.cjs --s3Bucket <bucket> [--prefix <prefix>] [--moduleId <id>] [--version <ver>]
// Requires AWS creds in env (or in CI via configure-aws-credentials).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { KMSClient, SignCommand } = require('@aws-sdk/client-kms');
const { execSync } = require('child_process');

function sha256FileSync(p) {
    const buf = fs.readFileSync(p);
    return crypto.createHash('sha256').update(buf).digest('hex');
}
function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    const units = ['KB', 'MB', 'GB', 'TB'];
    let u = -1;
    do { bytes /= 1024; u++; } while (bytes >= 1024 && u < units.length - 1);
    return bytes.toFixed(2) + ' ' + units[u];
}
function copyRecursiveSync(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const items = fs.readdirSync(src);
        for (const it of items) copyRecursiveSync(path.join(src, it), path.join(dest, it));
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}
function walkFiles(dir) {
    const results = [];
    (function walk(p) {
        const stat = fs.statSync(p);
        if (stat.isDirectory()) {
            const children = fs.readdirSync(p);
            for (const c of children) walk(path.join(p, c));
        } else {
            results.push(p);
        }
    })(dir);
    return results;
}
function inferTypeFromExt(ext) {
    ext = ext.toLowerCase();
    if (['.glb', '.gltf'].includes(ext)) return 'glb';
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return 'image';
    if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return 'audio';
    if (['.html'].includes(ext)) return 'html';
    if (['.js', '.mjs', '.cjs'].includes(ext)) return 'script';
    if (['.css'].includes(ext)) return 'style';
    return 'binary';
}

async function uploadFile(s3, bucket, key, filePath) {
    const body = fs.createReadStream(filePath);
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ACL: 'public-read' }));
    return `https://${bucket}.s3.${process.env.AWS_REGION || 'us-west-2'}.amazonaws.com/${encodeURIComponent(key)}`;
}

function run(cmd) {
    try { return execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim(); }
    catch (e) { return null; }
}

(async function main() {
    const argv = process.argv.slice(2);
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1], i++;
    }
    const s3Bucket = args.s3Bucket || process.env.S3_BUCKET;
    const prefix = (args.prefix || process.env.S3_PREFIX || `modules/${Date.now()}`).replace(/\/+$/, '');
    const moduleId = args.moduleId || (run('git rev-parse --abbrev-ref HEAD') || 'module').replace(/[\/\s]/g, '-');
    const version = args.version || run('git rev-parse --short HEAD') || (`dev-${Date.now()}`);

    if (!s3Bucket) {
        console.error('Missing --s3Bucket or S3_BUCKET env. Provide S3 bucket to upload assets.');
        process.exit(2);
    }

    const clientDist = path.join(process.cwd(), 'client', 'dist');
    const serverDist = path.join(process.cwd(), 'server', 'dist');
    const publicDir = path.join(process.cwd(), 'public');

    if (!fs.existsSync(clientDist)) { console.error('client/dist missing - build client first'); process.exit(2); }
    if (!fs.existsSync(serverDist)) { console.error('server/dist missing - build server first'); process.exit(2); }

    const tmpDir = path.join(os.tmpdir(), `module-upload-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    copyRecursiveSync(clientDist, path.join(tmpDir, 'client-dist'));
    copyRecursiveSync(serverDist, path.join(tmpDir, 'server-dist'));
    if (fs.existsSync(publicDir)) copyRecursiveSync(publicDir, path.join(tmpDir, 'public'));

    const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-west-2' });
    const files = walkFiles(tmpDir);
    const assets = [];
    let totalBytes = 0;

    console.log(`Uploading ${files.length} files to s3://${s3Bucket}/${prefix}/${moduleId}/${version}/ ...`);

    for (const f of files) {
        const rel = path.relative(tmpDir, f).replace(/\\/g, '/');
        const key = `${prefix}/${moduleId}/${version}/${rel}`;
        const url = await uploadFile(s3, s3Bucket, key, f);
        const stat = fs.statSync(f);
        const sha = sha256FileSync(f);
        totalBytes += stat.size;
        const type = inferTypeFromExt(path.extname(f));
        assets.push({ path: rel, url, sha256: sha, size: stat.size, humanSize: humanSize(stat.size), type });
        console.log('uploaded', rel, url);
    }

    const gitCommit = run('git rev-parse HEAD') || null;
    const manifest = {
        moduleId,
        version,
        title: (run('basename $(pwd)') || moduleId),
        entryPointClient: 'client-dist/index.html',
        entryPointServer: 'server-dist/index.js',
        assetsCount: assets.length,
        assetsSizeBytes: totalBytes,
        assets,
        gitCommit,
        builtAt: new Date().toISOString(),
        author: process.env.USER || process.env.USERNAME || null,
        kronosMetadata: { tags: ['avatar', 'story', 'kronos'] }
    };

    const manifestPath = path.join(tmpDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    // Optional: sign manifest with KMS 
    const kmsKeyArn = process.env.KMS_KEY_ARN || args.kmsKeyArn;
    if (kmsKeyArn) {
        console.log('Signing manifest with KMS key:', kmsKeyArn);
        const { KMSClient, SignCommand } = require('@aws-sdk/client-kms');
        const kms = new KMSClient({ region: process.env.AWS_REGION || 'us-west-2' });
        const payload = fs.readFileSync(manifestPath);
        const digest = crypto.createHash('sha256').update(payload).digest();
        // KMS expects base64 for Message when MessageType='RAW'
        const signCmd = new SignCommand({
            KeyId: kmsKeyArn,
            Message: digest,
            MessageType: 'RAW',
            SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256' // ensure key supports this 
        });
        const signResp = await kms.send(signCmd);
        const signature = Buffer.from(signResp.Signature).toString('base64');
        fs.writeFileSync(path.join(tmpDir, 'manifest.sig'), signature, 'utf8');
        // also upload manifest & signature to S3 under same prefix 
        const manifestKey = `${prefix}/${moduleId}/${version}/manifest.json`;
        await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: manifestKey, Body: fs.createReadStream(manifestPath), ACL: 'public-read' }));
        const sigKey = `${prefix}/${moduleId}/${version}/manifest.sig`;
        await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: sigKey, Body: signature, ACL: 'public-read' }));
        console.log('Manifest and signature uploaded to S3.');
    } else {
        console.log('KMS_KEY_ARN not provided; skipping manifest signing.');
    }

    console.log('Module package prepared in', tmpDir);
    console.log('manifest path:', manifestPath);
    console.log('Assets uploaded:', assets.length, 'Total size:', humanSize(totalBytes));
    process.exit(0);
})();
