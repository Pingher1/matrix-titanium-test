// kronos-publish.js
// Usage: node kronos-publish.js /path/to/module https://kronos.example.com API_KEY
// Requires: npm install archiver axios form-data
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const axios = require('axios');
const FormData = require('form-data');

async function zipFolder(folder, outPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        output.on('close', () => resolve());
        archive.on('error', err => reject(err));
        archive.pipe(output);
        archive.directory(folder, false);
        archive.finalize();
    });
}

async function publishModule(folder, kronosUrl, apiKey) {
    const tmpZip = path.join(require('os').tmpdir(), `module-${Date.now()}.zip`);
    await zipFolder(folder, tmpZip);

    const form = new FormData();
    form.append('module', fs.createReadStream(tmpZip));
    // If manifest exists, include it explicitly 
    const manifestPath = path.join(folder, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        form.append('manifest', fs.createReadStream(manifestPath));
    }

    const headers = {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
    };

    const publishUrl = `${kronosUrl.replace(/\/$/, '')}/api/modules/publish`;
    console.log('Publishing to', publishUrl);
    const resp = await axios.post(publishUrl, form, { headers, maxContentLength: Infinity, maxBodyLength: Infinity, timeout: 120000 });
    if (resp.status >= 200 && resp.status < 300) {
        console.log('Publish success:', resp.data);
        // cleanup 
        fs.unlinkSync(tmpZip);
        return resp.data;
    } else {
        throw new Error(`Publish failed ${resp.status}: ${JSON.stringify(resp.data)}`);
    }
}

async function main() {
    const [, , folder, kronosUrl, apiKey] = process.argv;
    if (!folder || !kronosUrl || !apiKey) {
        console.error('Usage: node kronos-publish.js /path/to/module KRONOS_URL API_KEY');
        process.exit(2);
    }
    if (!fs.existsSync(folder)) {
        console.error('Folder not found:', folder);
        process.exit(2);
    }
    try {
        const result = await publishModule(folder, kronosUrl, apiKey);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error publishing:', err && err.message ? err.message : err);
        process.exit(1);
    }
}

if (require.main === module) main();
