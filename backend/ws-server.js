#!/usr/bin/env node
/**
 * VibeAI WebSocket Server
 * Broadcast System für Live-Updates:
 * - file.created, file.updated, file.deleted
 * - project.tree
 * - preview.reload
 * - terminal.output
 * - agent.status.update
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = 8001;
const HEARTBEAT_INTERVAL = 30000; // 30s

// HTTP Server für Health Check
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'running',
            clients: wss.clients.size,
            uptime: process.uptime()
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// WebSocket Server
const wss = new WebSocket.Server({ server });

console.log(`🚀 VibeAI WebSocket Server starting on port ${PORT}...`);

// Client Management
const clients = new Set();

// Broadcast zu allen Clients
function broadcast(event, data) {
    const message = JSON.stringify({
        event,
        ...data,
        timestamp: new Date().toISOString()
    });

    let sent = 0;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(message);
                sent++;
            } catch (err) {
                console.error('❌ Broadcast error:', err.message);
            }
        }
    });

    console.log(`📡 Broadcast [${event}] to ${sent} clients`);
    return sent;
}

// Connection Handler
wss.on('connection', (ws, req) => {
    const clientId = Math.random().toString(36).substr(2, 9);
    clients.add(ws);

    console.log(`✅ Client connected [${clientId}] - Total: ${clients.size}`);

    // Send Welcome Message
    ws.send(JSON.stringify({
        event: 'connected',
        clientId,
        timestamp: new Date().toISOString()
    }));

    // Heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Message Handler
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📨 Received [${data.event}] from [${clientId}]`);

            // Echo bestimmte Events an alle Clients
            if (['file.updated', 'file.created', 'file.deleted', 'preview.reload', 'terminal.output'].includes(data.event)) {
                broadcast(data.event, data);
            }
        } catch (err) {
            console.error('❌ Message parse error:', err.message);
        }
    });

    // Disconnect Handler
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`❌ Client disconnected [${clientId}] - Remaining: ${clients.size}`);
    });

    // Error Handler
    ws.on('error', (err) => {
        console.error(`⚠️ WebSocket error [${clientId}]:`, err.message);
    });
});

// Heartbeat Ping
const heartbeat = setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
            console.log('💀 Terminating dead client');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, HEARTBEAT_INTERVAL);

// Cleanup on exit
wss.on('close', () => {
    clearInterval(heartbeat);
});

// Start Server
server.listen(PORT, () => {
    console.log(`✅ WebSocket Server running on ws://localhost:${PORT}`);
    console.log(`✅ Health check available at http://localhost:${PORT}/health`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, closing server...');
    wss.close(() => {
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
});

// Export broadcast function for external use
global.wsBroadcast = broadcast;

module.exports = { broadcast, wss };
