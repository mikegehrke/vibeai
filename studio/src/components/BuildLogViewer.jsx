// ============================================================
// VIBEAI – BUILD LOG VIEWER COMPONENT
// ============================================================
/**
 * Build Log Viewer mit Progress Bar
 * 
 * Features:
 * - Live Build Logs
 * - Progress Indicator
 * - Artifact Download
 * - Status Display
 * 
 * Props:
 *   buildId: string
 */

import React from "react";
import { useBuildLogs } from "../hooks/useBuildLogs";
import LiveConsole from "./LiveConsole";
import "./BuildLogViewer.css";

export default function BuildLogViewer({ buildId }) {
    const { logs, status, progress, buildInfo, downloadArtifacts } = useBuildLogs(buildId);

    // Status Icon
    const getStatusIcon = () => {
        switch (status) {
            case "queued": return "⏳";
            case "building": return "🔨";
            case "success": return "✅";
            case "failed": return "❌";
            default: return "❓";
        }
    };

    // Status Color
    const getStatusColor = () => {
        switch (status) {
            case "queued": return "#ffc107";
            case "building": return "#2196f3";
            case "success": return "#4caf50";
            case "failed": return "#f44336";
            default: return "#9e9e9e";
        }
    };

    return (
        <div className="build-log-viewer">
            {/* Header */}
            <div className="build-header">
                <div className="build-info">
                    <h3>
                        {getStatusIcon()} Build #{buildId}
                    </h3>
                    <span 
                        className="build-status"
                        style={{ color: getStatusColor() }}
                    >
                        {status.toUpperCase()}
                    </span>
                </div>

                {/* Actions */}
                <div className="build-actions">
                    {status === "success" && buildInfo?.artifacts && (
                        <button 
                            onClick={downloadArtifacts}
                            className="download-btn"
                        >
                            📦 Download Artifacts
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {(status === "building" || status === "queued") && (
                <div className="build-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ 
                                width: `${progress}%`,
                                background: getStatusColor()
                            }}
                        />
                    </div>
                    <span className="progress-text">{progress}%</span>
                </div>
            )}

            {/* Build Metadata */}
            {buildInfo && (
                <div className="build-metadata">
                    {buildInfo.build_type && (
                        <div className="metadata-item">
                            <strong>Type:</strong> {buildInfo.build_type}
                        </div>
                    )}
                    {buildInfo.started_at && (
                        <div className="metadata-item">
                            <strong>Started:</strong> {new Date(buildInfo.started_at).toLocaleString("de-DE")}
                        </div>
                    )}
                    {buildInfo.completed_at && (
                        <div className="metadata-item">
                            <strong>Completed:</strong> {new Date(buildInfo.completed_at).toLocaleString("de-DE")}
                        </div>
                    )}
                    {buildInfo.duration && (
                        <div className="metadata-item">
                            <strong>Duration:</strong> {buildInfo.duration}s
                        </div>
                    )}
                </div>
            )}

            {/* Logs */}
            <div className="build-logs">
                <LiveConsole 
                    logs={logs}
                    title="Build Logs"
                    height="400px"
                />
            </div>

            {/* Artifacts List */}
            {status === "success" && buildInfo?.artifacts?.length > 0 && (
                <div className="build-artifacts">
                    <h4>Build Artifacts</h4>
                    <ul className="artifacts-list">
                        {buildInfo.artifacts.map((artifact, index) => (
                            <li key={index} className="artifact-item">
                                <span className="artifact-name">
                                    📄 {artifact.name || artifact}
                                </span>
                                {artifact.size && (
                                    <span className="artifact-size">
                                        {formatBytes(artifact.size)}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Helper: Format Bytes
function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
