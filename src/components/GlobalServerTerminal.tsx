import React, { useState } from 'react';
import { Menu, Terminal, X, Zap, Mountain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GlobalServerTerminal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'bash' | 'health'>('bash'); // Default to Bash for Commander feel
    const [chatMessages, setChatMessages] = useState<{ role: string, content: string }[]>([
        { role: 'system', content: 'KRONOS HYPER-SERVER CONNECTED.' },
        { role: 'assistant', content: 'Base and Alpha networks established. Terminal ready for direct execution.' }
    ]);
    const [chatInput, setChatInput] = useState('');

    const [bashLines, setBashLines] = useState<string[]>(['kronos-admin@base-server:~$ systemctl status smythos-bridge', 'bridge active (running)']);
    const [bashInput, setBashInput] = useState('');

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;

        const userCommand = chatInput;
        setChatInput(''); // Clear immediately for UX
        setChatMessages(prev => [...prev, { role: 'user', content: userCommand }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        ...chatMessages.slice(-5).filter(m => m.role !== 'system'),
                        { role: 'user', content: userCommand }
                    ]
                })
            });

            if (!response.ok) {
                setChatMessages(prev => [...prev, { role: 'system', content: `[ERROR] Connection to primary logic core severed. CODE: ${response.status}` }]);
                return;
            }

            const data = await response.json();
            if (data.reply) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'system', content: `[ERROR] Malformed logic packet received.` }]);
            }
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'system', content: `[FATAL] Terminal socket timeout. Diagnostics required.` }]);
        }
    };

    const handleBashSend = () => {
        if (!bashInput.trim()) return;
        const cmd = bashInput;
        setBashInput('');
        setBashLines(prev => [...prev, `kronos-admin@root:~$ ${cmd}`]);
        setTimeout(() => {
            if (cmd.includes('clear')) {
                setBashLines([]);
            } else if (cmd.includes('ping')) {
                setBashLines(prev => [...prev, '64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms', '64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms']);
            } else if (cmd.includes('deploy')) {
                setBashLines(prev => [...prev, 'Awaiting Commander authorization for Production overwrite...', 'FAILED: Insufficient keys provided.']);
            } else {
                setBashLines(prev => [...prev, `bash: ${cmd}: command not found. (Mock Shell Environment)`]);
            }
        }, 300);
    };

    return (
        <>
            {/* The East Wall Center Toggle Button (Earth Element) - CAMOUFLAGED WITH GLOWING ICON */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-4 bg-transparent border-transparent hover:border-[#00ff41]/20 border-r-0 rounded-l-2xl backdrop-blur-sm shadow-none hover:shadow-[-5px_0_30px_rgba(0,255,65,0.1)] hover:bg-[#00ff41]/10 transition-all flex flex-col gap-1 group"
                >
                    <Mountain className="w-6 h-6 text-[#00ff41] group-hover:scale-110 transition-transform opacity-100 drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
                </button>
            </div>

            {/* The Slide-Out Terminal Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed right-0 top-0 h-screen w-[400px] bg-black/95 border-l border-[#00ff41]/50 shadow-[-20px_0_50px_rgba(0,0,0,0.9)] z-[99999] backdrop-blur-2xl flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="h-16 border-b border-[#00ff41]/30 flex items-center justify-between px-6 bg-[#00ff41]/5">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-[#00ff41]" />
                                <h2 className="text-[#00ff41] font-bold tracking-[0.3em] text-sm uppercase">Global Terminal</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-[#00ff41] transition-colors p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Status/URL Context Banner & Node Jumps */}
                        <div className="bg-[#111] px-4 py-3 border-b border-gray-800 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff41] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff41]"></span>
                                </span>
                                <span className="text-[10px] uppercase font-mono tracking-widest text-[#00ff41]">
                                    Active: {window.location.pathname === '/' ? 'BASE (B)' : window.location.pathname === '/pilot' ? 'ALPHA (A)' : 'FORGE HUB'}
                                </span>
                            </div>

                            {/* Node Jumps */}
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className={`flex-1 py-1.5 px-2 rounded font-black tracking-widest text-[9px] uppercase border transition-all ${window.location.pathname === '/'
                                        ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                                        : 'bg-black text-gray-500 border-gray-700 hover:border-[#00ff41]/50 hover:text-[#00ff41]'
                                        }`}
                                >
                                    JUMP TO BASE [B]
                                </button>
                                <button
                                    onClick={() => window.location.href = '/pilot'}
                                    className={`flex-1 py-1.5 px-2 rounded font-black tracking-widest text-[9px] uppercase border transition-all ${window.location.pathname === '/pilot'
                                        ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                                        : 'bg-black text-gray-500 border-gray-700 hover:border-[#00ff41]/50 hover:text-[#00ff41]'
                                        }`}
                                >
                                    JUMP TO ALPHA [A]
                                </button>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex w-full bg-[#111] border-b border-gray-800 text-[10px] font-black tracking-[0.2em]">
                            <button onClick={() => setActiveTab('bash')} className={`flex-1 py-3 transition-colors ${activeTab === 'bash' ? 'text-[#00ff41] border-b-2 border-[#00ff41] bg-[#00ff41]/5' : 'text-gray-500 hover:text-gray-300'}`}>BASH CLIENT</button>
                            <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 transition-colors ${activeTab === 'chat' ? 'text-[#00ff41] border-b-2 border-[#00ff41] bg-[#00ff41]/5' : 'text-gray-500 hover:text-gray-300'}`}>NEURAL CHAT</button>
                            <button onClick={() => setActiveTab('health')} className={`flex-1 py-3 transition-colors ${activeTab === 'health' ? 'text-[#00ff41] border-b-2 border-[#00ff41] bg-[#00ff41]/5' : 'text-gray-500 hover:text-gray-300'}`}>DIAGNOSTICS</button>
                        </div>

                        {/* TAB CONTENTS */}

                        {/* 1. BASH TAB */}
                        {activeTab === 'bash' && (
                            <>
                                <div className="flex-1 p-4 overflow-y-auto bg-black font-mono text-xs text-green-500 custom-scrollbar flex flex-col gap-1">
                                    <div className="text-gray-500 mb-4 opacity-70">
                                        KRONOS OS Root Access v9.1.2<br />
                                        Type 'clear' to reset terminal. Note: Execution scoped to local Sandbox.
                                    </div>
                                    {bashLines.map((line, i) => (
                                        <div key={i} className="break-all">{line}</div>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-[#00ff41]/30 bg-[#0a0a0a] flex items-center font-mono">
                                    <span className="text-gray-500 mr-2">$</span>
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent focus:outline-none text-[#00ff41] text-xs"
                                        autoFocus
                                        value={bashInput}
                                        onChange={(e) => setBashInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleBashSend()}
                                    />
                                </div>
                            </>
                        )}

                        {/* 2. CHAT TAB */}
                        {activeTab === 'chat' && (
                            <>
                                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                                    {chatMessages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-xl border font-mono text-xs shadow-lg ${m.role === 'user'
                                                ? 'bg-gradient-to-br from-[#003300] to-black border-[#00ff41]/50 text-[#00ff41]'
                                                : m.role === 'system'
                                                    ? 'bg-transparent border-none text-[#00ff41]/60 text-[10px] text-center w-full block'
                                                    : 'bg-black border-gray-700 text-gray-300'
                                                }`}>
                                                {m.role !== 'system' && (
                                                    <div className="flex items-center gap-2 mb-2 opacity-50">
                                                        {m.role === 'user' ? <Zap className="w-3 h-3 text-[#00ff41]" /> : <Terminal className="w-3 h-3 text-gray-400" />}
                                                        <span className="text-[9px] uppercase tracking-widest font-bold">{m.role}</span>
                                                    </div>
                                                )}
                                                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-[#00ff41]/30 bg-black">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 bg-[#111] border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00ff41] text-[#00ff41] transition-colors font-mono"
                                            placeholder="Transmit neural prompt..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                                        />
                                        <button
                                            onClick={handleChatSend}
                                            className="bg-transparent hover:bg-[#00ff41]/20 border border-[#00ff41] text-[#00ff41] px-4 py-3 rounded-lg font-bold uppercase tracking-widest transition-all"
                                        >
                                            TXT
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 3. HEALTH TAB */}
                        {activeTab === 'health' && (
                            <div className="flex-1 p-6 overflow-y-auto bg-black font-mono custom-scrollbar text-[#00ff41]">
                                <h3 className="text-sm font-bold tracking-widest border-b border-[#00ff41]/30 pb-2 mb-4">SYSTEM DIAGNOSTICS</h3>

                                <div className="flex flex-col gap-6 text-xs">
                                    <div>
                                        <div className="text-gray-500 mb-1">Server State</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse"></div>
                                            <span>ONLINE (Port 8080)</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-gray-500 mb-1">Memory Allocation (Sim)</div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#00ff41] w-[45%]"></div>
                                        </div>
                                        <div className="text-right text-[10px] mt-1 text-gray-500">4.5GB / 10.0GB Allocated</div>
                                    </div>

                                    <div>
                                        <div className="text-gray-500 mb-1">Active Modules</div>
                                        <ul className="list-disc pl-4 text-gray-300">
                                            <li>Omniscient Core (Idle)</li>
                                            <li>SmythOS Bridge (Connected)</li>
                                            <li>Whisper TTS Transcoder (Standby)</li>
                                        </ul>
                                    </div>

                                    <div className="p-3 border border-pink-500/50 bg-pink-500/10 rounded-lg text-pink-400">
                                        [WARNING] Physical API limits approaching for Voice Duplex. Verify quotas on ElevenLabs.
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.3); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.6); }
            `}</style>
        </>
    );
};

// Error boundary wrapped to prevent DOM collapse on hot reloads
export default function SafeGlobalServerTerminal() {
    return <GlobalServerTerminal />;
}
