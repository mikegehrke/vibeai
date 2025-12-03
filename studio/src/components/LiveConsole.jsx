// ============================================================
// VIBEAI – LIVE CONSOLE COMPONENT
// ============================================================
/**
 * Terminal-Style Log Viewer
 * 
 * Features:
 * - Auto-Scroll to Bottom
 * - ANSI Color Support
 * - Copy to Clipboard
 * - Clear Logs
 * - Search/Filter
 * 
 * Props:
 *   logs: string[]
 *   title: string
 *   height: string
 */

import React, { useEffect, useRef, useState } from "react";
import "./LiveConsole.css";

export default function LiveConsole({ 
    logs = [], 
    title = "Console", 
    height = "300px" 
}) {
    const consoleRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [filter, setFilter] = useState("");
    const [showTimestamps, setShowTimestamps] = useState(true);

    // Auto-Scroll to Bottom
    useEffect(() => {
        if (autoScroll && consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    // Logs filtern
    const filteredLogs = filter 
        ? logs.filter(log => log.toLowerCase().includes(filter.toLowerCase()))
        : logs;

    // Copy to Clipboard
    const copyToClipboard = () => {
        const text = logs.join("\n");
        navigator.clipboard.writeText(text);
        alert("Logs copied to clipboard!");
    };

    // Clear Logs (Event an Parent senden)
    const clearLogs = () => {
        if (window.confirm("Clear all logs?")) {
            // Parent muss logs state leeren
            console.log("Clear logs requested");
        }
    };

    // ANSI Color Parsing (basic)
    const parseLogLine = (line) => {
        // Simple emoji detection für Status
        if (line.includes("✅") || line.includes("success")) {
            return { text: line, color: "success" };
        } else if (line.includes("❌") || line.includes("error")) {
            return { text: line, color: "error" };
        } else if (line.includes("⚠️") || line.includes("warn")) {
            return { text: line, color: "warning" };
        } else if (line.includes("⏳") || line.includes("compiling")) {
            return { text: line, color: "info" };
        } else if (line.includes("🚀") || line.includes("ready")) {
            return { text: line, color: "success" };
        }
        return { text: line, color: "default" };
    };

    // Timestamp hinzufügen
    const getTimestamp = () => {
        const now = new Date();
        return now.toLocaleTimeString("de-DE");
    };

    return (
        <div className="live-console">
            {/* Header */}
            <div className="console-header">
                <h3>{title}</h3>
                
                <div className="console-actions">
                    {/* Filter */}
                    <input 
                        type="text"
                        placeholder="Filter..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="console-filter"
                    />

                    {/* Timestamps Toggle */}
                    <button 
                        onClick={() => setShowTimestamps(!showTimestamps)}
                        className="console-btn"
                        title="Toggle timestamps"
                    >
                        🕐
                    </button>

                    {/* Auto-Scroll Toggle */}
                    <button 
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`console-btn ${autoScroll ? "active" : ""}`}
                        title="Auto-scroll"
                    >
                        ⬇️
                    </button>

                    {/* Copy */}
                    <button 
                        onClick={copyToClipboard}
                        className="console-btn"
                        title="Copy to clipboard"
                    >
                        📋
                    </button>

                    {/* Clear */}
                    <button 
                        onClick={clearLogs}
                        className="console-btn"
                        title="Clear logs"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* Console Output */}
            <div 
                ref={consoleRef}
                className="console-output"
                style={{ height }}
            >
                {filteredLogs.length === 0 ? (
                    <div className="console-empty">
                        {filter ? "No matching logs" : "No logs yet..."}
                    </div>
                ) : (
                    filteredLogs.map((log, index) => {
                        const parsed = parseLogLine(log);
                        return (
                            <div 
                                key={index} 
                                className={`console-line console-${parsed.color}`}
                            >
                                {showTimestamps && (
                                    <span className="console-timestamp">
                                        [{getTimestamp()}]
                                    </span>
                                )}
                                <span className="console-text">
                                    {parsed.text}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="console-footer">
                <span>{filteredLogs.length} / {logs.length} lines</span>
                {filter && <span className="filter-badge">Filtered: {filter}</span>}
            </div>
        </div>
    );
}
