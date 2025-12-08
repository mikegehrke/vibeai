// Professional VS Code-style Builder with All Features
import React from 'react';

const ProfessionalBuilder = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui',
      background: '#1e1e1e',
      color: '#d4d4d4',
      overflow: 'hidden'
    }}>
      {/* Title Bar */}
      <div style={{
        height: '35px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 15px',
        fontSize: '13px',
        color: '#fff',
        borderBottom: '1px solid #3c3c3c'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>🚀 VibeAI Builder Pro</span>
          <span style={{ opacity: 0.8 }}>{/* projectId */}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>🔧</button>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>⚙️</button>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.3)' }}></div>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>−</button>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>□</button>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
        </div>
      </div>

      {/* Menu Bar */}
      <div style={{
        height: '30px',
        background: '#2d2d30',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        borderBottom: '1px solid #3c3c3c',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(menu => (
            <span key={menu} style={{ 
              padding: '4px 8px', 
              cursor: 'pointer',
              borderRadius: '3px'
            }} onMouseOver={e => e.target.style.background = '#3c3c3c'} onMouseOut={e => e.target.style.background = 'transparent'}>
              {menu}
            </span>
          ))}
        </div>
      </div>

      {/* Activity Bar */}
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{
          width: '48px',
          background: '#333333',
          borderRight: '1px solid #3c3c3c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '10px',
          gap: '15px'
        }}>
          {[
            { icon: '📁', tooltip: 'Explorer', active: true },
            { icon: '🔍', tooltip: 'Search' },
            { icon: '🔀', tooltip: 'Source Control' },
            { icon: '🐛', tooltip: 'Run and Debug' },
            { icon: '📦', tooltip: 'Extensions' },
            { icon: '🤖', tooltip: 'AI Assistant' }
          ].map((item, i) => (
            <button key={i} style={{
              width: '32px',
              height: '32px',
              background: item.active ? '#007acc' : 'transparent',
              border: 'none',
              color: '#d4d4d4',
              fontSize: '16px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.icon}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          
          {/* Primary Sidebar */}
          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{
              width: '300px',
              background: '#252526',
              borderRight: '1px solid #3c3c3c',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Explorer Header */}
              <div style={{
                height: '35px',
                background: '#2d2d30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#cccccc'
              }}>
                <span>📁 EXPLORER</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#cccccc', cursor: 'pointer' }}>⋯</button>
                  <button style={{ background: 'none', border: 'none', color: '#cccccc', cursor: 'pointer' }}>📁</button>
                  <button style={{ background: 'none', border: 'none', color: '#cccccc', cursor: 'pointer' }}>🔄</button>
                </div>
              </div>

              {/* File Tree */}
              <div style={{ flex: 1, overflow: 'auto', fontSize: '13px' }}>
                {/* Project Root */}
                <div style={{ padding: '8px 12px', background: '#37373d', fontWeight: 'bold' }}>
                  📂 erstelle-ein-tracker-app-mit-allen-funktionen-und
                </div>
                
                {/* Files */}
                <div style={{ paddingLeft: '20px' }}>
                  {[
                    { name: 'README.md', icon: '📄', modified: true },
                    { name: 'app.py', icon: '🐍', added: true },
                    { name: 'package.json', icon: '📦', untracked: true },
                    { name: 'docker-compose.yml', icon: '🐳', modified: true },
                    { name: 'index.html', icon: '🌐', modified: true },
                    { name: '.env', icon: '⚙️', gitignored: true },
                    { name: 'Dockerfile', icon: '🐳' },
                    { name: 'requirements.txt', icon: '📋' }
                  ].map((file, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      background: i === 0 ? '#37373d' : 'transparent',
                      gap: '6px'
                    }}
                    onMouseOver={e => e.target.style.background = '#37373d'}
                    onMouseOut={e => e.target.style.background = i === 0 ? '#37373d' : 'transparent'}>
                      <span>{file.icon}</span>
                      <span style={{ 
                        color: file.modified ? '#f9c23c' : file.added ? '#4ec9b0' : file.untracked ? '#4ec9b0' : '#d4d4d4'
                      }}>
                        {file.name}
                      </span>
                      {file.modified && <span style={{ color: '#f9c23c', fontSize: '10px' }}>M</span>}
                      {file.added && <span style={{ color: '#4ec9b0', fontSize: '10px' }}>A</span>}
                      {file.untracked && <span style={{ color: '#4ec9b0', fontSize: '10px' }}>U</span>}
                    </div>
                  ))}
                </div>

                {/* Git Section */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ 
                    padding: '8px 12px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: '#cccccc',
                    background: '#2d2d30',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>🔀 SOURCE CONTROL</span>
                    <span style={{ background: '#007acc', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '9px' }}>4</span>
                  </div>
                  
                  <div style={{ paddingLeft: '12px', fontSize: '12px' }}>
                    <div style={{ padding: '4px 0', color: '#4ec9b0' }}>📂 Changes (4)</div>
                    <div style={{ paddingLeft: '12px' }}>
                      <div style={{ padding: '2px 0', color: '#f9c23c' }}>M README.md</div>
                      <div style={{ padding: '2px 0', color: '#4ec9b0' }}>A app.py</div>
                      <div style={{ padding: '2px 0', color: '#4ec9b0' }}>U package.json</div>
                      <div style={{ padding: '2px 0', color: '#f9c23c' }}>M docker-compose.yml</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Tab Bar */}
              <div style={{
                height: '35px',
                background: '#2d2d30',
                display: 'flex',
                borderBottom: '1px solid #3c3c3c'
              }}>
                {[
                  { name: 'README.md', icon: '📄', active: true, modified: true },
                  { name: 'app.py', icon: '🐍', modified: false }
                ].map((tab, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    background: tab.active ? '#1e1e1e' : 'transparent',
                    borderRight: '1px solid #3c3c3c',
                    fontSize: '12px',
                    gap: '6px',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}>
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                    {tab.modified && <span style={{ color: '#f9c23c' }}>●</span>}
                    <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginLeft: 'auto' }}>×</button>
                  </div>
                ))}
              </div>

              {/* Editor Content */}
              <div style={{
                flex: 1,
                background: '#1e1e1e',
                fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '21px',
                padding: '20px',
                overflow: 'auto'
              }}>
                {/* Line Numbers */}
                <div style={{ display: 'flex' }}>
                  <div style={{ 
                    width: '40px', 
                    color: '#858585', 
                    textAlign: 'right', 
                    paddingRight: '15px',
                    userSelect: 'none'
                  }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(num => (
                      <div key={num} style={{ height: '21px' }}>{num}</div>
                    ))}
                  </div>
                  
                  {/* Code Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#569cd6', height: '21px' }}># 🚀 erstelle-ein-tracker-app-mit-allen-funktionen-und</div>
                    <div style={{ height: '21px' }}></div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>## AI-Powered Development Environment</div>
                    <div style={{ height: '21px' }}></div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>Dieses Projekt wurde mit **VibeAI Builder** erstellt - dem ultimativen AI-gestützten</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>Entwicklungstool.</div>
                    <div style={{ height: '21px' }}></div>
                    <div style={{ color: '#569cd6', height: '21px' }}>### 🔥 Features</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>- **Vollautomatische Code-Generierung** durch AI Agents</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>- **Echtzeit-Kollaboration** mit intelligenten Vorschlägen</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>- **Integrierte DevOps Pipeline** mit Auto-Deployment</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>- **Advanced Git/GitHub Integration**</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>- **Live Preview** mit Hot-Reload</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>- **Terminal Integration** für alle Commands</div>
                    <div style={{ color: '#d4d4d4', height: '21px' }}>- **Multi-Model AI Support** (GPT-4, Claude, Gemini)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - AI Chat & Preview */}
            <div style={{
              width: '450px',
              background: '#252526',
              borderLeft: '1px solid #3c3c3c',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Panel Tabs */}
              <div style={{
                height: '35px',
                background: '#2d2d30',
                display: 'flex',
                borderBottom: '1px solid #3c3c3c'
              }}>
                {[
                  { name: 'AI CHAT', icon: '🤖', active: true },
                  { name: 'PREVIEW', icon: '📱', active: false },
                  { name: 'TERMINAL', icon: '💻', active: false }
                ].map((tab, i) => (
                  <button key={i} style={{
                    flex: 1,
                    background: tab.active ? '#1e1e1e' : 'transparent',
                    border: 'none',
                    color: tab.active ? '#ffffff' : '#cccccc',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '0 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* AI Chat Interface */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <div style={{
                  padding: '12px',
                  background: '#2d2d30',
                  borderBottom: '1px solid #3c3c3c',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <select style={{
                      background: '#37373d',
                      color: '#d4d4d4',
                      border: '1px solid #3c3c3c',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px'
                    }}>
                      <option>🧠 Claude 3.5 Sonnet</option>
                      <option>⚡ GPT-4 Turbo</option>
                      <option>🎭 Claude 3 Opus</option>
                      <option>💎 Gemini Pro</option>
                    </select>
                    
                    <select style={{
                      background: '#37373d',
                      color: '#d4d4d4',
                      border: '1px solid #3c3c3c',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px'
                    }}>
                      <option>🤖 Auto Coder</option>
                      <option>🐙 GitHub Agent</option>
                      <option>🎨 UI Designer</option>
                      <option>⚙️ DevOps Engineer</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      background: '#007acc',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}>
                      AUTO MODE
                    </button>
                    <button style={{
                      background: '#37373d',
                      color: '#d4d4d4',
                      border: '1px solid #3c3c3c',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}>
                      📎 FILES
                    </button>
                    <button style={{
                      background: '#37373d',
                      color: '#d4d4d4',
                      border: '1px solid #3c3c3c',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}>
                      🖼️ IMAGE
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '12px',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {/* Welcome Message */}
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#2d3748',
                    borderRadius: '8px',
                    borderLeft: '3px solid #4ecdc4'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '20px', height: '20px', background: '#4ecdc4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🤖</span>
                      <span style={{ fontWeight: 'bold', color: '#4ecdc4' }}>AI Auto-Coder</span>
                      <span style={{ color: '#888', fontSize: '10px' }}>jetzt</span>
                    </div>
                    <div style={{ color: '#d4d4d4' }}>
                      <strong>🚀 Willkommen im Ultimate VibeAI Builder!</strong><br/><br/>
                      Ich bin dein intelligenter Auto-Coder Agent mit Vollzugriff auf alle Tools:<br/><br/>
                      <strong>💻 Code & Development</strong><br/>
                      • Vollautomatische Code-Generierung<br/>
                      • Intelligente Fehlerkorrektur<br/>
                      • Performance-Optimierung<br/><br/>
                      
                      <strong>🐙 Git & GitHub Integration</strong><br/>
                      • Smart Commits & PR Management<br/>
                      • Branch Operations<br/>
                      • Issue Tracking<br/><br/>
                      
                      <strong>⚡ Quick Actions:</strong><br/>
                      • "Erstelle eine moderne React App"<br/>
                      • "Optimiere alle Performance-Bottlenecks"<br/>
                      • "Deploy die App auf Vercel"<br/><br/>
                      
                      <strong>🎯 Bereit für AI-gestützte Entwicklung?</strong><br/>
                      Beschreibe einfach was du bauen möchtest!
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div style={{
                  padding: '12px',
                  background: '#2d2d30',
                  borderTop: '1px solid #3c3c3c'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    background: '#1e1e1e',
                    borderRadius: '6px',
                    border: '1px solid #3c3c3c',
                    padding: '2px'
                  }}>
                    <input
                      type="text"
                      placeholder="Frage den AI Assistant..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#d4d4d4',
                        padding: '8px 12px',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                    <button style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      📤 SEND
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', fontSize: '10px' }}>
                    <button style={{ background: '#37373d', color: '#d4d4d4', border: 'none', borderRadius: '3px', padding: '3px 6px', cursor: 'pointer' }}>
                      📁 Upload File
                    </button>
                    <button style={{ background: '#37373d', color: '#d4d4d4', border: 'none', borderRadius: '3px', padding: '3px 6px', cursor: 'pointer' }}>
                      📋 Copy Code
                    </button>
                    <button style={{ background: '#37373d', color: '#d4d4d4', border: 'none', borderRadius: '3px', padding: '3px 6px', cursor: 'pointer' }}>
                      💾 Save Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel - Terminal & Output */}
          <div style={{
            height: '250px',
            background: '#1e1e1e',
            borderTop: '1px solid #3c3c3c',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Terminal Tabs */}
            <div style={{
              height: '30px',
              background: '#2d2d30',
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #3c3c3c'
            }}>
              {[
                { name: 'zsh', active: true, icon: '💻' },
                { name: 'Build Output', active: false, icon: '🔧' },
                { name: 'Git Log', active: false, icon: '📜' }
              ].map((tab, i) => (
                <div key={i} style={{
                  padding: '0 12px',
                  fontSize: '11px',
                  background: tab.active ? '#1e1e1e' : 'transparent',
                  color: tab.active ? '#ffffff' : '#cccccc',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRight: '1px solid #3c3c3c'
                }}>
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                  <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginLeft: '8px' }}>×</button>
                </div>
              ))}
              
              <button style={{
                marginLeft: 'auto',
                marginRight: '12px',
                background: '#37373d',
                color: '#d4d4d4',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}>
                + NEW TERMINAL
              </button>
            </div>

            {/* Terminal Content */}
            <div style={{
              flex: 1,
              padding: '12px',
              fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: '1.4',
              overflow: 'auto',
              background: '#1e1e1e'
            }}>
              <div style={{ color: '#4ec9b0' }}>mikegehrke@MacBook-Air vibeai % <span style={{ color: '#d4d4d4' }}>git status</span></div>
              <div style={{ color: '#f9c23c' }}>On branch feature/ai-enhanced</div>
              <div style={{ color: '#d4d4d4' }}>Your branch is ahead of 'origin/main' by 3 commits.</div>
              <div style={{ color: '#d4d4d4' }}>&nbsp;&nbsp;(use "git push" to publish your local commits)</div>
              <div></div>
              <div style={{ color: '#d4d4d4' }}>Changes not staged for commit:</div>
              <div style={{ color: '#888' }}>&nbsp;&nbsp;(use "git add &lt;file&gt;..." to update what will be committed)</div>
              <div style={{ color: '#f9c23c' }}>&nbsp;&nbsp;modified:   README.md</div>
              <div style={{ color: '#f9c23c' }}>&nbsp;&nbsp;modified:   docker-compose.yml</div>
              <div></div>
              <div style={{ color: '#d4d4d4' }}>Untracked files:</div>
              <div style={{ color: '#888' }}>&nbsp;&nbsp;(use "git add &lt;file&gt;..." to include in what will be committed)</div>
              <div style={{ color: '#4ec9b0' }}>&nbsp;&nbsp;app.py</div>
              <div style={{ color: '#4ec9b0' }}>&nbsp;&nbsp;package.json</div>
              <div></div>
              <div style={{ color: '#4ec9b0' }}>mikegehrke@MacBook-Air vibeai % <span style={{ color: '#d4d4d4', animation: 'blink 1s infinite' }}>_</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        height: '22px',
        background: '#007acc',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>🔀 feature/ai-enhanced</span>
          <span>🔄 3↑ 0↓</span>
          <span style={{ color: '#f9c23c' }}>⚠️ 4 changes</span>
          <span>🚀 VibeAI Auto-Mode: ON</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>Ln 5, Col 47</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>Markdown</span>
          <span style={{ background: '#28a745', padding: '2px 6px', borderRadius: '3px' }}>🤖 Claude 3.5</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalBuilder;