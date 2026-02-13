#!/bin/bash
if [ -d "dist" ]; then
    echo "DIST EXISTS" > status.txt
    ls -R dist >> status.txt
else
    echo "DIST MISSING" > status.txt
fi
