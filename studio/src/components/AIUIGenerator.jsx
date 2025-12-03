// ============================================================
// VIBEAI – AI UI GENERATOR COMPONENT
// ============================================================
/**
 * KI-gestützter UI Generator
 * 
 * FULL CYCLE:
 * 1. User Prompt → AI Model
 * 2. AI → UI Structure (JSON)
 * 3. UI Structure → HTML Preview
 * 4. Code Generation (Flutter/React/Vue)
 * 5. Build System → APK/App
 * 6. Live Preview → Download
 * 
 * Features:
 * - Natural Language Input
 * - Instant Preview
 * - Code Export
 * - Build Integration
 * 
 * Usage:
 *   <AIUIGenerator onGenerate={(screen) => {...}} />
 */

import React, { useState } from "react";
import AppBuilderPreview from "./AppBuilderPreview";
import "./AIUIGenerator.css";

export default function AIUIGenerator({ onGenerate, onBuild }) {
    const [prompt, setPrompt] = useState("");
    const [framework, setFramework] = useState("flutter");
    const [style, setStyle] = useState("material");
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Generate UI from Prompt
    const generateUI = async () => {
        if (!prompt.trim()) {
            setError("Please enter a description");
            return;
        }

        try {
            setGenerating(true);
            setError(null);

            const res = await fetch("/ai/generate_ui", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt,
                    framework: framework,
                    style: style
                })
            });

            if (!res.ok) {
                throw new Error(`Failed to generate: ${res.statusText}`);
            }

            const data = await res.json();
            setResult(data);

            // Notify parent
            if (onGenerate) {
                onGenerate(data.screen);
            }

        } catch (err) {
            console.error("Generate error:", err);
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    // Build App
    const buildApp = async () => {
        if (!result || !result.code) {
            return;
        }

        if (onBuild) {
            onBuild({
                code: result.code,
                framework: result.framework,
                screen_name: result.screen.name
            });
        } else {
            // Default: Start build via API
            try {
                const buildRes = await fetch("/build/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        build_type: framework === "flutter" ? "flutter_apk" : "web",
                        code_files: {
                            [`${result.screen.name}.dart`]: result.code
                        }
                    })
                });

                if (buildRes.ok) {
                    const buildData = await buildRes.json();
                    alert(`Build started! Build ID: ${buildData.build_id}`);
                } else {
                    throw new Error("Build failed");
                }
            } catch (err) {
                console.error("Build error:", err);
                setError(`Build failed: ${err.message}`);
            }
        }
    };

    // Export Code
    const exportCode = () => {
        if (!result || !result.code) return;

        const blob = new Blob([result.code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.screen.name}.${framework === "flutter" ? "dart" : "jsx"}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Example Prompts
    const examplePrompts = [
        "Login screen with email and password",
        "User profile page with avatar and bio",
        "E-commerce product listing with images",
        "Settings screen with toggles and buttons",
        "Chat interface with message list"
    ];

    return (
        <div className="ai-ui-generator">
            {/* Header */}
            <div className="generator-header">
                <h2>🤖 AI UI Generator</h2>
                <p>Describe your screen in natural language</p>
            </div>

            {/* Input Section */}
            <div className="generator-input">
                <div className="input-row">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Create a login screen with email and password fields..."
                        className="prompt-input"
                        rows={4}
                        disabled={generating}
                    />
                </div>

                <div className="options-row">
                    <div className="option-group">
                        <label>Framework:</label>
                        <select
                            value={framework}
                            onChange={(e) => setFramework(e.target.value)}
                            disabled={generating}
                        >
                            <option value="flutter">Flutter</option>
                            <option value="react">React</option>
                            <option value="vue">Vue</option>
                            <option value="html">HTML</option>
                        </select>
                    </div>

                    <div className="option-group">
                        <label>Style:</label>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            disabled={generating}
                        >
                            <option value="material">Material Design</option>
                            <option value="cupertino">iOS Cupertino</option>
                            <option value="tailwind">Tailwind CSS</option>
                            <option value="bootstrap">Bootstrap</option>
                        </select>
                    </div>

                    <button
                        onClick={generateUI}
                        disabled={generating || !prompt.trim()}
                        className="generate-btn"
                    >
                        {generating ? "⏳ Generating..." : "🚀 Generate UI"}
                    </button>
                </div>

                {/* Examples */}
                <div className="examples">
                    <label>Examples:</label>
                    <div className="example-list">
                        {examplePrompts.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => setPrompt(example)}
                                className="example-btn"
                                disabled={generating}
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="generator-error">
                    ❌ {error}
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="generator-results">
                    {/* Preview + Code Split */}
                    <div className="results-split">
                        {/* Left: Preview */}
                        <div className="result-preview">
                            <h3>Live Preview</h3>
                            <AppBuilderPreview
                                screen={result.screen}
                                autoRefresh={false}
                            />
                        </div>

                        {/* Right: Code */}
                        <div className="result-code">
                            <div className="code-header">
                                <h3>Generated Code</h3>
                                <div className="code-actions">
                                    <button onClick={exportCode}>
                                        💾 Export
                                    </button>
                                    <button onClick={buildApp} className="build-btn">
                                        🔨 Build App
                                    </button>
                                </div>
                            </div>
                            <pre className="code-block">
                                <code>{result.code}</code>
                            </pre>
                        </div>
                    </div>

                    {/* Screen Info */}
                    <div className="screen-info">
                        <div className="info-item">
                            <strong>Screen Name:</strong> {result.screen.name}
                        </div>
                        <div className="info-item">
                            <strong>Components:</strong> {result.screen.components.length}
                        </div>
                        <div className="info-item">
                            <strong>Framework:</strong> {result.framework}
                        </div>
                        <div className="info-item">
                            <strong>Style:</strong> {result.style}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
