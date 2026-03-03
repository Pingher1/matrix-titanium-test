import { Request, Response } from "express";
import { synthesizePageToS3 } from "./pollySynthesize";

export async function synthesizeStoryHandler(req: Request, res: Response) {
    try {
        const { storyId, pages } = req.body;
        if (!storyId || !Array.isArray(pages)) {
            return res.status(400).json({ error: "missing params" });
        }
        const results = [];
        for (const p of pages) {
            const r = await synthesizePageToS3({
                storyId,
                pageId: p.id,
                text: p.text,
                voice: p.voice || "Joanna"
            });
            results.push(r);
        }
        res.json({ ok: true, pages: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: String(err) });
    }
}
