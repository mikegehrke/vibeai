'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BuilderPage({ params }) {
  const { projectId } = params;
  
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProject();
  }, [projectId]);
  
  const loadProject = () => {
    try {
      const projectData = localStorage.getItem(`project_${projectId}`);
      if (projectData) {
        const data = JSON.parse(projectData);
        const formattedFiles = data.files.map((file, index) => ({
          id: index + 1,
          name: file.path.split('/').pop(),
          path: file.path,
          content: file.content || '',
          language: file.language || 'dart',
          type: 'file'
        }));
        
        setFiles(formattedFiles);
        setActiveFile(formattedFiles[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Fehler:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1e1e1e',
        color: 'white'
      }}>
        <div>Lade Projekt...</div>
      </div>
    );
  }

  if (!activeFile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1e1e1e',
        color: 'white',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div style={{ fontSize: '20px' }}>Keine Dateien gefunden</div>
        <Link
          href="/builder"
          style={{
            padding: '12px 24px',
            background: '#0098ff',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          Zurück zum Builder
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#1e1e1e',
      color: '#d4d4d4',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#2d2d30',
        borderBottom: '1px solid #3e3e42'
      }}>
        <Link href="/builder" style={{ color: '#0098ff', textDecoration: 'none' }}>
          ← Zurück
        </Link>
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          🏗️ {projectId}
        </span>
        <div></div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT - Files */}
        <div style={{
          width: '250px',
          background: '#252526',
          borderRight: '1px solid #3e3e42',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '12px',
            background: '#2d2d30',
            borderBottom: '1px solid #3e3e42',
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            📁 DATEIEN ({files.length})
          </div>
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => setActiveFile(file)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: activeFile?.id === file.id ? 'rgba(0,152,255,0.2)' : 'transparent',
                borderLeft: activeFile?.id === file.id ? '3px solid #0098ff' : '3px solid transparent',
                fontSize: '13px'
              }}
            >
              📄 {file.name}
            </div>
          ))}
        </div>

        {/* CENTER - Code Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Tab */}
          <div style={{
            background: '#2d2d30',
            borderBottom: '1px solid #3e3e42',
            padding: '8px 16px',
            fontSize: '13px'
          }}>
            📄 {activeFile.name} <span style={{ color: '#888', marginLeft: '8px' }}>({activeFile.language})</span>
          </div>

          {/* Code Area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Line Numbers */}
            <div style={{
              width: '50px',
              background: '#1e1e1e',
              borderRight: '1px solid #3e3e42',
              padding: '16px 8px',
              fontSize: '14px',
              fontFamily: 'Monaco, monospace',
              color: '#858585',
              textAlign: 'right',
              userSelect: 'none',
              lineHeight: '1.6',
              overflowY: 'hidden'
            }}>
              {activeFile.content.split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
            
            {/* Code */}
            <textarea
              value={activeFile.content}
              onChange={(e) => {
                setActiveFile({ ...activeFile, content: e.target.value });
                setFiles(files.map(f => f.id === activeFile.id ? { ...f, content: e.target.value } : f));
              }}
              style={{
                flex: 1,
                background: '#1e1e1e',
                border: 'none',
                color: '#d4d4d4',
                padding: '16px',
                fontSize: '14px',
                fontFamily: 'Monaco, "Courier New", monospace',
                resize: 'none',
                outline: 'none',
                lineHeight: '1.6'
              }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* RIGHT - Preview */}
        <div style={{
          width: '400px',
          background: '#252526',
          borderLeft: '1px solid #3e3e42',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px',
            background: '#2d2d30',
            borderBottom: '1px solid #3e3e42',
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            📱 PREVIEW
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '300px',
              height: '600px',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
              fontSize: '14px'
            }}>
              Flutter App Preview
              <br />
              (Simulation)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
