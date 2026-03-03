import React, { useEffect } from "react";
import VoiceE2EDemo from "./VoiceE2EDemo";

export default {
    title: "Admin/VoiceE2E",
    component: VoiceE2EDemo,
};

const Template = (args: any) => (
    <div style={{ maxWidth: 900 }}>
        <VoiceE2EDemo {...args} />
    </div>
);

export const Live = Template.bind({});
(Live as any).args = {}; // real component — requires mic & backend

// Visual mock: a simple static wrapper that mimics the main UI states
export const MockStates = () => {
    useEffect(() => { }, []);
    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: 12, background: "#0b0b0c", borderRadius: 8 }}>
                <h4 style={{ margin: 0 }}>Voice E2E Demo — Idle</h4>
                <div style={{ marginTop: 8, color: "#9aa" }}>Status: idle</div>
                <div style={{ marginTop: 6 }}>Transcript: —</div>
            </div>

            <div style={{ padding: 12, background: "#0b0b0c", borderRadius: 8 }}>
                <h4 style={{ margin: 0 }}>Voice E2E Demo — Recording</h4>
                <div style={{ marginTop: 8, color: "#faa" }}>Status: recording</div>
                <div style={{ marginTop: 6 }}>Transcript: (listening…)</div>
            </div>

            <div style={{ padding: 12, background: "#0b0b0c", borderRadius: 8 }}>
                <h4 style={{ margin: 0 }}>Voice E2E Demo — Processing</h4>
                <div style={{ marginTop: 8, color: "#ffb347" }}>Status: transcribing</div>
                <div style={{ marginTop: 6 }}>Transcript: (processing…)</div>
            </div>

            <div style={{ padding: 12, background: "#0b0b0c", borderRadius: 8 }}>
                <h4 style={{ margin: 0 }}>Voice E2E Demo — Playback</h4>
                <div style={{ marginTop: 8, color: "#8df" }}>Status: playing</div>
                <div style={{ marginTop: 6 }}>Transcript: "Hello, this is a sample playback."</div>
                <div style={{ marginTop: 6 }}>
                    <button style={{ padding: "6px 10px", borderRadius: 6, background: "#ff7a18", color: "#fff" }}>Play</button>
                </div>
            </div>
        </div>
    );
};
