// ============================================================
// VIBEAI – PREVIEW PAGE
// ============================================================
/**
 * Preview Page mit IFRAME + LiveConsole Split View
 * 
 * Features:
 * - Live Preview IFRAME (70%)
 * - Live Console (30%)
 * - Device Simulator
 * - Auto-Reload on Changes
 * 
 * Route: /preview/:projectId
 */

import React from "react";
import { useParams } from "react-router-dom";
import PreviewPanel from "../../components/PreviewPanel";
import "./PreviewPage.css";

export default function PreviewPage() {
    const { projectId } = useParams();
    const [previewType, setPreviewType] = React.useState("web"); // web, flutter

    return (
        <div className="preview-page">
            {/* Header */}
            <div className="preview-page-header">
                <h1>Live Preview</h1>
                <div className="project-info">
                    <span className="project-id">Project: {projectId}</span>
                    
                    {/* Type Selector */}
                    <div className="type-selector">
                        <button
                            className={previewType === "web" ? "active" : ""}
                            onClick={() => setPreviewType("web")}
                        >
                            🌐 Web
                        </button>
                        <button
                            className={previewType === "flutter" ? "active" : ""}
                            onClick={() => setPreviewType("flutter")}
                        >
                            🦋 Flutter
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Panel */}
            <div className="preview-page-content">
                <PreviewPanel 
                    projectId={projectId}
                    type={previewType}
                />
            </div>
        </div>
    );
}
