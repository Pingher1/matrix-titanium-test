import { Request, Response, NextFunction } from "express";

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const auth = req.header("Authorization") || req.header("x-api-key") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;

    // For dev: allow configured debug key in env
    if (!token) {
        // no key provided — reject or allow if public endpoints
        return res.status(401).json({ error: "Missing API key" });
    }

    // In production: validate token server-side (match known key or exchange)
    if (process.env.DEBUG_API_KEY && token === process.env.DEBUG_API_KEY) {
        (req as any).apiKeyValid = true;
        return next();
    }

    // You can perform token introspection here against Kronos auth service
    // e.g., call Kronos /token/validate or check JWT signature
    // For now, attach token to req
    (req as any).apiKey = token;

    // TODO: validate token properly
    next();
}
