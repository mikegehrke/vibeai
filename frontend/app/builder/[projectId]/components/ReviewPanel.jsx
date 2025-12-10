'use client';

import { useState } from 'react';

export default function ReviewPanel({ 
  reviewTitle = "Review",
  userRequest = "",
  codeChanges = [],
  onCommit,
  onFindIssues,
  selectedAgent = "auto"
}) {
  const [followUp, setFollowUp] = useState('');

  const agents = [
    { id: 'auto', name: 'Agent Auto', icon: '🤖' },
    { id: 'aura', name: 'Aura', icon: '✨' },
    { id: 'cora', name: 'Cora', icon: '💻' },
    { id: 'devra', name: 'Devra', icon: '🧠' },
    { id: 'lumi', name: 'Lumi', icon: '🎨' }
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      color: '#cccccc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #3c3c3c',
        background: '#252526'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '500',
          color: '#cccccc',
          marginBottom: '12px'
        }}>
          {reviewTitle}
        </div>
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <button
            onClick={onFindIssues}
            style={{
              padding: '6px 12px',
              background: '#2d2d30',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Find Issues
          </button>
          <button
            onClick={onCommit}
            style={{
              padding: '6px 12px',
              background: '#007acc',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Commit
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px'
      }}>
        {/* User Request */}
        {userRequest && (
          <div style={{
            marginBottom: '24px',
            padding: '12px',
            background: '#252526',
            borderRadius: '6px',
            border: '1px solid #3c3c3c'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#858585',
              marginBottom: '8px'
            }}>
              User Request:
            </div>
            <div style={{
              fontSize: '13px',
              color: '#cccccc',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {userRequest}
            </div>
          </div>
        )}

        {/* Code Changes */}
        {codeChanges.map((change, index) => (
          <div key={index} style={{
            marginBottom: '20px',
            border: '1px solid #3c3c3c',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            {/* File Header */}
            <div style={{
              padding: '8px 12px',
              background: '#2d2d30',
              borderBottom: '1px solid #3c3c3c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#4ec9b0' }}>{change.file}</span>
              <span style={{ color: '#858585' }}>
                {change.added > 0 && `+${change.added}`}
                {change.removed > 0 && ` -${change.removed}`}
              </span>
            </div>

            {/* Code Diff */}
            <div style={{
              background: '#1e1e1e',
              padding: '12px',
              fontSize: '12px',
              fontFamily: '"Fira Code", "Courier New", monospace',
              lineHeight: '1.5',
              overflowX: 'auto'
            }}>
              {change.diff?.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  style={{
                    padding: '2px 8px',
                    background: line.type === 'added' ? '#1e4620' : 
                               line.type === 'removed' ? '#5a1d1d' : 
                               'transparent',
                    color: line.type === 'added' ? '#4ec9b0' :
                          line.type === 'removed' ? '#f48771' :
                          '#cccccc',
                    display: 'flex',
                    gap: '12px'
                  }}
                >
                  <span style={{ 
                    color: '#858585',
                    minWidth: '40px',
                    textAlign: 'right'
                  }}>
                    {line.oldLine || ' '}
                  </span>
                  <span style={{ 
                    color: '#858585',
                    minWidth: '40px',
                    textAlign: 'right'
                  }}>
                    {line.newLine || ' '}
                  </span>
                  <span style={{ flex: 1 }}>
                    {line.type === 'removed' && '-'}
                    {line.type === 'added' && '+'}
                    {line.content}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Status Messages */}
        <div style={{
          marginTop: '16px',
          padding: '8px 12px',
          background: '#252526',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#858585'
        }}>
          <div>Explored {codeChanges.length} file{codeChanges.length !== 1 ? 's' : ''}</div>
          <div style={{ marginTop: '4px' }}>
            Completed {codeChanges.length} of {codeChanges.length} changes
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #3c3c3c',
        background: '#252526',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Follow-up Input */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Add a follow-up"
            style={{
              flex: 1,
              padding: '6px 10px',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '12px',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && followUp.trim()) {
                // Handle follow-up
                setFollowUp('');
              }
            }}
          />
          <select
            value={selectedAgent}
            onChange={(e) => {}}
            style={{
              padding: '6px 10px',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.icon} {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => {}}
            style={{
              padding: '6px 12px',
              background: '#2d2d30',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Stop ^c
          </button>
          <button
            onClick={onFindIssues}
            style={{
              padding: '6px 12px',
              background: '#2d2d30',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Review
          </button>
          <button
            onClick={onCommit}
            style={{
              padding: '6px 12px',
              background: '#007acc',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Commit
          </button>
        </div>
      </div>
    </div>
  );
}

