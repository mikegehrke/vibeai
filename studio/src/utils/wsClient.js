// ============================================================
// VIBEAI – WEBSOCKET CLIENT UTILITY
// ============================================================
/**
 * WebSocket Client Manager
 * 
 * Features:
 * - Auto-Reconnect
 * - Event Handlers
 * - Connection State
 * - Message Queue
 * 
 * Usage:
 *   const ws = new WSClient("/ws/build/123");
 *   ws.on("message", (data) => console.log(data));
 *   ws.connect();
 */

export class WSClient {
    constructor(endpoint, options = {}) {
        this.endpoint = endpoint;
        this.options = {
            autoReconnect: true,
            reconnectInterval: 3000,
            maxReconnectAttempts: 5,
            ...options
        };

        this.ws = null;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.eventHandlers = {};
        this.connectionState = "disconnected"; // disconnected, connecting, connected
    }

    // Connect
    connect() {
        if (this.connectionState === "connected" || this.connectionState === "connecting") {
            console.warn("WebSocket already connected or connecting");
            return;
        }

        this.connectionState = "connecting";
        this._trigger("connecting");

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        const url = `${protocol}//${host}${this.endpoint}`;

        console.log(`[WSClient] Connecting to ${url}`);

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log("[WSClient] Connected");
            this.connectionState = "connected";
            this.reconnectAttempts = 0;
            this._trigger("connected");

            // Queued Messages senden
            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                this.send(msg);
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this._trigger("message", data);

                // Type-specific events
                if (data.type) {
                    this._trigger(data.type, data);
                }
            } catch (error) {
                console.error("[WSClient] Parse error:", error);
                this._trigger("error", { message: "Failed to parse message", error });
            }
        };

        this.ws.onerror = (error) => {
            console.error("[WSClient] Error:", error);
            this._trigger("error", error);
        };

        this.ws.onclose = () => {
            console.log("[WSClient] Disconnected");
            this.connectionState = "disconnected";
            this._trigger("disconnected");

            // Auto-Reconnect
            if (this.options.autoReconnect && 
                this.reconnectAttempts < this.options.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`[WSClient] Reconnecting in ${this.options.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);
                
                setTimeout(() => {
                    this.connect();
                }, this.options.reconnectInterval);
            } else if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
                console.error("[WSClient] Max reconnect attempts reached");
                this._trigger("maxReconnectAttempts");
            }
        };
    }

    // Disconnect
    disconnect() {
        if (this.ws) {
            this.options.autoReconnect = false; // Disable auto-reconnect
            this.ws.close();
            this.ws = null;
            this.connectionState = "disconnected";
        }
    }

    // Send Message
    send(data) {
        if (this.connectionState === "connected" && this.ws) {
            const message = typeof data === "string" ? data : JSON.stringify(data);
            this.ws.send(message);
        } else {
            console.warn("[WSClient] Not connected, queueing message");
            this.messageQueue.push(data);
        }
    }

    // Event Handler Registration
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    // Remove Event Handler
    off(event, handler) {
        if (!this.eventHandlers[event]) return;

        if (handler) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        } else {
            delete this.eventHandlers[event];
        }
    }

    // Trigger Event
    _trigger(event, data) {
        if (!this.eventHandlers[event]) return;

        this.eventHandlers[event].forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`[WSClient] Handler error for event ${event}:`, error);
            }
        });
    }

    // Get Connection State
    getState() {
        return this.connectionState;
    }

    // Check if Connected
    isConnected() {
        return this.connectionState === "connected";
    }
}

// React Hook für WSClient
export function useWebSocket(endpoint, options = {}) {
    const [state, setState] = React.useState("disconnected");
    const [lastMessage, setLastMessage] = React.useState(null);
    const wsRef = React.useRef(null);

    React.useEffect(() => {
        if (!endpoint) return;

        const ws = new WSClient(endpoint, options);

        ws.on("connecting", () => setState("connecting"));
        ws.on("connected", () => setState("connected"));
        ws.on("disconnected", () => setState("disconnected"));
        ws.on("message", (data) => setLastMessage(data));

        // Custom event handlers
        if (options.onMessage) ws.on("message", options.onMessage);
        if (options.onConnected) ws.on("connected", options.onConnected);
        if (options.onDisconnected) ws.on("disconnected", options.onDisconnected);
        if (options.onError) ws.on("error", options.onError);

        ws.connect();
        wsRef.current = ws;

        return () => {
            ws.disconnect();
        };
    }, [endpoint]);

    return {
        state,
        lastMessage,
        send: (data) => wsRef.current?.send(data),
        disconnect: () => wsRef.current?.disconnect()
    };
}

// Für React import
import * as React from "react";
