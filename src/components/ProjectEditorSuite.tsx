import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Save, Play, FolderOpen, Terminal as TerminalIcon } from 'lucide-react';
import { AppTopNav } from './AppTopNav';

// Placeholder mock data until Commander drops physical Studio files into the vault
const mockProjects = [
    { id: 'proj-001', name: 'Pepper Core Dialog Engine', status: 'ACTIVE' },
    { id: 'proj-002', name: 'Matrix Visual Renderer', status: 'STANDBY' },
    { id: 'proj-003', name: 'RROT Companion Architect', status: 'ARCHIVED' }
];

export default function ProjectEditorSuite() {
    const [activeProject, setActiveProject] = useState(mockProjects[0].id);
    const [codeContent, setCodeContent] = useState('// KRONOS AI STUDIO EDITOR PROTOCOL\n// Awaiting project load...');

    return (
        <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden flex flex-col font-sans text-white">
            <AppTopNav />

            <div className="flex-1 w-full h-full flex pt-16">

                {/* West Panel: Project Vault Explorer */}
                <div className="w-[300px] bg-[#111] border-r border-[#00ff41]/20 flex flex-col">
                    <div className="p-4 border-b border-[#00ff41]/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#00ff41]">
                            <FolderOpen className="w-5 h-5" />
                            <h2 className="font-bold tracking-[0.2em] text-xs">AI STUDIO VAULT</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                        {mockProjects.map(proj => (
                            <button
                                key={proj.id}
                                onClick={() => setActiveProject(proj.id)}
                                className={`text-left p-3 rounded border transition-all ${activeProject === proj.id
                                    ? 'bg-[#00ff41]/10 border-[#00ff41]/50 text-[#00ff41]'
                                    : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                <div className="font-bold text-sm truncate">{proj.name}</div>
                                <div className="text-[10px] font-mono tracking-widest mt-1 opacity-70">{proj.status}</div>
                            </button>
                        ))}

                        <div className="mt-8 p-4 border border-dashed border-gray-600 rounded-lg text-center bg-white/5">
                            <p className="text-xs text-gray-400 font-mono tracking-widest">Awaiting Physical Project Injection in src/data/ai-studio-projects/</p>
                        </div>
                    </div>
                </div>

                {/* Center Panel: IDE Workspace */}
                <div className="flex-1 flex flex-col bg-black">
                    <div className="h-12 bg-[#1a1a1a] border-b border-[#00ff41]/20 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Code2 className="w-4 h-4" />
                                <span className="text-xs font-mono tracking-widest">Workspace.tsx</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff41]/10 border border-[#00ff41]/50 text-[#00ff41] rounded hover:bg-[#00ff41]/20 transition-colors text-[10px] font-bold tracking-widest">
                                <Save className="w-3.5 h-3.5" /> SAVE
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded hover:bg-gray-200 transition-colors text-[10px] font-bold tracking-widest">
                                <Play className="w-3.5 h-3.5" /> COMPILE
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        {/* Matrix Rain faint background behind code */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop')] bg-cover mix-blend-screen" />

                        <textarea
                            value={codeContent}
                            onChange={(e) => setCodeContent(e.target.value)}
                            className="absolute inset-0 w-full h-full bg-transparent text-[#00ff41] font-mono text-sm p-6 resize-none focus:outline-none leading-relaxed"
                            spellCheck="false"
                        />
                    </div>

                    {/* Integrated Diagnostics Terminal */}
                    <div className="h-48 border-t border-[#00ff41]/20 bg-[#0a0a0a] flex flex-col">
                        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 text-gray-500">
                            <TerminalIcon className="w-4 h-4" />
                            <span className="text-[10px] font-mono tracking-widest uppercase">Diagnostics & Routing Telemetry</span>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs text-gray-400 overflow-y-auto">
                            <p className="text-[#00ff41]">&gt; Editor Module Successfully Isolated.</p>
                            <p>&gt; Awaiting local physical sync of AI Studio matrices...</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
