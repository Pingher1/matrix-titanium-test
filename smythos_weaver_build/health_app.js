const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({ status: "up", module: "Kronos Pepper Core" });
});

app.get('/health/vector', (req, res) => {
    res.json({ status: "up", database: "pinecone", index: "kronos_pepper_index" });
});

app.get('/health/tts', (req, res) => {
    const key = process.env.ELEVENLABS_PEPPER_SMYTHOS_JARVIS;
    if (key) {
        res.json({ status: "up", tts: "active" });
    } else {
        res.status(500).json({ status: "down", error: "Missing TTS Vault Key" });
    }
});

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`[OK] Health App listening on port ${PORT}`);
});
