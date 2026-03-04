import React from 'react';

// CLEAN BASE: MATRIX GATEWAY
export default function MatrixGateway() {
    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center font-mono overflow-hidden">

            {/* The Matrix Rain Background */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-screen" />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center mt-20">
                {/* 
                  The Commander will inject the physical 3D AI Vanguard here.
                  Providing a heavy bounding box perfectly sized to match his screenshot.
                */}
                <div className="w-[300px] h-[300px] mb-8 relative border border-white/5 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,65,0.1)] backdrop-blur-md">
                    <div className="absolute inset-0 bg-[#00ff41]/5 flex items-center justify-center">
                        <p className="text-[#00ff41] text-[10px] tracking-widest text-center opacity-50">
                            AWAITING VANGUARD AI INJECTION
                        </p>
                    </div>
                </div>

                {/* The Primary Initiation Trigger exactly as pictured */}
                <button
                    onClick={() => window.location.href = '/hub-transition'} // Temporary routing placeholder
                    className="w-[90%] py-4 bg-[#0dd14e] text-white font-black tracking-[0.2em] rounded border-2 border-transparent hover:border-white/50 transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] active:scale-95"
                >
                    INITIATE SHATTERED JUMP
                </button>

                <p className="mt-4 text-[#00ff41] font-bold text-xs tracking-[0.3em] opacity-80 uppercase">
                    System Ready - Awaiting Command
                </p>
            </div>

        </div>
    );
}
