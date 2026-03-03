import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function getMusicManifestHandler(req: Request, res: Response) {
 try {
 const dir = path.join(process.cwd(), "..", "public", "music-manifests");
 if (!fs.existsSync(dir)) return res.json({ ok: true, songs: [] });
 const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
 const songs = files.map(f => {
 const json = fs.readFileSync(path.join(dir, f), 'utf8');
 try { return JSON.parse(json); } catch (e) { return null; }
 }).filter(Boolean);
 res.json({ ok: true, songs });
 } catch (err) {
 console.error("getMusicManifestHandler error", err);
 res.status(500).json({ ok: false, error: String(err) });
 }
}
