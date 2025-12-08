// -------------------------------------------------------------
// VIBEAI – EDITOR TABS COMPONENT
// -------------------------------------------------------------
/**
 * Code Editor with Monaco
 * 
 * Features:
 * - Monaco Editor (VS Code engine)
 * - Multi-tab support
 * - Syntax highlighting
 * - Auto-save
 * - IntelliSense
 * - File watching
 */

"use client";

import MonacoEditor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { updatePreviewDebounced } from "./utils/editor-bridge";

export default function EditorTabs({ projectId }) {
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [content, setContent] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [isAutoFixing, setIsAutoFixing] = useState(false);
    const [detectedIssues, setDetectedIssues] = useState([]);
    const editorRef = useRef(null);

    useEffect(() => {
        // Listen for file selection from FileExplorer
        const handleFileSelected = (event) => {
            const { file } = event.detail;
            openFile(file);
        };

        window.addEventListener('fileSelected', handleFileSelected);

        return () => {
            window.removeEventListener('fileSelected', handleFileSelected);
        };
    }, []);

    async function openFile(file) {
        try {
            // Check if already open
            if (!openFiles.includes(file)) {
                setOpenFiles([...openFiles, file]);
            }

            setActiveFile(file);

            const res = await fetch("http://localhost:8000/api/files/read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ projectId, file })
            });

            if (!res.ok) {
                throw new Error("Failed to load file");
            }

            const data = await res.json();
            setContent(data.content || "");
            setHasChanges(false);
        } catch (error) {
            console.error("❌ Error loading file:", error);
            setContent("// Error loading file");
        }
    }

    async function saveFile() {
        if (!activeFile) return;

        try {
            const res = await fetch("http://localhost:8000/api/files/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    projectId,
                    file: activeFile,
                    content
                })
            });

            if (!res.ok) {
                throw new Error("Failed to save file");
            }

            setHasChanges(false);
            console.log("✅ File saved:", activeFile);
        } catch (error) {
            console.error("❌ Error saving file:", error);
            alert("Failed to save file");
        }
    }

    function closeFile(file) {
        setOpenFiles(openFiles.filter(f => f !== file));

        if (activeFile === file) {
            const index = openFiles.indexOf(file);
            const nextFile = openFiles[index + 1] || openFiles[index - 1];

            if (nextFile) {
                openFile(nextFile);
            } else {
                setActiveFile(null);
                setContent("");
            }
        }
    }

    function handleEditorDidMount(editor) {
        editorRef.current = editor;

        // Auto-save on Cmd/Ctrl + S
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            saveFile();
        });
    }

    function handleContentChange(value) {
        setContent(value);
        setHasChanges(true);

        // ⭐ Live Preview Update - Sendet Code zum Preview iframe
        if (activeFile && value) {
            const language = getLanguage(activeFile);
            updatePreviewDebounced(value, language);
        }
    }

    function getLanguage(filename) {
        if (!filename) return "javascript";

        const ext = filename.split('.').pop().toLowerCase();

        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'json': 'json',
            'css': 'css',
            'html': 'html',
            'md': 'markdown',
            'py': 'python',
            'dart': 'dart',
            'yaml': 'yaml',
            'yml': 'yaml'
        };

        return languageMap[ext] || 'plaintext';
    }

    // ========================================
    // ⭐ BLOCK 18: AUTO-FIX FUNCTIONS
    // ========================================

    /**
     * Auto-fix current file with AI
     */
    async function autoFixFile() {
        if (!activeFile || !content) {
            alert("No file open to fix");
            return;
        }

        setIsAutoFixing(true);

        try {
            const res = await fetch("http://localhost:8000/autofix/fix", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_id: projectId,
                    file_path: activeFile,
                    content: content,
                    issue_type: "general"
                })
            });

            if (!res.ok) {
                throw new Error("Auto-fix failed");
            }

            const data = await res.json();

            if (data.success) {
                // Reload file to see fixed content
                await openFile(activeFile);
                alert(`✅ Auto-fixed! Changes: ${data.changes_made?.join(', ')}`);
            } else {
                throw new Error(data.error || "Fix failed");
            }
        } catch (error) {
            console.error("❌ Auto-fix error:", error);
            alert("Auto-fix failed: " + error.message);
        } finally {
            setIsAutoFixing(false);
        }
    }

    /**
     * Detect issues in current file
     */
    async function detectIssues() {
        if (!activeFile || !content) {
            alert("No file open to analyze");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/autofix/detect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_id: projectId,
                    file_path: activeFile,
                    content: content
                })
            });

            if (!res.ok) {
                throw new Error("Issue detection failed");
            }

            const data = await res.json();

            if (data.success) {
                setDetectedIssues(data.issues || []);

                if (data.has_errors) {
                    alert(`⚠️ Found ${data.issues.length} issues!\nCheck the issues panel.`);
                } else {
                    alert(`✅ No critical issues found!`);
                }
            }
        } catch (error) {
            console.error("❌ Issue detection error:", error);
            alert("Issue detection failed: " + error.message);
        }
    }

    /**
     * Optimize imports in current file
     */
    async function optimizeImports() {
        if (!activeFile || !content) {
            alert("No file open");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/autofix/optimize-imports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_id: projectId,
                    file_path: activeFile,
                    content: content
                })
            });

            if (!res.ok) {
                throw new Error("Import optimization failed");
            }

            const data = await res.json();

            if (data.success) {
                await openFile(activeFile);
                alert("✅ Imports optimized!");
            }
        } catch (error) {
            console.error("❌ Import optimization error:", error);
            alert("Import optimization failed: " + error.message);
        }
    }

    /**
     * Refactor current file
     */
    async function refactorCode(refactorType = "general") {
        if (!activeFile || !content) {
            alert("No file open");
            return;
        }

        setIsAutoFixing(true);

        try {
            const res = await fetch("http://localhost:8000/autofix/refactor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_id: projectId,
                    file_path: activeFile,
                    content: content,
                    refactor_type: refactorType
                })
            });

            if (!res.ok) {
                throw new Error("Refactoring failed");
            }

            const data = await res.json();

            if (data.success) {
                await openFile(activeFile);
                alert(`✅ Code refactored (${refactorType})!`);
            }
        } catch (error) {
            console.error("❌ Refactoring error:", error);
            alert("Refactoring failed: " + error.message);
        } finally {
            setIsAutoFixing(false);
        }
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Editor Header */}
            <div className="editor-header">
                <div className="editor-tabs">
                    {openFiles.map(file => (
                        <div
                            key={file}
                            className={`editor-tab ${activeFile === file ? 'active' : ''}`}
                            onClick={() => openFile(file)}
                        >
                            {file.split('/').pop()}
                            <span
                                style={{ marginLeft: 8, cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeFile(file);
                                }}
                            >
                                ✕
                            </span>
                        </div>
                    ))}
                </div>

                <div className="editor-actions">
                    {/* ⭐ BLOCK 18: Auto-Fix Buttons */}
                    <button
                        className="btn btn-warning"
                        onClick={autoFixFile}
                        disabled={!activeFile || isAutoFixing}
                        title="Auto-fix errors with AI"
                    >
                        {isAutoFixing ? '⏳ Fixing...' : '🔧 Auto-Fix'}
                    </button>

                    <button
                        className="btn btn-info"
                        onClick={detectIssues}
                        disabled={!activeFile}
                        title="Detect issues"
                    >
                        🔍 Detect Issues
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={optimizeImports}
                        disabled={!activeFile}
                        title="Optimize imports"
                    >
                        📦 Optimize Imports
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={saveFile}
                        disabled={!hasChanges}
                    >
                        💾 {hasChanges ? 'Save *' : 'Saved'}
                    </button>
                </div>
            </div>

            {/* Monaco Editor */}
            {activeFile ? (
                <>
                    {/* ⭐ Issues Panel */}
                    {detectedIssues.length > 0 && (
                        <div style={{
                            padding: '10px',
                            background: '#2a2a2a',
                            borderBottom: '1px solid #444',
                            maxHeight: '150px',
                            overflowY: 'auto'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ff6b6b' }}>
                                ⚠️ Detected Issues ({detectedIssues.length})
                            </h4>
                            {detectedIssues.map((issue, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '6px 8px',
                                        marginBottom: '4px',
                                        background: issue.type === 'error' ? '#ff6b6b22' : '#ffa50022',
                                        borderLeft: `3px solid ${issue.type === 'error' ? '#ff6b6b' : '#ffa500'}`,
                                        fontSize: '12px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <strong>{issue.type === 'error' ? '❌' : '⚠️'}</strong> {issue.message}
                                    {issue.line && ` (Line ${issue.line})`}
                                </div>
                            ))}
                        </div>
                    )}

                    <MonacoEditor
                        language={getLanguage(activeFile)}
                        value={content}
                        onChange={handleContentChange}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            readOnly: false,
                            automaticLayout: true,
                            tabSize: 2,
                            insertSpaces: true,
                            wordWrap: 'on',
                            quickSuggestions: true,
                            suggestOnTriggerCharacters: true,
                            acceptSuggestionOnEnter: 'on',
                            snippetSuggestions: 'top'
                        }}
                    />
                </>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#666',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ fontSize: '48px' }}>📝</div>
                    <div>Select a file to start editing</div>
                </div>
            )}
        </div>
    );
}
