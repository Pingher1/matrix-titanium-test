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
