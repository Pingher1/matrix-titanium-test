import React, { useEffect, useState, useRef } from "react";
import KaraokeLyrics from "./KaraokeLyrics";

type Song = {
 id: string;
 title: string;
 artist?: string;
 audioUrl: string;
 lyricMarks?: Array<{ time: number; value: string; index: number }>;
};

export default function SongPlayer({ song }: { song: Song }) {
 const [lyrics, setLyrics] = useState(song.lyricMarks ?? []);
 const [playing, setPlaying] = useState(false);
 const audioRef = useRef<HTMLAudioElement | null>(null);

 useEffect(() => {
 if (!audioRef.current && song.audioUrl) {
 audioRef.current = new Audio(song.audioUrl);
 audioRef.current.preload = "auto";
 audioRef.current.onplay = () => setPlaying(true);
 audioRef.current.onpause = () => setPlaying(false);
 }
 return () => {
 audioRef.current?.pause();
 audioRef.current = null;
 };
 }, [song.audioUrl]);

 useEffect(() => {
 if (!audioRef.current || !lyrics.length) return;
 let raf = 0;
 const start = () => {
 const tick = () => {
 const t = audioRef.current!.currentTime * 1000;
 let cur = null;
 for (let i = 0; i < lyrics.length; i++) {
 if (lyrics[i].time <= t) cur = lyrics[i];
 else break;
 }
 (window as any).__currentKaraokeMark = cur;
 raf = requestAnimationFrame(tick);
 };
 raf = requestAnimationFrame(tick);
 };
 const stop = () => {
 if (raf) cancelAnimationFrame(raf);
 };
 audioRef.current.addEventListener("play", start);
 audioRef.current.addEventListener("pause", stop);
 audioRef.current.addEventListener("ended", stop);
 return () => {
 audioRef.current?.removeEventListener("play", start);
 audioRef.current?.removeEventListener("pause", stop);
 audioRef.current?.removeEventListener("ended", stop);
 stop();
 };
 }, [lyrics]);

 const onPlay = () => audioRef.current?.play();
 const onPause = () => audioRef.current?.pause();

 return (
 <div style={{ background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
 <div style={{ fontSize: 18, fontWeight: 600 }}>{song.title} <span style={{ fontSize: 12, opacity: 0.7 }}>— {song.artist}</span></div>
 <div style={{ marginTop: 8 }}>
 <button onClick={onPlay} style={{ marginRight: 8 }}>Play</button>
 <button onClick={onPause}>Pause</button>
 </div>
 <div style={{ marginTop: 12 }}>
 <KaraokeLyrics lyrics={lyrics} />
 </div>
 </div>
 );
}
