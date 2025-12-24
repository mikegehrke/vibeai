'use client';

import { X, ChevronRight, Package, Layers, Zap } from 'lucide-react';
import { useState } from 'react';

export default function AgentModeOverlay({ isOpen, onClose, onSelectAgent, onSelectModel, currentAgent, currentModel, extendedModels = [] }) {
  if (!isOpen) return null;
  
  const [activeSection, setActiveSection] = useState('agents'); // agents, openai, gemini

  const agents = [
    {
      id: 'smart_agent',
      name: 'Smart Agent',
      subtitle: 'Best practices, full-stack apps',
      icon: '🤖',
      mode: 'autonomous',
      description: 'Builds complete apps with architecture and best practices'
    },
    {
      id: 'super_agent',
      name: 'Super Agent',
      subtitle: 'Most powerful, complex projects',
      icon: '⚡',
      mode: 'autonomous',
      description: 'Handles the most complex projects with optimization'
    },
    {
      id: 'vibeai_agent',
      name: 'VibeAI Agent',
      subtitle: 'Real-time streaming, full-stack',
      icon: '✨',
      mode: 'autonomous',
      description: 'Complete project generation with live build streaming'
    },
    {
      id: 'cora',
      name: 'Cora',
      subtitle: 'Code assistant, debugging',
      icon: '💻',
      mode: 'fast',
      description: 'Quick code help, debugging, and refactoring'
    },
    {
      id: 'lumi',
      name: 'Lumi',
      subtitle: 'Creative writing, design ideas',
      icon: '🌟',
      mode: 'fast',
      description: 'Creative content and design suggestions'
    },
    {
      id: 'devra',
      name: 'Devra',
      subtitle: 'Deep reasoning, analysis',
      icon: '🧠',
      mode: 'autonomous',
      description: 'Complex problem solving and deep analysis'
    },
    {
      id: 'aura',
      name: 'Aura',
      subtitle: 'General chat, questions',
      icon: '💬',
      mode: 'fast',
      description: 'Friendly conversation and general help'
    },
    {
      id: 'auto_fix',
      name: 'Auto-Fix Agent',
      subtitle: 'Automatic error detection',
      icon: '🔨',
      mode: 'autonomous',
      description: 'Automatically finds and fixes code errors'
    },
    {
      id: 'team_agent',
      name: 'Team Agent',
      subtitle: 'Multi-agent collaboration',
      icon: '👥',
      mode: 'autonomous',
      description: 'Coordinates multiple agents for complex tasks'
    },
  ];

  const autonomousAgents = agents.filter(a => a.mode === 'autonomous');
  const fastAgents = agents.filter(a => a.mode === 'fast');

  // Modelle nach Provider gruppieren
  const openaiModels = extendedModels.filter(m => m.provider === 'openai');
  const geminiModels = extendedModels.filter(m => m.provider === 'google');
  const claudeModels = extendedModels.filter(m => m.provider === 'anthropic');
  const ollamaModels = extendedModels.filter(m => m.provider === 'ollama');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '95%',
        maxWidth: '1100px',
        height: '85vh',
        background: '#1a1a1a',
        borderRadius: '16px',
        border: '1px solid #333',
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          background: '#0f0f0f',
          borderRight: '1px solid #333',
          padding: '2rem 0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '0 1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#fff',
              margin: 0
            }}>
              ⚡ Power Mode
            </h2>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
            <button
              onClick={() => setActiveSection('agents')}
              style={{
                padding: '1rem',
                background: activeSection === 'agents' ? '#3b82f6' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeSection === 'agents' ? '#fff' : '#999',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            >
              <Package size={20} />
              Agent Mode
            </button>
            
            <button
              onClick={() => setActiveSection('vibe')}
              style={{
                padding: '1rem',
                background: activeSection === 'vibe' ? '#3b82f6' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeSection === 'vibe' ? '#fff' : '#999',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            >
              <Layers size={20} />
              Vibe Pro ({openaiModels.length})
            </button>
            
            <button
              onClick={() => setActiveSection('ultra')}
              style={{
                padding: '1rem',
                background: activeSection === 'ultra' ? '#3b82f6' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeSection === 'ultra' ? '#fff' : '#999',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            >
              <Zap size={20} />
              Vibe Ultra ({geminiModels.length})
            </button>
            
            <button
              onClick={() => setActiveSection('advanced')}
              style={{
                padding: '1rem',
                background: activeSection === 'advanced' ? '#3b82f6' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeSection === 'advanced' ? '#fff' : '#999',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            >
              <Package size={20} />
              Vibe Advanced ({claudeModels.length + ollamaModels.length})
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <X size={24} />
          </button>

        {/* Agent Mode Section */}
        {activeSection === 'agents' && (
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Agent Mode</h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Fast Mode */}
            <div style={{
              background: '#252525',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  background: '#9b8b5e',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>Fast</div>
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>Quick, lightweight changes</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {fastAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onSelectAgent(agent.id);
                      onClose();
                    }}
                    style={{
                      padding: '1rem',
                      background: currentAgent === agent.id ? '#3b82f6' : '#2a2a2a',
                      border: currentAgent === agent.id ? '2px solid #3b82f6' : '1px solid #3a3a3a',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{agent.icon}</div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{agent.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Autonomous Mode */}
            <div style={{
              background: '#252525',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  background: '#3b82f6',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>Autonomous</div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: '#3b82f6',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>Core</span>
                  </div>
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>Full Agent capabilities</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {autonomousAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onSelectAgent(agent.id);
                      onClose();
                    }}
                    style={{
                      padding: '1rem',
                      background: currentAgent === agent.id ? '#3b82f6' : '#2a2a2a',
                      border: currentAgent === agent.id ? '2px solid #3b82f6' : '1px solid #3a3a3a',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{agent.icon}</div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{agent.subtitle}</div>
                  </button>
                ))}
              </div>
              
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#9ca3af'
              }}>
                ℹ️ Autonomous agents can build complete apps, fix errors automatically, and coordinate complex tasks.
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Vibe Pro Models Section (OpenAI) */}
        {activeSection === 'vibe' && (
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Vibe Pro Models</h3>
            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {openaiModels.length} Premium AI models powered by advanced technology
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {openaiModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    if (onSelectModel) onSelectModel(model.id);
                    onClose();
                  }}
                  style={{
                    padding: '1.25rem',
                    background: currentModel === model.id ? '#3b82f6' : '#2a2a2a',
                    border: currentModel === model.id ? '2px solid #3b82f6' : '1px solid #3a3a3a',
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{model.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {model.name.replace('Gpt', 'Vibe').replace('GPT', 'Vibe')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Vibe Ultra Models Section (Gemini) */}
        {activeSection === 'ultra' && (
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Vibe Ultra Models</h3>
            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {geminiModels.length} Ultra-fast multimodal AI models
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {geminiModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    if (onSelectModel) onSelectModel(model.id);
                    onClose();
                  }}
                  style={{
                    padding: '1.25rem',
                    background: currentModel === model.id ? '#10b981' : '#2a2a2a',
                    border: currentModel === model.id ? '2px solid #10b981' : '1px solid #3a3a3a',
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{model.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {model.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Vibe Advanced Models Section (Claude + Ollama) */}
        {activeSection === 'advanced' && (
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Vibe Advanced Models</h3>
            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {claudeModels.length + ollamaModels.length} Advanced reasoning and local models
            </p>
            
            {claudeModels.length > 0 && (
              <>
                <h4 style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  Claude Models ({claudeModels.length})
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {claudeModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        if (onSelectModel) onSelectModel(model.id);
                        onClose();
                      }}
                      style={{
                        padding: '1.25rem',
                        background: currentModel === model.id ? '#8b5cf6' : '#2a2a2a',
                        border: currentModel === model.id ? '2px solid #8b5cf6' : '1px solid #3a3a3a',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{model.icon}</div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                        {model.name}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {ollamaModels.length > 0 && (
              <>
                <h4 style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  VibeAI Go - Local Models ({ollamaModels.length})
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {ollamaModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        if (onSelectModel) onSelectModel(model.id);
                        onClose();
                      }}
                      style={{
                        padding: '1.25rem',
                        background: currentModel === model.id ? '#10b981' : '#2a2a2a',
                        border: currentModel === model.id ? '2px solid #10b981' : '1px solid #3a3a3a',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{model.icon}</div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                        {model.name}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}



