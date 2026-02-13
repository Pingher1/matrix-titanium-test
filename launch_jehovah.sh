#!/bin/bash
rm -f ../server_debug.log
echo "Start" > ../server_debug.log
cd server
npm install >> ../server_debug.log 2>&1
node index.js >> ../server_debug.log 2>&1 &
echo "Done" >> ../server_debug.log
