#!/bin/bash
# KRONOS Cloud Voice Diagnostic Tool
# Run this script to test the /api/transcribe and /api/tts proxies from server.ts

API_URL="http://localhost:8080" # The backend server port

echo "==================================="
echo " KRONOS CLOUD VOICE DIAGNOSTICS"
echo "==================================="

echo -e "\n[1] Testing TTS (Text-to-Speech) Endpoint..."
echo "Sending payload: 'Hello KRONOS, the API bridge is online.'"
curl -s -X POST $API_URL/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello KRONOS, the API bridge is online.","voiceId":"alloy"}' | jq '.'

echo -e "\n-----------------------------------"
echo "[2] Testing STT (Speech-to-Text) Mock Endpoint (Without audio blob)..."
curl -s -X POST $API_URL/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo -e "\n==================================="
echo "If 'status' == 'mock', the server is running on Local Browser Fallbacks."
echo "To activate Cloud Intelligence, add OPENAI_API_KEY and ELEVENLABS_API_KEY to your .env file."
