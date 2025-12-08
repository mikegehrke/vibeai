// -------------------------------------------------------------
// VIBEAI – APP BUILDER PAGE (Main Layout)
// -------------------------------------------------------------
/**
 * App Builder Dashboard
 * 
 * Layout:
 * - Left Sidebar: File Explorer
 * - Center Top: Code Editor Tabs (Monaco)
 * - Center Bottom: Build Panel
 * - Right Top: Visual Editor (Drag & Drop)
 * - Right Bottom: Live Preview Panel
 * - Bottom: AI Chat Panel (Orchestrator)
 * 
 * Real-time AI assistance while building!
 */

"use client";

import { useState } from "react";
import FileExplorer from "./FileExplorer";
import EditorTabs from "./EditorTabs";
import LivePreview from "./LivePreview";
import AIPanel from "./AIPanel";
import BuildPanel from "./BuildPanel";
import VisualEditor from "./VisualEditor";
import "./styles.css";

export default function BuilderPage({ params }) {
    const { projectId } = params;
    
    // ⭐ BLOCK 15: Visual Editor State
    const [screen, setScreen] = useState({
        name: "HomeScreen",
        type: "Screen",
        children: []
    });

    return (
        <div className="builder-container-extended">
            
            {/* LEFT SIDEBAR - File Explorer */}
            <div className="sidebar">
                <FileExplorer projectId={projectId} />
            </div>

            {/* CENTER TOP - Code Editor */}
            <div className="editor">
                <EditorTabs projectId={projectId} />
            </div>

            {/* CENTER BOTTOM - Build Panel */}
            <div className="build-panel">
                <BuildPanel projectId={projectId} />
            </div>

            {/* RIGHT TOP - Visual Editor */}
            <div className="visual-editor">
                <VisualEditor 
                    screen={screen} 
                    setScreen={setScreen}
                    projectId={projectId}
                />
            </div>

            {/* RIGHT BOTTOM - Live Preview */}
            <div className="preview">
                <LivePreview projectId={projectId} />
            </div>

            {/* BOTTOM PANEL - AI Chat Assistant */}
            <div className="ai-panel">
                <AIPanel projectId={projectId} />
            </div>
        </div>
    );
}
