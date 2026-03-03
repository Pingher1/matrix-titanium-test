import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Loader2 } from 'lucide-react';
import { createJob } from '../services/jobService';
import { useSmythOSState, useSmythOSDispatch } from '../state/smythos/reducer';

// Safely alias SpeechRecognition for cross-browser support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface VoicePromptProps {
    onJobStarted: (jobId: string) => void;
}

const VoicePrompt: React.FC<VoicePromptProps> = ({ onJobStarted }) => {
    const [prompt, setPrompt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const state = useSmythOSState();
    const dispatch = useSmythOSDispatch();
    const isListening = state.ui.voiceActive;

    // Persist recognition instance
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition API not supported in this browser.");
            return;
        }

        const rc = new SpeechRecognition();
        rc.continuous = true;
        rc.interimResults = true;
        rc.lang = 'en-US';

        rc.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setPrompt(prev => prev + (prev ? " " : "") + finalTranscript);
            }
        };

        rc.onerror = (event: any) => {
            console.error("Speech Recognition Error", event.error);
            dispatch({ type: "SET_UI", payload: { voiceActive: false } });
        };

        rc.onend = () => {
            // Keep the state synced if the browser automatically ends recognition
            dispatch({ type: "SET_UI", payload: { voiceActive: false } });
        };

        recognitionRef.current = rc;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        // Obey the global Kill switch
        if (isListening && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) { /* already started */ }
        } else if (!isListening && recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
    }, [isListening]);

    const toggleListen = () => {
        if (!recognitionRef.current) return alert("Microphone dictation is not supported by your browser.");
        dispatch({ type: "SET_UI", payload: { voiceActive: !isListening } });
    };

    const playTTS = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.1; // Slightly robotic/AI pitch
            window.speechSynthesis.speak(utterance);
        }
    };

    const submitJob = async () => {
        if (!prompt.trim()) return;
        setIsSubmitting(true);
        try {
            const result = await createJob(prompt);
            playTTS("Link established. Synthesizing new avatar parameters in the core.");
            onJobStarted(result.jobId);
            setPrompt("");
        } catch (err) {
            console.error("Failed to submit job:", err);
            playTTS("Critical error. Cannot reach the KRONOS Forge backend.");
            alert("Failed to reach Forge server. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex gap-2 items-end p-2 rounded-2xl bg-black/40 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10">
            <button
                onClick={toggleListen}
                className={`p-4 rounded-xl transition-all flex items-center justify-center 
                    ${isListening
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
            >
                {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
            </button>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitJob();
                    }
                }}
                placeholder="Dictate or type your AI avatar prompt here..."
                className="flex-1 bg-transparent text-white resize-none outline-none min-h-[56px] py-4 px-2 text-sm leading-relaxed scrollbar-hide"
                rows={1}
            />

            <button
                onClick={submitJob}
                disabled={isSubmitting || !prompt.trim()}
                className={`p-4 rounded-xl transition-all flex items-center justify-center font-bold tracking-widest text-[10px] uppercase
                    ${isSubmitting || !prompt.trim()
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                    }`}
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : <span className="flex items-center gap-2">Forge <Send className="w-4 h-4" /></span>}
            </button>
        </div>
    );
};

export default VoicePrompt;
