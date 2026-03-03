import express from "express";
import axios from "axios";

const router = express.Router();

// Helper to read Kronos base URL and API key from env
const KRONOS_URL = (process.env.KRONOS_URL || "").replace(/\/+$/, "");
const KRONOS_API_KEY = process.env.KRONOS_API_KEY || process.env.KRONOS_STAGING_API_KEY || "";

if (!KRONOS_URL) {
    console.warn("KRONOS_URL not configured; /api/modules endpoints will return 503 until set");
}

function kronosClient() {
    if (!KRONOS_URL) throw new Error("KRONOS_URL not set");
    const instance = axios.create({
        baseURL: KRONOS_URL,
        headers: {
            Authorization: `Bearer ${KRONOS_API_KEY}`,
            "Content-Type": "application/json",
        },
        timeout: 30000,
    });
    return instance;
}

// GET /api/modules
// optional query params passed through (limit, q, etc.)
router.get("/api/modules", async (req, res) => {
    try {
        const kc = kronosClient();
        // Map query if present 
        const resp = await kc.get("/api/modules", { params: req.query });
        return res.json(resp.data);
    } catch (err: any) {
        console.error("Failed to proxy /api/modules:", err?.message || err);
        return res.status(502).json({ ok: false, error: "failed to fetch modules from kronos", details: err?.message });
    }
});

// GET /api/modules/:moduleId/:version
router.get("/api/modules/:moduleId/:version", async (req, res) => {
    const { moduleId, version } = req.params;
    try {
        const kc = kronosClient();
        const resp = await kc.get(`/api/modules/${encodeURIComponent(moduleId)}/${encodeURIComponent(version)}`);
        // Expected that Kronos returns manifest URL or manifest 
        return res.json(resp.data);
    } catch (err: any) {
        console.error("Failed to proxy module detail:", err?.message || err);
        return res.status(502).json({ ok: false, error: "failed to fetch module detail", details: err?.message });
    }
});

export default router;
