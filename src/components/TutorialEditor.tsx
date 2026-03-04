import React, { useState, useRef } from 'react';
import { Video, Target, SplitSquareHorizontal, ShieldAlert, Disc2, Maximize2, Settings, ListPlus, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialEditorProps {
    onClose: () => void;
}

const TutorialEditor: React.FC<TutorialEditorProps> = ({ onClose }) => {
    const [targetUrl, setTargetUrl] = useState('https://example.com');
    const [commandSequence, setCommandSequence] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordScope, setRecordScope] = useState<'CURRENT' | 'FULL'>('CURRENT');
    const [outputFormat, setOutputFormat] = useState<'WebM'>('WebM');
    const [isSplit, setIsSplit] = useState(false);

    // Physical Hardware Recording State Logic
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Dummy array to simulate the FUB instructions queuing up
    const [stepQueue, setStepQueue] = useState<string[]>([
        "Navigate to Active Contacts.",
        "Select target lead profile."
    ]);

    const handleAddStep = () => {
        if (commandSequence.trim()) {
            setStepQueue(prev => [...prev, commandSequence]);
            setCommandSequence('');
        }
    };

    const handleDeleteStep = (indexToRemove: number) => {
        setStepQueue(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleLoadTarget = () => {
        let formatted = targetUrl.trim();
        if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
            formatted = 'https://' + formatted;
        }
        setTargetUrl(formatted);
    };

    const handleToggleRecord = async () => {
        if (isRecording) {
            // STOP RECORDING SEQUENCE
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            setIsRecording(false);
        } else {
            // FIRE INITIALIZATION SEQUENCE
            try {
                chunksRef.current = [];
                // Triggers the MacOS window selector UI
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { displaySurface: recordScope === 'CURRENT' ? "window" : "monitor" },
                    audio: true
                });

                mediaStreamRef.current = stream;

                // Track manual stop from the Chrome floating UI bar
                stream.getVideoTracks()[0].onended = () => {
                    if (isRecording) handleToggleRecord();
                };

                const options = { mimeType: 'video/webm; codecs=vp9' };
                const targetMime = MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined;
                const mediaRecorder = new MediaRecorder(stream, targetMime);

                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    document.body.appendChild(a);
                    a.style.display = 'none';
                    a.href = url;
                    const ext = 'webm';
                    a.download = `KRONOS_Tutorial_Capture_${new Date().getTime()}.${ext}`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    console.log("KRONOS: Payload successfully offloaded to disk.");
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("OS Access Denied or Cancelled:", err);
                setIsRecording(false);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-40 bg-[#050505] flex flex-col font-sans"
        >
            {/* TIER 1: The Northstar Bar is inherited from TestPilotGateway, so we just pad the top. 
                Wait, if TestPilotGateway owns Northstar, we just render this div BELOW it or taking up the middle space. 
                Actually, taking up the full screen minus Northstar is better.
                We'll apply some padding to sit beneath the Gateway's Northstar bar. */}

            <div className="w-full flex-1 pt-16 pb-[150px] px-6 flex flex-col gap-4">
                {/* TOOLBAR FOR BROWSER INJECTION */}
                <div className="w-full h-12 bg-black/50 border border-[#00ff41]/30 rounded-lg flex items-center px-4 gap-4 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-2 text-red-500/70 text-xs font-mono">
                        <ShieldAlert className="w-4 h-4" />
                        <span>X-FRAME BYPASS REQUIRED FOR CRM</span>
                    </div>

                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-[#111] border border-gray-700 rounded px-3 py-1 text-sm text-[#00ff41] focus:outline-none focus:border-[#00ff41]"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoadTarget()}
                        />
                        <button
                            onClick={handleLoadTarget}
                            className="px-4 py-1 bg-[#00ff41]/20 border border-[#00ff41] text-[#00ff41] rounded text-xs font-bold uppercase hover:bg-[#00ff41]/40 transition-colors"
                        >
                            LOAD TARGET
                        </button>
                        <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1 bg-[#111] border border-gray-600 text-gray-400 rounded text-xs font-bold uppercase hover:border-yellow-500 hover:text-yellow-500 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            title="Bypass Security: Open in a new isolated browser tab"
                        >
                            POP-OUT <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    <button
                        onClick={() => setIsSplit(!isSplit)}
                        className={`p-2 rounded border transition-colors ${isSplit ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]' : 'bg-transparent border-gray-700 text-gray-500 hover:text-white'}`}
                        title="Toggle Split Screen"
                    >
                        <SplitSquareHorizontal className="w-4 h-4" />
                    </button>

                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        ✕
                    </button>
                </div>

                {/* TIER 2: ACTIVE WORKSPACE (IFrame/Browser Simulation) */}
                <div className="flex-1 w-full flex gap-4 overflow-hidden relative">
                    <div className="flex-[2] h-full bg-[#111] border border-gray-800 rounded-lg overflow-hidden relative group">
                        {/* Simulated Browser Webview */}
                        <div className="absolute inset-0 flex items-center justify-center p-8 bg-black">
                            <iframe
                                src={targetUrl}
                                className="w-full h-full border-none bg-white opacity-90 grayscale"
                                title="Kronos Primary Viewport"
                            />
                            {/* Overlaying a message since actual FUB will block iframe */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <Target className="w-12 h-12 text-[#00ff41] mb-4 opacity-50 loop-spin" />
                                <p className="text-[#00ff41] font-mono tracking-widest text-sm">TARGET VIEWPORT SECURED</p>
                            </div>
                        </div>
                    </div>

                    {/* SPLIT SCREEN VIEW */}
                    <AnimatePresence>
                        {isSplit && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "33%", opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="h-full bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden relative flex flex-col"
                            >
                                <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-[#111]">
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">AUXILIARY DATABASE NODE</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-gray-600 font-mono text-xs text-center px-4">Secondary workflow or AI Neural Chat can be mounted here.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* TIER 3: COMMAND RECORDING RIBBON (Fixed Bottom 2-Inches) */}
            <div className="absolute bottom-0 left-0 w-full h-[150px] bg-black border-t-[3px] border-[#00ff41] shadow-[0_-10px_40px_rgba(0,255,65,0.15)] z-50 flex flex-col shrink-0">
                {/* Ribbon Header / Stats */}
                <div className="h-6 w-full bg-gradient-to-r from-[#00ff41]/20 to-transparent flex items-center px-6 justify-between">
                    <span className="font-mono text-[10px] text-[#00ff41] font-bold tracking-widest uppercase">KRONOS INSTRUCTIONAL VIDEO RECORDER (V1.0)</span>
                    <span className="font-mono text-[10px] text-gray-400">FPS: 60 | CODEC: ON</span>
                </div>

                <div className="flex-1 flex items-stretch p-4 gap-4">
                    {/* Left Flank: Vertical Scope Toggles */}
                    <div className="flex flex-col justify-center gap-1 border-r border-gray-800 pr-4 shrink-0 w-[110px]">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1 text-center">CAPTURE SCOPE</span>
                        <button
                            onClick={() => setRecordScope('CURRENT')}
                            className={`px-2 py-1.5 text-[10px] font-bold rounded transition-colors w-full border ${recordScope === 'CURRENT' ? 'bg-gray-800 text-white border-gray-600' : 'bg-[#111] text-gray-500 hover:text-gray-300 border-gray-800'}`}
                        >
                            CURRENT WIN
                        </button>
                        <button
                            onClick={() => setRecordScope('FULL')}
                            className={`px-2 py-1.5 text-[10px] font-bold rounded transition-colors w-full border ${recordScope === 'FULL' ? 'bg-gray-800 text-white border-gray-600' : 'bg-[#111] text-gray-500 hover:text-gray-300 border-gray-800'}`}
                        >
                            FULL SCREEN
                        </button>
                    </div>

                    {/* Center: AI Command Input Notepad & Step Queue */}
                    <div className="flex-[3] flex flex-col gap-2 min-w-0 px-2">
                        <div className="flex gap-2 flex-1 relative">
                            <textarea
                                className="flex-1 bg-[#111] border border-gray-700 rounded p-3 text-sm text-white focus:outline-none focus:border-[#00ff41] font-mono transition-colors shadow-inner resize-none custom-scrollbar leading-relaxed"
                                placeholder="Active Working Notepad: Draft your instruction path here... (e.g. 'Navigate to...')"
                                value={commandSequence}
                                onChange={(e) => setCommandSequence(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddStep();
                                    }
                                }}
                            />
                            <div className="absolute top-2 right-16 text-[9px] text-gray-600 font-mono pointer-events-none">
                                SHIFT+ENTER for new line
                            </div>
                            <button onClick={handleAddStep} className="bg-[#111] border border-gray-700 hover:border-[#00ff41] text-[#00ff41] px-4 rounded transition-colors group flex flex-col items-center justify-center gap-1 shrink-0 shadow-md">
                                <ListPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold tracking-widest uppercase">ENQUEUE</span>
                            </button>
                        </div>

                        {/* Tiny Step Visualize bar */}
                        <div className="h-[34px] w-full bg-[#0a0a0a] rounded border border-gray-800 flex gap-2 overflow-x-auto custom-scrollbar items-center shrink-0 px-2 shrink-0">
                            {stepQueue.map((step, idx) => (
                                <div key={idx} className="shrink-0 bg-[#111] border border-[#00ff41]/30 py-1 pl-3 pr-2 rounded-full flex items-center gap-2 group transition-colors hover:border-red-500/50">
                                    <span className="text-[10px] text-[#00ff41] font-black group-hover:text-red-500 transition-colors">{idx + 1}</span>
                                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{step}</span>
                                    <button
                                        onClick={() => handleDeleteStep(idx)}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-full p-0.5 ml-1 transition-all"
                                        title="Delete Step"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            ))}
                            {stepQueue.length === 0 && <span className="text-gray-600 text-[10px] italic font-mono w-full text-center">Path Builder Queue empty. Add automated steps above.</span>}
                        </div>
                    </div>

                    {/* Right Flank: Vertical Format Toggles & REC Override */}
                    <div className="flex items-center gap-4 border-l border-gray-800 pl-4 shrink-0">
                        {/* Format Toggle Vertical Stack */}
                        <div className="flex flex-col justify-center gap-1 w-[70px]">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono text-center mb-1">FORMAT</span>
                            <button
                                onClick={() => setOutputFormat('WebM')}
                                className="px-2 py-1.5 text-[10px] font-bold rounded transition-colors w-full border bg-gray-800 text-white border-gray-600 hover:text-gray-300"
                            >
                                .WebM
                            </button>
                        </div>

                        {/* The REC Override */}
                        <button
                            onClick={handleToggleRecord}
                            className={`h-full aspect-square ml-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] group ${isRecording
                                ? 'bg-red-900/40 border-red-500 text-red-500 shadow-[0_0_30px_rgba(255,0,0,0.3)]'
                                : 'bg-[#111] border-gray-600 text-gray-400 hover:border-[#00ff41] hover:text-[#00ff41]'
                                }`}
                        >
                            <Disc2 className={`w-8 h-8 ${isRecording ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                            <span className="font-black text-[10px] tracking-widest">{isRecording ? 'RECORDING' : 'INIT REC'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .loop-spin {
                    animation: spin-slow 10s linear infinite;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
};

export default TutorialEditor;
