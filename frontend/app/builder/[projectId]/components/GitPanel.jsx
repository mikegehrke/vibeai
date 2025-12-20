'use client';

import { useState, useEffect } from 'react';

export default function GitPanel({ projectId }) {
  const [status, setStatus] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  useEffect(() => {
    loadGitStatus();
  }, [projectId]);

  const loadGitStatus = async () => {
    try {
      const res = await fetch(`http://localhost:8005/api/git/status?project_id=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Git status error:', error);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    setIsCommitting(true);
    try {
      const res = await fetch('http://localhost:8005/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          message: commitMessage
        })
      });
      
      if (res.ok) {
        setCommitMessage('');
        loadGitStatus();
        alert('✅ Changes committed!');
      } else {
        const error = await res.json();
        alert(`❌ Commit failed: ${error.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      const res = await fetch('http://localhost:8005/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          remote: 'origin',
          branch: 'main'
        })
      });
      
      if (res.ok) {
        alert('✅ Pushed to remote!');
      } else {
        const error = await res.json();
        alert(`❌ Push failed: ${error.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div style={{ padding: '12px', color: '#cccccc', fontSize: '12px' }}>
      <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '13px' }}>
        🔀 Git Status
      </div>
      
      {status && (
        <>
          {status.has_changes ? (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px', color: '#ffa500' }}>
                ⚠️ {status.files.length} file(s) changed
              </div>
              <div style={{ maxHeight: '200px', overflow: 'auto', background: '#1e1e1e', padding: '8px', borderRadius: '4px' }}>
                {status.files.map((file, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', fontSize: '11px' }}>
                    <span style={{ color: file.staged ? '#4ec9b0' : '#ffa500', marginRight: '8px' }}>
                      {file.status}
                    </span>
                    <span>{file.file}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '16px', color: '#4ec9b0' }}>
              ✅ Working tree clean
            </div>
          )}
        </>
      )}
      
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCommit();
            }
          }}
          style={{
            width: '100%',
            padding: '6px 8px',
            background: '#1e1e1e',
            border: '1px solid #3c3c3c',
            borderRadius: '4px',
            color: '#cccccc',
            fontSize: '11px'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || isCommitting}
          style={{
            flex: 1,
            padding: '6px 12px',
            background: commitMessage.trim() && !isCommitting ? '#007acc' : '#3c3c3c',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '11px',
            cursor: commitMessage.trim() && !isCommitting ? 'pointer' : 'not-allowed'
          }}
        >
          {isCommitting ? '⏳ Committing...' : '💾 Commit'}
        </button>
        
        <button
          onClick={handlePush}
          disabled={isPushing}
          style={{
            flex: 1,
            padding: '6px 12px',
            background: !isPushing ? '#28a745' : '#3c3c3c',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '11px',
            cursor: !isPushing ? 'pointer' : 'not-allowed'
          }}
        >
          {isPushing ? '⏳ Pushing...' : '🚀 Push'}
        </button>
      </div>
      
      <button
        onClick={loadGitStatus}
        style={{
          width: '100%',
          marginTop: '8px',
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid #3c3c3c',
          borderRadius: '4px',
          color: '#cccccc',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        🔄 Refresh Status
      </button>
    </div>
  );
}













