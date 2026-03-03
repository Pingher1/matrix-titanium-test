import React, { useState, useEffect } from "react";
import { eventBus } from "../lib/eventBus";
import { useVoiceController } from "../lib/useVoiceController";

export default function KronosAssistantPanel() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        { role: "assistant", content: "I am the Kronos Ultimate Enterprise Architect. How can I assist you in Avatar Forge today?" },
    ]);
    const [input, setInput] = useState("");
    const [persona, setPersona] = useState("Kronos Ultimate Enterprise Architect");
    const { speak, stop, isEnabled, setIsEnabled, isSpeaking } = useVoiceController();

    const sendCommand = async (cmd: string) => {
        setMessages((prev) => [...prev, { role: "user", content: cmd }]);
        try {
            const res = await fetch("http://localhost:8080/api/assistant/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: cmd }),
            });
            const data = await res.json();
            if (data.ok && data.action) {
                const responseText = `Executing action: ${data.action.name || data.action.type}`;
                setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
                if (isEnabled) speak(responseText);

                // Dispatch to Avatar Action Bridge
                if (data.action.type === "playAnimation") {
                    eventBus.emit("avatar:action", { action: data.action.name });
                    if ((window as any).__playAvatarAnimation) {
                        (window as any).__playAvatarAnimation(data.action.name);
                    }
                }
            } else {
                const fallbackText = data.message || "Command acknowledged, but no specific action mapped.";
                setMessages((prev) => [...prev, { role: "assistant", content: fallbackText }]);
                if (isEnabled) speak(fallbackText);
            }
        } catch (err) {
            const errorText = "Error connecting to Kronos Agent.";
            setMessages((prev) => [...prev, { role: "assistant", content: errorText }]);
            if (isEnabled) speak(errorText);
        }
    };

    // Welcome message on mount
    useEffect(() => {
        if (isEnabled && !isSpeaking) {
            speak("I am the Kronos Ultimate Enterprise Architect. How can I assist you in Avatar Forge today?");
        }
    }, []); // Run once

    return (
        <div style={{ padding: "24px", color: "#111", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ margin: 0 }}>Kronos Assistant</h2>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                        onClick={() => {
                            if (isSpeaking) stop();
                            setIsEnabled(!isEnabled);
                        }}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            border: `1px solid ${isEnabled ? "#4f46e5" : "#ccc"}`,
                            background: isEnabled ? "#eef2ff" : "#fff",
                            color: isEnabled ? "#4f46e5" : "#666",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
                        {isEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
                    </button>
                    <select
                        value={persona}
                        onChange={(e) => setPersona(e.target.value)}
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", color: "#111" }}
                    >
                        <option value="Kronos Ultimate Enterprise Architect">Kronos Ultimate Enterprise Architect</option>
                        <option value="Avatar Developer">Avatar Developer</option>
                        <option value="Storybook Director">Storybook Director</option>
                    </select>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
                {/* Chat Window */}
                <div style={{ border: "1px solid #eee", borderRadius: "12px", display: "flex", flexDirection: "column", height: "500px", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#000" : "#f5f5f5", color: m.role === "user" ? "#fff" : "#111", padding: "12px 16px", borderRadius: "12px", maxWidth: "80%" }}>
                                {m.content}
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: "16px", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a command (e.g., 'wave hello')"
                            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            onKeyDown={(e) => { if (e.key === "Enter") { sendCommand(input); setInput(""); } }}
                        />
                        <button
                            onClick={() => { sendCommand(input); setInput(""); }}
                            style={{ padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
                        >
                            Send
                        </button>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h3 style={{ margin: "0 0 8px 0" }}>Quick Actions</h3>
                    <button onClick={() => sendCommand("wave hello")} style={quickBtnStyle}>👋 Run wave animation</button>
                    <button onClick={() => sendCommand("bow deeply to the camera")} style={quickBtnStyle}>🙇‍♂️ Run bow animation</button>
                    <button onClick={() => sendCommand("read the storybook")} style={quickBtnStyle}>📖 Run present book animation</button>

                    <h3 style={{ margin: "16px 0 8px 0" }}>System Tools</h3>
                    <button onClick={() => alert("Mock: Synthesizing TTS...")} style={sysBtnStyle}>🎙 Synth TTS</button>
                    <button onClick={() => alert("Mock: Generating Story via LLM...")} style={sysBtnStyle}>✍️ Generate Story</button>
                    <button onClick={() => alert("Mock: Creating Asset Record...")} style={sysBtnStyle}>📦 Create Asset Record</button>
                </div>
            </div>
        </div>
    );
}

const quickBtnStyle = {
    padding: "12px", background: "#fff", border: "1px solid #eee", borderRadius: "8px", cursor: "pointer", textAlign: "left" as const, boxShadow: "0 2px 4px rgba(0,0,0,0.02)", fontWeight: "bold"
};

const sysBtnStyle = {
    ...quickBtnStyle,
    background: "#f8f9fa"
};
