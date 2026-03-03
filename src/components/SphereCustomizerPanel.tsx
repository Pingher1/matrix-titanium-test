import React from 'react';
import { useSmythOSState, useSmythOSDispatch } from '../state/smythos/reducer';
import AssetBrowser from './AssetBrowser';
import BackgroundSelector from './BackgroundSelector';

const SphereCustomizerPanel: React.FC = () => {
    const state = useSmythOSState();
    const dispatch = useSmythOSDispatch();

    const p = state.pbr;
    const t = state.pbr.transform;
    const ui = state.ui;

    // Helper to deeply update PBR keys without repeating dispatch boilerplate
    const setPBR = (key: keyof typeof p, value: any) => {
        dispatch({ type: 'SET_PBR', payload: { [key]: value } });
    };

    return (
        <div className="flex flex-col gap-6 p-6 text-white pb-24">
            <h2 className="text-xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#00d8ff] to-[#4f46e5] mb-2 border-b border-white/10 pb-4">
                // CORE PROTOCOLS
            </h2>

            {/* CLOUD TEXTURES */}
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Material Topology Maps</label>
                <select
                    value={state.textures.find(tex => tex.type === 'base')?.url || ""}
                    onChange={(e) => {
                        const url = e.target.value;
                        if (url) {
                            dispatch({ type: 'IMPORT_TEXTURE', payload: { id: 'base-map', type: 'base', url } });
                        } else {
                            dispatch({ type: 'REMOVE_TEXTURE', payload: { id: 'base-map' } });
                        }
                    }}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#00d8ff] transition-colors"
                >
                    <option value="">[ NONE - SMOOTH ]</option>
                    <option value="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg">Water Ripples (Bump)</option>
                    <option value="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/golfball.jpg">Golfball Dimples (Bump)</option>
                    <option value="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/noise.png">Static Noise (Bump)</option>
                </select>
                <span className="text-[10px] text-gray-500 font-mono mt-1">*Loads externally to bypass local storage</span>
            </div>

            {/* ADOBE STOCK BROWSER */}
            <div className="flex flex-col gap-2 mt-2">
                <AssetBrowser />
            </div>

            {/* MATERIAL PRESETS */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Core Material</label>
                <div className="flex bg-black/50 rounded-lg p-1">
                    {(['solid', 'glass', 'liquid'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => {
                                dispatch({ type: 'SET_MATERIAL_STATE', payload: mode });
                                if (mode === 'solid') {
                                    setPBR('transmission', 0); setPBR('roughness', 0.5); setPBR('metalness', 0.8);
                                } else if (mode === 'glass') {
                                    setPBR('transmission', 1); setPBR('roughness', 0.1); setPBR('metalness', 0.1);
                                } else if (mode === 'liquid') {
                                    setPBR('transmission', 0.9); setPBR('roughness', 0.0); setPBR('metalness', 0.3);
                                }
                            }}
                            className={`flex-1 py-1 text-xs font-bold uppercase rounded-md transition-all ${p.materialState === mode ? 'bg-[#00ff41]/20 text-[#00ff41]' : 'text-white/40 hover:text-white'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* 360 HDRI BACKGROUNDS */}
            <div className="flex flex-col gap-2 mt-2 border-t border-white/10 pt-4">
                <BackgroundSelector />
            </div>

            {/* SPATIAL TRANSFORMS (X, Y, Z) */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
                <label className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">Spatial Transforms</label>

                {/* Horizontal (X) */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span>X-Axis (Horizontal)</span>
                        <span>{t.x.toFixed(2)}</span>
                    </div>
                    <input
                        type="range" min="-4" max="4" step="0.1"
                        value={t.x}
                        onChange={(e) => dispatch({ type: 'SET_TRANSFORM', payload: { x: parseFloat(e.target.value) } })}
                        className="w-full accent-orange-400"
                    />
                </div>

                {/* Vertical (Y) */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span>Y-Axis (Vertical)</span>
                        <span>{t.y.toFixed(2)}</span>
                    </div>
                    <input
                        type="range" min="-4" max="4" step="0.1"
                        value={t.y}
                        onChange={(e) => dispatch({ type: 'SET_TRANSFORM', payload: { y: parseFloat(e.target.value) } })}
                        className="w-full accent-orange-400"
                    />
                </div>

                {/* Depth (Z) */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span>Z-Axis (Depth)</span>
                        <span>{t.z.toFixed(2)}</span>
                    </div>
                    <input
                        type="range" min="-6" max="6" step="0.1"
                        value={t.z}
                        onChange={(e) => dispatch({ type: 'SET_TRANSFORM', payload: { z: parseFloat(e.target.value) } })}
                        className="w-full accent-orange-400"
                    />
                </div>
            </div>

            {/* PBR SLIDERS */}
            <div className="flex flex-col gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                        <span>Transmission (Clear/Liquid)</span>
                        <span className="text-[#00d8ff]">{p.transmission.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={p.transmission} onChange={(e) => setPBR('transmission', parseFloat(e.target.value))} className="w-full accent-[#00d8ff]" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                        <span>Roughness (Blur)</span>
                        <span className="text-[#00d8ff]">{p.roughness.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={p.roughness} onChange={(e) => setPBR('roughness', parseFloat(e.target.value))} className="w-full accent-[#00d8ff]" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                        <span>Metalness (Polish)</span>
                        <span className="text-[#00d8ff]">{p.metalness.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={p.metalness} onChange={(e) => setPBR('metalness', parseFloat(e.target.value))} className="w-full accent-[#00d8ff]" />
                </div>
                <div className="flex flex-col gap-1 opacity-50">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                        <span>Index of Refraction (IOR)</span>
                        <span className="text-[#00d8ff]">{p.ior.toFixed(2)}</span>
                    </label>
                    <input type="range" min="1" max="2.3" step="0.05" value={p.ior} onChange={(e) => setPBR('ior', parseFloat(e.target.value))} className="w-full accent-[#00d8ff]" />
                </div>
            </div>

            {/* IRON MAN FX */}
            <div className="flex flex-col gap-3 bg-black/30 p-3 rounded-xl border border-white/5 mb-3">
                <label className="text-xs font-bold text-[#f48c06] uppercase tracking-widest drop-shadow-[0_0_10px_rgba(244,140,6,0.5)]">Bubbly Iron Man FX</label>

                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arc Reactor Light</span>
                    <input type="checkbox" checked={p.chestLight} onChange={(e) => setPBR('chestLight', e.target.checked)} className="accent-[#00d8ff] w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Neon Disco Pulse</span>
                    <input type="checkbox" checked={p.discoFlash} onChange={(e) => setPBR('discoFlash', e.target.checked)} className="accent-[#f48c06] w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Liquid Raindrops</span>
                    <input type="checkbox" checked={p.raindrops} onChange={(e) => setPBR('raindrops', e.target.checked)} className="accent-[#00ff41] w-4 h-4 cursor-pointer" />
                </div>
            </div>

            {/* SERVER TELEMETRY */}
            <div className="flex flex-col gap-3 bg-black/30 p-3 rounded-xl border border-white/5 mb-3">
                <label className="text-xs font-bold text-[#00ff41] uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]">Server Telemetry</label>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('avatar:screenshot'))}
                    className="w-full bg-[#00ff41]/20 hover:bg-[#00ff41]/40 border border-[#00ff41]/50 text-[#00ff41] font-bold py-2 rounded transition-all uppercase text-[10px] tracking-widest"
                >
                    Capture System Snapshot
                </button>
            </div>

            {/* BRANDING */}
            <div className="flex flex-col gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">3D Engraving</label>
                <input
                    type="text"
                    value={ui.presetId || ""}
                    onChange={(e) => dispatch({ type: 'SET_UI', payload: { presetId: e.target.value.toUpperCase() } })}
                    maxLength={2}
                    placeholder="e.g. R"
                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-[#00ff41] text-center font-black tracking-widest uppercase text-xl"
                />
            </div>

            {/* CORE COLORS */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hull Hue</span>
                    <input type="color" value={p.colorHex} onChange={(e) => setPBR('colorHex', e.target.value)} className="w-6 h-6 outline-none bg-transparent cursor-pointer border-0 p-0" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Radiance</span>
                    <input type="color" value={p.emissiveHex} onChange={(e) => setPBR('emissiveHex', e.target.value)} className="w-6 h-6 outline-none bg-transparent cursor-pointer border-0 p-0" />
                </div>
            </div>

        </div >
    );
};

export default SphereCustomizerPanel;
