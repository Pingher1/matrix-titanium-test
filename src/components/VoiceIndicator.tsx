import React from "react";
import { useSmythOSState, useSmythOSDispatch } from "../state/smythos/reducer";

export default function VoiceIndicator() {
    const state = useSmythOSState();
    const dispatch = useSmythOSDispatch();
    const active = state.ui.voiceActive;

    const toggle = () => {
        dispatch({ type: "SET_UI", payload: { voiceActive: !active } });
    };

    return (
        <div style={container}>
            {/* Dynamic Keyframes Injected Safely via JSX Style tag */}
            <style>
                {`
          @keyframes voicePulse {
            0% { transform: scale(0.9); opacity: 0.9; }
            50% { transform: scale(1.2); opacity: 0.6; }
            100% { transform: scale(0.9); opacity: 0.9; }
          }
        `}
            </style>

            <button
                aria-pressed={active}
                aria-label={active ? "Voice active. Click to disable." : "Voice inactive. Click to enable."}
                onClick={toggle}
                style={{ ...btn, ...(active ? btnActive : {}) }}
                title={active ? "Voice ON — click to disable" : "Voice OFF — click to enable"}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: "block" }}>
                        <path d={active ? "M12 1v22M4 9v6a8 8 0 0 0 16 0V9" : "M5 9v6a7 7 0 0 0 14 0V9"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: "bold", letterSpacing: "0.2em" }}>{active ? "RROT ON" : "RROT OFF"}</span>
                    <div style={active ? pulse : {}} aria-hidden />
                </div>
            </button>
        </div>
    );
}

const container: React.CSSProperties = {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9999,
    pointerEvents: "auto",
};

const btn: React.CSSProperties = {
    background: "rgba(10,12,16,0.85)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "10px 16px",
    borderRadius: 28,
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
    transition: "all 0.3s ease",
};

const btnActive: React.CSSProperties = {
    background: "linear-gradient(90deg, #ff7a18, #ffb347)",
    color: "#101010",
    border: "1px solid #ff7a18",
    boxShadow: "0 0 20px rgba(255,122,24,0.4)",
};

const pulse: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.8)",
    boxShadow: "0 0 12px rgba(255,160,60,0.8)",
    animation: "voicePulse 1.5s infinite",
};
