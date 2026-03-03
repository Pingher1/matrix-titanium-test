// scripts/generate_manifest.js
// Node script: scans local public/assets/... and writes a manifest mapping id -> s3 public url

const fs = require('fs');
const path = require('path');

const BUCKET = process.env.AWS_S3_BUCKET || 'YOUR_BUCKET_NAME';
const REGION = process.env.AWS_REGION || 'us-east-1';

function s3url(key) { return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`; }

// build manifest for HDRIs, textures, glbs
const manifest = { hdr: {}, textures: {}, glb: {} };

const hdrDir = path.join(__dirname, '..', 'public', 'assets', 'hdr');
if (fs.existsSync(hdrDir)) {
    fs.readdirSync(hdrDir).forEach(f => {
        manifest.hdr[path.basename(f, path.extname(f))] = s3url(`hdr/${f}`);
    });
}

const texDir = path.join(__dirname, '..', 'public', 'assets', 'ktx2');
if (fs.existsSync(texDir)) {
    fs.readdirSync(texDir).forEach(f => {
        manifest.textures[path.basename(f, path.extname(f))] = s3url(`textures/${f}`);
    });
}

const glbDir = path.join(__dirname, '..', 'public', 'assets', 'glb');
if (fs.existsSync(glbDir)) {
    fs.readdirSync(glbDir).forEach(f => {
        manifest.glb[path.basename(f, path.extname(f))] = s3url(`glb/${f}`);
    });
}

fs.writeFileSync(path.join(__dirname, '..', 'public', 'assets', 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Manifest written to public/assets/manifest.json');
