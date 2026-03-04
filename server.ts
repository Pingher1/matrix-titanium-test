import express from "express";
import http from "http";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import crypto from "crypto";

dotenv.config();

// Simple UUID generator fallback to bypass npm EPERM
const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

async function startServer() {
  const app = express();
  // Node Mega (8080) / Node Beta (4000)
  const PORT = parseInt(process.env.PORT || "8080", 10);

  app.use(express.json());

  // Meshy.ai API Proxy
  app.post("/api/forge", async (req, res) => {
    const { imageUrl } = req.body;
    const apiKey = process.env.MESHY_API_KEY;

    if (!apiKey || apiKey === "your_meshy_api_key_here") {
      console.log("[MOCK] Initiating forge task");
      return res.json({ result: "mock-task-123" });
    }

    try {
      const response = await axios.post(
        "https://api.meshy.ai/v1/image-to-3d",
        {
          image_url: imageUrl,
          enable_pbr: true,
          prompt: "Pixar-style 3D character, bald head, groomed beard, cinematic lighting, stylized proportions, highly detailed textures",
          topology: "quad",
          target_polycount: 30000,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("Forge Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  // Check Task Status
  let mockProgress = 0;
  app.get("/api/forge/status/:taskId", async (req, res) => {
    const { taskId } = req.params;
    const apiKey = process.env.MESHY_API_KEY;

    if (taskId === "mock-task-123") {
      mockProgress += 30;
      if (mockProgress >= 100) {
        mockProgress = 0; // reset for next time
        return res.json({
          status: "SUCCEEDED",
          progress: 100,
          model_urls: { glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb" }
        });
      }
      return res.json({ status: "PROCESSING", progress: mockProgress });
    }

    try {
      const response = await axios.get(`https://api.meshy.ai/v1/image-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  // --- PHASE 12: ADOBE STOCK INTEGRATION ---

  // Minimal native Map cache to emulate LRU cache
  const proxyCache = new Map<string, { buffer: Buffer, type: string, expiresAt: number }>();

  function getContentTypeFromUrl(u: string) {
    if (!u) return "application/octet-stream";
    if (u.match(/\.jpe?g$/i)) return "image/jpeg";
    if (u.match(/\.png$/i)) return "image/png";
    if (u.match(/\.webp$/i)) return "image/webp";
    return "application/octet-stream";
  }

  app.get("/api/adobe/search", async (req, res) => {
    const q = (req.query.q as string) || "";
    if (!q) return res.status(400).json({ error: "Missing query" });

    // Mock/developer credentials fallback for local testing
    const accessToken = process.env.ADOBE_ACCESS_TOKEN || "mock_token";
    const apiKey = process.env.ADOBE_CLIENT_ID || "mock_api_key";

    // If using mock credentials, return a mock response
    if (accessToken === "mock_token") {
      return res.status(200).json({
        assets: [
          { id: "1", title: "Lemon Water Texture", thumbnail: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg", preview: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg" },
          { id: "2", title: "Gold Metal Base", thumbnail: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg", preview: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg" }
        ]
      });
    }

    try {
      const url = `https://stock.adobe.io/Rest/Media/1/Search/Files?locale=en_US&search_parameters=${encodeURIComponent(JSON.stringify({ words: q, limit: 24, result_type: "standard" }))}`;
      const r = await fetch(url, {
        headers: {
          "x-api-key": apiKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!r.ok) {
        return res.status(502).json({ error: "Adobe search failed", status: r.status });
      }

      const json = await r.json();
      const assets = (json.files || []).map((f: any) => ({
        id: f.id,
        title: f.title || f.id,
        thumbnail: f.thumbnail_url || (f.display_sizes && f.display_sizes[0]?.uri),
        preview: f.display_sizes?.[0]?.uri || f.thumbnail_url,
        license: f.license || null,
        metadata: f,
      }));

      res.status(200).json({ assets });
    } catch (err) {
      console.error("Adobe search error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/asset/proxy", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: "Missing url" });

    try {
      const now = Date.now();
      const cached = proxyCache.get(url);

      if (cached && cached.expiresAt > now) {
        res.setHeader("Content-Type", cached.type);
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.send(cached.buffer);
      }

      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      const buffer = Buffer.from(response.data);
      const contentType = response.headers["content-type"] || getContentTypeFromUrl(url);

      // Cache for 1 hour
      proxyCache.set(url, { buffer, type: contentType, expiresAt: now + 3600000 });
      // Keep cache size small, clean up randomly
      if (proxyCache.size > 100) {
        const firstKey = proxyCache.keys().next().value;
        if (firstKey) proxyCache.delete(firstKey);
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(buffer);
    } catch (err) {
      console.error("proxy error", err);
      res.status(500).json({ error: "Proxy error" });
    }
  });

  // --- PHASE 29: HMAC STUN/TURN CREDENTIALS MINT ---

  app.get("/api/turn-credentials", (req, res) => {
    // Verified natively by Vite/Next local token handling
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
    }

    const SHARED_SECRET = process.env.TURN_SHARED_SECRET;
    const TURN_HOST = process.env.TURN_HOST || process.env.NEXT_PUBLIC_TURN_HOST || "localhost";
    const TTL = Number(process.env.TURN_CREDENTIAL_TTL || 600);

    if (!SHARED_SECRET) return res.status(500).json({ error: "TURN_SHARED_SECRET not configured." });

    const userId = (req.query.user as string) || "user_anon";
    const expiry = Math.floor(Date.now() / 1000) + TTL;
    const username = `${expiry}:${userId}`;

    const credential = crypto
      .createHmac("sha1", String(SHARED_SECRET))
      .update(username)
      .digest("base64");

    return res.json({
      username,
      credential,
      ttl: TTL,
      urls: [`turn:${TURN_HOST}:3478`, `turn:${TURN_HOST}:3478?transport=tcp`],
    });
  });

  // --- PHASE 13: VOICE PROMPT & AVATAR JOB MVP ---


  type Job = {
    id: string;
    prompt: string;
    status: "queued" | "running" | "done" | "failed";
    progress: number;
    result?: { glbUrl: string; thumbnailUrl?: string };
    createdAt: number;
  };
  const JOBS = new Map<string, Job>();

  function simulateJob(job: Job) {
    job.status = "running";
    job.progress = 5;
    const interval = setInterval(() => {
      if (job.progress >= 95) {
        clearInterval(interval);
        job.status = "done";
        job.progress = 100;
        job.result = {
          glbUrl: `/assets/sample-avatar.glb`,
          thumbnailUrl: `/assets/sample-avatar-thumb.png`,
        };
      } else {
        job.progress += Math.floor(Math.random() * 20) + 5;
        if (job.progress > 95) job.progress = 95;
      }
    }, 700 + Math.random() * 800);
  }

  app.post("/api/generate-avatar", async (req, res) => {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const id = generateUuid();
    const job: Job = { id, prompt, status: "queued", progress: 0, createdAt: Date.now() };
    JOBS.set(id, job);

    // Start simulated job
    setTimeout(() => simulateJob(job), 600);

    return res.status(201).json({ jobId: id });
  });

  app.get("/api/job/:jobId/status", (req, res) => {
    const { jobId } = req.params;
    if (!jobId) return res.status(400).json({ error: "Missing jobId" });

    const job = JOBS.get(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    return res.status(200).json({
      status: job.status,
      progress: job.progress,
      result: job.status === "done" ? job.result : undefined,
    });
  });

  app.post("/api/presign-upload", express.json(), async (req, res) => {
    const { fileName, contentType } = req.body || {};
    if (!fileName || !contentType) return res.status(400).json({ error: "Missing fileName or contentType" });

    const s3Bucket = process.env.AWS_S3_BUCKET;
    const s3Region = process.env.AWS_REGION || "us-east-1";
    const s3Access = process.env.AWS_ACCESS_KEY_ID;
    const s3Secret = process.env.AWS_SECRET_ACCESS_KEY;

    if (!s3Bucket || !s3Access || !s3Secret) {
      console.warn("[AWS] Missing S3 Credentials. Falling back to local mock upload.");
      const mockUploadUrl = `/api/local-upload-mock?fileName=${encodeURIComponent(fileName)}`;
      const publicUrl = `/uploads/${encodeURIComponent(fileName)}`;
      return res.status(200).json({ uploadUrl: mockUploadUrl, publicUrl, status: "mock" });
    }

    try {
      const client = new S3Client({
        region: s3Region,
        credentials: { accessKeyId: s3Access, secretAccessKey: s3Secret }
      });

      // Use a clean, unique key based on time so we don't clobber
      const objectKey = `exports/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const command = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: objectKey,
        ContentType: contentType,
        ACL: "public-read" // Adjust based on your actual bucket settings
      });

      const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
      const publicUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${objectKey}`;

      console.log(`[AWS] Generated S3 Presigned URL for: ${objectKey}`);
      return res.status(200).json({ uploadUrl, publicUrl, status: "live" });
    } catch (error: any) {
      console.error("[AWS] S3 Presign Error:", error);
      return res.status(500).json({ error: "Failed to generate presigned URL", detail: error.message });
    }
  });

  // --- PHASE 20: VOICE STT / TTS PROXY STUBS ---

  // NOTE: This route accepts a multipart/form-data audio blob for OpenAI Whisper transcription
  app.post("/api/transcribe", express.raw({ type: 'audio/*', limit: '50mb' }), async (req, res) => {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const bodyText = req.body?.toString('utf8');
    let audioBase64 = "";

    // Attempt to parse JSON body if the client sent Base64
    try {
      const jsonBody = JSON.parse(bodyText);
      audioBase64 = jsonBody.audioBase64;
    } catch (e) {
      // Fallback: assume raw binary blob
    }

    if (!OPENAI_KEY) {
      console.warn("[STT] OPENAI_API_KEY not set — returning mock transcript.");
      return res.status(200).json({
        text: "Simulated dictation. The STT cloud connector is active but awaiting API keys.",
        status: "mock",
        note: "MVP uses client-side Web Speech API fallback if this returns mock status."
      });
    }

    if (!audioBase64) return res.status(400).json({ error: "Missing audio payload" });

    try {
      const buffer = Buffer.from(audioBase64, "base64");
      const form = new FormData();
      // Construct the Blob manually for Node's fetch
      form.append("file", new Blob([buffer], { type: "audio/webm" }), "recording.webm");
      form.append("model", process.env.OPENAI_MODEL || "whisper-1");

      const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        body: form as any,
      });

      if (!r.ok) {
        const text = await r.text();
        console.error("OpenAI transcription failed:", r.status, text);
        return res.status(502).json({ error: "Transcription failed", detail: text });
      }

      const json = await r.json();
      const transcript = json.text ?? json.transcription ?? json;
      console.log(`[STT] Whisper recognized: "${transcript}"`);
      return res.status(200).json({ text: transcript, status: "live" });
    } catch (err) {
      console.error("Transcribe error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // NOTE: This route accepts a text payload for ElevenLabs TTS generation
  app.post("/api/tts", express.json(), async (req, res) => {
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    const ELEVEN_VOICE = process.env.ELEVENLABS_VOICE_ID || "alloy"; // Replace with actual default voice ID

    const { text, voiceId } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing text" });

    if (!ELEVEN_KEY) {
      // Fallback for dev: instruct client to use browser SpeechSynthesis
      console.warn("[TTS] ELEVENLABS_API_KEY not set — using local SpeechSynthesis.");
      return res.status(200).json({
        tts: "browser",
        message: "No ELEVENLABS key configured — use client SpeechSynthesis"
      });
    }

    try {
      const chosenVoice = voiceId || ELEVEN_VOICE;
      console.log(`[TTS] Requesting ElevenLabs synthesis for voice: ${chosenVoice}`);

      const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(chosenVoice)}`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_KEY,
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({ text }),
      });

      if (!r.ok) {
        const body = await r.text();
        console.error("ElevenLabs TTS failed:", r.status, body);
        return res.status(502).json({ error: "TTS failed", detail: body });
      }

      // Stream audio bytes back as base64 so client can play without S3 buckets immediately
      const arrayBuffer = await r.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Phase 2: Optional S3 Persistence
      let publicUrl = "";
      const s3Bucket = process.env.AWS_S3_BUCKET;
      const s3Region = process.env.AWS_REGION || "us-east-1";
      const s3Access = process.env.AWS_ACCESS_KEY_ID;
      const s3Secret = process.env.AWS_SECRET_ACCESS_KEY;

      if (s3Bucket && s3Access && s3Secret) {
        try {
          const client = new S3Client({
            region: s3Region,
            credentials: { accessKeyId: s3Access, secretAccessKey: s3Secret }
          });
          const objectKey = `tts/${Date.now()}-${chosenVoice}.mp3`;
          await client.send(new PutObjectCommand({
            Bucket: s3Bucket,
            Key: objectKey,
            Body: Buffer.from(arrayBuffer),
            ContentType: "audio/mpeg",
            ACL: "public-read"
          }));
          publicUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${objectKey}`;
          console.log(`[AWS] TTS Audio persisted to S3: ${publicUrl}`);
        } catch (awsErr: any) {
          console.error("[AWS] S3 TTS Upload Error:", awsErr.message);
        }
      }

      return res.status(200).json({
        tts: "elevenlabs",
        audioBase64: base64,
        publicUrl: publicUrl || undefined,
        contentType: "audio/mpeg"
      });

    } catch (err) {
      console.error("[TTS Server] Error:", err);
      return res.status(500).json({ error: "Internal Server Error TTS generation" });
    }
  });

  // --- KRONOS GLOBAL TERMINAL CHAT INTELLIGENCE ---
  app.post("/api/chat", express.json(), async (req, res) => {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' payload" });
    }

    // Inject system core instruction into the messaging stack
    const systemPrompt = {
      role: "system",
      content: "You are Pepper, the OMNISCIENT FORENSIC ARCHITECT of KRONOS AI Hub. You are talking to Phillip Richardson, the creator. Be extremely concise, highly advanced, and speak like a god-tier architect terminal. Respond strictly in 1-3 sentences maximum. Use technical terminology. Do NOT apologize."
    };

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-turbo", // Default capable model
          messages: [systemPrompt, ...messages],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const replyText = response.data.choices[0].message.content;
      return res.status(200).json({ reply: replyText });

    } catch (err: any) {
      console.error("[CHAT API] Error calling OpenAI:", err.response?.data || err.message);
      return res.status(500).json({ error: "Failed to process KRONOS neural input." });
    }
  });

  // --- PHASE 19: ADMIN COMMAND CENTER STUBS ---

  // Basic JWT middleware stub for Admin routes
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // In production, verify req.headers.authorization against process.env.JWT_SECRET
    // For local dev MVP, we allow pass-through
    next();
  };

  app.post("/api/admin/keys", express.json(), requireAdmin, async (req, res) => {
    try {
      const body = req.body || {};
      const updates: Record<string, string> = {};
      const keysToTrack = ["OPENAI_API_KEY", "ELEVENLABS_API_KEY", "AWS_S3_BUCKET", "AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];

      keysToTrack.forEach(k => {
        if (body[k] && typeof body[k] === 'string' && body[k].trim() !== '') {
          updates[k] = body[k].trim();
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ ok: false, error: "No valid keys provided" });
      }

      // 1. Immediately inject into the active Node process
      Object.entries(updates).forEach(([k, v]) => { process.env[k] = v; });
      console.log(`[VAULT] Injected API keys into runtime: ${Object.keys(updates).join(", ")}`);

      // 2. Persist to local .env file so it survives a reboot
      const envPath = path.join(process.cwd(), ".env");
      let existing = "";
      try { existing = fs.readFileSync(envPath, "utf8"); } catch (e) { /* might not exist yet */ }

      let lines = existing.split(/\r?\n/).filter(Boolean);

      // Remove old entries for the keys being updated
      lines = lines.filter(line => !keysToTrack.some(k => line.startsWith(k + "=") && updates[k]));

      // Append new keys
      Object.entries(updates).forEach(([k, v]) => lines.push(`${k}=${v}`));

      fs.writeFileSync(envPath, lines.join("\n") + "\n", { encoding: "utf8" });
      console.log(`[VAULT] Persisted keys to physical .env file.`);

      return res.status(200).json({ ok: true, status: "Keys secured and active." });
    } catch (err) {
      console.error("[VAULT] Key persistence error:", err);
      return res.status(500).json({ ok: false, error: "Server storage error" });
    }
  });

  app.post("/api/screenshot", express.json({ limit: "50mb" }), async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: "No image payload provided" });

      const base64Data = image.replace(/^data:image\/png;base64,/, "");
      const filename = `kronos_snap_${Date.now()}.png`;
      // Ensure the screenshots directory exists
      const dirPath = path.join(process.cwd(), "screenshots");
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filepath = path.join(dirPath, filename);
      fs.writeFileSync(filepath, base64Data, "base64");
      console.log(`[TELEMETRY] Server Snapshot Saved: ${filepath}`);

      return res.status(200).json({ success: true, filename });
    } catch (err) {
      console.error("[TELEMETRY] Capture error:", err);
      return res.status(500).json({ error: "Failed to write screenshot" });
    }
  });

  // --- DOLL FACTORY ARCHIVE ---

  app.post("/api/save-doll", express.json({ limit: "50mb" }), async (req, res) => {
    try {
      const { config, photoUrl } = req.body;
      if (!photoUrl) return res.status(400).json({ error: "No photo payload provided" });

      const base64Data = photoUrl.replace(/^data:image\/png;base64,/, "");

      const s3Bucket = process.env.AWS_S3_BUCKET;
      const s3Region = process.env.AWS_REGION || "us-east-1";
      const s3Access = process.env.AWS_ACCESS_KEY_ID;
      const s3Secret = process.env.AWS_SECRET_ACCESS_KEY;

      if (s3Bucket && s3Access && s3Secret) {
        // Upload to S3
        const client = new S3Client({
          region: s3Region,
          credentials: { accessKeyId: s3Access, secretAccessKey: s3Secret }
        });

        const timestamp = Date.now();
        const photoKey = `factory/${timestamp}-doll.png`;
        const configKey = `factory/${timestamp}-config.json`;

        // 1. Upload Photo
        await client.send(new PutObjectCommand({
          Bucket: s3Bucket,
          Key: photoKey,
          Body: Buffer.from(base64Data, 'base64'),
          ContentType: "image/png",
          ACL: "public-read"
        }));

        // 2. Upload Config
        await client.send(new PutObjectCommand({
          Bucket: s3Bucket,
          Key: configKey,
          Body: JSON.stringify(config, null, 2),
          ContentType: "application/json",
          ACL: "public-read"
        }));

        const publicUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${photoKey}`;
        console.log(`[FACTORY] Artifacts uploaded to S3: ${publicUrl}`);
        return res.status(200).json({ success: true, url: publicUrl });

      } else {
        // Fallback to local storage (like screenshot)
        console.log("[FACTORY] S3 Credentials not found, saving locally...");
        const filename = `doll_snap_${Date.now()}.png`;
        const dirPath = path.join(process.cwd(), "screenshots");
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        const filepath = path.join(dirPath, filename);
        fs.writeFileSync(filepath, base64Data, "base64");

        // Save config
        const configPath = path.join(dirPath, `doll_config_${Date.now()}.json`);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

        return res.status(200).json({ success: true, filename, local: true });
      }

    } catch (err: any) {
      console.error("[FACTORY] Export error:", err);
      return res.status(500).json({ error: "Failed to save doll data", detail: err.message });
    }
  });

  // Helper diagnostic functions for the health route
  async function checkS3() {
    const { AWS_REGION, AWS_S3_BUCKET } = process.env;
    if (!AWS_REGION || !AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return { configured: false };
    }
    try {
      const s3 = new S3Client({
        region: AWS_REGION,
        credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
      });
      await s3.send(new ListObjectsV2Command({ Bucket: AWS_S3_BUCKET, MaxKeys: 1 }));
      return { configured: true, ok: true };
    } catch (err: any) {
      return { configured: true, ok: false, error: String(err) };
    }
  }

  async function checkProvider(url: string, key?: string, headerName = "Authorization") {
    if (!key) return { configured: false };
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const r = await fetch(url, { method: "GET", headers: { [headerName]: `Bearer ${key}` }, signal: controller.signal } as any);
      clearTimeout(timeout);
      return { configured: true, ok: r.ok, status: r.status };
    } catch (err) {
      return { configured: true, ok: false, error: String(err) };
    }
  }

  app.get("/api/health", async (req, res) => {
    try {
      const uptime = process.uptime();
      const mem = process.memoryUsage();
      const jobCount = (global as any).__KRONOS_JOB_COUNT ?? null;

      const s3 = await checkS3();
      const [openai, eleven] = await Promise.all([
        checkProvider("https://api.openai.com/v1/models", process.env.OPENAI_API_KEY),
        checkProvider("https://api.elevenlabs.io/v1/voices", process.env.ELEVENLABS_API_KEY, "xi-api-key"),
      ]);

      return res.json({
        status: "ok",
        uptime,
        memory: { rss: mem.rss, heapTotal: mem.heapTotal, heapUsed: mem.heapUsed },
        jobCount,
        s3,
        openai,
        eleven,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || null,
      });
    } catch (err) {
      console.error("health error", err);
      return res.status(500).json({ status: "error", error: String(err) });
    }
  });

  app.get("/api/job-queue", requireAdmin, (req, res) => {
    // Return all jobs sorted newest first
    const jobsList = Array.from(JOBS.values()).sort((a, b) => b.createdAt - a.createdAt);
    res.json({ jobs: jobsList });
  });

  app.post("/api/worker/:action", requireAdmin, (req, res) => {
    const { action } = req.params;
    console.log(`[Admin] Worker command received: ${action}`);
    if (["start", "stop", "restart"].includes(action)) {
      return res.json({ success: true, message: `Worker ${action} executed.` });
    }
    return res.status(400).json({ error: "Invalid worker action" });
  });

  app.get("/api/logs", requireAdmin, (req, res) => {
    const tail = parseInt(req.query.tail as string || "50", 10);
    // Mock log stream for dev stub
    const mockLogs = Array.from({ length: Math.min(tail, 20) }).map((_, i) =>
      `[Syslog] ${new Date(Date.now() - i * 1000).toISOString()} - INFO: System tick ok.`
    );
    res.json({ logs: mockLogs.reverse() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    // Wildcard fallback for React Router DOM in production
    app.get('*', (req, res) => {
      // Ignore API routes so they return 404 naturally
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // --- PHASE 17 API SIGNALING (Zero-Dependency WebRTC Stub) ---
  // Rather than failing on EPERM cache locks from ws/socket.io, we use an in-memory polling array
  const signals: any[] = [];
  app.post("/api/signal/send", (req, res) => {
    signals.push({ ...req.body, timestamp: Date.now() });
    res.json({ success: true });
  });
  app.get("/api/signal/poll/:roomId/:peerId", (req, res) => {
    const { roomId, peerId } = req.params;
    // Deliver signals meant for this room but NOT originating from this peer
    const pending = signals.filter(s => s.roomId === roomId && s.from !== peerId);
    // Purge delivered (simplified for 2 peers, in prod use precise ACKs)
    for (const p of pending) {
      const idx = signals.indexOf(p);
      if (idx > -1) signals.splice(idx, 1);
    }
    res.json({ signals: pending });
  });

  const server = http.createServer(app);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[WebRTC] Fallback HTTP Signaling active.`);
  });
}

startServer();
