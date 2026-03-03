#!/usr/bin/env bash
set -euo pipefail

BUCKET=$1
REGION=${2:-us-east-1}

aws s3 sync public/assets/hdr s3://$BUCKET/hdr --acl public-read --cache-control "max-age=31536000,public"
aws s3 sync public/assets/ktx2 s3://$BUCKET/textures --acl public-read --cache-control "max-age=31536000,public"
aws s3 sync public/assets/glb s3://$BUCKET/glb --acl public-read --cache-control "max-age=31536000,public"

# generate manifest (local)
node scripts/generate_manifest.js

aws s3 cp public/assets/manifest.json s3://$BUCKET/manifest/manifest.json --acl public-read --cache-control "max-age=60"

echo "Assets published to s3://$BUCKET"
