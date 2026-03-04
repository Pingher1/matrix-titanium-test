#!/usr/bin/env python3
"""
KRONOS (Pepper) Emergency Ingestion Script
"""
import os, json, argparse
from pathlib import Path
import openai
import pinecone
import tiktoken
import time

# Use your exact Vault key names
OPENAI_KEY = os.getenv("PEPPER_SMYTHOS_JARVIS")
PINECONE_KEY = os.getenv("PINECONE_API_KEY") 
PINECONE_ENV = os.getenv("PINECONE_ENV")

if not all([OPENAI_KEY, PINECONE_KEY, PINECONE_ENV]):
    raise SystemExit("❌ Missing keys: PEPPER_SMYTHOS_JARVIS, PINECONE_API_KEY, PINECONE_ENV")

openai.api_key = OPENAI_KEY
pinecone.init(api_key=PINECONE_KEY, environment=PINECONE_ENV)
enc = tiktoken.get_encoding("cl100k_base")

def chunk_text(text, chunk_size=1000, overlap=200):
    tokens = enc.encode(text)
    chunks = []
    start = 0
    
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text = enc.decode(chunk_tokens)
        chunks.append((start, end, chunk_text))
        start = end - overlap
    
    return chunks

def process_file(filepath, index_name):
    path = Path(filepath)
    if not path.exists():
        print(f"❌ File missing: {filepath}")
        return None
        
    text = path.read_text()
    chunks = chunk_text(text)
    print(f"📄 {path.name}: {len(chunks)} chunks")
    
    # Create embeddings
    vectors = []
    for i, (start, end, chunk) in enumerate(chunks):
        try:
            resp = openai.Embedding.create(
                input=chunk,
                model="text-embedding-3-large"
            )
            embedding = resp['data'][0]['embedding']
            
            vector_id = f"{path.name}::chunk::{i}"
            metadata = {
                "source": path.name,
                "chunk_index": i,
                "char_range": [start, end]
            }
            vectors.append((vector_id, embedding, metadata))
            time.sleep(0.1)  # Rate limiting
            
        except Exception as e:
            print(f"❌ Embedding error chunk {i}: {e}")
            continue
    
    # Upsert to Pinecone
    if vectors:
        idx = pinecone.Index(index_name)
        idx.upsert(vectors=vectors)
        print(f"✅ Uploaded {len(vectors)} vectors")
    
    return {"file": path.name, "chunks": len(chunks), "vectors": len(vectors)}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", default="kronos_pepper_index")
    parser.add_argument("--input", nargs="+", required=True)
    args = parser.parse_args()
    
    # Ensure index exists
    if args.index not in pinecone.list_indexes():
        pinecone.create_index(name=args.index, dimension=1536)
        print(f"✅ Created index: {args.index}")
    
    results = []
    for filepath in args.input:
        result = process_file(filepath, args.index)
        if result:
            results.append(result)
    
    print(f"\n🎯 Ingestion Summary:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
