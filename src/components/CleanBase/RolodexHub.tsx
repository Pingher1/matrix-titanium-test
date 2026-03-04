import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, ArrowLeft } from 'lucide-react';

const DECKS = [
    { id: 'd1', title: 'EXPANSION', sub: 'RESERVED NODE', img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1200' },
    { id: 'd2', title: 'BUYER', sub: 'BARRERE ACCESS', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200' },
    { id: 'd3', title: 'SELLERS', sub: 'ASSET LIQUIDATION', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09c15ffa?q=80&w=1200' },
];

export default function RolodexHub() {
    const [currentIndex, setCurrentIndex] = useState(1); // Default to Center (BUYER)

    const nextCard = () => {
        if (currentIndex < DECKS.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const prevCard = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
        <div className="absolute inset-0 bg-[#05080a] overflow-hidden flex flex-col font-sans text-white">

            {/* Top Navigation Bar */}
            <div className="absolute top-8 w-full px-12 flex justify-between items-start z-50">
                <button className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>

                <div className="text-right">
                    <h1 className="text-[#1eb8b1] font-bold tracking-[0.2em] italic text-sm">
                        RICHARDSON ELITE HUB
                    </h1>
                    <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase font-mono mt-1">
                        SECURE_ACTIVE_SESSION
                    </p>
                </div>
            </div>

            {/* Main Rolodex Carousel Container */}
            <div className="flex-1 w-full h-full flex items-center justify-center pt-10">
                <div className="relative w-full max-w-7xl flex items-center justify-center h-[75vh]">

                    <AnimatePresence initial={false}>
                        {DECKS.map((deck, idx) => {
                            // Calculate position relative to the active card
                            const position = idx - currentIndex;

                            // Framer Motion Dynamic States based on position
                            const isActive = position === 0;
                            const isLeft = position < 0;
                            const isRight = position > 0;

                            // Visual mathematical constraints echoing the snapshot
                            const translateOffset = position * 65; // Vw physical separation
                            const scale = isActive ? 1 : 0.8;
                            const opacity = isActive ? 1 : 0.4;
                            const zIndex = isActive ? 30 : 10;

                            return (
                                <motion.div
                                    key={deck.id}
                                    className="absolute w-[450px] md:w-[600px] h-[600px] md:h-[700px] rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                                    animate={{
                                        x: `${translateOffset}%`,
                                        scale: scale,
                                        opacity: opacity,
                                        zIndex: zIndex
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 25
                                    }}
                                    style={{
                                        // Specific Cyan Glow solely on the active card matching Image 2
                                        boxShadow: isActive ? '0 0 50px rgba(30,184,177,0.4), inset 0 0 0 2px rgba(30,184,177,0.5)' : 'none',
                                    }}
                                >
                                    {/* Real Estate Photography Background */}
                                    <div className="absolute inset-0">
                                        <img src={deck.img} alt={deck.title} className="w-full h-full object-cover" />
                                        {/* Tonal gradient mapping the deep shadows from the screenshot */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/95" />
                                    </div>

                                    {/* Telemetry and Typography Overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-10">
                                        <div className="absolute top-10 left-10 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#1eb8b1]" />
                                            <span className="text-white font-bold tracking-widest text-xs">2026</span>
                                        </div>

                                        <div className="mt-8 text-center">
                                            <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl">
                                                {deck.title}
                                            </h2>
                                            <p className="text-gray-300 font-bold tracking-[0.5em] text-sm mt-4 custom-text-shadow">
                                                {deck.sub}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button - Only interactive when active */}
                                    <div className="absolute bottom-16 w-full px-12 z-40">
                                        <button
                                            className={`w-full py-5 rounded-full font-bold tracking-[0.4em] text-xs transition-all ${isActive
                                                    ? 'bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#1eb8b1]/50 text-white shadow-xl hover:shadow-[0_0_30px_rgba(30,184,177,0.3)]'
                                                    : 'bg-black/20 text-transparent border-transparent pointer-events-none'
                                                }`}
                                        >
                                            {isActive ? 'INITIALIZE ACTION' : ''}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls Panel */}
            <div className="absolute bottom-12 w-full px-12 flex justify-between items-center z-50">
                <button className="flex items-center gap-3 px-5 py-3 rounded-full bg-black/40 border border-white/5 hover:border-white/20 transition-all backdrop-blur-sm text-gray-400 hover:text-white">
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest">SECURE SHARE</span>
                </button>

                {/* Left/Right Cyclic Anchors and Pagination Tracker */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={prevCard}
                        disabled={currentIndex === 0}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-black/50 border ${currentIndex > 0 ? 'border-white/10 hover:border-[#1eb8b1]/50 text-white' : 'border-transparent text-gray-700'
                            }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="flex gap-2">
                        {DECKS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-[#1eb8b1]' : 'w-2 bg-gray-600'
                                    }`}
                            />
                        ))}
                        {/* Fake dots to simulate broader carousel from image */}
                        <div className="h-1.5 w-2 rounded-full bg-gray-700/50" />
                        <div className="h-1.5 w-2 rounded-full bg-gray-700/30" />
                        <div className="h-1.5 w-2 rounded-full bg-gray-700/10" />
                    </div>

                    <button
                        onClick={nextCard}
                        disabled={currentIndex === DECKS.length - 1}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-black/50 border ${currentIndex < DECKS.length - 1 ? 'border-white/10 hover:border-[#1eb8b1]/50 text-white' : 'border-transparent text-gray-700'
                            }`}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <style>{`
                .custom-text-shadow {
                    text-shadow: 0 4px 20px rgba(0,0,0,0.9);
                }
            `}</style>
        </div>
    );
}
