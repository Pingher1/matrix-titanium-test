import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PresentationControls, Environment, ContactShadows } from '@react-three/drei';
import AvatarLoader from './AvatarLoader';

interface AvatarPreviewModalProps {
    glbUrl: string;
    onAccept: () => void;
    onDelete: () => void;
}

export default function AvatarPreviewModal({ glbUrl, onAccept, onDelete }: AvatarPreviewModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4 font-sans">
            <div className="w-full max-w-5xl h-[80vh] bg-[#070a10] border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40">
                    <div>
                        <h2 className="text-xl font-black tracking-[0.2em] text-[#00d8ff] uppercase">Generation Complete</h2>
                        <p className="text-[10px] text-gray-500 font-mono">Review topology before merging into core matrix.</p>
                    </div>
                </div>

                {/* 3D Viewer */}
                <div className="flex-1 relative bg-gradient-to-t from-[#0e101a] to-transparent">
                    <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#ff7a18] font-mono animate-pulse">Assembling GLB Topology...</div>}>
                        <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
                            <ambientLight intensity={1.5} />
                            <directionalLight position={[5, 5, 5]} intensity={2} />
                            <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#00d8ff" />
                            <directionalLight position={[0, -5, -5]} intensity={1} color="#ff7a18" />

                            <Environment preset="studio" blur={0.8} />

                            <PresentationControls
                                global
                                rotation={[0, 0, 0]}
                                polar={[-Math.PI / 4, Math.PI / 2]}
                                azimuth={[-Math.PI / 2, Math.PI / 2]}
                                snap={true}
                            >
                                <AvatarLoader url={glbUrl} position={[0, -1, 0]} scale={1.5} />
                            </PresentationControls>

                            <ContactShadows position={[0, -1.1, 0]} opacity={0.6} scale={10} blur={2.5} far={4} />
                        </Canvas>
                    </Suspense>
                </div>

                {/* Footer Controls */}
                <div className="h-20 border-t border-white/10 bg-black/60 flex items-center justify-end px-6 gap-4">
                    <button
                        onClick={onDelete}
                        className="px-6 py-3 rounded-lg border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                    >
                        Delete Mesh
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#00d8ff] to-[#4f46e5] text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,216,255,0.4)] hover:shadow-[0_0_30px_rgba(0,216,255,0.6)] transition-shadow"
                    >
                        Accept & Import
                    </button>
                </div>
            </div>
        </div>
    );
}
