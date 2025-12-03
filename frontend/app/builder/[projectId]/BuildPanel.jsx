// -------------------------------------------------------------
// VIBEAI – BUILD PANEL COMPONENT
// -------------------------------------------------------------
/**
 * Build Panel with Live Logs
 * 
 * Features:
 * - Start APK/Web builds
 * - Live build logs via WebSocket
 * - Download build artifacts
 * - Error/success notifications
 * - Build progress tracking
 */

"use client";

import { useState, useEffect, useRef } from "react";

export default function BuildPanel({ projectId }) {
    const [logs, setLogs] = useState([]);
    const [buildId, setBuildId] = useState(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [buildStatus, setBuildStatus] = useState(null);
    const [buildType, setBuildType] = useState("flutter_apk");
    const wsRef = useRef(null);
    const logsEndRef = useRef(null);

    useEffect(() => {
        // Auto-scroll to bottom
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        // Cleanup WebSocket on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    async function startBuild() {
        if (isBuilding) return;

        setIsBuilding(true);
        setBuildStatus("starting");
        setLogs(["🚀 Starting build..."]);

        try {
            const res = await fetch("http://localhost:8000/build/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_id: projectId,
                    build_type: buildType
                })
            });

            if (!res.ok) {
                throw new Error(`Build start failed: ${res.status}`);
            }

            const data = await res.json();
            setBuildId(data.build_id);

            // Connect to WebSocket for live logs
            connectBuildWebSocket(data.build_id);

        } catch (error) {
            console.error("❌ Build start error:", error);
            setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
            setBuildStatus("error");
            setIsBuilding(false);
        }
    }

    function connectBuildWebSocket(build_id) {
        try {
            // WebSocket connection for build logs
            const ws = new WebSocket(
                `ws://localhost:8000/ws/build-events/${build_id}`
            );

            ws.onopen = () => {
                setLogs(prev => [...prev, "📡 Connected to build server"]);
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.type === "log") {
                        setLogs(prev => [...prev, msg.text]);
                    } else if (msg.type === "status") {
                        setBuildStatus(msg.status);

                        if (msg.status === "completed") {
                            setLogs(prev => [...prev, "✅ Build completed!"]);
                            setIsBuilding(false);
                        } else if (msg.status === "failed") {
                            setLogs(prev => [...prev, "❌ Build failed"]);
                            setIsBuilding(false);
                        }
                    }
                } catch (err) {
                    console.error("WebSocket message error:", err);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setLogs(prev => [...prev, "❌ WebSocket error"]);
            };

            ws.onclose = () => {
                setLogs(prev => [...prev, "📡 Disconnected from build server"]);
                setIsBuilding(false);
            };

            wsRef.current = ws;

        } catch (error) {
            console.error("WebSocket connection error:", error);
            setLogs(prev => [...prev, `❌ WebSocket error: ${error.message}`]);
            setIsBuilding(false);
        }
    }

    function clearLogs() {
        setLogs([]);
        setBuildStatus(null);
    }

    return (
        <div className="build-panel">
            {/* Header */}
            <div className="build-header">
                <div className="build-title">
                    🔨 Build System
                </div>

                <div className="build-controls">
                    <select
                        value={buildType}
                        onChange={(e) => setBuildType(e.target.value)}
                        disabled={isBuilding}
                        className="build-type-select"
                    >
                        <option value="flutter_apk">Flutter APK</option>
                        <option value="flutter_web">Flutter Web</option>
                        <option value="react_web">React Web</option>
                        <option value="nextjs_web">Next.js Web</option>
                    </select>

                    <button
                        onClick={startBuild}
                        disabled={isBuilding}
                        className={`btn ${isBuilding ? 'btn-disabled' : 'btn-primary'}`}
                    >
                        {isBuilding ? '⏳ Building...' : '🚀 Start Build'}
                    </button>

                    <button
                        onClick={clearLogs}
                        className="btn"
                        disabled={isBuilding}
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Build Logs */}
            <div className="build-logs">
                {logs.length === 0 ? (
                    <div className="build-empty">
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔨</div>
                        <div>No build logs yet</div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                            Start a build to see live logs
                        </div>
                    </div>
                ) : (
                    <>
                        {logs.map((log, index) => (
                            <div key={index} className="build-log-line">
                                <span className="build-log-index">{index + 1}</span>
                                <span className="build-log-text">{log}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </>
                )}
            </div>

            {/* Build Actions */}
            {buildId && buildStatus === 'completed' && (
                <div className="build-actions">
                    <a
                        href={`http://localhost:8000/build/download/zip?build_id=${buildId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success"
                    >
                        📦 Download Build ZIP
                    </a>

                    {buildType === 'flutter_apk' && (
                        <a
                            href={`http://localhost:8000/build/download/apk?build_id=${buildId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success"
                        >
                            📱 Download APK
                        </a>
                    )}
                </div>
            )}

            {/* Inline Styles */}
            <style jsx>{`
                .build-panel {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #1a1a1a;
                }

                .build-header {
                    padding: 10px 15px;
                    background: #252525;
                    border-bottom: 1px solid #333;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .build-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #ccc;
                }

                .build-controls {
                    display: flex;
                    gap: 8px;
                }

                .build-type-select {
                    padding: 6px 12px;
                    background: #1e1e1e;
                    border: 1px solid #444;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 12px;
                    cursor: pointer;
                }

                .build-type-select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-disabled {
                    opacity: 0.5;
                    cursor: not-allowed !important;
                }

                .btn-success {
                    background: #4caf50;
                    border-color: #4caf50;
                    color: white;
                }

                .btn-success:hover {
                    background: #45a049;
                }

                .build-logs {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 15px;
                    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .build-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #666;
                    text-align: center;
                }

                .build-log-line {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 2px;
                    color: #ddd;
                }

                .build-log-index {
                    color: #666;
                    min-width: 30px;
                    text-align: right;
                }

                .build-log-text {
                    flex: 1;
                }

                .build-actions {
                    padding: 15px;
                    background: #252525;
                    border-top: 1px solid #333;
                    display: flex;
                    gap: 10px;
                }
            `}</style>
        </div>
    );
}
