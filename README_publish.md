# Publishing to Kronos

## Overview
The publish pipeline builds the app, uploads built assets to S3, computes SHA256 hashes and sizes, signs the manifest with AWS KMS (if configured), packages the module, then calls `kronos-publish.js` to publish to Kronos. The GitHub Actions workflow automates this with secrets.

## Required GitHub secrets (add these to repo → Settings → Secrets):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., us-west-2)
- `S3_BUCKET` (target S3 bucket)
- `KMS_KEY_ARN` (ARN of the asymmetric KMS signing key) — optional but strongly recommended
- `KRONOS_URL` (Kronos publish endpoint)
- `KRONOS_API_KEY` (publish API key)

## Minimal IAM permissions (CI role / user)
- **S3**: `s3:PutObject`, `s3:GetObject`, `s3:ListBucket` on the S3 bucket prefix you use
- **KMS**: `kms:Sign` (for signing), `kms:Verify` (optional for verify), limited to the KMS key ARN
- **(Optional) CloudFront**: `cloudfront:CreateInvalidation` if you invalidate CDN

## Local quick-run

1) **Build**:
   ```bash
   yarn install
   cd client && yarn build
   cd ../server && yarn build
   cd ..
   ```

2) **Generate & upload manifest + assets to S3 and sign (locally)**:
   ```bash
   export AWS_REGION=us-west-2
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   node ./compute_manifest_hashes_upload.cjs --s3Bucket your-bucket --prefix modules --moduleId my-module-id --version my-version --kmsKeyArn arn:aws:kms:...
   ```

3) **Verify manifest signature**:
   ```bash
   node ./verify_manifest_signature.cjs --s3Bucket your-bucket --manifestKey modules/my-module-id/my-version/manifest.json --sigKey modules/my-module-id/my-version/manifest.sig --kmsKeyArn arn:aws:kms:...
   ```

4) **Publish to Kronos (using staging)**:
   ```bash
   export KRONOS_URL="https://kronos-staging.example.com"
   export KRONOS_API_KEY="STAGING_API_KEY"
   node ./kronos-publish.js /tmp/module-upload-<timestamp> "$KRONOS_URL" "$KRONOS_API_KEY"
   ```

## GitHub Actions
The workflow `publish_with_s3.yml` runs on push to main and on manual dispatch. Add the required secrets in repo settings. After the workflow runs, check the "Artifacts" section on the run to download the module zip and manifest.

## Troubleshooting
- **KMS sign errors**: confirm that the KMS key is an asymmetric signing key and the CI principal has kms:Sign permission on that key.
- **S3 upload errors**: ensure bucket exists, region set, and IAM creds have PutObject rights for the prefix.
- **Large builds or timeout**: increase `timeout-minutes` in workflow. For very large assets, prefer uploading directly from workers instead of in-workflow memory.
- **If kronos-publish.js fails**: inspect the workflow logs and the node output for HTTP status and body.
