import React from "react";

export default function WardrobePanel({ onSelectOutfit }: { onSelectOutfit: (id: string) => void }) {
    // Phase 30 Outfit Schemas (Wardrobe Registry)
    const outfits = [
        { id: "jungle_explorer", name: "Explorer", color: "#4B5320" },
        { id: "neon_party", name: "Neon Party", color: "#FF00FF" },
        { id: "galactic_armor", name: "Space Armor", color: "#00FFFF" }
    ];

    return (
        <div className="absolute left-6 top-32 z-50 bg-black/60 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg w-64">
            <h3 className="text-white font-mono font-bold text-sm mb-3">WARDROBE FACTORY</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                {outfits.map(outfit => (
                    <button
                        key={outfit.id}
                        onClick={() => onSelectOutfit(outfit.id)}
                        className="flex items-center justify-between px-4 hover:scale-105 transition-transform"
                        style={{
                            background: outfit.color,
                            border: "1px solid rgba(255,255,255,0.4)",
                            borderRadius: "8px",
                            height: "40px",
                            color: "#fff",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                        }}
                    >
                        <span className="text-xs font-bold leading-none">{outfit.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
