import React from "react";
import { eventBus } from "../lib/eventBus";

export default function AvatarBubbleButton({ storyId }: { storyId: string }) {
    const onClick = () => {
        eventBus.emit("story:play", { storyId });
    };

    return (
        <button aria-label="Ask avatar to read"
            onClick={onClick}
            style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #ff9acb, #ff5aa2)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            className="hover:scale-105 active:scale-95 transition-transform"
        >
            <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="10" fill="white" opacity="0.15" />
                <path d="M8 11h8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M12 7v8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        </button>
    );
}
