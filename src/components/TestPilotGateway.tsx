import React, { useState } from 'react';
import DigitalRain from './DigitalRain';
import { Terminal, Activity, Wifi, ShieldCheck, Cpu, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppleGlassSlider from './AppleGlassSlider';

const TestPilotGateway: React.FC = () => {
    // Basic terminal state to simulate an AI chat UI and hold transcripts
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'assistant', content: 'OMNISCIENT FORENSIC ARCHITECT ONLINE.' },
        { role: 'assistant', content: 'Connection secured. Primary Hub access granted.' }
    ]);
    const [input, setInput] = useState('');
    const [isWestMenuOpen, setIsWestMenuOpen] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userCommand = input;
        setInput(''); // Immediate UX clear

        const newMessages = [...messages, { role: 'user', content: userCommand }];
        setMessages(newMessages);

        try {
            // Keep a rolling context window of the last 6 messages
            const contextToSend = newMessages.slice(-6).filter(m => m.role !== 'system');

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: contextToSend })
            });

            if (!response.ok) {
                setMessages(prev => [...prev, { role: 'system', content: `[ERROR] Connection to primary logic core severed. CODE: ${response.status}` }]);
                return;
            }

            const data = await response.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'system', content: `[ERROR] Malformed logic packet received.` }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: `[FATAL] Terminal socket timeout. Core routing offline.` }]);
        }
    };

    return (
        <div className="absolute inset-0 bg-black overflow-hidden font-sans text-white">
            {/* 1. Background Layer: Classic Green Matrix Digital Rain */}
            <DigitalRain speed={1.5} density={0.92} color="#00ff41" />

            <div className="relative z-20 w-full h-full p-6 flex flex-col gap-6">

                {/* THE NORTHSTAR BAR: Top Master Command & Telemetry */}
                <div className="w-full h-14 bg-black/40 backdrop-blur-xl border border-[#00ff41]/30 rounded-full flex items-center justify-between px-6 shadow-[0_0_30px_rgba(0,255,65,0.15)] shrink-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_10px_#00ff41]" />
                        <h1 className="font-black tracking-[0.3em] text-[#00ff41] text-sm">KRONOS COMMAND CENTER</h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-gray-400 hover:text-[#00ff41] transition-colors cursor-default">
                            <Activity className="w-4 h-4" />
                            <span className="font-mono text-xs font-bold tracking-widest">HEALTH: 100%</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 hover:text-[#00ff41] transition-colors cursor-default">
                            <Wifi className="w-4 h-4" />
                            <span className="font-mono text-xs font-bold tracking-widest">LATENCY: 0.02ms</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 hover:text-[#00ff41] transition-colors cursor-default">
                            <Cpu className="w-4 h-4" />
                            <span className="font-mono text-xs font-bold tracking-widest">NODES: 3</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#00ff41] bg-[#00ff41]/10 px-3 py-1 rounded-full border border-[#00ff41]/50 cursor-pointer hover:bg-[#00ff41]/20 transition-all">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="font-mono text-[10px] font-black tracking-widest uppercase">Encryption Active</span>
                        </div>
                    </div>
                </div>

                {/* THE CLEAN CENTER: Pepper Core Visualization */}
                <div className="flex-1 h-full flex flex-col items-center justify-center relative mt-16 z-10 w-full pointer-events-none">
                    {/* Glowing Avatar */}
                    <img
                        src="/pepper-concept-2.webp" // Switching to the preferred Alpha concept image Phil likes
                        alt="KRONOS Architect"
                        className="max-h-[75vh] object-contain drop-shadow-[0_0_50px_rgba(0,255,65,0.6)] animate-pulse-slow rounded-xl pointer-events-auto"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/pepper_concept.png';
                        }}
                    />
                    <div className="absolute bottom-12 text-center">
                        <h2 className="text-3xl font-black tracking-[0.3em] mb-2 text-[#00ff41] drop-shadow-md">KRONOS ALPHA</h2>
                        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Awaiting Master Directive</p>
                    </div>
                </div>

                {/* WEST WALL TILE (Air Element): NEURAL TERMINAL DRAWER */}
                {/* Minimalist Side Trigger Button */}
                <button
                    onClick={() => setIsWestMenuOpen(!isWestMenuOpen)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/80 p-4 border border-l-0 border-[#00ff41]/50 rounded-r-2xl text-[#00ff41] hover:bg-[#00ff41]/20 transition-all z-50 group shadow-[0_0_30px_rgba(0,255,65,0.2)]"
                >
                    <Wind className="w-6 h-6 group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100" />
                </button>

                <AnimatePresence>
                    {isWestMenuOpen && (
                        <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 h-full w-[400px] z-40 pt-20 pb-6 pl-6 pr-6" // pt-20 so it sits under the Northstar Bar
                        >
                            {/* LEFT CONSOLE: The AI Studio Chat Terminal */}
                            <div className="w-full h-full flex flex-col bg-black/80 border border-[#00ff41]/50 rounded-r-3xl rounded-l-md backdrop-blur-xl shadow-[20px_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                                <div className="p-4 border-b border-[#00ff41]/30 flex items-center justify-between bg-gradient-to-r from-[#00ff41]/10 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <Terminal className="text-[#00ff41] w-5 h-5" />
                                        <h2 className="text-[#00ff41] font-bold tracking-[0.2em] text-sm">NEURAL TERMINAL</h2>
                                    </div>
                                    <button onClick={() => setIsWestMenuOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 font-mono text-xs custom-scrollbar">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-lg border shadow-lg ${m.role === 'user' ? 'bg-[#003300] border-[#00ff41]/50 text-[#00ff41]' :
                                                m.role === 'system' ? 'bg-transparent border-none text-[#00ff41]/60 text-[10px] text-center w-full block' :
                                                    'bg-[#111] border-gray-700 text-gray-300'
                                                }`}>
                                                {m.role !== 'system' && <span className="opacity-50 text-[10px] uppercase block mb-1 font-bold">{m.role}</span>}
                                                <p className="whitespace-pre-wrap">{m.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-[#00ff41]/30 flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00ff41] text-[#00ff41] transition-colors"
                                        placeholder="Command sequence..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button onClick={handleSend} className="bg-[#00ff41]/20 hover:bg-[#00ff41]/40 border border-[#00ff41] text-[#00ff41] px-4 py-2 rounded font-bold uppercase tracking-widest transition-all">
                                        TXT
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SOUTH WALL TILE: The Apple Glass Ecosystem Slider (Water Element is inside the component) */}
                <div className="absolute bottom-0 left-0 w-full z-40 pointer-events-none">
                    <AppleGlassSlider />
                </div>

            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 65, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 65, 0.6);
                }
            `}</style>
        </div>
    );
};

export default TestPilotGateway;
