/**
 * Realtime Panel - Chat & Voice Call Generator
 */

import React, { useState, useEffect } from 'react';
import './RealtimePanel.css';

const RealtimePanel = () => {
  const [mode, setMode] = useState('chat'); // 'chat' or 'voice'
  const [chatFeatures, setChatFeatures] = useState(['basic_messaging']);
  const [voiceFeatures, setVoiceFeatures] = useState(['audio_call']);
  const [backendFramework, setBackendFramework] = useState('fastapi');
  const [frontendFramework, setFrontendFramework] = useState('react');
  const [protocol, setProtocol] = useState('socket_io');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('backend');
  const [availableFeatures, setAvailableFeatures] = useState({chat: [], voice: []});

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const [chatRes, voiceRes] = await Promise.all([
        fetch('/realtime-gen/chat-features'),
        fetch('/realtime-gen/voice-features')
      ]);
      
      const chatData = await chatRes.json();
      const voiceData = await voiceRes.json();
      
      setAvailableFeatures({
        chat: chatData.features,
        voice: voiceData.features
      });
    } catch (error) {
      console.error('Failed to load features:', error);
    }
  };

  const generateSystem = async () => {
    setLoading(true);
    setGeneratedCode(null);

    try {
      const endpoint = mode === 'chat' ? '/realtime-gen/generate-chat' : '/realtime-gen/generate-voice';
      
      const body = mode === 'chat' ? {
        chat_features: chatFeatures,
        backend_framework: backendFramework,
        frontend_framework: frontendFramework,
        protocol: protocol,
        ai_model: chatFeatures.includes('ai_assistant') ? 'gpt-4' : null,
        translation_enabled: chatFeatures.includes('live_translation')
      } : {
        voice_features: voiceFeatures,
        backend_framework: backendFramework,
        frontend_framework: frontendFramework,
        max_participants: 10,
        tts_provider: voiceFeatures.includes('avatar_voice') ? 'openai' : null,
        stt_provider: voiceFeatures.includes('ai_transcription') ? 'openai' : null
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data);
        setActiveTab('backend');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (feature) => {
    if (mode === 'chat') {
      setChatFeatures(prev =>
        prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
      );
    } else {
      setVoiceFeatures(prev =>
        prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
      );
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied!');
  };

  const features = mode === 'chat' ? availableFeatures.chat : availableFeatures.voice;
  const selectedFeatures = mode === 'chat' ? chatFeatures : voiceFeatures;

  return (
    <div className="realtime-panel">
      <div className="realtime-header">
        <h2>🔴 Realtime Generator</h2>
        <p className="realtime-subtitle">Generate WebSocket Chat & WebRTC Voice Call Systems</p>
      </div>

      <div className="realtime-content">
        <div className="realtime-config">
          <div className="mode-selector">
            <button className={mode === 'chat' ? 'active' : ''} onClick={() => setMode('chat')}>
              💬 Chat System
            </button>
            <button className={mode === 'voice' ? 'active' : ''} onClick={() => setMode('voice')}>
              📞 Voice/Video Calls
            </button>
          </div>

          <div className="config-section">
            <h3>{mode === 'chat' ? '💬 Chat Features' : '📞 Call Features'}</h3>
            <div className="features-grid">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`feature-card ${selectedFeatures.includes(feature.id) ? 'selected' : ''}`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className="feature-name">{feature.name}</div>
                  <div className="feature-desc">{feature.description}</div>
                  {feature.requires && <div className="feature-req">Requires: {feature.requires}</div>}
                </div>
              ))}
            </div>
          </div>

          {mode === 'chat' && (
            <div className="config-section">
              <h3>🔌 Protocol</h3>
              <select value={protocol} onChange={(e) => setProtocol(e.target.value)}>
                <option value="websocket">WebSocket</option>
                <option value="socket_io">Socket.io (Recommended)</option>
                <option value="sse">Server-Sent Events</option>
              </select>
            </div>
          )}

          <div className="config-section">
            <h3>⚙️ Backend Framework</h3>
            <select value={backendFramework} onChange={(e) => setBackendFramework(e.target.value)}>
              <option value="fastapi">FastAPI (Python)</option>
              <option value="express" disabled>Express.js - Coming Soon</option>
              <option value="django" disabled>Django - Coming Soon</option>
            </select>
          </div>

          <div className="config-section">
            <h3>🎨 Frontend Framework</h3>
            <select value={frontendFramework} onChange={(e) => setFrontendFramework(e.target.value)}>
              <option value="react">React</option>
              <option value="flutter" disabled>Flutter - Coming Soon</option>
              <option value="react_native" disabled>React Native - Coming Soon</option>
            </select>
          </div>

          <button className="generate-btn" onClick={generateSystem} disabled={loading}>
            {loading ? '⏳ Generating...' : `🚀 Generate ${mode === 'chat' ? 'Chat' : 'Voice'} System`}
          </button>
        </div>

        {generatedCode && (
          <div className="realtime-output">
            <div className="output-header">
              <h3>📦 Generated Code</h3>
              <button onClick={() => copyCode(
                activeTab === 'backend' ? generatedCode.backend_code :
                activeTab === 'websocket' ? generatedCode.websocket_code || generatedCode.signaling_code :
                activeTab === 'frontend' ? generatedCode.frontend_code :
                activeTab === 'ui' ? (generatedCode.chat_ui_code || generatedCode.voice_ui_code) :
                activeTab === 'database' ? generatedCode.database_schema :
                generatedCode.setup_instructions
              )} className="copy-btn">
                📋 Copy
              </button>
            </div>

            <div className="code-tabs">
              <button className={activeTab === 'backend' ? 'active' : ''} onClick={() => setActiveTab('backend')}>
                🔧 Backend
              </button>
              <button className={activeTab === 'websocket' ? 'active' : ''} onClick={() => setActiveTab('websocket')}>
                {mode === 'chat' ? '🔌 WebSocket' : '📡 Signaling'}
              </button>
              <button className={activeTab === 'frontend' ? 'active' : ''} onClick={() => setActiveTab('frontend')}>
                🎨 Frontend
              </button>
              <button className={activeTab === 'ui' ? 'active' : ''} onClick={() => setActiveTab('ui')}>
                💎 UI Component
              </button>
              <button className={activeTab === 'database' ? 'active' : ''} onClick={() => setActiveTab('database')}>
                🗄️ Database
              </button>
              <button className={activeTab === 'setup' ? 'active' : ''} onClick={() => setActiveTab('setup')}>
                📖 Setup
              </button>
            </div>

            <div className="code-display">
              <pre><code>
                {activeTab === 'backend' && generatedCode.backend_code}
                {activeTab === 'websocket' && (generatedCode.websocket_code || generatedCode.signaling_code)}
                {activeTab === 'frontend' && generatedCode.frontend_code}
                {activeTab === 'ui' && (generatedCode.chat_ui_code || generatedCode.voice_ui_code)}
                {activeTab === 'database' && generatedCode.database_schema}
                {activeTab === 'setup' && generatedCode.setup_instructions}
              </code></pre>
            </div>

            <div className="installation-commands">
              <h4>📦 Installation</h4>
              {generatedCode.installation_commands.map((cmd, i) => (
                <div key={i} className="command-item">
                  <code>{cmd}</code>
                  <button onClick={() => copyCode(cmd)}>📋</button>
                </div>
              ))}
            </div>

            <div className="realtime-info">
              <div className="info-card">
                <h4>✅ Generated Features</h4>
                <ul>
                  {selectedFeatures.map(f => (
                    <li key={f}>✓ {f.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>

              <div className="info-card">
                <h4>🛠️ Technology Stack</h4>
                <ul>
                  <li>Backend: {backendFramework}</li>
                  <li>Frontend: {frontendFramework}</li>
                  {mode === 'chat' && <li>Protocol: {protocol}</li>}
                  {mode === 'voice' && <li>Protocol: WebRTC</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="realtime-examples">
        <h3>💡 Quick Templates</h3>
        <div className="examples-grid">
          {mode === 'chat' ? (
            <>
              <div className="example-card" onClick={() => setChatFeatures(['basic_messaging', 'typing_indicator'])}>
                <div>💬 Basic Chat</div>
                <div>Simple 1-on-1 messaging</div>
              </div>
              <div className="example-card" onClick={() => setChatFeatures(['group_chat', 'file_sharing', 'typing_indicator', 'read_receipts', 'message_reactions'])}>
                <div>👥 Team Chat</div>
                <div>Slack-like collaboration</div>
              </div>
              <div className="example-card" onClick={() => setChatFeatures(['basic_messaging', 'ai_assistant', 'typing_indicator'])}>
                <div>🤖 AI Support</div>
                <div>Customer support bot</div>
              </div>
              <div className="example-card" onClick={() => setChatFeatures(['group_chat', 'live_translation', 'message_reactions'])}>
                <div>🌍 Global Chat</div>
                <div>Multi-language messaging</div>
              </div>
            </>
          ) : (
            <>
              <div className="example-card" onClick={() => setVoiceFeatures(['audio_call'])}>
                <div>📞 Audio Call</div>
                <div>Simple voice calling</div>
              </div>
              <div className="example-card" onClick={() => setVoiceFeatures(['video_call', 'screen_share', 'noise_cancellation'])}>
                <div>🎥 Video Conference</div>
                <div>Team meetings</div>
              </div>
              <div className="example-card" onClick={() => setVoiceFeatures(['video_call', 'recording', 'ai_transcription'])}>
                <div>🎬 Interview Platform</div>
                <div>Video interviews with transcripts</div>
              </div>
              <div className="example-card" onClick={() => setVoiceFeatures(['video_call', 'live_translation', 'ai_transcription', 'recording'])}>
                <div>🌐 Global Meeting</div>
                <div>International calls with translation</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimePanel;
