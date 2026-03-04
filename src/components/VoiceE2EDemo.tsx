import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

/**
 * VoiceE2EDemo
 * - Record microphone audio (short clips)
 * - Upload to /api/transcribe => receive transcript (text)
 * - Send transcript to /api/tts => receive publicUrl or audioBase64
 * - Play audio and show timing / latency for each step
 *
 * Hands-Free (Continuous Mode) enabled.
 */

export default function VoiceE2EDemo() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [lastTTSAudioUrl, setLastTTSAudioUrl] = useState<string | null>(null);
    const [lastTTSBase64, setLastTTSBase64] = useState<string | null>(null);
    const [durations, setDurations] = useState<Record<string, number>>({});
    const [continuousMode, setContinuousMode] = useState(true); // Default to True for hands-free

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const continuousModeRef = useRef(true);

    useEffect(() => {
        continuousModeRef.current = continuousMode;
    }, [continuousMode]);

    useEffect(() => {
        audioRef.current = new Audio();

        // Auto-Listen Hook: When Pepper finishes speaking, open the mic again automatically.
        audioRef.current.onended = () => {
            if (continuousModeRef.current) {
                console.log("Audio finished playing. Auto-resuming listening...");
                setTimeout(startRecording, 500); // 500ms breather before mic opens
            }
        };

        return () => {
            audioRef.current?.pause();
            audioRef.current?.removeAttribute("src");
        };
    }, []);

    const startRecording = async () => {
        setTranscript(null);
        setLastTTSAudioUrl(null);
        setLastTTSBase64(null);
        setStatus("Listening...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
            mediaRecorderRef.current = mr;
            chunksRef.current = [];
            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };
            mr.onstart = () => {
                setIsRecording(true);
            };
            mr.onstop = () => {
                setIsRecording(false);
                setStatus("processing-audio");
                processAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
                // stop tracks
                stream.getTracks().forEach((t) => t.stop());
            };
            mr.start();

            // Give him 15 seconds to talk before automatically sending the payload
            setTimeout(() => {
                try { mr.state === "recording" && mr.stop(); } catch (e) { }
            }, 15000);
        } catch (err) {
            console.error("mic error", err);
            setStatus("Microphone Error - Check Permissions");
        }
    };

    const stopRecording = () => {
        try {
            mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current?.stop();
        } catch (e) { }
    };

    // Emergency kill switch
    const killLoop = () => {
        setContinuousMode(false);
        audioRef.current?.pause();
        stopRecording();
        setStatus("Loop Terminated");
    };

    async function processAudioBlob(blob: Blob) {
        if (!blob || blob.size === 0) return;

        const t0 = performance.now();
        setStatus("Transcribing via Whisper...");

        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const t1 = performance.now();
        setDurations((d) => ({ ...d, encodeMs: Math.round(t1 - t0) }));

        try {
            const tTransStart = performance.now();
            const transRes = await axios.post("/api/transcribe", { audioBase64: base64, filename: "recording.webm", mimeType: blob.type }, { timeout: 120000 });
            const tTransEnd = performance.now();

            setDurations((d) => ({ ...d, transcribeMs: Math.round(tTransEnd - tTransStart) }));
            const text = transRes.data?.text ?? transRes.data?.transcript ?? null;

            if (!text || text.trim().length === 0) {
                setTranscript("[Silence Detected]");
                if (continuousModeRef.current) setTimeout(startRecording, 1000);
                return;
            }

            setTranscript(text);

            // Request TTS
            const tTTSStart = performance.now();
            setStatus("Generating Pepper Response (ElevenLabs)...");
            const ttsRes = await axios.post("/api/tts", { text: text }, { timeout: 120000 });
            const tTTSEnd = performance.now();
            setDurations((d) => ({ ...d, ttsMs: Math.round(tTTSEnd - tTTSStart) }));

            if (ttsRes.data?.publicUrl) {
                setLastTTSAudioUrl(ttsRes.data.publicUrl);
                setLastTTSBase64(null);
                playAudioUrl(ttsRes.data.publicUrl);
            } else if (ttsRes.data?.audioBase64) {
                setLastTTSBase64(ttsRes.data.audioBase64);
                setLastTTSAudioUrl(null);
                playBase64(ttsRes.data.audioBase64, ttsRes.data.contentType || "audio/mpeg");
            } else if (ttsRes.data?.tts === "browser") {
                const utter = new SpeechSynthesisUtterance(text || "Response");
                utter.onend = () => { if (continuousModeRef.current) startRecording(); };
                window.speechSynthesis.speak(utter);
            } else {
                setStatus("tts-no-response");
                if (continuousModeRef.current) startRecording();
            }

            setStatus("Speaking...");
        } catch (err: any) {
            console.error("processAudio error", err);
            // Ignore Axios abortion errors or network timeouts by gracefully recovering
            setStatus(`Error: ${err.message}`);
            if (continuousModeRef.current) setTimeout(startRecording, 2000);
        }
    }

    function playAudioUrl(url: string) {
        try {
            if (!audioRef.current) audioRef.current = new Audio();
            audioRef.current.src = url;
            audioRef.current.play().catch((e) => {
                console.warn("play failed", e);
                if (continuousModeRef.current) startRecording();
            });
        } catch (e) {
            console.error("playAudioUrl error", e);
            if (continuousModeRef.current) startRecording();
        }
    }

    function playBase64(base64: string, mime = "audio/mpeg") {
        try {
            const binary = atob(base64);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes.buffer], { type: mime });
            const url = URL.createObjectURL(blob);
            playAudioUrl(url);
        } catch (e) {
            console.error("playBase64 error", e);
            if (continuousModeRef.current) startRecording();
        }
    }

    return (
        <div style={{ padding: 12, background: "rgba(6,8,10,0.8)", borderRadius: 8, color: "#fff", maxWidth: 720, border: "1px solid #333" }}>
            <h4 style={{ marginTop: 0, color: "#00ffcc" }}>Pepper Voice Link (Duplex Sandbox)</h4>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button
                    onClick={startRecording}
                    disabled={isRecording}
                    style={{ padding: "8px 16px", background: isRecording ? "#cc0000" : "#00cc00", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}
                >
                    {isRecording ? "🎤 Listening..." : "▶️ Start Link"}
                </button>

                {isRecording && (
                    <button onClick={stopRecording} style={{ padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                        Send Now (Force Stop)
                    </button>
                )}

                <button onClick={killLoop} style={{ padding: "8px 16px", background: "#cc0000", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                    🛑 Kill Switch
                </button>

                <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "14px", color: continuousMode ? "#00ffcc" : "#999" }}>
                    <input
                        type="checkbox"
                        checked={continuousMode}
                        onChange={(e) => setContinuousMode(e.target.checked)}
                    />
                    Continuous Loop (Hands-Free)
                </label>
            </div>

            <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: status?.includes("Error") ? "#ff4444" : "#ffcc00" }}>
                    System Status: {status || "Standby"}
                </div>

                <div style={{ marginTop: 12, padding: 8, background: "#000", borderRadius: 4, minHeight: "40px", fontFamily: "monospace" }}>
                    <span style={{ color: "#888" }}>You said: </span>
                    <span style={{ color: "#fff" }}>{transcript ?? "—"}</span>
                </div>
            </div>
        </div>
    );
}
