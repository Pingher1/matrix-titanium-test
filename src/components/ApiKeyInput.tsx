import React, { useEffect, useState } from "react";

/**
 * ApiKeyInput: small top-right control to set runtime API key.
 * - Stores key in sessionStorage (not persisted across browser sessions).
 * - Exposes a window helper for debugging: window.__KRONOS_API_KEY (only in dev).
 * - Use ApiClient.getApiKey() instead of directly reading sessionStorage.
 */

const STORAGE_KEY = "kronos_api_key";

export default function ApiKeyInput() {
    const [key, setKey] = useState<string>(() => sessionStorage.getItem(STORAGE_KEY) || "");
    const [masked, setMasked] = useState(true);
    const [saved, setSaved] = useState(!!key);

    useEffect(() => {
        if (key) sessionStorage.setItem(STORAGE_KEY, key);
        else sessionStorage.removeItem(STORAGE_KEY);
        // Expose in dev for quick console triggers (optional)
        if (process.env.NODE_ENV !== "production") (window as any).__KRONOS_API_KEY = key;
        return () => { if (process.env.NODE_ENV !== "production") (window as any).__KRONOS_API_KEY = undefined; };
    }, [key]);

    const onSave = () => {
        setSaved(true);
        alert("API key saved to session (not stored permanently).");
    };

    const onClear = () => {
        setKey("");
        setSaved(false);
        sessionStorage.removeItem(STORAGE_KEY);
        alert("API key cleared from session.");
    };

    if (saved) {
        return (
            <div style={{
                position: "fixed",
                bottom: "20px",
                left: "20px",
                zIndex: 99999,
                background: "rgba(0,0,0,0.6)",
                padding: "8px 12px",
                borderRadius: 12,
                color: "#2a8f3d",
                fontSize: 12,
                cursor: "pointer",
                border: "1px solid rgba(42, 143, 61, 0.5)"
            }} onClick={() => setSaved(false)} title="Click to edit API Key">
                API Key Saved &nbsp;&#9998;
            </div>
        );
    }

    return (
        <div style={{
            position: "fixed",
            bottom: "20px", // Moved to a safer, more standard bottom-left position
            left: "20px",
            zIndex: 99999, // Increased z-index
            background: "rgba(0,0,0,0.8)", // Darker for visibility
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            color: "white",
            fontSize: 14,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
        }}>
            <div style={{ fontWeight: 600, marginRight: '4px' }}>Gemini API Key:</div>
            <input
                aria-label="API Key"
                value={key}
                onChange={(e) => { setKey(e.target.value); setSaved(false); }}
                placeholder="Paste your key here..."
                style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #333",
                    background: "#000",
                    color: "#fff",
                    width: 250,
                    outline: "none",
                }}
                type={masked ? "password" : "text"}
            />
            <button
                onClick={() => setMasked(!masked)}
                style={{ padding: "8px 12px", background: "#333", border: "none", color: "white", borderRadius: 6, cursor: "pointer" }}
            >
                {masked ? "Show" : "Hide"}
            </button>
            <button
                onClick={onSave}
                style={{ padding: "8px 16px", background: saved ? "#2a8f3d" : "#2f8cff", border: "none", color: "white", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
            >
                {saved ? "Saved \u2713" : "Save"}
            </button>
            <button
                onClick={onClear}
                style={{ padding: "8px 12px", background: "#b33", border: "none", color: "white", borderRadius: 6, cursor: "pointer" }}
            >
                Clear
            </button>
        </div>
    );
}
