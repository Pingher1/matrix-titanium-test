#!/bin/bash
echo "🌑 EREBUS LAUNCHER: Initializing The Adversary..."
cd erebus || exit
echo "📦 Checking Dependencies..."
npm install
echo "🚀 Igniting Reactor on Port 5174..."
npm run dev
