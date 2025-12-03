// ============================================================
// VIBEAI – APP BUILDER LIVE PREVIEW
// ============================================================
/**
 * Live Preview Panel für App Builder
 * 
 * Features:
 * - Live Screen Rendering via /render_screen
 * - Component Preview
 * - Instant Updates (no build required)
 * - Multiple Frameworks (HTML, React, Flutter)
 * 
 * Usage:
 *   <AppBuilderPreview screen={screenData} />
 */

import React, { useState, useEffect, useCallback } from "react";
import "./AppBuilderPreview.css";

export default function AppBuilderPreview({ screen, autoRefresh = true }) {
    const [htmlPreview, setHtmlPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Render Screen
    const renderScreen = useCallback(async () => {
        if (!screen || !screen.components || screen.components.length === 0) {
            setHtmlPreview("");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/preview/render_screen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ screen })
            });

            if (!res.ok) {
                throw new Error(`Render failed: ${res.statusText}`);
            }

            const data = await res.json();
            setHtmlPreview(data.html);

        } catch (err) {
            console.error("Render error:", err);
            setError(err.message);
            setHtmlPreview(`
                <div style="padding: 40px; text-align: center; color: #f44336;">
                    <h3>❌ Render Error</h3>
                    <p>${err.message}</p>
                </div>
            `);
        } finally {
            setLoading(false);
        }
    }, [screen]);

    // Auto-Refresh bei Screen Changes
    useEffect(() => {
        if (autoRefresh) {
            renderScreen();
        }
    }, [screen, autoRefresh, renderScreen]);

    return (
        <div className="app-builder-preview">
            {/* Header */}
            <div className="preview-header">
                <h3>Live Preview</h3>
                <button onClick={renderScreen} disabled={loading}>
                    {loading ? "⏳ Rendering..." : "🔄 Refresh"}
                </button>
            </div>

            {/* Preview Content */}
            <div className="preview-content">
                {loading ? (
                    <div className="preview-loading">
                        <div className="spinner"></div>
                        <p>Rendering screen...</p>
                    </div>
                ) : error ? (
                    <div className="preview-error">
                        <h3>❌ Error</h3>
                        <p>{error}</p>
                        <button onClick={renderScreen}>Try Again</button>
                    </div>
                ) : htmlPreview ? (
                    <iframe
                        srcDoc={htmlPreview}
                        className="preview-iframe"
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                ) : (
                    <div className="preview-empty">
                        <p>No components to preview</p>
                        <small>Add components to see live preview</small>
                    </div>
                )}
            </div>
        </div>
    );
}
