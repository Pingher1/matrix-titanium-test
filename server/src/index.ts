import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import { createPresignHandler } from "./upload/presign";
import { synthesizeStoryHandler } from "./tts/pollyExpress";
import { getManifestHandler } from "./manifest/manifestController";
import { getMusicManifestHandler } from "./manifest/musicManifestController";
import { processAssistantCommand } from "./assistant/commandController";
import { apiKeyMiddleware } from "./middleware/apiKeyAuth";
import path from "path";
import modulesController from "./manifest/modulesController";
import { chatController } from "./chat/chatController";

dotenv.config();
const app = express();
app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.json());

// Static delivery for local story manifests, story assets, and backdrops
app.use("/story-manifests", express.static(path.join(process.cwd(), "../public/story-manifests")));
app.use("/story-assets", express.static(path.join(process.cwd(), "../public/story-assets")));
app.use("/backdrops", express.static(path.join(process.cwd(), "../public/backdrops")));

// Core endpoints
app.use("/", modulesController);
app.post("/api/presign", apiKeyMiddleware, createPresignHandler);
app.post("/api/tts/synthesize", apiKeyMiddleware, synthesizeStoryHandler);
app.get("/api/assets/manifest", getManifestHandler);
app.get("/api/music/manifest", getMusicManifestHandler);
app.post("/api/assistant/command", apiKeyMiddleware, processAssistantCommand);
app.post("/api/chat", chatController);

// Internal endpoint: worker posts asset validation
app.post("/internal/asset-validate", async (req, res) => {
    // In prod, persist to DB. For dev, echo success.
    console.log("Asset validation received:", req.body);
    res.json({ ok: true });
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
