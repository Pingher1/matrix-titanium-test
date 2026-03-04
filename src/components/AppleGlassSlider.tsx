import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Sparkles, BookOpen, Plus, Droplets } from 'lucide-react';

interface EcosystemNode {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    route: string;
    status: 'ONLINE' | 'STANDBY' | 'BUILDING';
}

const NODES: EcosystemNode[] = [
    {
        id: 'forge',
        title: 'THE FORGE',
        description: 'Primary Master Builder Lab & Asset Forge.',
        icon: <Box className="w-8 h-8" />,
        color: '#00ff41',
        route: '/forge',
        status: 'ONLINE'
    },
    {
        id: 'barbie',
        title: 'BARBIE WORLD',
        description: 'Dreamhouse 3D sandbox and styling studio.',
        icon: <Sparkles className="w-8 h-8" />,
        color: '#ff2a85',
        route: '/barbieworld',
        status: 'ONLINE'
    },
    {
        id: 'story',
        title: 'STORYBOOK',
        description: 'AI logic matrix generated narrative library.',
        icon: <BookOpen className="w-8 h-8" />,
        color: '#ffaa00',
        route: '/stories',
        status: 'STANDBY'
    },
    {
        id: 'tutorial',
        title: 'TUTORIAL EDITOR',
        description: 'Native video production and screen recording suite.',
        icon: <Box className="w-8 h-8" />, // Video icon unavailable in current Lucide import, using fallback Box
        color: '#ff2a2a',
        route: '#',
        status: 'ONLINE'
    }
];

interface AppleGlassSliderProps {
    onDeployTutorialEditor?: () => void;
}

const AppleGlassSlider: React.FC<AppleGlassSliderProps> = ({ onDeployTutorialEditor }) => {
    const [isVisible, setIsVisible] = useState(true);

    // Auto-hide after 15 seconds logic
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isVisible) {
            timeoutId = setTimeout(() => {
                setIsVisible(false);
            }, 15000);
        }
        return () => clearTimeout(timeoutId);
    }, [isVisible]);

    return (
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pointer-events-none z-50">

            {/* SOUTH WALL TILE (Water Element): ECOSYSTEM DRAWER TRIGGER */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/80 p-4 border border-b-0 border-[#00ff41]/50 rounded-t-2xl text-[#00ff41] hover:bg-[#00ff41]/20 transition-all z-50 group shadow-[0_0_30px_rgba(0,255,65,0.2)]"
            >
                <Droplets className="w-6 h-6 group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100" />
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full h-[60vh] bg-black/70 backdrop-blur-3xl border-t border-[#00ff41]/30 pb-4 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden relative"
                        onMouseEnter={() => setIsVisible(true)} // Keep visible while hovering
                    >
                        {/* Elite Deck Background Image Overlay */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-screen" />

                        <div className="w-full h-full flex flex-col pt-8 relative z-10">
                            <div className="px-12 mb-6 flex justify-between items-end">
                                <div>
                                    <h2 className="text-white font-black tracking-[0.3em] text-3xl drop-shadow-md">THE KRONOS NODES</h2>
                                    <p className="text-[#00ff41] font-mono text-xs mt-2 tracking-widest uppercase">Matrix auto-collapse active (15s). Select an isolated node to initiate Neural sync.</p>
                                </div>
                                <button className="flex items-center gap-2 px-6 py-3 border border-[#00ff41]/50 bg-black/50 text-[#00ff41] rounded-full hover:bg-[#00ff41]/20 transition-all font-mono text-xs font-bold tracking-widest backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                                    <Plus className="w-4 h-4" /> DUPLICATE NODE
                                </button>
                            </div>

                            {/* The Horizontal Glass Slider */}
                            <div className="w-full flex-1 overflow-x-auto pb-12 pt-4 px-12 custom-scrollbar-horizontal hide-scroll-arrows snap-x snap-mandatory">
                                <div className="flex gap-[25px] w-max">
                                    {NODES.map((node) => (
                                        <motion.button
                                            key={node.id}
                                            whileHover={{ scale: 1.02, y: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                if (node.id === 'tutorial' && onDeployTutorialEditor) {
                                                    onDeployTutorialEditor();
                                                } else {
                                                    window.location.href = node.route;
                                                }
                                            }}
                                            className="snap-center relative text-left outline-none"
                                            style={{ '--node-color': node.color } as React.CSSProperties}
                                        >
                                            {/* Glass Card Architecture */}
                                            <div
                                                className="w-[300px] h-[400px] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative border border-white/10 group shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 100%)',
                                                    backdropFilter: 'blur(20px)',
                                                    WebkitBackdropFilter: 'blur(20px)'
                                                }}
                                            >
                                                {/* Dynamic Hover Glow */}
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl"
                                                    style={{ background: `radial-gradient(circle at 50% 0%, ${node.color} 0%, transparent 70%)` }}
                                                />

                                                {/* Top Section: Icon & Status */}
                                                <div className="z-10 flex justify-between items-start">
                                                    <div
                                                        className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md"
                                                        style={{ color: node.color }}
                                                    >
                                                        {node.icon}
                                                    </div>
                                                    <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'ONLINE' ? 'animate-pulse' : ''}`} style={{ backgroundColor: node.status === 'ONLINE' ? node.color : '#666' }} />
                                                        <span className="text-[9px] font-mono tracking-widest text-white/70">{node.status}</span>
                                                    </div>
                                                </div>

                                                {/* Bottom Section: Titles */}
                                                <div className="z-10 mt-auto">
                                                    <div className="w-12 h-1 mb-4 rounded-full bg-white/20 transition-all group-hover:w-24" style={{ backgroundColor: node.color }} />
                                                    <h3 className="text-2xl font-black text-white tracking-widest mb-2 drop-shadow-lg">{node.title}</h3>
                                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">{node.description}</p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}

                                    {/* Infinite Add Node Card */}
                                    <button className="snap-center relative text-left outline-none group opacity-50 hover:opacity-100 transition-opacity">
                                        <div
                                            className="w-[300px] h-[400px] rounded-3xl flex flex-col justify-center items-center relative border border-white/10 border-dashed"
                                            style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}
                                        >
                                            <div className="p-6 rounded-full bg-black/40 border border-white/5 mb-4 group-hover:bg-[#00ff41]/10 transition-colors">
                                                <Plus className="w-10 h-10 text-gray-500 group-hover:text-[#00ff41]" />
                                            </div>
                                            <h3 className="text-sm font-black text-white/50 tracking-widest">INITIALIZE NEW NODE</h3>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar-horizontal::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.3);
                    border-radius: 10px;
                    margin: 0 24px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 65, 0.5);
                }
                .hide-scroll-arrows::-webkit-scrollbar-button {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default AppleGlassSlider;
