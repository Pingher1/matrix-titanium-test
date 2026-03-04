#!/usr/bin/env bash
set -euo pipefail

echo "🏛️ KRONOS (Pepper) Emergency Deployment"
echo "========================================"

# Vault Key Validation
REQUIRED_ENVS=(
    "PEPPER_SMYTHOS_JARVIS"
    "ELEVENLABS_PEPPER_SMYTHOS_JARVIS"
    "PINECONE_API_KEY"
    "PINECONE_ENV"
    "AWS_ACCESS_KEY_ID_KRONOS"
    "AWS_SECRET_ACCESS_KEY_KRONOS"
)

echo "🔑 Checking Vault Keys..."
MISSING=()
for v in "${REQUIRED_ENVS[@]}"; do
    if [ -z "${!v:-}" ]; then
        MISSING+=("$v")
    fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
    echo "❌ Missing Vault Keys: ${MISSING[*]}"
    echo "Fix: Add these to SmythOS Vault with actual values"
    exit 2
fi
echo "✅ All Vault keys present"

# Vector Database Check
echo "🧠 Validating Vector Database..."
python3 - <<PY
import os, json
try:
    import pinecone
    api_key = os.getenv('PINECONE_API_KEY')
    env = os.getenv('PINECONE_ENV')
    pinecone.init(api_key=api_key, environment=env)
    
    index_name = "kronos_pepper_index"
    if index_name in pinecone.list_indexes():
        idx = pinecone.Index(index_name)
        stats = idx.describe_index_stats()
        print(f"✅ Vector DB Ready - Count: {stats.total_vector_count}")
    else:
        pinecone.create_index(name=index_name, dimension=1536)
        print(f"✅ Created index: {index_name}")
        
except Exception as e:
    print(f"❌ Vector DB Error: {e}")
    print("Fix: Check PINECONE_API_KEY and PINECONE_ENV in Vault")
PY

echo "📚 Starting Ingestion..."
python3 ingest.py --index "kronos_pepper_index" --input "../PEPPER_MASTER_SOUL.txt" "../PEPPER_SOUL_SUPPLEMENT.txt"

echo "🎉 Emergency deployment complete!"
