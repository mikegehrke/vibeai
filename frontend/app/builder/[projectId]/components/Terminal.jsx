'use client';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { X, Plus, Trash2, Terminal as TerminalIcon, BarChart3, AlertTriangle } from 'lucide-react';

const Terminal = forwardRef(function Terminal({ projectId }, ref) {
  const [terminalSessions, setTerminalSessions] = useState([
    { 
      id: '1', 
      name: 'zsh', 
      active: true,
      output: [],
      input: '',
      history: [],
      historyIndex: -1
    }
  ]);
  const [activeTopTab, setActiveTopTab] = useState('terminal'); // terminal, output, problems
  const [activeBottomTab, setActiveBottomTab] = useState('terminal'); // terminal, problems, output, debug, ports
  const [problems, setProblems] = useState([]); // Array of {file, line, message, severity: 'error'|'warning'}
  const terminalRefs = useRef({});
  const inputRefs = useRef({});
  
  // Get active session
  const activeSession = terminalSessions.find(s => s.active) || terminalSessions[0];
  const activeOutput = activeSession?.output || [];
  const activeInput = activeSession?.input || '';
  const activeHistory = activeSession?.history || [];
  const activeHistoryIndex = activeSession?.historyIndex || -1;

  // Expose executeCommand to parent via ref
  useImperativeHandle(ref, () => ({
    executeCommand: (command) => {
      executeCommand(command, activeSession.id);
    }
  }));

  useEffect(() => {
    // Auto-scroll to bottom for active session
    const activeSessionId = activeSession?.id;
    if (activeSessionId && terminalRefs.current[activeSessionId]) {
      terminalRefs.current[activeSessionId].scrollTop = terminalRefs.current[activeSessionId].scrollHeight;
    }
  }, [activeOutput, activeSession?.id]);

  useEffect(() => {
    // Focus input when terminal becomes active
    const activeSessionId = activeSession?.id;
    if (activeBottomTab === 'terminal' && activeSessionId && inputRefs.current[activeSessionId]) {
      inputRefs.current[activeSessionId].focus();
    }
  }, [activeBottomTab, activeSession?.id]);

  const executeCommand = async (command, sessionId = null) => {
    if (!command || !command.trim()) return;
    
    const targetSessionId = sessionId || activeSession?.id;
    if (!targetSessionId) return;

    const trimmedCommand = command.trim();

    // Update session state
    setTerminalSessions(prev => prev.map(session => {
      if (session.id === targetSessionId) {
        const newHistory = [...session.history, trimmedCommand];
        const newOutput = [...session.output, `$ ${trimmedCommand}`];
        
        return {
          ...session,
          history: newHistory,
          historyIndex: newHistory.length,
          output: newOutput,
          input: ''
        };
      }
      return session;
    }));

    try {
      // Execute via backend
      const res = await fetch('http://localhost:8005/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          command: trimmedCommand
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update session with output
        setTerminalSessions(prev => prev.map(session => {
          if (session.id === targetSessionId) {
            let newOutput = [...session.output];
            
            if (data.output) {
              const lines = data.output.split('\n');
              lines.forEach((line, index) => {
                if (line.trim() || index === lines.length - 1) {
                  newOutput.push(line);
                }
              });
            } else if (data.success) {
              newOutput.push('Command executed successfully');
            }
            
            if (data.returncode !== undefined && data.returncode !== 0) {
              newOutput.push(`(exit code: ${data.returncode})`);
            }
            
            newOutput.push(''); // Empty line after output
            
            return {
              ...session,
              output: newOutput
            };
          }
          return session;
        }));
      } else {
        const error = await res.json();
        const errorMsg = error.detail || error.error || 'Command failed';
        
        setTerminalSessions(prev => prev.map(session => {
          if (session.id === targetSessionId) {
            return {
              ...session,
              output: [...session.output, `❌ Error: ${errorMsg}`, '']
            };
          }
          return session;
        }));
      }
    } catch (error) {
      setTerminalSessions(prev => prev.map(session => {
        if (session.id === targetSessionId) {
          return {
            ...session,
            output: [...session.output, `❌ Error: ${error.message}`, '']
          };
        }
        return session;
      }));
    }
  };

  const handleKeyDown = (e, sessionId = null) => {
    const targetSessionId = sessionId || activeSession?.id;
    if (!targetSessionId) return;

    const session = terminalSessions.find(s => s.id === targetSessionId);
    if (!session) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(session.input, targetSessionId);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (session.historyIndex > 0) {
        const newIndex = session.historyIndex - 1;
        setTerminalSessions(prev => prev.map(s => 
          s.id === targetSessionId 
            ? { ...s, historyIndex: newIndex, input: s.history[newIndex] }
            : s
        ));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (session.historyIndex < session.history.length - 1) {
        const newIndex = session.historyIndex + 1;
        setTerminalSessions(prev => prev.map(s => 
          s.id === targetSessionId 
            ? { ...s, historyIndex: newIndex, input: s.history[newIndex] }
            : s
        ));
      } else {
        setTerminalSessions(prev => prev.map(s => 
          s.id === targetSessionId 
            ? { ...s, historyIndex: s.history.length, input: '' }
            : s
        ));
      }
    }
  };

  const handleInputChange = (value, sessionId) => {
    setTerminalSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, input: value } : s
    ));
  };

  const formatLine = (line, idx) => {
    // Format like VS Code Terminal (exact match)
    if (line.startsWith('$')) {
      return (
        <div key={idx} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap', display: 'flex', alignItems: 'flex-start', fontFamily: 'inherit' }}>
          <span style={{ 
            color: '#58a6ff',
            fontWeight: '400',
            fontFamily: 'inherit'
          }}>{line}</span>
        </div>
      );
    } else if (line.includes('INFO:') || line.includes('INFO ')) {
      return (
        <div key={idx} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          <span style={{ color: '#858585' }}>{line}</span>
        </div>
      );
    } else if (line.includes('✔') || line.match(/^✔/)) {
      return (
        <div key={idx} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          <span style={{ color: '#3fb950' }}>{line}</span>
        </div>
      );
    } else if (line.includes('⚠️') || line.includes('Warning') || line.toLowerCase().includes('warning')) {
      return (
        <div key={idx} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          <span style={{ color: '#d29922' }}>{line}</span>
        </div>
      );
    } else if (line.includes('❌') || line.includes('Error:') || line.toLowerCase().includes('error') || line.includes('failed') || line.includes('(exit code:')) {
      return (
        <div key={idx} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          <span style={{ color: '#f85149' }}>{line}</span>
        </div>
      );
    } else if (line.trim() === '') {
      return <div key={idx} style={{ marginBottom: '1px', height: '2px' }} />;
    } else {
      let color = '#cccccc'; // VS Code default text color
      
      // Special patterns
      if (line.match(/^Router prefix:/) || line.match(/^Router routes:/)) {
        color = '#858585';
      } else if (line.includes('Router loaded') || line.includes('loaded')) {
        color = '#858585';
      } else if (line.includes('[AgentSystem]')) {
        color = '#858585';
      } else if (line.match(/^\d+\.\d+\.\d+/)) {
        color = '#79c0ff';
      } else if (line.match(/^\+|^\-|^│/)) {
        color = '#858585';
      } else if (line.match(/^[A-Z_]+=/)) {
        color = '#a5d6ff';
      } else if (line.match(/^[A-Z]+:/)) {
        color = '#858585';
      }
      
      return (
        <div key={idx} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          <span style={{ color: color }}>{line}</span>
        </div>
      );
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#1e1e1e', // VS Code Dark Theme
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: '13px',
      color: '#cccccc'
    }}>
      {/* Tabs - Problems, Output, Debug Console, Terminal, Ports */}
      <div style={{
        height: '35px',
        background: '#252526',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        alignItems: 'center',
        padding: '0',
        fontSize: '12px',
        userSelect: 'none'
      }}>
        {['Problems', 'Output', 'Debug Console', 'Terminal', 'Ports'].map(tab => {
          const tabKey = tab.toLowerCase().replace(' ', '');
          return (
            <div
              key={tab}
              onClick={() => setActiveBottomTab(tabKey)}
              style={{
                padding: '0 16px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                background: activeBottomTab === tabKey ? '#1e1e1e' : 'transparent',
                color: activeBottomTab === tabKey ? '#cccccc' : '#858585',
                borderBottom: activeBottomTab === tabKey ? '2px solid #007acc' : '2px solid transparent',
                transition: 'all 0.2s',
                fontSize: '12px'
              }}
              onMouseEnter={(e) => {
                if (activeBottomTab !== tabKey) {
                  e.currentTarget.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeBottomTab !== tabKey) {
                  e.currentTarget.style.color = '#858585';
                }
              }}
            >
              {tab}
            </div>
          );
        })}
      </div>

      {/* Main Terminal Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Terminal Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div 
            ref={(el) => {
              if (activeSession?.id) {
                terminalRefs.current[activeSession.id] = el;
              }
            }}
            style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '8px 12px',
              color: '#cccccc',
              fontFamily: 'inherit',
              fontSize: '13px',
              lineHeight: '1.4',
              background: '#1e1e1e',
              scrollBehavior: 'smooth'
            }}
          >
            {activeOutput.length === 0 ? (
              <div style={{ color: '#858585', fontStyle: 'italic', marginBottom: '8px' }}>
                No output yet. Type a command to get started.
              </div>
            ) : (
              activeOutput.map((line, idx) => formatLine(line, idx))
            )}
            
            {/* Input Prompt - DIRECTLY IN OUTPUT AREA (like VS Code) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              marginTop: '4px'
            }}>
              <span style={{ 
                color: '#58a6ff',
                fontWeight: '400',
                fontFamily: 'inherit',
                userSelect: 'none'
              }}>$ </span>
              <input
                ref={(el) => {
                  if (activeSession?.id) {
                    inputRefs.current[activeSession.id] = el;
                  }
                }}
                type="text"
                value={activeInput}
                onChange={(e) => handleInputChange(e.target.value, activeSession?.id)}
                onKeyDown={(e) => handleKeyDown(e, activeSession?.id)}
                placeholder=""
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#cccccc',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  caretColor: '#58a6ff',
                  lineHeight: '1.4',
                  padding: '0',
                  minWidth: '200px'
                }}
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Terminal Sessions */}
        <div style={{
          width: '200px',
          background: '#252526',
          borderLeft: '1px solid #3c3c3c',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '11px'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '8px 12px',
            background: '#2d2d30',
            borderBottom: '1px solid #3c3c3c',
            color: '#cccccc',
            fontWeight: '500',
            fontSize: '11px'
          }}>
            TERMINALS
          </div>

          {/* Terminal Sessions List */}
          <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
            {terminalSessions.map((session, idx) => (
              <div
                key={session.id}
                onClick={() => {
                  setTerminalSessions(prev => prev.map(s => ({ ...s, active: s.id === session.id })));
                  // Focus input when switching sessions
                  setTimeout(() => {
                    if (inputRefs.current[session.id]) {
                      inputRefs.current[session.id].focus();
                    }
                  }, 100);
                }}
                style={{
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  background: session.active ? '#094771' : 'transparent',
                  color: session.active ? '#cccccc' : '#858585',
                  fontSize: '11px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!session.active) {
                    e.currentTarget.style.background = '#2a2d2e';
                    e.currentTarget.style.color = '#cccccc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!session.active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#858585';
                  }
                }}
              >
                <span style={{ fontSize: '10px', color: '#858585' }}>∞</span>
                <span style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>{session.name}</span>
                {session.active && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTerminalSessions(prev => {
                        const filtered = prev.filter(s => s.id !== session.id);
                        // If we deleted the active session, activate the first one
                        if (filtered.length > 0 && session.active) {
                          filtered[0].active = true;
                        }
                        // Clean up refs
                        delete terminalRefs.current[session.id];
                        delete inputRefs.current[session.id];
                        return filtered;
                      });
                    }}
                    style={{
                      padding: '2px',
                      background: 'transparent',
                      border: 'none',
                      color: '#858585',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.6,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.color = '#f48771';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6';
                      e.currentTarget.style.color = '#858585';
                    }}
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Terminal Button */}
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid #3c3c3c',
            background: '#2d2d30'
          }}>
            <button
              onClick={() => {
                const sessionNumber = terminalSessions.length;
                const newSession = {
                  id: String(Date.now()),
                  name: sessionNumber === 0 ? 'zsh' : `VibeAI (cd ...)`,
                  active: false,
                  output: [],
                  input: '',
                  history: [],
                  historyIndex: -1
                };
                // Set new session as active and deactivate others
                setTerminalSessions(prev => prev.map(s => ({ ...s, active: false })).concat([{ ...newSession, active: true }]));
              }}
              style={{
                width: '100%',
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid #3c3c3c',
                borderRadius: '3px',
                color: '#cccccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '11px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c3c3c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Plus size={12} />
              New Terminal
            </button>
          </div>

        </div>
      </div>

    </div>
  );
});

export default Terminal;
