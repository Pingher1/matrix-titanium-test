import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TransmissionProtocol: React.FC = () => {
    const [isTransmitting, setIsTransmitting] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Fast, aggressive progress bar simulation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15) + 5;
            });
        }, 50);

        // Terminate transmission after exactly 1.5 seconds
        const timeout = setTimeout(() => {
            setIsTransmitting(false);
        }, 1500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <AnimatePresence>
            {isTransmitting && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center font-mono pointer-events-none"
                >
                    {/* Faint Matrix Rain Background Image Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-screen" />

                    <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
                        {/* Target Crosshair Decoration */}
                        <div className="flex justify-between w-full h-8 opacity-50">
                            <div className="w-8 h-full border-t-2 border-l-2 border-[#00ff41]"></div>
                            <div className="w-8 h-full border-t-2 border-r-2 border-[#00ff41]"></div>
                        </div>

                        <div className="text-center flex flex-col gap-2">
                            <h1 className="text-[#00ff41] font-black tracking-[0.5em] text-2xl uppercase animate-pulse drop-shadow-[0_0_15px_rgba(0,255,65,0.8)]">
                                TACTICAL UPLINK
                            </h1>
                            <p className="text-gray-400 text-[10px] tracking-widest uppercase">
                                Establishing secure handshake transmission...
                            </p>
                            <p className="text-white font-bold text-sm tracking-[0.4em] mt-2">
                                NODE_SYNC: {Math.min(progress, 100)}%
                            </p>
                        </div>

                        <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden border border-white/5 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                            <div
                                className="h-full bg-[#00ff41] transition-all duration-75 relative"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            >
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/30 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Bottom Crosshair Decoration */}
                        <div className="flex justify-between w-full h-8 opacity-50">
                            <div className="w-8 h-full border-b-2 border-l-2 border-[#00ff41]"></div>
                            <div className="w-8 h-full border-b-2 border-r-2 border-[#00ff41]"></div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TransmissionProtocol;
