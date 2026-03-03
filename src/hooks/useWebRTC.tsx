import { useEffect, useRef, useState } from "react";

// For this MVP, we generate a unique peer ID per mount to avoid Socket limitations
function generatePeerId() {
    return Math.random().toString(36).substring(2, 9);
}

export function useWebRTC({ roomId, onRemoteStream }: { roomId: string; onRemoteStream: (stream: MediaStream, peerId: string) => void }) {
    const peerId = useRef(generatePeerId());
    const pcRef = useRef<Record<string, RTCPeerConnection>>({});
    const localStreamRef = useRef<MediaStream | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    // Signaling API helpers pointing to the local Node server
    const SIGNALING_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    const sendSignal = async (to: string, data: any) => {
        try {
            await fetch(`${SIGNALING_URL}/api/signal/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, from: peerId.current, to, data })
            });
        } catch (e) {
            console.error("Signal send failed:", e);
        }
    };

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        const startPolling = async () => {
            pollInterval = setInterval(async () => {
                if (!isPolling) return;
                try {
                    const res = await fetch(`${SIGNALING_URL}/api/signal/poll/${roomId}/${peerId.current}`);
                    if (!res.ok) return;
                    const { signals } = await res.json();

                    for (const signal of signals) {
                        await handleIncomingSignal(signal);
                    }
                } catch (e) {
                    // silent poll fail
                }
            }, 2000);
        };

        const handleIncomingSignal = async ({ from, data }: any) => {
            // Only process signals actually meant for us (or broadcasted 'join' events without a specific 'to')
            if (data.to && data.to !== peerId.current) return;

            let pc = pcRef.current[from];
            if (!pc) {
                pc = createPeerConnection(from);
                pcRef.current[from] = pc;
            }

            if (data.type === "join") {
                // A new peer joined. Create an offer.
                if (!localStreamRef.current) await acquireMicrophone();
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
                }
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendSignal(from, { type: "offer", sdp: offer.sdp, to: from });
            }
            else if (data.type === "offer") {
                if (!localStreamRef.current) await acquireMicrophone();
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
                }
                await pc.setRemoteDescription({ type: "offer", sdp: data.sdp });
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignal(from, { type: "answer", sdp: answer.sdp, to: from });
            }
            else if (data.type === "answer") {
                await pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
            }
            else if (data.candidate) {
                try { await pc.addIceCandidate(data.candidate); } catch (e) { console.warn("ICE err", e); }
            }
        };

        const acquireMicrophone = async () => {
            try {
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (e) {
                console.error("mic denied", e);
            }
        };

        function createPeerConnection(remotePeerId: string) {
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                ],
            });

            pc.onicecandidate = (evt) => {
                if (evt.candidate) sendSignal(remotePeerId, { candidate: evt.candidate, to: remotePeerId });
            };

            pc.ontrack = (evt) => {
                onRemoteStream(evt.streams[0], remotePeerId);
            };

            return pc;
        }

        // Announce presence to the room
        sendSignal("all", { type: "join" });
        startPolling();

        return () => {
            setIsPolling(false);
            clearInterval(pollInterval);
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
            Object.values(pcRef.current).forEach((p) => p.close());
        };
    }, [roomId, onRemoteStream]);

    return { localPeerId: peerId.current };
}
