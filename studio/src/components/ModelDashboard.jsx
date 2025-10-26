import React, { useState, useEffect } from 'react';
import './ModelDashboard.css';

const ModelDashboard = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 ALLE 88 PREMIUM MODELLE KATEGORISIERT
  const modelCategories = {
    'gpt5': {
      name: '🚀 GPT-5 Series',
      color: 'from-purple-500 to-pink-500',
      models: [
        { id: 'gpt-5', name: 'GPT-5', description: 'Next Generation AI', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-search-api', name: 'GPT-5 Search', description: 'Real-time web search', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-search-api-2025-10-14', name: 'GPT-5 Search Latest', description: 'Latest search model', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-2025-08-07', name: 'GPT-5 Latest', description: 'Latest GPT-5 version', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-pro', name: 'GPT-5 Pro', description: 'Professional grade', speed: 'Medium', cost: '$$$$$' },
        { id: 'gpt-5-pro-2025-10-06', name: 'GPT-5 Pro Latest', description: 'Latest pro version', speed: 'Medium', cost: '$$$$$' },
        { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Efficient GPT-5', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-5-mini-2025-08-07', name: 'GPT-5 Mini Latest', description: 'Latest mini version', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Ultra efficient', speed: 'Lightning', cost: '$' },
        { id: 'gpt-5-nano-2025-08-07', name: 'GPT-5 Nano Latest', description: 'Latest nano version', speed: 'Lightning', cost: '$' },
        { id: 'gpt-5-codex', name: 'GPT-5 Codex', description: 'Code specialist', speed: 'Fast', cost: '$$$' },
        { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat', description: 'Chat optimized', speed: 'Fast', cost: '$$$' }
      ]
    },
    'gpt4': {
      name: '🧠 GPT-4 Series',
      color: 'from-blue-500 to-cyan-500',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Best overall model', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Speed champion', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-2024-11-20', name: 'GPT-4o November', description: 'November 2024 version', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-2024-05-13', name: 'GPT-4o May', description: 'May 2024 version', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-2024-08-06', name: 'GPT-4o August', description: 'August 2024 version', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o Mini July', description: 'July 2024 mini', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Enhanced GPT-4', speed: 'Fast', cost: '$$$' },
        { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1 Latest', description: 'Latest 4.1 version', speed: 'Fast', cost: '$$$' },
        { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Efficient 4.1', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini Latest', description: 'Latest 4.1 mini', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: 'Ultra efficient 4.1', speed: 'Lightning', cost: '$' },
        { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano Latest', description: 'Latest 4.1 nano', speed: 'Lightning', cost: '$' },
        { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', description: 'Chat optimized', speed: 'Fast', cost: '$$' }
      ]
    },
    'gpt35': {
      name: '⚡ GPT-3.5 Series',
      color: 'from-green-500 to-emerald-500',
      models: [
        { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16k', description: 'Large context', speed: 'Fast', cost: '$' },
        { id: 'gpt-3.5-turbo-instruct', name: 'GPT-3.5 Instruct', description: 'Completion model', speed: 'Fast', cost: '$' }
      ]
    },
    'reasoning': {
      name: '🧮 O-Series (Reasoning)',
      color: 'from-indigo-500 to-purple-500',
      models: [
        { id: 'o1', name: 'O1', description: 'Advanced reasoning', speed: 'Slow', cost: '$$$$' },
        { id: 'o1-2024-12-17', name: 'O1 December', description: 'December 2024 reasoning', speed: 'Slow', cost: '$$$$' },
        { id: 'o1-pro', name: 'O1 Pro', description: 'Professional reasoning', speed: 'Very Slow', cost: '$$$$$' },
        { id: 'o1-pro-2025-03-19', name: 'O1 Pro Latest', description: 'Latest pro reasoning', speed: 'Very Slow', cost: '$$$$$' },
        { id: 'o1-mini', name: 'O1 Mini', description: 'Fast reasoning', speed: 'Medium', cost: '$$' },
        { id: 'o1-mini-2024-09-12', name: 'O1 Mini September', description: 'September mini reasoning', speed: 'Medium', cost: '$$' },
        { id: 'o3', name: 'O3', description: 'Next-gen reasoning', speed: 'Slow', cost: '$$$$' },
        { id: 'o3-2025-04-16', name: 'O3 Latest', description: 'Latest O3 reasoning', speed: 'Slow', cost: '$$$$' },
        { id: 'o3-pro', name: 'O3 Pro', description: 'Pro reasoning', speed: 'Very Slow', cost: '$$$$$' },
        { id: 'o3-pro-2025-06-10', name: 'O3 Pro Latest', description: 'Latest O3 pro', speed: 'Very Slow', cost: '$$$$$' },
        { id: 'o3-mini', name: 'O3 Mini', description: 'Efficient reasoning', speed: 'Medium', cost: '$$' },
        { id: 'o3-mini-2025-01-31', name: 'O3 Mini Latest', description: 'Latest O3 mini', speed: 'Medium', cost: '$$' },
        { id: 'o3-deep-research', name: 'O3 Deep Research', description: 'Research specialist', speed: 'Very Slow', cost: '$$$$$' },
        { id: 'o3-deep-research-2025-06-26', name: 'O3 Deep Research Latest', description: 'Latest research model', speed: 'Very Slow', cost: '$$$$$' },
        { id: 'o4-mini', name: 'O4 Mini', description: 'Future reasoning', speed: 'Medium', cost: '$$' },
        { id: 'o4-mini-2025-04-16', name: 'O4 Mini Latest', description: 'Latest O4 mini', speed: 'Medium', cost: '$$' },
        { id: 'o4-mini-deep-research', name: 'O4 Mini Deep Research', description: 'Mini research model', speed: 'Slow', cost: '$$$' },
        { id: 'o4-mini-deep-research-2025-06-26', name: 'O4 Mini Research Latest', description: 'Latest mini research', speed: 'Slow', cost: '$$$' }
      ]
    },
    'images': {
      name: '🎨 Image Generation',
      color: 'from-pink-500 to-rose-500',
      models: [
        { id: 'dall-e-2', name: 'DALL-E 2', description: 'Image generation', speed: 'Medium', cost: '$$' },
        { id: 'dall-e-3', name: 'DALL-E 3', description: 'Premium images', speed: 'Slow', cost: '$$$' },
        { id: 'gpt-image-1', name: 'GPT Image 1', description: 'Image processing', speed: 'Fast', cost: '$$' },
        { id: 'gpt-image-1-mini', name: 'GPT Image 1 Mini', description: 'Efficient image processing', speed: 'Ultra Fast', cost: '$' }
      ]
    },
    'video': {
      name: '🎬 Video Generation',
      color: 'from-red-500 to-orange-500',
      models: [
        { id: 'sora-2', name: 'SORA-2', description: 'Video generation', speed: 'Very Slow', cost: '$$$$$' },
        { id: 'sora-2-pro', name: 'SORA-2 Pro', description: 'Professional video', speed: 'Very Slow', cost: '$$$$$$' }
      ]
    },
    'audio': {
      name: '🎵 Audio & Voice',
      color: 'from-yellow-500 to-orange-500',
      models: [
        { id: 'whisper-1', name: 'Whisper-1', description: 'Audio transcription', speed: 'Fast', cost: '$' },
        { id: 'tts-1', name: 'TTS-1', description: 'Text to speech', speed: 'Fast', cost: '$' },
        { id: 'tts-1-hd', name: 'TTS-1 HD', description: 'HD text to speech', speed: 'Medium', cost: '$$' },
        { id: 'gpt-audio', name: 'GPT Audio', description: 'Audio processing', speed: 'Fast', cost: '$$' },
        { id: 'gpt-audio-2025-08-28', name: 'GPT Audio Latest', description: 'Latest audio model', speed: 'Fast', cost: '$$' },
        { id: 'gpt-audio-mini', name: 'GPT Audio Mini', description: 'Efficient audio', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-audio-mini-2025-10-06', name: 'GPT Audio Mini Latest', description: 'Latest mini audio', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-audio-preview', name: 'GPT-4o Audio Preview', description: 'Multimodal audio', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-audio-preview-2024-12-17', name: 'GPT-4o Audio Dec', description: 'December audio preview', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-audio-preview-2024-10-01', name: 'GPT-4o Audio Oct', description: 'October audio preview', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-audio-preview-2025-06-03', name: 'GPT-4o Audio June', description: 'June audio preview', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini-audio-preview', name: 'GPT-4o Mini Audio', description: 'Mini audio preview', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-mini-audio-preview-2024-12-17', name: 'GPT-4o Mini Audio Dec', description: 'December mini audio', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS', description: 'Mini text to speech', speed: 'Ultra Fast', cost: '$' }
      ]
    },
    'realtime': {
      name: '⚡ Real-time',
      color: 'from-cyan-500 to-blue-500',
      models: [
        { id: 'gpt-realtime', name: 'GPT Realtime', description: 'Real-time chat', speed: 'Ultra Fast', cost: '$$$' },
        { id: 'gpt-realtime-2025-08-28', name: 'GPT Realtime Latest', description: 'Latest realtime', speed: 'Ultra Fast', cost: '$$$' },
        { id: 'gpt-realtime-mini', name: 'GPT Realtime Mini', description: 'Fast realtime', speed: 'Lightning', cost: '$$' },
        { id: 'gpt-realtime-mini-2025-10-06', name: 'GPT Realtime Mini Latest', description: 'Latest mini realtime', speed: 'Lightning', cost: '$$' },
        { id: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime Preview', description: 'Realtime preview', speed: 'Ultra Fast', cost: '$$$' },
        { id: 'gpt-4o-realtime-preview-2024-12-17', name: 'GPT-4o Realtime Dec', description: 'December realtime', speed: 'Ultra Fast', cost: '$$$' },
        { id: 'gpt-4o-realtime-preview-2024-10-01', name: 'GPT-4o Realtime Oct', description: 'October realtime', speed: 'Ultra Fast', cost: '$$$' },
        { id: 'gpt-4o-realtime-preview-2025-06-03', name: 'GPT-4o Realtime June', description: 'June realtime', speed: 'Ultra Fast', cost: '$$$' },
        { id: 'gpt-4o-mini-realtime-preview', name: 'GPT-4o Mini Realtime', description: 'Mini realtime', speed: 'Lightning', cost: '$$' },
        { id: 'gpt-4o-mini-realtime-preview-2024-12-17', name: 'GPT-4o Mini Realtime Dec', description: 'December mini realtime', speed: 'Lightning', cost: '$$' }
      ]
    },
    'specialized': {
      name: '🔧 Specialized',
      color: 'from-gray-500 to-slate-500',
      models: [
        { id: 'text-embedding-ada-002', name: 'Text Embedding Ada-002', description: 'Standard embeddings', speed: 'Fast', cost: '$' },
        { id: 'text-embedding-3-small', name: 'Text Embedding 3 Small', description: 'Efficient embeddings', speed: 'Ultra Fast', cost: '$' },
        { id: 'text-embedding-3-large', name: 'Text Embedding 3 Large', description: 'Powerful embeddings', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-transcribe', name: 'GPT-4o Transcribe', description: 'Transcription service', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe', description: 'Mini transcription', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-transcribe-diarize', name: 'GPT-4o Transcribe Diarize', description: 'Speaker diarization', speed: 'Medium', cost: '$$$' },
        { id: 'gpt-4o-search-preview', name: 'GPT-4o Search Preview', description: 'Search preview', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-search-preview-2025-03-11', name: 'GPT-4o Search Latest', description: 'Latest search preview', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini-search-preview', name: 'GPT-4o Mini Search', description: 'Mini search preview', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-mini-search-preview-2025-03-11', name: 'GPT-4o Mini Search Latest', description: 'Latest mini search', speed: 'Ultra Fast', cost: '$' },
        { id: 'omni-moderation-latest', name: 'Omni Moderation Latest', description: 'Content moderation', speed: 'Fast', cost: '$' },
        { id: 'omni-moderation-2024-09-26', name: 'Omni Moderation Sept', description: 'September moderation', speed: 'Fast', cost: '$' },
        { id: 'codex-mini-latest', name: 'Codex Mini Latest', description: 'Code assistant', speed: 'Fast', cost: '$$' }
      ]
    }
  };

  // Filter models based on search and category
  const getFilteredModels = () => {
    let allModels = [];
    
    if (activeCategory === 'all') {
      Object.values(modelCategories).forEach(category => {
        allModels = [...allModels, ...category.models];
      });
    } else {
      allModels = modelCategories[activeCategory]?.models || [];
    }

    if (searchTerm) {
      allModels = allModels.filter(model => 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allModels;
  };

  // Test a specific model
  const testModel = async (modelId) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8005/api/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: modelId, 
          prompt: "Hello! This is a test message. Please respond briefly." 
        })
      });
      
      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        [modelId]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [modelId]: { error: error.message }
      }));
    }
    setIsLoading(false);
  };

  const ModelCard = ({ model }) => (
    <div className="model-card">
      <div className="model-header">
        <h3 className="model-name">{model.name}</h3>
        <div className="model-badges">
          <span className={`speed-badge speed-${model.speed.toLowerCase().replace(' ', '-')}`}>
            {model.speed}
          </span>
          <span className="cost-badge">{model.cost}</span>
        </div>
      </div>
      
      <p className="model-description">{model.description}</p>
      
      <div className="model-actions">
        <button 
          className="test-btn"
          onClick={() => testModel(model.id)}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Testing...' : '🧪 Test Model'}
        </button>
        
        <button className="details-btn">
          📊 Details
        </button>
      </div>

      {testResults[model.id] && (
        <div className="test-result">
          {testResults[model.id].error ? (
            <div className="error">❌ {testResults[model.id].error}</div>
          ) : (
            <div className="success">
              ✅ Response: {testResults[model.id].response?.substring(0, 100)}...
              <div className="metrics">
                ⚡ {testResults[model.id].responseTime}ms | 
                💰 ${testResults[model.id].cost} | 
                🔢 {testResults[model.id].tokens} tokens
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="model-dashboard">
      <div className="dashboard-header">
        <h1>🚀 VibeAI 2.0 - Ultimate Model Dashboard</h1>
        <p>88 Premium OpenAI Models at your disposal!</p>
        
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-tabs">
            <button 
              className={activeCategory === 'all' ? 'active' : ''}
              onClick={() => setActiveCategory('all')}
            >
              🌟 All (88)
            </button>
            {Object.entries(modelCategories).map(([key, category]) => (
              <button
                key={key}
                className={activeCategory === key ? 'active' : ''}
                onClick={() => setActiveCategory(key)}
              >
                {category.name} ({category.models.length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="models-grid">
        {getFilteredModels().map(model => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>

      {getFilteredModels().length === 0 && (
        <div className="no-results">
          🔍 No models found matching your search criteria
        </div>
      )}
    </div>
  );
};

export default ModelDashboard;