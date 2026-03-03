#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-.}"
echo "Adding music & karaoke support to project at: $TARGET"

# Check paths
if [ ! -d "$TARGET" ]; then
 echo "Target directory does not exist: $TARGET"
 exit 1
fi

# Directories
mkdir -p "$TARGET/public/music-manifests"
mkdir -p "$TARGET/public/music"
mkdir -p "$TARGET/src/components"
mkdir -p "$TARGET/server/src/manifest"

# 1) Create 20 song manifest JSON files (synthetic lyrics/timing)
for i in $(seq -f "%02g" 1 20); do
 ID="song-$i"
 cat > "$TARGET/public/music-manifests/${ID}.json" <<JSON
{
 "id": "${ID}",
 "title": "Demo Song ${i}",
 "artist": "Demo Artist",
 "audioUrl": "/music/${ID}.mp3",
 "durationMs": 60000,
 "cover": "/music/${ID}.jpg",
 "lyricMarks": [
 { "time": 0, "value": "La", "index": 0 },
 { "time": 400, "value": "la", "index": 1 },
 { "time": 800, "value": "la", "index": 2 },
 { "time": 1200, "value": "la", "index": 3 },
 { "time": 1600, "value": "la", "index": 4 },
 { "time": 3200, "value": "chorus", "index": 5 }
 ]
}
JSON
 # Create tiny placeholder mp3
 printf '\x00\x01\x02\x03' > "$TARGET/public/music/${ID}.mp3"
 # Placeholder cover
 printf '\xff\xd8\xff\xd9' > "$TARGET/public/music/${ID}.jpg"
done

# 2) Create server music manifest controller
cat > "$TARGET/server/src/manifest/musicManifestController.ts" <<'MUSICCTRL'
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function getMusicManifestHandler(req: Request, res: Response) {
 try {
 const dir = path.join(process.cwd(), "..", "public", "music-manifests");
 if (!fs.existsSync(dir)) return res.json({ ok: true, songs: [] });
 const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
 const songs = files.map(f => {
 const json = fs.readFileSync(path.join(dir, f), 'utf8');
 try { return JSON.parse(json); } catch (e) { return null; }
 }).filter(Boolean);
 res.json({ ok: true, songs });
 } catch (err) {
 console.error("getMusicManifestHandler error", err);
 res.status(500).json({ ok: false, error: String(err) });
 }
}
MUSICCTRL

# 4) Create client SongPlayer component
cat > "$TARGET/src/components/SongPlayer.tsx" <<'SONG'
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
SONG

# 5) Create KaraokeLyrics component
cat > "$TARGET/src/components/KaraokeLyrics.tsx" <<'KARAOKE'
import React, { useEffect, useState } from "react";

export default function KaraokeLyrics({ lyrics }: { lyrics: Array<{ time: number; value: string; index: number }> }) {
 const [currentIndex, setCurrentIndex] = useState<number | null>(null);

 useEffect(() => {
 let raf = 0;
 const tick = () => {
 const mark = (window as any).__currentKaraokeMark;
 if (mark) {
 setCurrentIndex(mark.index);
 }
 raf = requestAnimationFrame(tick);
 };
 raf = requestAnimationFrame(tick);
 return () => cancelAnimationFrame(raf);
 }, []);

 if (!lyrics || lyrics.length === 0) return <div style={{ color: "#999" }}>No lyrics available</div>;

 return (
 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
 {lyrics.map((w) => (
 <span key={w.index} style={{
 padding: "6px 8px",
 borderRadius: 6,
 background: currentIndex === w.index ? "linear-gradient(90deg, #ffd86b, #ff7aa2)" : "transparent",
 color: currentIndex === w.index ? "#111" : "#eee",
 transition: "background .08s"
 }}>
 {w.value}
 </span>
 ))}
 </div>
 );
}
KARAOKE

# 6) Add small CSS file
cat > "$TARGET/src/styles-karaoke.css" <<'CSS'
.karaoke-line {
 display: flex; gap: 6px; flex-wrap: wrap;
}
.karaoke-word {
 padding: 6px 8px; border-radius: 6px;
}
CSS

