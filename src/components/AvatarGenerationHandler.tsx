import React, { useState, useEffect } from 'react';
import { pollJob } from '../services/jobService';
import { Loader2 } from 'lucide-react';

interface AvatarGenerationHandlerProps {
    jobId: string;
    onComplete: (data: { glbUrl: string; thumbnailUrl?: string }) => void;
    onFail?: () => void;
}

export default function AvatarGenerationHandler({ jobId, onComplete, onFail }: AvatarGenerationHandlerProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<string>("Initializing secure handshake...");

    useEffect(() => {
        if (!jobId) return;

        setStatus("Establishing link to Alpha Forge...");

        const stopPolling = pollJob(
            jobId,
            (data) => {
                setProgress(data.progress || 0);
                if (data.status === "queued") setStatus("Waiting in queue...");
                if (data.status === "running") setStatus("Forging raw topology mapping...");
            },
            (data) => {
                if (data.status === "done" && data.result) {
                    setStatus("Forge link established.");
                    setProgress(100);
                    onComplete(data.result);
                } else {
                    setStatus("Forge connection severed. Generation failed.");
                    if (onFail) onFail();
                }
            }
        );

        return () => stopPolling();
    }, [jobId, onComplete, onFail]);

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-3 p-4 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between text-[#00d8ff] font-mono text-xs uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    {status}
                </span>
                <span className="text-orange-400 font-black">{progress}%</span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#00d8ff] to-[#4f46e5] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
