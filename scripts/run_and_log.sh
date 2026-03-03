#!/usr/bin/env bash
# run_and_log.sh <short-description> -- <command-to-run...>
# Example: ./run_and_log.sh "build client" -- bash -lc "cd client && yarn build"
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <desc> -- <command...>"
  exit 2
fi

DESC="$1"; shift
if [ "$1" != "--" ]; then
  echo "Missing -- separator"
  exit 2
fi
shift

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOGDIR="./logs"
mkdir -p "$LOGDIR"
LOGFILE="$LOGDIR/$(echo "$DESC" | tr ' /' '__')_${TIMESTAMP}.log"

echo "==== RUN LOG: $DESC" | tee -a "$LOGFILE"
echo "Timestamp: $(date --iso-8601=seconds)" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"
echo "Working dir: $(pwd)" | tee -a "$LOGFILE"
echo "User: $(whoami) Host: $(hostname -f || hostname)" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"
echo "Environment snapshot (redacted):" | tee -a "$LOGFILE"
env | sed -E 's/(AWS|SECRET|KEY|TOKEN|PASS|PASSWORD)[^=]*=.*/\1=<REDACTED>/' | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"

# run the command, capture stdout/stderr and exit code
{
  echo "COMMAND: $*"
  echo "---- OUTPUT ----"
  "$@" 2>&1
  EXIT=$?
  echo "---- END OUTPUT ----"
  echo "EXIT CODE: $EXIT"
  date --iso-8601=seconds
} | tee -a "$LOGFILE"

if [ "${EXIT:-0}" -ne 0 ]; then
  echo "Command failed with exit $EXIT. See $LOGFILE"
  exit $EXIT
fi
echo "Command succeeded. Log: $LOGFILE"
exit 0
