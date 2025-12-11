'use client';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { X, Plus, Trash2, Terminal as TerminalIcon, BarChart3, AlertTriangle } from 'lucide-react';

const Terminal = forwardRef(function Terminal({ projectId, onUrlDetected, onProblemDetected }, ref) {
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
  const [outputLogs, setOutputLogs] = useState([]); // Array of {source, message, timestamp}
  const [debugLogs, setDebugLogs] = useState([]); // Array of {level, message, timestamp}
  const [ports, setPorts] = useState([]); // Array of {port, process, name, url}
  const terminalRefs = useRef({});
  const inputRefs = useRef({});
  
  // Get active session
  const activeSession = terminalSessions.find(s => s.active) || terminalSessions[0];
  const activeOutput = activeSession?.output || [];
  const activeInput = activeSession?.input || '';
  const activeHistory = activeSession?.history || [];
  const activeHistoryIndex = activeSession?.historyIndex || -1;

  // Expose executeCommand and addProblem to parent via ref
  useImperativeHandle(ref, () => ({
    executeCommand: async (command) => {
      // ⚡ WICHTIG: Führe Befehl wirklich aus und warte auf Ergebnis
      return await executeCommand(command, activeSession.id);
    },
    addProblem: (problem) => {
      setProblems(prev => [...prev, problem]);
      if (onProblemDetected) {
        onProblemDetected(problem);
      }
    },
    addDebugLog: (level, message) => {
      setDebugLogs(prev => [...prev, {
        level: level || 'info',
        message: message,
        timestamp: new Date().toISOString()
      }]);
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
                  
                  // Detect URLs in output (like http://localhost:3000)
                  const urlRegex = /(https?:\/\/[^\s]+|localhost:\d+|127\.0\.0\.1:\d+)/gi;
                  const urls = line.match(urlRegex);
                  if (urls && onUrlDetected) {
                    urls.forEach(url => {
                      const fullUrl = url.startsWith('http') ? url : `http://${url}`;
                      onUrlDetected(fullUrl, trimmedCommand);
                    });
                  }
                  
                  // Detect errors and add to problems
                  if (line.match(/error|Error|ERROR|failed|Failed|FAILED/i)) {
                    const problem = {
                      file: null,
                      line: newOutput.length,
                      message: line,
                      severity: 'error',
                      source: 'terminal'
                    };
                    setProblems(prev => [...prev, problem]);
                    if (onProblemDetected) {
                      onProblemDetected(problem);
                    }
                  }
                  
                  // Detect warnings
                  if (line.match(/warning|Warning|WARNING|warn|Warn/i)) {
                    const problem = {
                      file: null,
                      line: newOutput.length,
                      message: line,
                      severity: 'warning',
                      source: 'terminal'
                    };
                    setProblems(prev => [...prev, problem]);
                  }
                  
                  // Add to output logs
                  setOutputLogs(prev => [...prev, {
                    source: trimmedCommand,
                    message: line,
                    timestamp: new Date().toISOString()
                  }]);
                  
                  // Detect running servers and ports
                  const portMatch = line.match(/(?:listening|running|started).*?(\d{4,5})|port\s+(\d{4,5})|:(\d{4,5})/i);
                  if (portMatch) {
                    const port = parseInt(portMatch[1] || portMatch[2] || portMatch[3]);
                    if (port && port > 1000 && port < 65535) {
                      setPorts(prev => {
                        const existingPort = prev.find(p => p.port === port);
                        if (!existingPort) {
                          const newPort = {
                            port: port,
                            process: trimmedCommand,
                            name: `${trimmedCommand} (${port})`,
                            url: `http://localhost:${port}`
                          };
                          // Auto-open browser tab if it's a server
                          if (trimmedCommand.includes('start') || trimmedCommand.includes('dev') || trimmedCommand.includes('serve')) {
                            if (onUrlDetected) {
                              onUrlDetected(newPort.url, trimmedCommand);
                            }
                          }
                          return [...prev, newPort];
                        }
                        return prev;
                      });
                    }
                  }
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

      {/* Main Content Area - Different panels based on active tab */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Problems Panel */}
        {activeBottomTab === 'problems' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '8px 12px',
              background: '#1e1e1e'
            }}>
              {problems.length === 0 ? (
                <div style={{ color: '#858585', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                  No problems detected
                </div>
              ) : (
                <div>
                  <div style={{ color: '#858585', fontSize: '11px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #3c3c3c' }}>
                    {problems.filter(p => p.severity === 'error').length} errors, {problems.filter(p => p.severity === 'warning').length} warnings
                  </div>
                  {problems.map((problem, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (problem.file && onProblemDetected) {
                          onProblemDetected(problem);
                        }
                      }}
                      style={{
                        padding: '6px 8px',
                        marginBottom: '2px',
                        background: problem.severity === 'error' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(212, 153, 34, 0.1)',
                        borderLeft: `3px solid ${problem.severity === 'error' ? '#f85149' : '#d29922'}`,
                        cursor: problem.file ? 'pointer' : 'default',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (problem.file) {
                          e.currentTarget.style.background = problem.severity === 'error' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(212, 153, 34, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (problem.file) {
                          e.currentTarget.style.background = problem.severity === 'error' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(212, 153, 34, 0.1)';
                        }
                      }}
                    >
                      <span style={{ color: problem.severity === 'error' ? '#f85149' : '#d29922', fontSize: '14px' }}>
                        {problem.severity === 'error' ? '❌' : '⚠️'}
                      </span>
                      <span style={{ color: '#cccccc', flex: 1 }}>
                        {problem.file ? `${problem.file}:${problem.line}` : `Line ${problem.line}`}
                      </span>
                      <span style={{ color: '#858585', fontSize: '11px' }}>
                        {problem.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Output Panel */}
        {activeBottomTab === 'output' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '8px 12px',
              background: '#1e1e1e',
              fontFamily: 'inherit',
              fontSize: '13px',
              color: '#cccccc'
            }}>
              {outputLogs.length === 0 ? (
                <div style={{ color: '#858585', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                  No output logs yet
                </div>
              ) : (
                outputLogs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', whiteSpace: 'pre-wrap' }}>
                    <span style={{ color: '#858585', fontSize: '11px' }}>
                      [{new Date(log.timestamp).toLocaleTimeString()}] {log.source}:
                    </span>
                    <span style={{ color: '#cccccc', marginLeft: '8px' }}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Debug Console */}
        {activeBottomTab === 'debugconsole' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '8px 12px',
              background: '#1e1e1e',
              fontFamily: 'inherit',
              fontSize: '13px',
              color: '#cccccc'
            }}>
              {debugLogs.length === 0 ? (
                <div style={{ color: '#858585', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                  No debug logs yet
                </div>
              ) : (
                debugLogs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', whiteSpace: 'pre-wrap' }}>
                    <span style={{ 
                      color: log.level === 'error' ? '#f85149' : log.level === 'warn' ? '#d29922' : '#58a6ff',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span style={{ color: '#cccccc', marginLeft: '8px' }}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Ports Panel */}
        {activeBottomTab === 'ports' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '8px 12px',
              background: '#1e1e1e'
            }}>
              {ports.length === 0 ? (
                <div style={{ color: '#858585', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                  No ports detected. Start a server to see ports here.
                </div>
              ) : (
                <div>
                  <div style={{ color: '#858585', fontSize: '11px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #3c3c3c' }}>
                    {ports.length} port{ports.length > 1 ? 's' : ''} detected
                  </div>
                  {ports.map((portInfo, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        marginBottom: '4px',
                        background: '#2d2d30',
                        border: '1px solid #3c3c3c',
                        borderRadius: '4px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#4ec9b0', fontWeight: '500', marginBottom: '4px' }}>
                          Port {portInfo.port}
                        </div>
                        <div style={{ color: '#858585', fontSize: '11px' }}>
                          {portInfo.name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <a
                          href={portInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onUrlDetected) {
                              onUrlDetected(portInfo.url, portInfo.process);
                            }
                          }}
                          style={{
                            color: '#58a6ff',
                            textDecoration: 'none',
                            fontSize: '11px',
                            padding: '4px 8px',
                            background: '#094771',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#0e639c';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#094771';
                          }}
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terminal Output */}
        {activeBottomTab === 'terminal' && (
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
        )}

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
