#!/usr/bin/env bash
set -eu -o pipefail

SCRIPTDIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPTDIR/.." && pwd)"
LOGDIR="$PROJECT_ROOT/logs"
mkdir -p "$LOGDIR"

if [ -z "${KRONOS_URL:-}" ] || [ -z "${KRONOS_API_KEY:-}" ]; then
  echo "Please set KRONOS_URL and KRONOS_API_KEY in environment."
  exit 2
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TMPMOD="/tmp/module-package-${TIMESTAMP}"
SNAP_TGZ="/tmp/project_snapshot_${TIMESTAMP}.tgz"

echo "Building project and creating snapshot; logs in $LOGDIR"

# 1) Install & build
$SCRIPTDIR/run_and_log.sh "yarn_install" -- bash -lc "cd $PROJECT_ROOT && yarn install"
$SCRIPTDIR/run_and_log.sh "build_client" -- bash -lc "cd $PROJECT_ROOT/client && yarn build"
$SCRIPTDIR/run_and_log.sh "build_server" -- bash -lc "cd $PROJECT_ROOT/server && yarn build"

# 2) Create snapshot using collector script
$SCRIPTDIR/run_and_log.sh "create_snapshot" -- bash -lc "cd $PROJECT_ROOT && ./collect_project_snapshot.sh ."

# 3) Prepare module package
mkdir -p "$TMPMOD"
$SCRIPTDIR/run_and_log.sh "rsync_package" -- bash -lc "rsync -av --progress $PROJECT_ROOT/client/dist $PROJECT_ROOT/server/dist $PROJECT_ROOT/public $PROJECT_ROOT/manifest.json $TMPMOD/"

# 4) Compute checksums
$SCRIPTDIR/run_and_log.sh "compute_checksums" -- bash -lc "cd $TMPMOD && find . -type f -print0 | xargs -0 sha256sum > $LOGDIR/module_checksums_${TIMESTAMP}.txt"

# 5) Publish to Kronos staging/prod (env defines target)
$SCRIPTDIR/run_and_log.sh "publish_kronos" -- node $PROJECT_ROOT/kronos-publish.js "$TMPMOD" "$KRONOS_URL" "$KRONOS_API_KEY"

echo "Publish complete. Artifacts:"
ls -lah "$TMPMOD" | tee -a "$LOGDIR/publish_artifacts_${TIMESTAMP}.log"
echo "Snapshot created earlier; check /tmp for project_snapshot_*.tgz"

# Optionally upload snapshot to S3 if AWS env configured
if [ -n "${AWS_S3_SNAPSHOT_BUCKET:-}" ]; then
  echo "Uploading snapshot to s3://$AWS_S3_SNAPSHOT_BUCKET..."
  aws s3 cp $SNAP_TGZ s3://$AWS_S3_SNAPSHOT_BUCKET/ --acl private
  echo "Uploaded snapshot to s3://$AWS_S3_SNAPSHOT_BUCKET/"
fi
echo "Done. Check logs in $LOGDIR"
exit 0
