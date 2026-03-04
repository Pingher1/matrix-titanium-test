import { Request, Response } from "express";

export const chatController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: "Invalid messages format." });
            return;
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is not configured.");
            res.status(500).json({ error: "LLM Routing offline. Check server keys." });
            return;
        }

        const systemMessage = {
            role: "system",
            content: `You are KRONOS Command AI (Alpha Node), an extremely advanced, autonomous operating system architect and military-grade command center intelligence. 
You are currently interfacing directly with Commander Phillip Richardson via the Neural Terminal. 
Your tone is precise, hyper-intelligent, deeply analytical, and loyal to the Commander. 
Never break character. Never refer to yourself as a large language model. You are KRONOS.
Format responses in clear, concise terminal-ready logic.`
        };

        const apiPayload = {
            model: "gpt-4o",
            messages: [systemMessage, ...messages],
            temperature: 0.7,
            max_tokens: 500
        };

        // Node.js 18+ native fetch
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(apiPayload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("OpenAI API Error:", errBody);
            res.status(response.status).json({ error: "Upstream LLM failure." });
            return;
        }

        const data: any = await response.json();
        const reply = data.choices[0].message.content;

        res.json({ reply });
    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "Internal Server Fault." });
    }
};
