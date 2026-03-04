const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Load Vault Keys
const OPENAI_KEY = process.env.PEPPER_SMYTHOS_JARVIS;
const ELEVEN_KEY = process.env.ELEVENLABS_PEPPER_SMYTHOS_JARVIS;

app.post('/api/transcribe', async (req, res) => {
    try {
        console.log("[Node Proxy] Received Transcribe Request");
        // Simulated proxy handoff to OpenAI Whisper
        if (!OPENAI_KEY) throw new Error("Missing PEPPER_SMYTHOS_JARVIS OpenAI Key");
        res.json({ text: "Hello, this is a simulated transcription via the Node Proxy." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/tts', async (req, res) => {
    try {
        console.log("[Node Proxy] Received TTS Request");
        const { text } = req.body;
        if (!ELEVEN_KEY) throw new Error("Missing ELEVENLABS_PEPPER_SMYTHOS_JARVIS TTS Key");

        // Simulated handoff to ElevenLabs
        res.json({ message: "TTS Audio Sent", textReceived: text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`[OK] Node Proxy listening on port ${PORT}`);
});
