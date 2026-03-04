import React from 'react';
import DigitalRain from './DigitalRain';

const LandingGateway: React.FC = () => {

    return (
        <div className="absolute inset-0 bg-black overflow-hidden font-sans">
            {/* 1. Background Layer: Classic Green Matrix Digital Rain */}
            <DigitalRain speed={1.5} density={0.92} color="#00ff41" />

            {/* 2. Middle Layer: The 2D Concept Art Image */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center -mt-24">
                <img
                    src="/assets/pepper_concept.png"
                    alt="KRONOS Architect"
                    className="max-h-[60vh] object-contain drop-shadow-[0_0_35px_rgba(0,255,65,0.4)] animate-pulse-slow"
                />
            </div>

            {/* 3. Foreground UI Layer */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 drop-shadow-2xl w-full max-w-2xl pointer-events-auto">

                <button
                    onClick={() => window.location.href = '/deck'}
                    className="px-16 py-5 bg-gradient-to-r from-[#00ff41] to-[#008f11] hover:from-[#008f11] hover:to-[#00ff41] text-white font-black tracking-[0.4em] text-xl uppercase rounded-sm border-2 border-[#00ff41] shadow-[0_0_40px_rgba(0,255,65,0.6)] transition-all hover:scale-105"
                >
                    INITIATE SHATTERED JUMP
                </button>
                <p className="text-center text-[#00ff41] text-[12px] tracking-[0.4em] font-bold opacity-80 drop-shadow-lg">
                    SYSTEM READY • AWAITING COMMAND
                </p>
            </div>
        </div>
    );
};

export default LandingGateway;
