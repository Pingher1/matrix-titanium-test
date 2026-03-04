import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DigitalRain from './DigitalRain';
import AvatarCarousel from './AvatarCarousel';
import VoicePrompt from './VoicePrompt';
import RROTIcon from "./RROTIcon";
import VoiceE2EDemo from "./VoiceE2EDemo";

const MatrixEntrance: React.FC = () => {
    // Tracks which sphere id ('A', 'B', 'C') is active in the carousel
    const [activeSector, setActiveSector] = useState<string>('A');
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 bg-black overflow-hidden font-sans">
            {/* 1. Background Layer: Classic Green Matrix Digital Rain */}
            <DigitalRain speed={1.5} density={0.92} color="#00ff41" />

            {/* 2. Middle Layer: The 3D Interactive Carousel */}
            <div className="absolute inset-0 z-10">
                <AvatarCarousel onSphereSelect={setActiveSector} />
            </div>

            {/* 3. Foreground UI Layer: Only visible when Sphere 'A' (The AI Core) is selected */}
            <div className={`transition-opacity duration-1000 ${activeSector === 'A' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* KRONOS AI Avatar - Always visible on the Matrix Hub */}
                <RROTIcon />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 mt-40 flex flex-col items-center gap-6 drop-shadow-2xl w-full max-w-lg">

                    {/* Embedded RROT Voice Core */}
                    <VoicePrompt onJobStarted={(id) => console.log("Job intercepted on Matrix screen:", id)} />

                    {/* The Command Interface - Placed right above the Enter Forge Button */}
                    <div style={{ position: "absolute", bottom: "120px", left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
                        <VoiceE2EDemo />
                    </div>

                    <button
                        onClick={() => navigate('/forge')}
                        className="px-12 py-4 bg-gradient-to-r from-[#e85d04] to-[#f48c06] hover:from-[#f48c06] hover:to-[#ffba08] text-white font-black tracking-[0.3em] uppercase rounded-sm border border-[#f48c06] shadow-[0_0_40px_rgba(234,88,12,0.6)] transition-all hover:scale-105"
                    >
                        ENTER THE FORGE
                    </button>
                    <p className="text-center text-[#f48c06] text-[10px] tracking-[0.3em] font-bold opacity-80 drop-shadow-md">
                        WORKSPACE INITIALIZED
                    </p>
                </div>
            </div>

            {/* Off-Focus Overlay Text (When B or C is selected) */}
            <div className={`absolute inset-0 z-20 pointer-events-none flex items-center justify-center transition-opacity duration-500 ${activeSector !== 'A' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-black/80 backdrop-blur-md px-8 py-4 border border-white/10 rounded-2xl text-center">
                    <h2 className="text-white text-2xl font-black uppercase tracking-[0.2em] italic mb-1">Sector {activeSector} Locked</h2>
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Return to Sector A to Access The Forge</p>
                </div>
            </div>
        </div>
    );
};

export default MatrixEntrance;
