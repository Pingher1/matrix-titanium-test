import { useEffect, useRef } from "react";
import { eventBus } from "../lib/eventBus";

type SpeechMark = { time: number; value: string; index: number };

export default function useSpeechSync(audioUrl: string | null, speechMarks: SpeechMark[] | null, pageId: string | null) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!audioUrl) return;
        audioRef.current = new Audio(audioUrl);
        audioRef.current.preload = "auto";
        const audio = audioRef.current;

        audio.onended = () => {
            eventBus.emit("story:page:end", { pageId: pageId! });
        };

        return () => {
            audio.pause();
            audioRef.current = null;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [audioUrl, pageId]);

    useEffect(() => {
        if (!audioRef.current || !speechMarks || !pageId) return;

        const audio = audioRef.current;
        const marks = speechMarks.slice().sort((a, b) => a.time - b.time);

        function tick() {
            const tMs = audio.currentTime * 1000;
            let curMark: SpeechMark | null = null;

            for (let i = 0; i < marks.length; i++) {
                if (marks[i].time <= tMs) curMark = marks[i];
                else break;
            }

            if (curMark) {
                eventBus.emit("story:word", { pageId, wordIndex: curMark.index, timeMs: curMark.time, text: curMark.value });
            }
            rafRef.current = requestAnimationFrame(tick);
        }

        audio.play().catch((e) => console.warn("Audio play blocked:", e));
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [speechMarks, pageId]);

    return {
        play: () => audioRef.current?.play(),
        pause: () => audioRef.current?.pause(),
        seek: (ms: number) => {
            if (audioRef.current) audioRef.current.currentTime = ms / 1000;
        },
        getAudio: () => audioRef.current,
    };
}
