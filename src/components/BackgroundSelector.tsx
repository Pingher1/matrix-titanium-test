import React from "react";
import { useSmythOSState, useSmythOSDispatch } from "../state/smythos/reducer";
import { Sun } from "lucide-react";

const PRESETS = [
    { id: "studio", name: "Studio" },
    { id: "city", name: "City" },
    { id: "sunset", name: "Sunset" },
    { id: "dawn", name: "Dawn" },
    { id: "night", name: "Night" },
    { id: "calm", name: "Calm" },
    { id: "neon", name: "Neon" },
    { id: "storm", name: "Storm" },
    { id: "glitch", name: "Glitch" }
];

export default function BackgroundSelector() {
    const state = useSmythOSState();
    const dispatch = useSmythOSDispatch();
    const active = state.lighting.activeEnvMapId ?? "studio";

    return (
        <div className="bg-black/30 border border-white/10 rounded-xl p-3 backdrop-blur-md text-white mt-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Sun size={14} className="text-orange-400" />
                HDRI Environment Maps
            </h4>

            <div className="flex gap-2 flex-wrap">
                {PRESETS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => dispatch({ type: "SET_LIGHTING", payload: { activeEnvMapId: p.id } })}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${active === p.id
                            ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black font-bold shadow-[0_0_10px_rgba(255,122,24,0.3)]'
                            : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                            }`}
                    >
                        {p.name}
                    </button>
                ))}
            </div>

            <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Environment Brightness</label>
                    <input
                        type="range"
                        min={0} max={2} step={0.05}
                        value={state.lighting.ambientIntensity ?? 1}
                        onChange={(e) => dispatch({ type: "SET_LIGHTING", payload: { ambientIntensity: parseFloat(e.target.value) } })}
                        className="w-24 accent-orange-500"
                    />
                </div>
            </div>
        </div>
    );
}
