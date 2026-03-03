import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import url from 'url';

type Client = {
    id: string;
    ws: WebSocket;
    room?: string;
};

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 8081;

const server = http.createServer();
const wss = new WebSocketServer({ server });

const clients = new Map<string, Client>();

function broadcastToRoom(room: string, message: any, exceptId?: string) {
    const payload = JSON.stringify(message);
    for (const [id, client] of clients.entries()) {
        if (client.room === room && client.ws.readyState === WebSocket.OPEN && id !== exceptId) {
            client.ws.send(payload);
        }
    }
}

wss.on('connection', (ws, req) => {
    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const client: Client = { id, ws, room: undefined };
    clients.set(id, client);
    console.log('ws connected', id);

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(String(data));
            // Basic protocol:
            // { type: 'join', room: 'room1' }
            // { type: 'signal', room: 'room1', to: 'clientId', payload: {...} }
            // { type: 'broadcast', room: 'room1', payload: {...} }
            if (msg.type === 'join') {
                client.room = msg.room;
                ws.send(JSON.stringify({ type: 'joined', id, room: client.room }));
            } else if (msg.type === 'signal') {
                // direct to a client id if specified 
                if (msg.to && clients.has(msg.to)) {
                    const target = clients.get(msg.to)!;
                    target.ws.send(JSON.stringify({ type: 'signal', from: id, payload: msg.payload }));
                }
            } else if (msg.type === 'broadcast') {
                if (client.room) broadcastToRoom(client.room, { type: 'broadcast', from: id, payload: msg.payload }, msg.exclude);
            } else if (msg.type === 'list') {
                // respond with clients list in room 
                const roomClients = [];
                for (const [cid, c] of clients.entries()) if (c.room === msg.room) roomClients.push(cid);
                ws.send(JSON.stringify({ type: 'list', room: msg.room, clients: roomClients }));
            } else {
                // default: echo 
                ws.send(JSON.stringify({ type: 'echo', payload: msg }));
            }
        } catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: String(err) }));
        }
    });

    ws.on('close', () => {
        clients.delete(id);
        console.log('ws closed', id);
    });

    ws.on('error', (err) => {
        console.error('ws error', err);
    });
});

server.listen(PORT, () => console.log(`WebSocket server listening on ws://localhost:${PORT}`));

// Export helpers if you want to broadcast from server code
export function broadcastEvent(event: any, room?: string) {
    if (room) broadcastToRoom(room, event);
    else {
        const payload = JSON.stringify(event);
        for (const c of clients.values()) if (c.ws.readyState === WebSocket.OPEN) c.ws.send(payload);
    }
}
