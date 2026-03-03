// webrtc-proxy.js
// Simple express endpoint that accepts an SDP offer and returns an SDP answer using node-webrtc (wrtc).
// Usage: node server/webrtc-proxy.js (ensure WRtc installed: npm install wrtc express body-parser)
const express = require('express');
const bodyParser = require('body-parser');
const { RTCPeerConnection, RTCSessionDescription, MediaStream } = require('wrtc');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/offer', async (req, res) => {
    try {
        const { sdp } = req.body;
        if (!sdp) return res.status(400).json({ error: 'missing sdp' });

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Optional: handle incoming tracks 
        pc.ontrack = (event) => {
            console.log('Received track kind=', event.track.kind);
            // You can implement recording or forward here. For demo we just log.
            // For recording, pipe to a recorder or save raw frames (requires additional work).
        };

        pc.onicecandidate = (e) => {
            // In this simple flow we don't stream ICE candidates — we'll rely on trickle disabled 
            console.log('ice candidate', !!e.candidate);
        };

        // set remote offer 
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));

        // create answer 
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Wait briefly for ICE gathering (or use trickle)
        // For production, return answer and negotiate ICE by candidate exchange 
        setTimeout(() => {
            const localDesc = pc.localDescription;
            res.json({ sdp: localDesc.sdp, type: localDesc.type });
        }, 500);

        // optionally store pc in a map to close later if needed 
    } catch (err) {
        console.error('offer error', err);
        res.status(500).json({ error: String(err) });
    }
});

const PORT = process.env.WEBRTC_PROXY_PORT || 8083;
app.listen(PORT, () => console.log(`webrtc-proxy listening on http://localhost:${PORT}/offer`));
