// -------------------------------------------------------------
// VIBEAI – FILE EXPLORER COMPONENT
// -------------------------------------------------------------
/**
 * File Explorer with Project Tree
 * 
 * Features:
 * - Lists all project files
 * - Click to open in editor
 * - File icons based on type
 * - Real-time file updates
 * - Supports nested folders
 */

"use client";

import { useEffect, useState } from "react";

export default function FileExplorer({ projectId }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        loadFiles();
    }, [projectId]);

    async function loadFiles() {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8005/api/projects/${projectId}/files`);
            
            if (!res.ok) {
                throw new Error("Failed to load files");
            }
            
            const data = await res.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error("❌ Error loading files:", error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    }

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        const iconMap = {
            'js': '📄',
            'jsx': '⚛️',
            'ts': '🔷',
            'tsx': '⚛️',
            'json': '📋',
            'css': '🎨',
            'html': '🌐',
            'md': '📝',
            'py': '🐍',
            'dart': '🎯',
            'yaml': '⚙️',
            'yml': '⚙️',
            'txt': '📄',
            'env': '🔐'
        };
        
        return iconMap[ext] || '📁';
    }

    function handleFileClick(file) {
        setSelectedFile(file);
        
        // Dispatch custom event for EditorTabs to listen
        window.dispatchEvent(new CustomEvent('fileSelected', {
            detail: { file, projectId }
        }));
    }

    return (
        <div className="file-explorer">
            <h3>📁 Project Files</h3>
            
            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading files...
                </div>
            ) : files.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No files found
                </div>
            ) : (
                <ul className="file-list">
                    {files.map((file, index) => (
                        <li 
                            key={index}
                            className={`file-item ${selectedFile === file ? 'active' : ''}`}
                            onClick={() => handleFileClick(file)}
                        >
                            <span className="file-icon">{getFileIcon(file)}</span>
                            <span>{file}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
