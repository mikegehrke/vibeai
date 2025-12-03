// -------------------------------------------------------------
// VIBEAI – LIVE PREVIEW COMPONENT (Enhanced with Device Frames)
// -------------------------------------------------------------
/**
 * Live Preview Panel
 * 
 * Features:
 * - Web preview (React, Next.js, HTML)
 * - Flutter preview (iframe)
 * - Device frames (iPhone 15 Pro, Pixel 8, iPad Pro, Desktop)
 * - Hot reload
 * - Responsive testing
 * - Console logs
 */

"use client";

import { useEffect, useState } from "react";
import DeviceFrame, { DeviceSelector } from "./DeviceFrame";

export default function LivePreview({ projectId }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewType, setPreviewType] = useState("web");
    const [device, setDevice] = useState("iphone15");

    useEffect(() => {
        startPreview();
    }, [projectId]);

    async function startPreview() {
        try {
            setLoading(true);
            setError(null);

            const endpoint = previewType === "web" 
                ? "/preview/start_web" 
                : "/preview/start_flutter";

            const res = await fetch(`http://localhost:8000${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    project_id: projectId 
                })
            });

            if (!res.ok) {
                throw new Error(`Failed to start preview: ${res.status}`);
            }

            const data = await res.json();
            
            if (data.preview_url) {
                setUrl(data.preview_url);
            } else {
                throw new Error("No preview URL returned");
            }
        } catch (err) {
            console.error("❌ Error starting preview:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function refreshPreview() {
        const iframe = document.getElementById('preview-iframe');
        if (iframe) {
            iframe.src = iframe.src;
        }
    }

    function openInNewTab() {
        if (url) {
            window.open(url, '_blank');
        }
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Preview Header */}
            <div className="preview-header">
                <div className="preview-title">
                    🔴 Live Preview
                </div>
                
                <div className="preview-controls">
                    <select 
                        className="preview-btn"
                        value={previewType}
                        onChange={(e) => {
                            setPreviewType(e.target.value);
                            startPreview();
                        }}
                        style={{ padding: '4px 8px' }}
                    >
                        <option value="web">Web</option>
                        <option value="flutter">Flutter</option>
                    </select>
                    
                    <button 
                        className="preview-btn"
                        onClick={refreshPreview}
                        title="Refresh"
                    >
                        🔄
                    </button>
                    
                    <button 
                        className="preview-btn"
                        onClick={openInNewTab}
                        title="Open in new tab"
                    >
                        🔗
                    </button>
                </div>
            </div>

            {/* Device Selector */}
            <DeviceSelector currentDevice={device} onDeviceChange={setDevice} />

            {/* Preview Content with Device Frame */}
            {loading ? (
                <div className="preview-loading">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                        <div>Starting preview...</div>
                    </div>
                </div>
            ) : error ? (
                <div className="preview-loading">
                    <div style={{ textAlign: 'center', color: '#f44336' }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>❌</div>
                        <div>Preview Error</div>
                        <div style={{ fontSize: '11px', marginTop: '5px', color: '#888' }}>
                            {error}
                        </div>
                        <button 
                            className="btn"
                            style={{ marginTop: '15px' }}
                            onClick={startPreview}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : (
                <DeviceFrame device={device} url={url} />
            )}
        </div>
    );
}
