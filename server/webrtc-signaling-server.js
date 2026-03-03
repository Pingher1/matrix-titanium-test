// webrtc-signaling-server.js
// Simple WebSocket-based signaling server — not an SFU, just broker signaling between peers.
// Usage: node webrtc-signaling-server.js [port]
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.SIGNAL_PORT ? Number(process.env.SIGNAL_PORT) : 8082;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const peers = new Map(); // clientId -> ws

wss.on('connection', (ws) => {
    const clientId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    peers.set(clientId, ws);
    ws.send(JSON.stringify({ type: 'welcome', clientId }));
    console.log('webrtc peer connected', clientId);

    ws.on('message', (message) => {
        let msg;
        try { msg = JSON.parse(message); } catch (e) { return; }
        // msg: { type: 'offer'|'answer'|'ice', to:targetClientId, payload: ... }
        if (msg.to && peers.has(msg.to)) {
            peers.get(msg.to).send(JSON.stringify({ ...msg, from: clientId }));
        } else {
            // broadcast candidate or presence 
            if (msg.type === 'broadcast') {
                for (const [id, socket] of peers) {
                    if (socket.readyState === WebSocket.OPEN && id !== clientId) socket.send(JSON.stringify({ from: clientId, payload: msg.payload }));
                }
            }
        }
    });

    ws.on('close', () => {
        peers.delete(clientId);
        // notify others 
        for (const [id, socket] of peers) {
            if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'peer-left', id: clientId }));
        }
    });
});

server.listen(PORT, () => console.log(`WebRTC signaling server listening on ws://localhost:${PORT}`));
