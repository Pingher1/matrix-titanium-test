import { Request, Response } from "express";

export async function processAssistantCommand(req: Request, res: Response) {
    try {
        const { command } = req.body;
        console.log("Kronos Assistant Command Received:", command);

        // Simple command routing stub
        let action = null;
        if (typeof command === 'string') {
            const lower = command.toLowerCase();
            if (lower.includes("wave")) {
                action = { type: "playAnimation", name: "Wave_Hello" };
            } else if (lower.includes("bow") || lower.includes("greet")) {
                action = { type: "playAnimation", name: "Bow_Deep" };
            } else if (lower.includes("read") || lower.includes("story")) {
                action = { type: "playAnimation", name: "PresentBook" };
            } else {
                action = { type: "playAnimation", name: "Idle_SoftNod" };
            }
        } else if (command && command.type) {
            action = command;
        }

        res.json({ ok: true, action, message: "Command processed successfully" });
    } catch (err) {
        console.error("processAssistantCommand error", err);
        res.status(500).json({ ok: false, error: String(err) });
    }
}
