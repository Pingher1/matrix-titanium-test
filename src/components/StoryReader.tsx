import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

type VoiceOption = { id: string; name: string };

// StoryReader: MVP
// - Accepts story text (textarea) or sample selection
// - Avatar select (simple list of names / thumbnails placeholder)
// - Play/Pause, speed control
// - Highlights words as TTS plays (approximate timing by wordsPerSecond)
export default function StoryReader({
    initialText,
    voices = [{ id: "browser", name: "Browser TTS" }],
    mock = false,
}: {
    initialText?: string;
    voices?: VoiceOption[];
    mock?: boolean; // if true, simulate TTS and highlighting without calling API
}) {
    const [text, setText] = useState(initialText || "Once upon a time, a little robot learned to sing.");
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1.0);
    const [voice, setVoice] = useState<VoiceOption>(voices[0]);
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
    const words = text.trim().split(/\s+/);
    const timerRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const playMock = () => {
        const wps = 2.5 * speed; // words per second baseline
        const interval = 1000 / wps;
        setCurrentWordIndex(0);
        setIsPlaying(true);
        timerRef.current = window.setInterval(() => {
            setCurrentWordIndex((i) => {
                if (i >= words.length - 1) {
                    if (timerRef.current) window.clearInterval(timerRef.current);
                    setIsPlaying(false);
                    return words.length - 1;
                }
                return i + 1;
            });
        }, interval);
    };

    const stop = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const play = async () => {
        setCurrentWordIndex(0);
        if (mock || voice.id === "browser") {
            // use speechSynthesis for quick demo
            if ("speechSynthesis" in window && voice.id === "browser") {
                stop();
                const u = new SpeechSynthesisUtterance(text);
                u.rate = Math.max(0.5, Math.min(2.0, speed));
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(u);
                // approximate highlight using mock decoder
                playMock();
                return;
            } else {
                playMock();
                return;
            }
        }

        try {
            setIsPlaying(true);
            // call /api/tts -> may return publicUrl or audioBase64
            const res = await axios.post("/api/tts", { text, voiceId: voice.id });
            const data = res.data;
            if (data.publicUrl) {
                if (!audioRef.current) audioRef.current = new Audio();
                audioRef.current.src = data.publicUrl;
                audioRef.current.playbackRate = speed;
                audioRef.current.play();
                // best-effort highlighting: estimate total duration from audio (unknown), fallback to word pacing
                playMock();
            } else if (data.audioBase64) {
                const binary = atob(data.audioBase64);
                const len = binary.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
                const blob = new Blob([bytes.buffer], { type: data.contentType || "audio/mpeg" });
                const url = URL.createObjectURL(blob);
                if (!audioRef.current) audioRef.current = new Audio();
                audioRef.current.src = url;
                audioRef.current.playbackRate = speed;
                audioRef.current.play();
                playMock();
            } else {
                // fallback
                playMock();
            }
        } catch (err) {
            console.error("TTS error", err);
            // fallback to mock
            playMock();
        }
    };

    const onPlayPause = () => {
        if (isPlaying) stop();
        else play();
    };

    return (
        <div style={{ padding: 12, background: "#071018", color: "#fff", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Story Reader (MVP)</h3>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <select value={voice.id} onChange={(e) => setVoice(voices.find((v) => v.id === e.target.value) || voices[0])}>
                    {voices.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>

                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Speed:
                    <input type="range" min="0.6" max="1.8" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
                    <span style={{ minWidth: 36 }}>{speed.toFixed(1)}x</span>
                </label>

                <button onClick={onPlayPause} style={{ padding: "6px 10px", background: "#ff7a18", border: "none", borderRadius: 6 }}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
            </div>

            <div style={{ marginBottom: 8 }}>
                <textarea rows={4} style={{ width: "100%", borderRadius: 6, padding: 8 }} value={text} onChange={(e) => setText(e.target.value)} />
            </div>

            <div style={{ padding: 12, background: "#0b0b0c", borderRadius: 6 }}>
                <div style={{ marginBottom: 8, color: "#9aa" }}>Status: {isPlaying ? "playing" : "idle"}</div>
                <div style={{ lineHeight: 1.6 }}>
                    {words.map((w, i) => (
                        <span
                            key={i}
                            style={{
                                background: i === currentWordIndex ? "rgba(255,122,24,0.18)" : "transparent",
                                padding: "0 2px",
                                borderRadius: 2,
                                color: i === currentWordIndex ? "#ffb347" : "#fff",
                            }}
                        >
                            {w}{" "}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
