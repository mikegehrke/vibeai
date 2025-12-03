// ============================================================
// VIBEAI – BUILD LOGS HOOK
// ============================================================
/**
 * React Hook für Build Log Streaming
 * 
 * Features:
 * - Live Build Logs via WebSocket
 * - Build Status Updates
 * - Auto-Reconnect
 * - Error Handling
 * 
 * Usage:
 *   const { logs, status, progress } = useBuildLogs(buildId);
 */

import { useEffect, useState, useCallback, useRef } from "react";

export function useBuildLogs(buildId) {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("unknown"); // queued, building, success, failed
    const [progress, setProgress] = useState(0);
    const [buildInfo, setBuildInfo] = useState(null);
    const wsRef = useRef(null);

    // WebSocket Connection
    const connectWebSocket = useCallback((buildId) => {
        // Alte Connection schließen
        if (wsRef.current) {
            wsRef.current.close();
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/build/${buildId}`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("Build WebSocket connected");
            setLogs(prev => [...prev, "🔗 Connected to build server"]);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                
                switch (msg.type) {
                    case "connected":
                        setLogs(prev => [...prev, `✅ ${msg.message}`]);
                        break;
                    
                    case "status":
                        setStatus(msg.status);
                        setLogs(prev => [...prev, `📊 Status: ${msg.status}`]);
                        if (msg.message) {
                            setLogs(prev => [...prev, msg.message]);
                        }
                        break;
                    
                    case "log":
                        setLogs(prev => [...prev, msg.text]);
                        break;
                    
                    case "progress":
                        setProgress(msg.progress);
                        if (msg.step) {
                            setLogs(prev => [...prev, `⏳ ${msg.step} (${msg.progress}%)`]);
                        }
                        break;
                    
                    case "success":
                        setStatus("success");
                        setProgress(100);
                        setLogs(prev => [...prev, `✅ ${msg.message || "Build completed successfully!"}`]);
                        if (msg.artifacts) {
                            setBuildInfo(prev => ({ ...prev, artifacts: msg.artifacts }));
                        }
                        break;
                    
                    case "error":
                        setStatus("failed");
                        setLogs(prev => [...prev, `❌ ${msg.message}`]);
                        if (msg.details) {
                            setLogs(prev => [...prev, msg.details]);
                        }
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
            console.log("Build WebSocket disconnected");
            setLogs(prev => [...prev, "🔌 Disconnected from build server"]);
            
            // Auto-Reconnect nach 3 Sekunden wenn Build noch läuft
            if (status === "building" || status === "queued") {
                setTimeout(() => {
                    console.log("Attempting to reconnect...");
                    connectWebSocket(buildId);
                }, 3000);
            }
        };

        wsRef.current = ws;
    }, [status]);

    // Build Status abrufen
    const fetchBuildStatus = useCallback(async () => {
        try {
            const res = await fetch(`/build/${buildId}/status`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
                setProgress(data.progress || 0);
                setBuildInfo(data);
            }
        } catch (error) {
            console.error("Failed to fetch build status:", error);
        }
    }, [buildId]);

    // Build Artifacts herunterladen
    const downloadArtifacts = useCallback(async () => {
        try {
            const res = await fetch(`/build/${buildId}/download`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `build-${buildId}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error("Failed to download artifacts");
            }
        } catch (error) {
            console.error("Download error:", error);
            setLogs(prev => [...prev, `❌ Failed to download: ${error.message}`]);
        }
    }, [buildId]);

    // Auto-Connect beim Mount
    useEffect(() => {
        if (buildId) {
            fetchBuildStatus();
            connectWebSocket(buildId);
        }

        // Cleanup beim Unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [buildId]);

    return {
        logs,
        status,
        progress,
        buildInfo,
        downloadArtifacts,
        refresh: fetchBuildStatus
    };
}
