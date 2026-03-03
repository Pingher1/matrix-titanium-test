import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Play, Square, RefreshCcw, ScrollText, Mic, Send } from 'lucide-react';
import { useSmythOSState, useSmythOSDispatch } from '../state/smythos/reducer';
import CallPanel from './CallPanel';
import VoiceE2EDemo from './VoiceE2EDemo';
import AdminKeyModal from './AdminKeyModal';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

export default function AdminDashboard() {
    const [health, setHealth] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [serverTarget, setServerTarget] = useState<string>(API_BASE);
    const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '');
    const [jwtInput, setJwtInput] = useState('');
    const [prompt, setPrompt] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);

    const dispatch = useSmythOSDispatch();
    const isListening = useSmythOSState().ui.voiceActive;

    useEffect(() => {
        if (!token) return;
        const interval = setInterval(() => {
            fetchHealth();
            fetchJobs();
        }, 3000);
        return () => clearInterval(interval);
    }, [token, serverTarget]);

    const fetchHealth = async () => {
        try {
            const res = await fetch(`${serverTarget}/api/health`);
            if (res.ok) setHealth(await res.json());
        } catch { }
    };

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${serverTarget}/api/job-queue`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data.jobs || []);
            }
        } catch { }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${serverTarget}/api/logs?tail=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch { }
    };

    const sendWorkerAction = async (action: string) => {
        try {
            const res = await fetch(`${serverTarget}/api/worker/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) alert(`Worker ${action} success.`);
        } catch (err: any) {
            alert(`Worker ${action} blocked: ${err.message}`);
        }
    };

    const login = () => {
        sessionStorage.setItem('admin_token', jwtInput);
        setToken(jwtInput);
        fetchHealth();
        fetchJobs();
    };

    const submitVoicePrompt = async () => {
        if (!prompt) return;
        try {
            await fetch(`${serverTarget}/api/generate-avatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            setPrompt('');
            fetchJobs();
        } catch (e: any) {
            alert(`Command failed: ${e.message}`);
        }
    };

    if (!token) {
        return (
            <div className="absolute inset-0 bg-black flex items-center justify-center p-6 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[#080a0f]" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#ff7a18 1px, transparent 1px), linear-gradient(90deg, #ff7a18 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">KRONOS COMMAND CENTER</h2>
                    <p className="text-sm text-gray-400 mb-4">Enter JWT Authorization Token</p>
                    <input
                        type="password"
                        value={jwtInput}
                        onChange={(e) => setJwtInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none mb-6"
                        placeholder="Bearer token..."
                    />
                    <button onClick={login} className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(255,122,24,0.4)] transition-all">
                        ACCESS ROOT
                    </button>
                    <button onClick={() => setToken('dev_mode_bypass')} className="w-full mt-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all">
                        Bypass (Local Dev Only)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-[#06080c] text-white p-6 overflow-y-auto">
            {/* Server Header */}
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400"><Server size={24} /></div>
                        <div>
                            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">ADMINISTRATOR DECK</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                Target Node:
                                <input
                                    value={serverTarget}
                                    onChange={e => setServerTarget(e.target.value)}
                                    className="bg-transparent border-b border-white/20 px-2 py-0.5 text-white focus:border-orange-500 outline-none w-64"
                                    placeholder="http://localhost:8080"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <button
                            onClick={() => setShowKeyModal(true)}
                            className="bg-white/5 border border-white/20 hover:bg-white/10 px-4 py-1.5 rounded-lg text-sm transition-all"
                        >
                            Open Key Vault
                        </button>
                        <div className="text-right">
                            <div className="text-sm text-gray-400 flex items-center gap-2 justify-end">
                                <Activity size={14} className={health ? "text-green-400" : "text-red-400"} />
                                Status: {health?.status || "OFFLINE"}
                            </div>
                            <div className="text-xs text-gray-500">Uptime: {health ? Math.floor(health.uptime / 60) + ' mins' : '--'}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Operations */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <Activity size={16} /> WORKER OPS
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => sendWorkerAction('start')} className="flex items-center justify-center gap-2 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-sm transition-all"><Play size={14} /> Start</button>
                                <button onClick={() => sendWorkerAction('stop')} className="flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm transition-all"><Square size={14} /> Kill</button>
                                <button onClick={() => sendWorkerAction('restart')} className="col-span-2 flex items-center justify-center gap-2 py-2 bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"><RefreshCcw size={14} /> Cycle Node</button>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <Mic size={16} /> FORGE COMMAND
                            </h3>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none h-24 resize-none"
                                    placeholder="Enter generation job instructions manually or via global dictate..."
                                />
                                <button
                                    className={`absolute bottom-3 left-3 p-2 rounded-lg transition-all ${isListening ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(255,160,60,0.6)] animate-pulse' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                                    onClick={() => dispatch({ type: "SET_UI", payload: { voiceActive: !isListening } })}
                                    title="Toggle Global RROT Dictation"
                                >
                                    <Mic size={16} />
                                </button>
                                <button
                                    className="absolute bottom-3 right-3 p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                                    onClick={submitVoicePrompt}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mid Col: Active Jobs */}
                    <div className="space-y-6 lg:col-span-1 flex flex-col h-[650px]">
                        <CallPanel />
                        <VoiceE2EDemo />
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex-1 overflow-hidden flex flex-col">
                            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Database size={16} /> JOB QUEUE</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{jobs.length} Active</span>
                            </h3>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {jobs.map((job, idx) => (
                                    <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-3 text-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400 font-mono text-xs">{job.id.substring(0, 8)}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                {job.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-xs line-clamp-2 mb-3">{job.prompt}</p>
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-gradient-to-r from-orange-500 to-amber-300 h-full" style={{ width: `${job.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {jobs.length === 0 && <div className="text-center text-gray-500 text-sm mt-10">Queue Empty</div>}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Logs */}
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md lg:col-span-1 flex flex-col h-[500px]">
                        <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><ScrollText size={16} /> SYS LOG</span>
                            <button onClick={fetchLogs} className="text-gray-500 hover:text-white transition-colors"><RefreshCcw size={14} /></button>
                        </h3>
                        <div className="flex-1 bg-black/60 rounded-xl p-3 overflow-y-auto font-mono text-xs text-gray-400 space-y-1 custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className="border-b border-white/5 pb-1">{log}</div>
                            ))}
                            {logs.length === 0 && <div className="text-center mt-10 opacity-50">No logs queried.</div>}
                        </div>
                    </div>
                </div>
            </div>

            {showKeyModal && <AdminKeyModal onClose={() => setShowKeyModal(false)} serverTarget={serverTarget} />}

            {/* Scoped scrollbar styling */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            `}</style>
        </div>
    );
}
