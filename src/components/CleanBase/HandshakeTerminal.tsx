import React from 'react';

// CLEAN BASE: HANDSHAKE TERMINAL (The Load Screen)
export default function HandshakeTerminal() {
    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center font-mono">
            {/* The primary glass card matching Image 3 */}
            <div className="w-[85%] max-w-md bg-[#0a0f12]/80 backdrop-blur-xl border border-[#1eb8b1]/20 rounded-[2.5rem] p-10 flex flex-col items-center">

                {/* Glowing Title */}
                <h1 className="text-[#1eb8b1] font-bold italic tracking-[0.3em] text-xs mb-12 drop-shadow-[0_0_10px_rgba(30,184,177,0.5)]">
                    SECURITY HANDSHAKE ACTIVE
                </h1>

                {/* Terminal Readout exactly matching the snapshot */}
                <div className="w-full flex flex-col gap-4 text-[#1eb8b1] text-[10px] tracking-widest uppercase mb-12 opacity-90">
                    <p>&gt; INITIALIZING KRONOS_CORE_V15.0</p>
                    <p>&gt; SYNCING ARCHITECTURAL ASSETS</p>
                    <p>&gt; REIFYING VISUAL DNA NODES</p>
                    <p>&gt; BARRERE ACCESS PROTOCOL: GRANTED</p>
                    <p>&gt; GLOBAL STATUS: SYSTEM READY</p>
                </div>

                {/* System Loading pill button */}
                <div className="w-full py-4 bg-white/5 border border-white/5 rounded-full text-center">
                    <span className="text-gray-500 font-bold italic tracking-[0.4em] text-[10px]">
                        SYSTEM LOADING...
                    </span>
                </div>
            </div>

            {/* Bottom Screen Label */}
            <div className="absolute bottom-12 w-full text-center">
                <p className="text-gray-600 font-bold tracking-[0.5em] text-[8px] uppercase">
                    RICHARDSON ELITE OPERATIONS TERMINAL
                </p>
            </div>
        </div>
    );
}
