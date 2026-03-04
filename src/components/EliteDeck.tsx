import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import { Lock, ShieldAlert, CheckCircle2, Hexagon, Layers, Gamepad2, BrainCircuit } from 'lucide-react';

const MODULES = [
    { id: 'm1', title: 'THE FORGE', color: '#ff2a2a', icon: <Hexagon className="w-12 h-12" />, route: '/forge' },
    { id: 'm2', title: 'BARBIE ENGINE', color: '#ff1493', icon: <Gamepad2 className="w-12 h-12" />, route: '/barbieworld' },
    { id: 'm3', title: 'STORYBOOK', color: '#ffaa00', icon: <Layers className="w-12 h-12" />, route: '/stories' },
    { id: 'm4', title: 'ARCHITECT AI', color: '#00ff41', icon: <BrainCircuit className="w-12 h-12" />, route: '/kronos' },
    { id: 'm5', title: 'ADMIN VAULT', color: '#ff2a2a', icon: <ShieldAlert className="w-12 h-12" />, route: '/admin' }
];

export default function EliteDeck() {
    const [isLocked, setIsLocked] = useState(true);
    const [passcode, setPasscode] = useState('');
    const [accessGranted, setAccessGranted] = useState(false);

    // 3D Cylinder Physics
    const rotationY = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Handshake Protocol Logic
    const handleKeypad = (num: string) => {
        if (passcode.length < 4) {
            const newCode = passcode + num;
            setPasscode(newCode);
            if (newCode === '0000') {
                setTimeout(() => {
                    setAccessGranted(true);
                    setTimeout(() => setIsLocked(false), 800);
                }, 400);
            } else if (newCode.length === 4) {
                // Incorrect code, reset
                setTimeout(() => setPasscode(''), 500);
            }
        }
    };

    // Kinetic Drag Logic for the 3D Prism
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = (event: any, info: any) => {
        setIsDragging(false);
        const currentRot = rotationY.get();
        const velocity = info.velocity.x;
        // Snap to nearest face (72 degrees per face for 5 items: 360 / 5)
        const snapAngle = 360 / MODULES.length;
        const targetRot = Math.round((currentRot + velocity * 0.2) / snapAngle) * snapAngle;

        animate(rotationY, targetRot, {
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1.5
        });
    };

    if (isLocked) {
        return (
            <div className="absolute inset-0 bg-black flex items-center justify-center font-mono">
                {/* Crimson Matrix Background */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop')] bg-cover mix-blend-screen grayscale sepia-[100%] hue-rotate-[-50deg] saturate-[500%]" />

                <div className="relative z-10 w-full max-w-sm p-8 border border-red-900/50 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(255,42,42,0.2)] rounded-3xl flex flex-col items-center">
                    <div className="mb-8">
                        {accessGranted ? <CheckCircle2 className="w-12 h-12 text-[#00ff41] animate-pulse" /> : <Lock className="w-12 h-12 text-red-600 animate-pulse" />}
                    </div>
                    <h2 className={`text-xl font-black tracking-[0.4em] mb-6 ${accessGranted ? 'text-[#00ff41]' : 'text-red-600'}`}>
                        {accessGranted ? 'ACCESS GRANTED' : 'LUCID PRISM V12.5'}
                    </h2>

                    <div className="flex gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < passcode.length ? (accessGranted ? 'bg-[#00ff41] border-[#00ff41]' : 'bg-red-600 border-red-600 shadow-[0_0_10px_#ff2a2a]') : 'border-gray-800'}`} />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'CLR', 0, 'ENT'].map((btn) => (
                            <button
                                key={btn}
                                onClick={() => typeof btn === 'number' ? handleKeypad(btn.toString()) : setPasscode('')}
                                className="h-12 bg-red-950/20 hover:bg-red-900/50 border border-red-900/30 text-red-500 font-bold tracking-widest rounded transition-colors active:scale-95"
                            >
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-[#050000] overflow-hidden flex flex-col items-center justify-center font-sans perspective-[1500px]">
            {/* Global Crimson Environment */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale sepia-[100%] hue-rotate-[-50deg] saturate-[500%]" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#1a0000]/60 to-black/95 pointer-events-none" />
            </div>

            <div className="absolute top-12 text-center z-20 pointer-events-none">
                <h1 className="text-4xl font-black tracking-[0.4em] text-white drop-shadow-[0_0_20px_rgba(255,42,42,0.8)]">LUCID PRISM</h1>
                <p className="text-red-500 font-mono text-xs tracking-[0.3em] mt-3 uppercase">Chronos Beta Carousel Array v12.5</p>
            </div>

            {/* The 3D Preserve-3D Container */}
            <motion.div
                ref={containerRef}
                drag="x"
                dragElastic={0.1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{ rotateY: rotationY }}
                className="relative w-full max-w-[400px] h-[500px] transform-style-3d cursor-grab active:cursor-grabbing z-10"
            >
                {/* Translate Z pushes items outwards by ~350px radius */}
                {MODULES.map((mod, index) => {
                    const angle = (360 / MODULES.length) * index;
                    return (
                        <div
                            key={mod.id}
                            className="absolute inset-0 flex items-center justify-center backface-hidden"
                            style={{
                                transform: `rotateY(${angle}deg) translateZ(400px)`,
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {/* The physical Crimson Glass Card */}
                            <button
                                onClick={() => !isDragging && (window.location.href = mod.route)}
                                className="w-[320px] h-[450px] bg-black/40 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-8 group hover:border-red-500 hover:bg-black/80 transition-all shadow-[0_0_50px_rgba(255,42,42,0.1)] hover:shadow-[0_0_80px_rgba(255,42,42,0.4)]"
                                style={{ transform: 'translateZ(1px)' }} // Forces hardware acceleration
                            >
                                <div className="p-6 rounded-full bg-red-950/40 border border-red-500/20 text-red-500 group-hover:scale-110 group-hover:bg-red-900 group-hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                                    {mod.icon}
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-black tracking-widest text-white mb-2">{mod.title}</h2>
                                    <p className="text-red-400 font-mono text-xs tracking-widest uppercase">System Core Active</p>
                                </div>

                                <div className="w-full h-1 bg-red-900/50 mt-8 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-1/3 group-hover:w-full transition-all duration-1000 shadow-[0_0_10px_#ff2a2a]"></div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </motion.div>

            <div className="absolute bottom-12 z-20 pointer-events-none font-mono text-gray-500 text-[10px] tracking-[0.5em] uppercase text-center w-full">
                Kinetic Drag Enabled • Pure Modular Isolation
            </div>

            <style>{`
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .bg-radial-gradient {
                    background-image: radial-gradient(var(--tw-gradient-stops));
                }
            `}</style>
        </div>
    );
}
