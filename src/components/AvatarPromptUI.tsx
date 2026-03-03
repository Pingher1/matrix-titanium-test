import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useSmythOSState, useSmythOSDispatch } from '../state/smythos/reducer';
import VoicePrompt from './VoicePrompt';
import AvatarGenerationHandler from './AvatarGenerationHandler';
import AvatarPreviewModal from './AvatarPreviewModal';
import { exportGLBAndUpload } from '../services/exportService';

const AvatarPromptUI: React.FC = () => {
    const state = useSmythOSState();
    const dispatch = useSmythOSDispatch();

    // Local state for the generation job pipeline
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [previewGLB, setPreviewGLB] = useState<string | null>(null);

    // We can assume modelUrl is checking if 3D generation is finished/active
    const isModelActive = !!state.export.lastExportUrl;

    const handleSave = () => {
        if (!state.export.lastExportUrl) {
            alert("No custom Avatar model is loaded to save yet.");
            return;
        }

        // Send a custom dispatch event targeting the ExportHandler sleeping inside the Canvas
        const event = new CustomEvent('avatar:export', {
            detail: {
                onComplete: (url: string) => alert(`Avatar model saved successfully!\nMock Cloud URL: ${url}`),
                onError: (err: any) => alert(`Export failed: ${err.message}`)
            }
        });
        window.dispatchEvent(event);
    };

    // Callback when a Generation job finishes successfully from the Node API
    const handleJobComplete = (data: { glbUrl: string; thumbnailUrl?: string }) => {
        setActiveJobId(null);
        setPreviewGLB(data.glbUrl);
    };

    // Callback when the user inspects the Preview Modal and clicks Accept
    const acceptPreview = () => {
        if (previewGLB) {
            // Push the accepted model URL into the global state router core
            dispatch({ type: 'SET_EXPORT', payload: { lastExportUrl: previewGLB } });
        }
        setPreviewGLB(null);
    };

    // If a model is loaded into the core workstation, show the save options
    if (state.export.lastExportUrl) {
        return (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4">
                <button
                    onClick={() => dispatch({ type: 'SET_EXPORT', payload: { lastExportUrl: undefined } })}
                    className="px-6 py-3 bg-red-600/80 hover:bg-red-500 text-white rounded-full font-bold shadow-lg backdrop-blur-md transition border border-white/20"
                >
                    Clear Avatar
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00d8ff]/20 hover:bg-[#00d8ff]/40 text-[#00d8ff] rounded-full font-bold shadow-[0_0_15px_rgba(0,216,255,0.3)] backdrop-blur-md transition border border-[#00d8ff]/50"
                >
                    <Save className="w-5 h-5" />
                    Save & Export Avatar
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50">
                {activeJobId ? (
                    <AvatarGenerationHandler
                        jobId={activeJobId}
                        onComplete={handleJobComplete}
                        onFail={() => setActiveJobId(null)}
                    />
                ) : (
                    <VoicePrompt onJobStarted={(id) => setActiveJobId(id)} />
                )}

                <p className="text-center text-xs text-gray-500 mt-2 tracking-wider">
                    KRONOS AVATAR FORGE ENGINE
                </p>
            </div>

            {/* R3F Modal triggered when generation finishes but before merging to the Workstation */}
            {previewGLB && (
                <AvatarPreviewModal
                    glbUrl={previewGLB}
                    onAccept={acceptPreview}
                    onDelete={() => setPreviewGLB(null)}
                />
            )}
        </>
    );
};

export default AvatarPromptUI;
