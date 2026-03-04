import React from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarCarousel from './AvatarCarousel';
import { useSmythOSState, useSmythOSDispatch } from '../state/smythos/reducer';

export default function EliteDeck() {
    const dispatch = useSmythOSDispatch();
    const navigate = useNavigate();
    const activePanel = useSmythOSState().ui.currentPanel;

    return (
        <div className="absolute inset-0 bg-black overflow-hidden flex flex-col font-sans">
            {/* Themed Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-20 mix-blend-screen"
                    style={{
                        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,122,24,0.15), transparent 60%)",
                    }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#ff7a18]/5 to-transparent mix-blend-screen" />
            </div>

            {/* Stakeholder NavBar */}
            <div className="relative z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-orange-500/30 flex items-center justify-center bg-black/50 shadow-[0_0_15px_rgba(255,122,24,0.2)]">
                        <span className="text-orange-500 font-bold tracking-widest text-xs">K</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-[0.2em] text-white">THE ELITE DECK</h1>
                        <p className="text-xs text-orange-400 font-mono tracking-widest">KRONOS ECOSYSTEM PORTAL</p>
                    </div>
                </div>
            </div>

            {/* Main Presentation Tier */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">

                {/* The 3-Ring Matrix Carousel is the centerpiece */}
                <div className="w-full max-w-5xl h-[55vh] relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 backdrop-blur-sm">
                    <AvatarCarousel onSphereSelect={() => { }} />
                </div>

                {/* Quick Access Tiles underneath the Carousel */}
                <div className="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => navigate('/forge')}
                        className="group flex flex-col items-start text-left p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all backdrop-blur-md"
                    >
                        <h3 className="text-lg font-bold text-white tracking-widest mb-2 group-hover:text-orange-400 transition-colors">THE FORGE</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Access the primary AI workstation to generate, sculpt, and configure proprietary 3D entities.</p>
                    </button>

                    <button
                        onClick={() => dispatch({ type: "SET_UI", payload: { currentPanel: "settings" } })}
                        className="group flex flex-col items-start text-left p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-md"
                    >
                        <h3 className="text-lg font-bold text-white tracking-widest mb-2 group-hover:text-gray-200 transition-colors">PERMISSIONS</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Manage API vault keys, organizational access tiers, and WebRTC streaming rights.</p>
                    </button>

                    <div className="group flex flex-col items-start text-left p-6 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md opacity-60">
                        <h3 className="text-lg font-bold text-gray-500 tracking-widest mb-2 flex items-center gap-3">
                            CATALOG <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded tracking-normal">SOON</span>
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Secure Adobe Stock cloud synchronization and proprietary mesh libraries.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
