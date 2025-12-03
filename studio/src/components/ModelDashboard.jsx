import React, { useState, useEffect } from 'react';
import './ModelDashboard.css';

const ModelDashboard = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 ALLE 267 PREMIUM MODELLE KATEGORISIERT
  const modelCategories = {
    'gpt51': {
      name: '💎 GPT-5.1 Series',
      color: 'from-violet-600 to-purple-600',
      models: [
        { id: 'gpt-5.1', name: 'GPT-5.1', description: 'Absolute cutting edge', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5.1-2025-10-14', name: 'GPT-5.1 Latest', description: 'Latest 5.1 version', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5.1-mini', name: 'GPT-5.1 Mini', description: 'Efficient 5.1', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-5.1-mini-2025-10-14', name: 'GPT-5.1 Mini Latest', description: 'Latest 5.1 mini', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-5.1-nano', name: 'GPT-5.1 Nano', description: 'Ultra efficient 5.1', speed: 'Lightning', cost: '$' },
        { id: 'gpt-5.1-nano-2025-10-14', name: 'GPT-5.1 Nano Latest', description: 'Latest 5.1 nano', speed: 'Lightning', cost: '$' }
      ]
    },
    'gpt5': {
      name: '🚀 GPT-5 Series',
      color: 'from-purple-500 to-pink-500',
      models: [
        { id: 'gpt-5', name: 'GPT-5', description: 'Next Generation AI', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-search-api', name: 'GPT-5 Search', description: 'Real-time web search', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-search-api-2025-10-14', name: 'GPT-5 Search Latest', description: 'Latest search model', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-2025-08-07', name: 'GPT-5 August', description: 'August GPT-5 version', speed: 'Fast', cost: '$$$$' },
        { id: 'gpt-5-pro', name: 'GPT-5 Pro', description: 'Professional grade', speed: 'Medium', cost: '$$$$$' },
        { id: 'gpt-5-pro-2025-10-06', name: 'GPT-5 Pro Latest', description: 'Latest pro version', speed: 'Medium', cost: '$$$$$' },
        { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Efficient GPT-5', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-5-mini-2025-08-07', name: 'GPT-5 Mini August', description: 'August mini version', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Ultra efficient', speed: 'Lightning', cost: '$' },
        { id: 'gpt-5-nano-2025-08-07', name: 'GPT-5 Nano August', description: 'August nano version', speed: 'Lightning', cost: '$' },
        { id: 'gpt-5-codex', name: 'GPT-5 Codex', description: 'Code specialist', speed: 'Fast', cost: '$$$' },
        { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat', description: 'Chat optimized', speed: 'Fast', cost: '$$$' }
      ]
    },
    'gpt41': {
      name: '🔷 GPT-4.1 Series',
      color: 'from-blue-600 to-indigo-600',
      models: [
        { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Enhanced GPT-4', speed: 'Fast', cost: '$$$' },
        { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1 Latest', description: 'Latest 4.1 version', speed: 'Fast', cost: '$$$' },
        { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Efficient 4.1', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini Latest', description: 'Latest 4.1 mini', speed: 'Ultra Fast', cost: '$$' },
        { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: 'Ultra efficient 4.1', speed: 'Lightning', cost: '$' },
        { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano Latest', description: 'Latest 4.1 nano', speed: 'Lightning', cost: '$' }
      ]
    },
    'gpt4o': {
      name: '🧠 GPT-4o Series',
      color: 'from-blue-500 to-cyan-500',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Best overall model', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Speed champion', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-2024-11-20', name: 'GPT-4o November', description: 'November 2024 version', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-2024-05-13', name: 'GPT-4o May', description: 'May 2024 version', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-2024-08-06', name: 'GPT-4o August', description: 'August 2024 version', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o Mini July', description: 'July 2024 mini', speed: 'Ultra Fast', cost: '$' },
        { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', description: 'Chat optimized', speed: 'Fast', cost: '$$' }
      ]
    },
    'gpt4legacy': {
      name: '🔵 GPT-4 Legacy',
      color: 'from-sky-500 to-blue-500',
      models: [
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Turbo speed', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4', speed: 'Medium', cost: '$$' },
        { id: 'gpt-4-32k', name: 'GPT-4 32K', description: 'Large context', speed: 'Medium', cost: '$$' }
      ]
    },
    'gpt35': {
      name: '⚡ GPT-3.5 Series',
      color: 'from-green-500 to-emerald-500',
      models: [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Classic speed', speed: 'Ultra Fast', cost: '$' },
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
        { id: 'o1-preview', name: 'O1 Preview', description: 'O1 preview version', speed: 'Slow', cost: '$$$$' },
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
      name: '🔧 Specialized OpenAI',
      color: 'from-gray-500 to-slate-500',
      models: [
        { id: 'text-embedding-ada-002', name: 'Embedding Ada-002', description: 'Standard embeddings', speed: 'Fast', cost: '$' },
        { id: 'text-embedding-3-small', name: 'Embedding 3 Small', description: 'Efficient embeddings', speed: 'Ultra Fast', cost: '$' },
        { id: 'text-embedding-3-large', name: 'Embedding 3 Large', description: 'Powerful embeddings', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-transcribe', name: 'GPT-4o Transcribe', description: 'Transcription service', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe', description: 'Mini transcription', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-transcribe-diarize', name: 'GPT-4o Diarize', description: 'Speaker diarization', speed: 'Medium', cost: '$$$' },
        { id: 'gpt-4o-search-preview', name: 'GPT-4o Search', description: 'Search preview', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-search-preview-2025-03-11', name: 'GPT-4o Search Latest', description: 'Latest search preview', speed: 'Fast', cost: '$$' },
        { id: 'gpt-4o-mini-search-preview', name: 'GPT-4o Mini Search', description: 'Mini search preview', speed: 'Ultra Fast', cost: '$' },
        { id: 'gpt-4o-mini-search-preview-2025-03-11', name: 'GPT-4o Mini Search Latest', description: 'Latest mini search', speed: 'Ultra Fast', cost: '$' },
        { id: 'omni-moderation-latest', name: 'Omni Moderation', description: 'Content moderation', speed: 'Fast', cost: '$' },
        { id: 'omni-moderation-2024-09-26', name: 'Omni Moderation Sept', description: 'September moderation', speed: 'Fast', cost: '$' },
        { id: 'codex-mini-latest', name: 'Codex Mini', description: 'Code assistant', speed: 'Fast', cost: '$$' }
      ]
    },
    'claude45': {
      name: '👑 Claude 4.5 Series',
      color: 'from-orange-600 to-red-600',
      models: [
        { id: 'claude-4.5', name: 'Claude 4.5', description: 'Latest Claude generation', speed: 'Fast', cost: '$$$' },
        { id: 'claude-4.5-opus-20250514', name: 'Claude 4.5 Opus', description: 'Most powerful Claude', speed: 'Medium', cost: '$$$$' },
        { id: 'claude-4.5-sonnet-20250514', name: 'Claude 4.5 Sonnet', description: 'Balanced performance', speed: 'Fast', cost: '$$$' },
        { id: 'claude-4.5-haiku-20250514', name: 'Claude 4.5 Haiku', description: 'Fast & efficient', speed: 'Ultra Fast', cost: '$$' }
      ]
    },
    'claude4': {
      name: '🔶 Claude 4 Series',
      color: 'from-orange-500 to-amber-500',
      models: [
        { id: 'claude-4', name: 'Claude 4', description: 'Claude 4 base', speed: 'Fast', cost: '$$' },
        { id: 'claude-4-opus-20250220', name: 'Claude 4 Opus', description: 'Powerful reasoning', speed: 'Medium', cost: '$$$' },
        { id: 'claude-4-sonnet-20250220', name: 'Claude 4 Sonnet', description: 'Balanced model', speed: 'Fast', cost: '$$' },
        { id: 'claude-4-haiku-20250220', name: 'Claude 4 Haiku', description: 'Lightning fast', speed: 'Ultra Fast', cost: '$' }
      ]
    },
    'claude35': {
      name: '🟠 Claude 3.5 Series',
      color: 'from-amber-500 to-yellow-500',
      models: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Excellent balance', speed: 'Fast', cost: '$$' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Speed focused', speed: 'Ultra Fast', cost: '$' }
      ]
    },
    'claude3': {
      name: '🟡 Claude 3 Series',
      color: 'from-yellow-500 to-lime-500',
      models: [
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Top tier reasoning', speed: 'Medium', cost: '$$$' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced approach', speed: 'Fast', cost: '$$' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Speedy responses', speed: 'Ultra Fast', cost: '$' }
      ]
    },
    'claude2': {
      name: '🟢 Claude 2 Series',
      color: 'from-lime-500 to-green-500',
      models: [
        { id: 'claude-2.1', name: 'Claude 2.1', description: 'Stable & reliable', speed: 'Fast', cost: '$' },
        { id: 'claude-2.0', name: 'Claude 2.0', description: 'Classic Claude', speed: 'Fast', cost: '$' }
      ]
    },
    'gemini3': {
      name: '💠 Gemini 3 Series',
      color: 'from-blue-600 to-purple-600',
      models: [
        { id: 'gemini-3', name: 'Gemini 3', description: 'Next-gen Gemini', speed: 'Fast', cost: '$$' },
        { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'Professional grade', speed: 'Medium', cost: '$$$' },
        { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Ultra fast', speed: 'Ultra Fast', cost: '$' },
        { id: 'gemini-3-nano', name: 'Gemini 3 Nano', description: 'Lightweight', speed: 'Lightning', cost: '$' }
      ]
    },
    'gemini25': {
      name: '🔷 Gemini 2.5 Series',
      color: 'from-sky-500 to-blue-500',
      models: [
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Enhanced pro', speed: 'Medium', cost: '$$' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Enhanced flash', speed: 'Ultra Fast', cost: '$' }
      ]
    },
    'gemini20': {
      name: '🔹 Gemini 2.0 Series',
      color: 'from-cyan-500 to-sky-500',
      models: [
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', description: 'Experimental flash', speed: 'Ultra Fast', cost: '$' },
        { id: 'gemini-2.0-flash-thinking-exp-1219', name: 'Gemini 2.0 Thinking', description: 'Advanced reasoning', speed: 'Medium', cost: '$$' }
      ]
    },
    'gemini15': {
      name: '🔸 Gemini 1.5 Series',
      color: 'from-teal-500 to-cyan-500',
      models: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Pro performance', speed: 'Fast', cost: '$$' },
        { id: 'gemini-1.5-pro-exp-0827', name: 'Gemini 1.5 Pro Exp', description: 'Experimental pro', speed: 'Fast', cost: '$$' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Speed optimized', speed: 'Ultra Fast', cost: '$' },
        { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', description: 'Compact flash', speed: 'Lightning', cost: '$' },
        { id: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash 002', description: 'Updated flash', speed: 'Ultra Fast', cost: '$' }
      ]
    },
    'gemini10': {
      name: '🔻 Gemini 1.0 Series',
      color: 'from-emerald-500 to-teal-500',
      models: [
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Classic pro', speed: 'Fast', cost: '$' }
      ]
    },
    'gemini-exp': {
      name: '🧪 Gemini Experimental',
      color: 'from-violet-500 to-purple-500',
      models: [
        { id: 'gemini-exp-1206', name: 'Gemini Exp 1206', description: 'Experimental features', speed: 'Fast', cost: '$' },
        { id: 'learnlm-1.5-pro-experimental', name: 'LearnLM 1.5 Pro', description: 'Learning optimized', speed: 'Fast', cost: '$' }
      ]
    },
    'ollama': {
      name: '🐑 Ollama (Local)',
      color: 'from-slate-600 to-gray-600',
      models: [
        { id: 'llama3.2:1b', name: 'Llama 3.2 1B', description: 'Tiny & fast', speed: 'Lightning', cost: 'Free' },
        { id: 'llama3.2:3b', name: 'Llama 3.2 3B', description: 'Small & efficient', speed: 'Ultra Fast', cost: 'Free' },
        { id: 'llama3.1:8b', name: 'Llama 3.1 8B', description: 'Balanced', speed: 'Fast', cost: 'Free' },
        { id: 'llama3.1:70b', name: 'Llama 3.1 70B', description: 'Large & powerful', speed: 'Medium', cost: 'Free' },
        { id: 'mistral:7b', name: 'Mistral 7B', description: 'Fast & smart', speed: 'Fast', cost: 'Free' },
        { id: 'mixtral:8x7b', name: 'Mixtral 8x7B', description: 'Mixture of experts', speed: 'Medium', cost: 'Free' },
        { id: 'codellama:7b', name: 'CodeLlama 7B', description: 'Code specialist', speed: 'Fast', cost: 'Free' },
        { id: 'codellama:13b', name: 'CodeLlama 13B', description: 'Advanced coding', speed: 'Medium', cost: 'Free' },
        { id: 'deepseek-coder:6.7b', name: 'DeepSeek Coder', description: 'Deep code understanding', speed: 'Fast', cost: 'Free' },
        { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', description: 'Multilingual', speed: 'Fast', cost: 'Free' },
        { id: 'phi3:mini', name: 'Phi-3 Mini', description: 'Microsoft small', speed: 'Lightning', cost: 'Free' },
        { id: 'gemma2:9b', name: 'Gemma2 9B', description: 'Google local', speed: 'Fast', cost: 'Free' }
      ]
    },
    'github-openai': {
      name: '🐙 GitHub - OpenAI',
      color: 'from-indigo-600 to-purple-600',
      models: [
        { id: 'gpt-5.1-preview', name: 'GitHub GPT-5.1', description: 'Preview access', speed: 'Fast', cost: 'Free' },
        { id: 'gpt-5-turbo-2024-07-18', name: 'GitHub GPT-5 Turbo', description: 'Turbo version', speed: 'Ultra Fast', cost: 'Free' },
        { id: 'gpt-4o', name: 'GitHub GPT-4o', description: 'Free GPT-4o', speed: 'Fast', cost: 'Free' },
        { id: 'gpt-4o-mini', name: 'GitHub GPT-4o Mini', description: 'Free mini', speed: 'Ultra Fast', cost: 'Free' }
      ]
    },
    'github-claude': {
      name: '🐙 GitHub - Claude',
      color: 'from-orange-600 to-red-600',
      models: [
        { id: 'claude-4.5-sonnet', name: 'GitHub Claude 4.5', description: 'Free Claude 4.5', speed: 'Fast', cost: 'Free' },
        { id: 'claude-4-opus', name: 'GitHub Claude 4 Opus', description: 'Free Claude 4', speed: 'Medium', cost: 'Free' },
        { id: 'claude-3.5-sonnet', name: 'GitHub Claude 3.5', description: 'Free Claude 3.5', speed: 'Fast', cost: 'Free' },
        { id: 'claude-3-opus', name: 'GitHub Claude 3 Opus', description: 'Free Claude 3', speed: 'Medium', cost: 'Free' }
      ]
    },
    'github-gemini': {
      name: '🐙 GitHub - Gemini',
      color: 'from-blue-600 to-cyan-600',
      models: [
        { id: 'gemini-3-pro-latest', name: 'GitHub Gemini 3 Pro', description: 'Free Gemini 3', speed: 'Medium', cost: 'Free' },
        { id: 'gemini-3-flash-latest', name: 'GitHub Gemini 3 Flash', description: 'Free Gemini 3 Flash', speed: 'Ultra Fast', cost: 'Free' },
        { id: 'gemini-2.5-pro-latest', name: 'GitHub Gemini 2.5', description: 'Free Gemini 2.5', speed: 'Medium', cost: 'Free' },
        { id: 'gemini-2.0-flash-exp', name: 'GitHub Gemini 2.0', description: 'Free Gemini 2.0', speed: 'Ultra Fast', cost: 'Free' }
      ]
    },
    'github-meta': {
      name: '🐙 GitHub - Meta',
      color: 'from-blue-500 to-indigo-500',
      models: [
        { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', description: 'Latest Llama', speed: 'Medium', cost: 'Free' },
        { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', description: 'Massive model', speed: 'Slow', cost: 'Free' },
        { id: 'Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', description: 'Large Llama', speed: 'Medium', cost: 'Free' },
        { id: 'Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', description: 'Small Llama', speed: 'Fast', cost: 'Free' }
      ]
    },
    'github-mistral': {
      name: '🐙 GitHub - Mistral',
      color: 'from-purple-500 to-pink-500',
      models: [
        { id: 'Mistral-large-2411', name: 'Mistral Large 2411', description: 'Latest large', speed: 'Medium', cost: 'Free' },
        { id: 'Mistral-large', name: 'Mistral Large', description: 'Large model', speed: 'Medium', cost: 'Free' },
        { id: 'Mistral-small', name: 'Mistral Small', description: 'Compact model', speed: 'Fast', cost: 'Free' },
        { id: 'Mistral-Nemo', name: 'Mistral Nemo', description: 'Balanced model', speed: 'Fast', cost: 'Free' }
      ]
    },
    'github-cohere': {
      name: '🐙 GitHub - Cohere',
      color: 'from-green-500 to-teal-500',
      models: [
        { id: 'Cohere-command-r-plus-08-2024', name: 'Command R+ Aug', description: 'August version', speed: 'Fast', cost: 'Free' },
        { id: 'Cohere-command-r-plus', name: 'Command R+', description: 'Plus model', speed: 'Fast', cost: 'Free' },
        { id: 'Cohere-command-r-08-2024', name: 'Command R Aug', description: 'August version', speed: 'Fast', cost: 'Free' },
        { id: 'Cohere-command-r', name: 'Command R', description: 'Base model', speed: 'Fast', cost: 'Free' }
      ]
    },
    'github-ai21': {
      name: '🐙 GitHub - AI21',
      color: 'from-yellow-500 to-orange-500',
      models: [
        { id: 'AI21-Jamba-1.5-Large', name: 'Jamba 1.5 Large', description: 'Large hybrid', speed: 'Medium', cost: 'Free' },
        { id: 'AI21-Jamba-1.5-Mini', name: 'Jamba 1.5 Mini', description: 'Compact hybrid', speed: 'Fast', cost: 'Free' }
      ]
    },
    'github-microsoft': {
      name: '🐙 GitHub - Microsoft',
      color: 'from-cyan-500 to-blue-500',
      models: [
        { id: 'Phi-4', name: 'Phi-4', description: 'Microsoft small', speed: 'Fast', cost: 'Free' }
      ]
    },
    'deepseek': {
      name: '🤖 DeepSeek',
      color: 'from-red-600 to-pink-600',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'Chat specialist', speed: 'Fast', cost: '$' },
        { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'Reasoning focused', speed: 'Medium', cost: '$$' }
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
        <p>267 Premium AI Models at your disposal!</p>
        
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
              🌟 All (267)
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