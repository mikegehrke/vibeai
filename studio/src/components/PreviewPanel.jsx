// ============================================================
// VIBEAI – PREVIEW PANEL COMPONENT
// ============================================================
/**
 * Split-View Preview Panel mit IFRAME + LiveConsole
 * 
 * Features:
 * - Responsive IFRAME Preview
 * - Live Console mit Auto-Scroll
 * - Device Simulator (Desktop/Tablet/Mobile)
 * - Reload Button
 * - Error Boundary
 * 
 * Props:
 *   projectId: string
 *   type: "web" | "flutter"
 */

import React, { useState } from "react";
import { usePreview } from "../hooks/usePreview";
import LiveConsole from "./LiveConsole";
import "./PreviewPanel.css";

export default function PreviewPanel({ projectId, type = "web" }) {
    const { previewUrl, logs, status, restartPreview } = usePreview(projectId, type);
    const [deviceMode, setDeviceMode] = useState("desktop"); // desktop, tablet, mobile
    const [consoleHeight, setConsoleHeight] = useState(30); // Prozent

    // Device Presets
    const deviceSizes = {
        desktop: { width: "100%", height: "100%" },
        tablet: { width: "768px", height: "1024px" },
        mobile: { width: "375px", height: "667px" }
    };

    // IFRAME Reload
    const reloadPreview = () => {
        const iframe = document.getElementById("preview-iframe");
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    return (
        <div className="preview-panel">
            {/* Toolbar */}
            <div className="preview-toolbar">
                <div className="toolbar-left">
                    <h3>Live Preview</h3>
                    <span className={`status-badge status-${status}`}>
                        {status === "running" ? "🟢" : status === "starting" ? "🟡" : "🔴"}
                        {status}
                    </span>
                </div>

                <div className="toolbar-right">
                    {/* Device Mode */}
                    <div className="device-selector">
                        <button
                            className={deviceMode === "desktop" ? "active" : ""}
                            onClick={() => setDeviceMode("desktop")}
                            title="Desktop"
                        >
                            🖥️
                        </button>
                        <button
                            className={deviceMode === "tablet" ? "active" : ""}
                            onClick={() => setDeviceMode("tablet")}
                            title="Tablet"
                        >
                            📱
                        </button>
                        <button
                            className={deviceMode === "mobile" ? "active" : ""}
                            onClick={() => setDeviceMode("mobile")}
                            title="Mobile"
                        >
                            📲
                        </button>
                    </div>

                    {/* Actions */}
                    <button onClick={reloadPreview} title="Reload">
                        🔄
                    </button>
                    <button onClick={restartPreview} title="Restart Server">
                        ⚡
                    </button>
                </div>
            </div>

            {/* Split View */}
            <div className="preview-split">
                {/* IFRAME Container */}
                <div 
                    className="preview-iframe-container"
                    style={{ height: `${100 - consoleHeight}%` }}
                >
                    {status === "running" && previewUrl ? (
                        <div 
                            className="iframe-wrapper"
                            style={deviceSizes[deviceMode]}
                        >
                            <iframe
                                id="preview-iframe"
                                src={previewUrl}
                                title="Live Preview"
                                className="preview-iframe"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            />
                        </div>
                    ) : status === "starting" ? (
                        <div className="preview-loading">
                            <div className="spinner"></div>
                            <p>Starting preview server...</p>
                        </div>
                    ) : status === "error" ? (
                        <div className="preview-error">
                            <h3>❌ Preview Error</h3>
                            <p>Failed to start preview server. Check console logs.</p>
                            <button onClick={restartPreview}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="preview-idle">
                            <p>Preview not started</p>
                        </div>
                    )}
                </div>

                {/* Resize Handle */}
                <div 
                    className="resize-handle"
                    onMouseDown={(e) => {
                        const startY = e.clientY;
                        const startHeight = consoleHeight;

                        const handleMouseMove = (moveEvent) => {
                            const deltaY = moveEvent.clientY - startY;
                            const containerHeight = e.target.parentElement.offsetHeight;
                            const newHeight = startHeight + (deltaY / containerHeight) * 100;
                            setConsoleHeight(Math.max(10, Math.min(80, newHeight)));
                        };

                        const handleMouseUp = () => {
                            document.removeEventListener("mousemove", handleMouseMove);
                            document.removeEventListener("mouseup", handleMouseUp);
                        };

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                    }}
                />

                {/* Console */}
                <div 
                    className="preview-console"
                    style={{ height: `${consoleHeight}%` }}
                >
                    <LiveConsole 
                        logs={logs}
                        title={`${type.toUpperCase()} Preview Logs`}
                        height="100%"
                    />
                </div>
            </div>
        </div>
    );
}
