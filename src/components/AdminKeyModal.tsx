import React, { useState } from "react";

export default function AdminKeyModal({ onClose, serverTarget }: { onClose: () => void, serverTarget: string }) {
    const [openai, setOpenai] = useState("");
    const [eleven, setEleven] = useState("");
    const [awsBucket, setAwsBucket] = useState("");
    const [awsRegion, setAwsRegion] = useState("us-east-1");
    const [awsAccess, setAwsAccess] = useState("");
    const [awsSecret, setAwsSecret] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    const submit = async () => {
        setStatus("saving...");
        try {
            const token = sessionStorage.getItem('admin_token') || 'local-admin-token';
            const res = await fetch(`${serverTarget}/api/admin/keys`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    OPENAI_API_KEY: openai,
                    ELEVENLABS_API_KEY: eleven,
                    AWS_S3_BUCKET: awsBucket,
                    AWS_REGION: awsRegion,
                    AWS_ACCESS_KEY_ID: awsAccess,
                    AWS_SECRET_ACCESS_KEY: awsSecret
                }),
            });
            const json = await res.json();
            setStatus(json?.status || "ok");
            if (json?.ok) setTimeout(onClose, 1000);
        } catch (e) {
            setStatus("error");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10000] backdrop-blur-sm">
            <div className="w-full max-w-xl p-6 bg-[#071018] border border-white/10 rounded-2xl shadow-2xl text-white">
                <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Admin Key Vault (Local Node)</h3>
                <p className="text-sm text-gray-400 mb-6">Keys injected here are transmitted securely to the active Node process and optionally persisted to the local `.env` vault. They are never cached in the browser.</p>

                <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Voice Engine Keys */}
                    <div className="space-y-3 pb-4 border-b border-white/10">
                        <h4 className="text-sm font-semibold text-gray-300">Phase 3: The Voice Engine</h4>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">OPENAI_API_KEY (Whisper STT)</label>
                            <input type="password" value={openai} onChange={(e) => setOpenai(e.target.value)} placeholder="sk-..." className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">ELEVENLABS_API_KEY (Voice TTS)</label>
                            <input type="password" value={eleven} onChange={(e) => setEleven(e.target.value)} placeholder="eleven-..." className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none" />
                        </div>
                    </div>

                    {/* AWS Storage Keys */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-semibold text-gray-300">Phase 2: AWS S3 Persistence Storage</h4>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">AWS_ACCESS_KEY_ID</label>
                            <input value={awsAccess} onChange={(e) => setAwsAccess(e.target.value)} placeholder="AKIA..." className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">AWS_SECRET_ACCESS_KEY</label>
                            <input type="password" value={awsSecret} onChange={(e) => setAwsSecret(e.target.value)} placeholder="Secret hash..." className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">AWS_REGION</label>
                                <input value={awsRegion} onChange={(e) => setAwsRegion(e.target.value)} placeholder="us-east-1" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">AWS_S3_BUCKET_NAME</label>
                                <input value={awsBucket} onChange={(e) => setAwsBucket(e.target.value)} placeholder="kronos-avatar-storage" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <div className="text-sm text-green-400">{status}</div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors">Cancel</button>
                        <button onClick={submit} className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:shadow-[0_0_15px_rgba(255,122,24,0.4)] rounded-lg text-sm font-bold text-white transition-all">Lock & Save Keys</button>
                    </div>
                </div>
            </div>
            {/* Scoped scrollbar styling */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            `}</style>
        </div>
    );
}
