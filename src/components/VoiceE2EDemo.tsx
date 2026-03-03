import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

/**
 * VoiceE2EDemo
 * - Record microphone audio (short clips)
 * - Upload to /api/transcribe => receive transcript (text)
 * - Send transcript to /api/tts => receive publicUrl or audioBase64
 * - Play audio and show timing / latency for each step
 *
 * Usage: import and render <VoiceE2EDemo />
 */

export default function VoiceE2EDemo() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [lastTTSAudioUrl, setLastTTSAudioUrl] = useState<string | null>(null);
    const [lastTTSBase64, setLastTTSBase64] = useState<string | null>(null);
    const [durations, setDurations] = useState<Record<string, number>>({});
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();
        return () => {
            audioRef.current?.pause();
            audioRef.current?.removeAttribute("src");
        };
    }, []);

    const startRecording = async () => {
        setTranscript(null);
        setLastTTSAudioUrl(null);
        setLastTTSBase64(null);
        setStatus("requesting-mic");
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
                setStatus("recording");
            };
            mr.onstop = () => {
                setIsRecording(false);
                setStatus("processing-audio");
                processAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
                // stop tracks
                stream.getTracks().forEach((t) => t.stop());
            };
            mr.start();
            // optional safety: stop after X seconds
            setTimeout(() => {
                try { mr.state === "recording" && mr.stop(); } catch (e) { }
            }, 6000); // stop auto after 6s
        } catch (err) {
            console.error("mic error", err);
            setStatus("mic-error");
        }
    };

    const stopRecording = () => {
        try {
            mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current?.stop();
        } catch (e) { }
    };

    async function processAudioBlob(blob: Blob) {
        const t0 = performance.now();
        setStatus("encoding");
        // Convert to base64
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const t1 = performance.now();
        setDurations((d) => ({ ...d, encodeMs: Math.round(t1 - t0) }));

        try {
            setStatus("uploading-transcribe");
            const tTransStart = performance.now();
            const transRes = await axios.post("/api/transcribe", { audioBase64: base64, filename: "recording.webm", mimeType: blob.type }, { timeout: 120000 });
            const tTransEnd = performance.now();

            setDurations((d) => ({ ...d, transcribeMs: Math.round(tTransEnd - tTransStart) }));
            const text = transRes.data?.text ?? transRes.data?.transcript ?? null;
            setTranscript(text || ""); // may be null

            // Now request TTS for the returned transcript (or a canned response)
            const tTTSStart = performance.now();
            setStatus("requesting-tts");
            const ttsRes = await axios.post("/api/tts", { text: text || "I couldn't hear that. Try again." }, { timeout: 120000 });
            const tTTSEnd = performance.now();
            setDurations((d) => ({ ...d, ttsMs: Math.round(tTTSEnd - tTTSStart) }));

            // ttsRes can return publicUrl or audioBase64
            if (ttsRes.data?.publicUrl) {
                setLastTTSAudioUrl(ttsRes.data.publicUrl);
                setLastTTSBase64(null);
                playAudioUrl(ttsRes.data.publicUrl);
            } else if (ttsRes.data?.audioBase64) {
                setLastTTSBase64(ttsRes.data.audioBase64);
                setLastTTSAudioUrl(null);
                playBase64(ttsRes.data.audioBase64, ttsRes.data.contentType || "audio/mpeg");
            } else if (ttsRes.data?.tts === "browser") {
                // fallback to SpeechSynthesis
                const utter = new SpeechSynthesisUtterance(text || "Response");
                window.speechSynthesis.speak(utter);
            } else {
                setStatus("tts-no-response");
            }

            setStatus("complete");
        } catch (err) {
            console.error("processAudio error", err);
            setStatus("error");
        }
    }

    function playAudioUrl(url: string) {
        try {
            if (!audioRef.current) audioRef.current = new Audio();
            audioRef.current.src = url;
            audioRef.current.play().catch((e) => console.warn("play failed", e));
        } catch (e) {
            console.error("playAudioUrl error", e);
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
        }
    }

    return (
        <div style={{ padding: 12, background: "rgba(6,8,10,0.6)", borderRadius: 8, color: "#fff", maxWidth: 720 }}>
            <h4 style={{ marginTop: 0 }}>Voice E2E Demo</h4>
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={startRecording} disabled={isRecording} style={{ padding: "8px 12px" }}>Start (auto stop ~6s)</button>
                <button onClick={stopRecording} disabled={!isRecording} style={{ padding: "8px 12px" }}>Stop</button>
            </div>

            <div style={{ marginTop: 12 }}>
                <div><strong>Status:</strong> {status}</div>
                <div><strong>Transcript:</strong> {transcript ?? "—"}</div>
                <div style={{ marginTop: 8 }}>
                    <strong>Durations (ms):</strong>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(durations, null, 2)}</pre>
                </div>
                {lastTTSAudioUrl && (
                    <div style={{ marginTop: 8 }}>
                        <strong>Audio URL:</strong> <a href={lastTTSAudioUrl} target="_blank" rel="noreferrer">{lastTTSAudioUrl}</a>
                    </div>
                )}
            </div>
        </div>
    );
}
