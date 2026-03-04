import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, Database, ShieldCheck } from 'lucide-react';
import AvatarCanvas from './AvatarCanvas';
import SphereCustomizerPanel from './SphereCustomizerPanel';
import AvatarPromptUI from './AvatarPromptUI';
import { useSmythOSState } from '../state/smythos/reducer';

const WorkstationLayout = () => {
    const navigate = useNavigate();
    const state = useSmythOSState();

    // We can assume modelUrl is checking if 3D generation is finished/active
    const isModelActive = !!state.export.lastExportUrl;

    return (
        <div className="w-screen h-screen bg-[#07080f] flex flex-col text-white overflow-hidden font-sans">
            {/* TOP NAVIGATION BAR */}
            <div className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/deck')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-bold tracking-widest text-[10px] uppercase">Leave Forge</span>
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <span className="font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#00d8ff] to-[#4f46e5] text-xl drop-shadow-[0_0_10px_rgba(0,216,255,0.3)]">
                        KRONOS WORKSTATION
                    </span>
                </div>

                {/* Server Status Lights (SmythOS aesthetic) */}
                <div className="flex items-center gap-6 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase bg-black/40 px-6 py-2 rounded-full border border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41]"></div>
                        <span>Alpha</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]"></div>
                        <span>Sync</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-[#e879f9]" />
                        <span className="text-[#e879f9]">Secured</span>
                    </div>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex flex-1 relative overflow-hidden">
                {/* 3D CANVAS PORT - Left Side (Fill) */}
                <div className="flex-1 relative bg-gradient-to-b from-[#0e101a] to-[#040508]">
                    <div className="absolute inset-0">
                        <AvatarCanvas />
                    </div>

                    {/* Floating Prompt Bar container */}
                    <div className="absolute bottom-10 left-0 w-full z-40">
                        <AvatarPromptUI />
                    </div>
                </div>

                {/* CONTROL BOARD - Right Side Rigid Panel */}
                <div className="w-[380px] shrink-0 border-l border-white/10 bg-[#0a0b12]/95 backdrop-blur-3xl overflow-y-auto shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40 relative custom-scrollbar">
                    <SphereCustomizerPanel />
                </div>
            </div>

            {/* Custom Scrollbar Styles for the rigid panel */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default WorkstationLayout;
