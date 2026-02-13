require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { oraclePulse } = require('./oracle'); // We will build this next

const app = express();
const PORT = 4000; // JEHOVAH'S THRONE

// 1. THE HANDSHAKE (CORS)
// We only allow Kronos (3000) and Barbie (4001) to talk to us.
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4001', 'http://localhost:5173', 'http://localhost:5174'], // Added Erebus (5174)
    methods: ['GET', 'POST']
}));

app.use(express.json());

// 2. THE HEARTBEAT
app.get('/', (req, res) => {
    res.json({
        status: 'ONLINE',
        system: 'JEHOVAH (Adversary)',
        time: new Date().toISOString()
    });
});

// 3. THE ORACLE TRIGGER
// Kronos calls this to get the "Outside World" data
app.get('/api/oracle/scan', async (req, res) => {
    console.log("👁️ JEHOVAH: Received Oracle Command.");
    const data = await oraclePulse();
    res.json(data);
});

// 4. IGNITION
app.listen(PORT, () => {
    console.log(`\n👁️  JEHOVAH WITNESS IS LISTENING ON PORT ${PORT}`);
    console.log(`🔗  Connected to U.A.C.I. Protocol v2.1`);
    console.log(`📡  Awaiting Commands from Kronos...\n`);
});
