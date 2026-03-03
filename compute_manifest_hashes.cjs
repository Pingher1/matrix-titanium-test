#!/usr/bin/env node
// compute_manifest_hashes.cjs
// Node (CommonJS) script - create module package and manifest.json with file hashes.
// Usage:
// node compute_manifest_hashes.cjs [--moduleDir /tmp/module-package] [--publicDir ./public]
//
// If no --moduleDir provided, the script will create /tmp/module-package-<timestamp> and copy client/dist server/dist public into it.
//
// Note: run after client & server builds (yarn build).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const os = require('os');

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

function run(cmd) {
    try { return execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim(); }
    catch (e) { return null; }
}

(async function main() {
    const argv = process.argv.slice(2);
    let moduleDirArg = null;
    let publicDir = path.join(process.cwd(), 'public');

    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--moduleDir') { moduleDirArg = argv[i + 1]; i++; }
        if (argv[i] === '--publicDir') { publicDir = argv[i + 1]; i++; }
    }

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultModuleDir = path.join(os.tmpdir(), `module-package-${ts}`);
    const moduleDir = moduleDirArg || defaultModuleDir;

    // Ensure builds exist 
    const clientDist = path.join(process.cwd(), 'client', 'dist');
    const serverDist = path.join(process.cwd(), 'server', 'dist');

    if (!fs.existsSync(clientDist)) {
        console.error('client/dist not found. Run client build first: cd client && yarn build');
        process.exit(2);
    }
    if (!fs.existsSync(serverDist)) {
        console.error('server/dist not found. Run server build first: cd server && yarn build');
        process.exit(2);
    }

    // Copy artifacts into moduleDir 
    console.log('Creating module directory:', moduleDir);
    fs.mkdirSync(moduleDir, { recursive: true });
    copyRecursiveSync(clientDist, path.join(moduleDir, 'client-dist'));
    copyRecursiveSync(serverDist, path.join(moduleDir, 'server-dist'));
    if (fs.existsSync(publicDir)) copyRecursiveSync(publicDir, path.join(moduleDir, 'public'));

    // Walk files and compute sha256 
    const allFiles = walkFiles(moduleDir);
    const assets = [];
    let totalBytes = 0;
    for (const f of allFiles) {
        const rel = path.relative(moduleDir, f).replace(/\\/g, '/');
        const stat = fs.statSync(f);
        const size = stat.size;
        const sha = sha256FileSync(f);
        const ext = path.extname(f);
        const type = inferTypeFromExt(ext);
        assets.push({ path: rel, sha256: sha, size, humanSize: humanSize(size), type });
        totalBytes += size;
    }

    // Create manifest // moduleId and version pulled from root package.json if present 
    let pkg = null;
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
        try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (e) { pkg = null; }
    }
    const gitCommit = run('git rev-parse HEAD') || null;
    const moduleId = (pkg && (pkg.name || pkg.moduleId)) || `kronos.module.${Date.now()}`;
    const version = (pkg && pkg.version) || `0.0.0-${ts}`;

    const manifest = {
        moduleId,
        version,
        title: (pkg && pkg.name) || 'Kronos Module',
        entryPointServer: 'server-dist/index.js',
        entryPointClient: 'client-dist/index.html',
        assetsCount: assets.length,
        assetsSizeBytes: totalBytes,
        assets,
        gitCommit,
        builtAt: new Date().toISOString(),
        author: process.env.USER || process.env.USERNAME || null,
        kronosMetadata: {
            compatibleKronosVersion: ">=1.0.0",
            tags: ["avatar", "story", "kronos"]
        }
    };

    const manifestPath = path.join(moduleDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    console.log('Manifest written to', manifestPath);
    console.log('Assets:', assets.length, 'total size', humanSize(totalBytes));
    console.log('Sample assets:');
    console.log(assets.slice(0, 10).map(a => `${a.path} ${a.humanSize} ${a.sha256}`).join('\n'));
    console.log('\nNow run kronos-publish.js with this moduleDir:', moduleDir);
    process.exit(0);
})();
