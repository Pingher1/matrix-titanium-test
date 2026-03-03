import React, { useState, useRef, useEffect } from 'react';
import { PhoneCall, PhoneOff, Users, Mic, MicOff, Volume2 } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';

export default function CallPanel() {
    const [roomId, setRoomId] = useState('kronos-alpha');
    const [connected, setConnected] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

    // Audio elements container
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Conditionally init WebRTC so we don't hot-mic on load
    const rtc = connected ? useWebRTC({
        roomId,
        onRemoteStream: (stream, peerId) => {
            setRemoteStreams(prev => {
                const map = new Map(prev);
                map.set(peerId, stream);
                return map;
            });
        }
    }) : null;

    useEffect(() => {
        // Bind incoming streams to physical audio objects
        remoteStreams.forEach((stream, peerId) => {
            let audioNode = audioRefs.current[peerId];
            if (!audioNode) {
                audioNode = new Audio();
                audioNode.autoplay = true;
                audioRefs.current[peerId] = audioNode;
            }
            if (audioNode.srcObject !== stream) {
                audioNode.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    const toggleConnection = async () => {
        if (connected) {
            setConnected(false);
            setMicEnabled(false);
            setRemoteStreams(new Map());
            // Clear floating audio nodes
            Object.values(audioRefs.current).forEach(a => {
                a.srcObject = null;
                a.remove();
            });
            audioRefs.current = {};
        } else {
            // Need permission to spin up the proxy
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setMicEnabled(true);
                setConnected(true);
            } catch (e) {
                alert("Microphone access is required to enter the Collaboration Matrix.");
            }
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><PhoneCall size={16} /> COLLABORATION MATRIX</span>
                {connected && <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 rounded font-mono animate-pulse"><Users size={12} /> {remoteStreams.size + 1}</span>}
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Room Frequency ID</label>
                    <input
                        disabled={connected}
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none disabled:opacity-50"
                        placeholder="e.g., forge-session-1"
                    />
                </div>

                {connected && (
                    <div className="bg-black/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Local Identity:</span>
                            <span className="font-mono text-orange-400">{rtc?.localPeerId || 'allocating...'}</span>
                        </div>
                        {Array.from(remoteStreams.entries()).map(([id, stream]) => (
                            <div key={id} className="flex items-center justify-between text-xs text-gray-300 border-t border-white/5 pt-2">
                                <span className="flex items-center gap-2"><Volume2 size={12} className="text-green-400" /> Remote Peer</span>
                                <span className="font-mono">{id}</span>
                            </div>
                        ))}
                        {remoteStreams.size === 0 && (
                            <div className="text-xs text-gray-500 italic text-center pt-2 border-t border-white/5 mt-2">
                                Listening for peers on STUN relay...
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={toggleConnection}
                        className={`col-span-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${connected ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20'}`}
                    >
                        {connected ? <><PhoneOff size={16} /> Disconnect</> : <><PhoneCall size={16} /> Join Matrix</>}
                    </button>

                    <button
                        disabled={!connected}
                        onClick={() => {
                            // Note: full local mute logic requires stream track manipulation. This is UI stub.
                            setMicEnabled(!micEnabled);
                            alert("Mic toggle UI stubbed out. To mute in MVP, drop connection.");
                        }}
                        className={`col-span-1 flex items-center justify-center gap-2 py-2 border rounded-lg text-sm transition-all disabled:opacity-30 ${micEnabled ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 'border-white/10 bg-black/40 text-gray-400'}`}
                    >
                        {micEnabled ? <><Mic size={16} /> Hot Mic</> : <><MicOff size={16} /> Muted</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
