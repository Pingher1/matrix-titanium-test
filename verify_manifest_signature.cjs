#!/usr/bin/env node
/* verify_manifest_signature.cjs Usage:
 node verify_manifest_signature.cjs --s3Bucket <bucket> --manifestKey <prefix/module/version/manifest.json> --sigKey <prefix/module/version/manifest.sig> --kmsKeyArn <arn>
 Notes:
 - Requires AWS credentials with s3:GetObject and kms:Verify.
*/
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { KMSClient, VerifyCommand } = require("@aws-sdk/client-kms");

function argMap(argv) {
    const m = {};
    for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) m[argv[i].slice(2)] = argv[i + 1], i++;
    return m;
}

(async () => {
    const args = argMap(process.argv.slice(2));
    const bucket = args.s3Bucket || process.env.S3_BUCKET;
    const manifestKey = args.manifestKey;
    const sigKey = args.sigKey;
    const kmsKeyArn = args.kmsKeyArn || process.env.KMS_KEY_ARN;

    if (!bucket || !manifestKey || !sigKey || !kmsKeyArn) {
        console.error("Usage: --s3Bucket <bucket> --manifestKey <key> --sigKey <key> --kmsKeyArn <arn>");
        process.exit(2);
    }

    const s3 = new S3Client({ region: process.env.AWS_REGION || "us-west-2" });
    const manifestResp = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: manifestKey }));
    const sigResp = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: sigKey }));
    const manifestBuf = await streamToBuffer(manifestResp.Body);
    const sigBuf = await streamToBuffer(sigResp.Body);
    // Compute digest 
    const digest = crypto.createHash("sha256").update(manifestBuf).digest();

    const kms = new KMSClient({ region: process.env.AWS_REGION || "us-west-2" });
    const verifyCmd = new VerifyCommand({
        KeyId: kmsKeyArn,
        Message: digest,
        MessageType: "DIGEST",
        Signature: Buffer.from(sigBuf.toString(), 'base64'),
        SigningAlgorithm: "RSASSA_PSS_SHA_256"
    });
    try {
        const result = await kms.send(verifyCmd);
        console.log("KMS Verify result:", result);
        console.log("Signature valid:", result.SignatureValid);
    } catch (err) {
        console.error("KMS verify failed:", err);
    }
    process.exit(0);

    function streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', c => chunks.push(Buffer.from(c)));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }
})().catch(err => { console.error(err); process.exit(1); });
