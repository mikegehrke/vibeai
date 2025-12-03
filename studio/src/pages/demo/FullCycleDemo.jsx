// ============================================================
// VIBEAI – FULL CYCLE DEMO PAGE
// ============================================================
/**
 * Demonstration der kompletten Pipeline:
 * AI → UI → Code → Build → Preview → APK → Download
 * 
 * Flow:
 * 1. User Prompt → AI UI Generator
 * 2. AI → UI Structure (JSON)
 * 3. UI Structure → HTML Preview (IFRAME)
 * 4. Code Generation (Flutter/React/Vue)
 * 5. Build System → APK/App
 * 6. Live Preview → Download Link
 * 
 * Features:
 * - Step-by-step visualization
 * - Live progress tracking
 * - All systems integrated
 * 
 * Usage:
 *   Route: /full-cycle-demo
 */

import React, { useState } from "react";
import AIUIGenerator from "../../components/AIUIGenerator";
import BuildLogViewer from "../../components/BuildLogViewer";
import "./FullCycleDemo.css";

export default function FullCycleDemo() {
    const [currentStep, setCurrentStep] = useState(0);
    const [generatedScreen, setGeneratedScreen] = useState(null);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [buildId, setBuildId] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);

    const steps = [
        { id: 0, label: "AI Prompt", icon: "💬" },
        { id: 1, label: "UI Generation", icon: "🎨" },
        { id: 2, label: "Preview", icon: "👁️" },
        { id: 3, label: "Code Generation", icon: "💻" },
        { id: 4, label: "Build", icon: "🔨" },
        { id: 5, label: "Download", icon: "📦" }
    ];

    // Handle UI Generation
    const handleGenerate = (screen) => {
        setGeneratedScreen(screen);
        setCurrentStep(1);
    };

    // Handle Build
    const handleBuild = async (buildData) => {
        setGeneratedCode(buildData.code);
        setCurrentStep(3);

        try {
            // Start build
            const res = await fetch("/build/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    build_type: buildData.framework === "flutter" ? "flutter_apk" : "web",
                    code_files: {
                        [`${buildData.screen_name}.dart`]: buildData.code
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                setBuildId(data.build_id);
                setCurrentStep(4);

                // Wait for build completion (simplified)
                setTimeout(() => {
                    setDownloadUrl(`/build/${data.build_id}/download`);
                    setCurrentStep(5);
                }, 5000);
            }
        } catch (err) {
            console.error("Build error:", err);
        }
    };

    return (
        <div className="full-cycle-demo">
            {/* Header */}
            <div className="demo-header">
                <h1>🚀 Full Cycle Demo</h1>
                <p>AI → UI → Code → Build → Preview → APK → Download</p>
            </div>

            {/* Progress Steps */}
            <div className="progress-steps">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`step ${currentStep >= step.id ? "active" : ""} ${
                            currentStep === step.id ? "current" : ""
                        }`}
                    >
                        <div className="step-icon">{step.icon}</div>
                        <div className="step-label">{step.label}</div>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="demo-content">
                {/* Step 0-3: AI UI Generator */}
                {currentStep <= 3 && (
                    <AIUIGenerator
                        onGenerate={handleGenerate}
                        onBuild={handleBuild}
                    />
                )}

                {/* Step 4: Build Logs */}
                {currentStep === 4 && buildId && (
                    <div className="build-section">
                        <h2>🔨 Building App...</h2>
                        <BuildLogViewer buildId={buildId} />
                    </div>
                )}

                {/* Step 5: Download */}
                {currentStep === 5 && downloadUrl && (
                    <div className="download-section">
                        <div className="success-message">
                            <h2>✅ Build Completed!</h2>
                            <p>Your app is ready to download</p>
                        </div>

                        <div className="download-actions">
                            <a
                                href={downloadUrl}
                                download
                                className="download-btn"
                            >
                                📦 Download APK
                            </a>

                            <button
                                onClick={() => {
                                    setCurrentStep(0);
                                    setGeneratedScreen(null);
                                    setGeneratedCode(null);
                                    setBuildId(null);
                                    setDownloadUrl(null);
                                }}
                                className="restart-btn"
                            >
                                🔄 Start Over
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="cycle-summary">
                            <h3>Full Cycle Summary</h3>
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <strong>Screen:</strong> {generatedScreen?.name}
                                </div>
                                <div className="summary-item">
                                    <strong>Components:</strong> {generatedScreen?.components.length}
                                </div>
                                <div className="summary-item">
                                    <strong>Build ID:</strong> {buildId}
                                </div>
                                <div className="summary-item">
                                    <strong>Status:</strong> ✅ Complete
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
