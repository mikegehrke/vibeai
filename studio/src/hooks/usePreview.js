// ============================================================
// VIBEAI – PREVIEW HOOK
// ============================================================
/**
 * React Hook für Live Preview Integration
 * 
 * Features:
 * - Preview Server Start/Stop
 * - Live Log Streaming via WebSocket
 * - Auto-Reconnect
 * - Error Handling
 * 
 * Usage:
 *   const { previewUrl, logs, status, restart } = usePreview(projectId);
 */

import { useEffect, useState, useCallback, useRef } from "react";

export function usePreview(projectId, type = "web") {
    const [previewUrl, setPreviewUrl] = useState("");
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("idle"); // idle, starting, running, error
    const [port, setPort] = useState(null);
    const wsRef = useRef(null);

    // Start Preview
    const startPreview = useCallback(async () => {
        try {
            setStatus("starting");
            setLogs([]);

            const res = await fetch("/preview/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    project_id: projectId,
                    type: type 
                })
            });

            if (!res.ok) {
                throw new Error(`Failed to start preview: ${res.statusText}`);
            }

            const data = await res.json();
            
            setPreviewUrl(data.url);
            setPort(data.port);
            setStatus("running");

            // WebSocket verbinden
            connectWebSocket(projectId);

        } catch (error) {
            console.error("Preview start error:", error);
            setStatus("error");
            setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
        }
    }, [projectId, type]);

    // WebSocket Connection
    const connectWebSocket = useCallback((projectId) => {
        // Alte Connection schließen
        if (wsRef.current) {
            wsRef.current.close();
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/preview/ws/${projectId}`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("Preview WebSocket connected");
            setLogs(prev => [...prev, "🔗 Connected to preview server"]);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                
                switch (msg.type) {
                    case "connected":
                        setLogs(prev => [...prev, `✅ ${msg.message}`]);
                        break;
                    
                    case "preview_log":
                        setLogs(prev => [...prev, msg.text]);
                        break;
                    
                    case "compile_start":
                        setLogs(prev => [...prev, "⏳ Compiling..."]);
                        break;
                    
                    case "compile_success":
                        setLogs(prev => [...prev, "✅ Compiled successfully!"]);
                        break;
                    
                    case "server_ready":
                        setLogs(prev => [...prev, `🚀 ${msg.text}`]);
                        break;
                    
                    case "reload":
                        setLogs(prev => [...prev, "🔄 Hot reload triggered"]);
                        break;
                    
                    case "compile_error":
                        setLogs(prev => [...prev, `❌ ${msg.text}`]);
                        break;
                    
                    default:
                        setLogs(prev => [...prev, msg.text || JSON.stringify(msg)]);
                }
            } catch (error) {
                console.error("WebSocket message error:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setLogs(prev => [...prev, "❌ WebSocket connection error"]);
        };

        ws.onclose = () => {
            console.log("Preview WebSocket disconnected");
            setLogs(prev => [...prev, "🔌 Disconnected from preview server"]);
            
            // Auto-Reconnect nach 3 Sekunden wenn Preview noch läuft
            if (status === "running") {
                setTimeout(() => {
                    console.log("Attempting to reconnect...");
                    connectWebSocket(projectId);
                }, 3000);
            }
        };

        wsRef.current = ws;
    }, [status]);

    // Stop Preview
    const stopPreview = useCallback(async () => {
        try {
            await fetch("/preview/stop", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            setStatus("idle");
            setPreviewUrl("");
            setPort(null);

            // WebSocket schließen
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            setLogs(prev => [...prev, "⏹️ Preview stopped"]);

        } catch (error) {
            console.error("Stop preview error:", error);
        }
    }, []);

    // Restart Preview
    const restartPreview = useCallback(async () => {
        setLogs(prev => [...prev, "🔄 Restarting preview..."]);
        await stopPreview();
        setTimeout(() => startPreview(), 1000);
    }, [stopPreview, startPreview]);

    // Auto-Start beim Mount
    useEffect(() => {
        startPreview();

        // Cleanup beim Unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [projectId, type]);

    return {
        previewUrl,
        logs,
        status,
        port,
        startPreview,
        stopPreview,
        restartPreview
    };
}
