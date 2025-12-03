import React, { useState, useEffect } from 'react';
import PromptHelper from './PromptHelper';
import './ModelComparison.css';

const ModelComparison = () => {
  const [selectedModels, setSelectedModels] = useState(['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro']);
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState('speed'); // speed, quality, cost

  const availableModels = [
    // ==================== OPENAI - GPT-5 SERIES ====================
    { id: 'gpt-5.1', name: 'GPT-5.1', category: 'openai', speed: 95, quality: 100, cost: 75 },
    { id: 'gpt-5.1-2025-10-14', name: 'GPT-5.1 Latest', category: 'openai', speed: 95, quality: 100, cost: 75 },
    { id: 'gpt-5.1-mini', name: 'GPT-5.1 Mini', category: 'openai', speed: 100, quality: 95, cost: 92 },
    { id: 'gpt-5.1-mini-2025-10-14', name: 'GPT-5.1 Mini Latest', category: 'openai', speed: 100, quality: 95, cost: 92 },
    { id: 'gpt-5.1-nano', name: 'GPT-5.1 Nano', category: 'openai', speed: 100, quality: 90, cost: 98 },
    { id: 'gpt-5.1-nano-2025-10-14', name: 'GPT-5.1 Nano Latest', category: 'openai', speed: 100, quality: 90, cost: 98 },
    { id: 'gpt-5', name: 'GPT-5', category: 'openai', speed: 92, quality: 99, cost: 77 },
    { id: 'gpt-5-search-api', name: 'GPT-5 Search API', category: 'openai', speed: 90, quality: 98, cost: 80 },
    { id: 'gpt-5-search-api-2025-10-14', name: 'GPT-5 Search API Latest', category: 'openai', speed: 90, quality: 98, cost: 80 },
    { id: 'gpt-5-2025-08-07', name: 'GPT-5 August', category: 'openai', speed: 92, quality: 99, cost: 77 },
    { id: 'gpt-5-pro', name: 'GPT-5 Pro', category: 'openai', speed: 85, quality: 100, cost: 70 },
    { id: 'gpt-5-pro-2025-10-06', name: 'GPT-5 Pro Latest', category: 'openai', speed: 85, quality: 100, cost: 70 },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', category: 'openai', speed: 98, quality: 93, cost: 95 },
    { id: 'gpt-5-mini-2025-08-07', name: 'GPT-5 Mini August', category: 'openai', speed: 98, quality: 93, cost: 95 },
    { id: 'gpt-5-nano', name: 'GPT-5 Nano', category: 'openai', speed: 100, quality: 88, cost: 98 },
    { id: 'gpt-5-nano-2025-08-07', name: 'GPT-5 Nano August', category: 'openai', speed: 100, quality: 88, cost: 98 },
    { id: 'gpt-5-codex', name: 'GPT-5 Codex', category: 'openai', speed: 90, quality: 97, cost: 85 },
    { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat Latest', category: 'openai', speed: 92, quality: 98, cost: 82 },
    
    // ==================== OPENAI - GPT-4.1 SERIES ====================
    { id: 'gpt-4.1', name: 'GPT-4.1', category: 'openai', speed: 90, quality: 97, cost: 82 },
    { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1 Latest', category: 'openai', speed: 90, quality: 97, cost: 82 },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', category: 'openai', speed: 98, quality: 92, cost: 93 },
    { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini Latest', category: 'openai', speed: 98, quality: 92, cost: 93 },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', category: 'openai', speed: 100, quality: 87, cost: 97 },
    { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano Latest', category: 'openai', speed: 100, quality: 87, cost: 97 },
    
    // ==================== OPENAI - GPT-4O SERIES ====================
    { id: 'gpt-4o', name: 'GPT-4o', category: 'openai', speed: 95, quality: 98, cost: 85 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'openai', speed: 100, quality: 90, cost: 98 },
    { id: 'gpt-4o-2024-11-20', name: 'GPT-4o November', category: 'openai', speed: 95, quality: 98, cost: 85 },
    { id: 'gpt-4o-2024-05-13', name: 'GPT-4o May', category: 'openai', speed: 94, quality: 97, cost: 84 },
    { id: 'gpt-4o-2024-08-06', name: 'GPT-4o August', category: 'openai', speed: 94, quality: 97, cost: 84 },
    { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o Mini July', category: 'openai', speed: 100, quality: 90, cost: 98 },
    { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', category: 'openai', speed: 95, quality: 98, cost: 85 },
    
    // ==================== OPENAI - GPT-4 LEGACY ====================
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'openai', speed: 85, quality: 95, cost: 80 },
    { id: 'gpt-4', name: 'GPT-4', category: 'openai', speed: 75, quality: 95, cost: 70 },
    { id: 'gpt-4-32k', name: 'GPT-4 32K', category: 'openai', speed: 70, quality: 95, cost: 60 },
    
    // ==================== OPENAI - GPT-3.5 SERIES ====================
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', category: 'openai', speed: 100, quality: 82, cost: 98 },
    { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', category: 'openai', speed: 98, quality: 82, cost: 95 },
    { id: 'gpt-3.5-turbo-instruct', name: 'GPT-3.5 Instruct', category: 'openai', speed: 100, quality: 80, cost: 97 },
    
    // ==================== OPENAI - O-SERIES (REASONING) ====================
    { id: 'o1', name: 'O1', category: 'openai', speed: 65, quality: 99, cost: 73 },
    { id: 'o1-2024-12-17', name: 'O1 December', category: 'openai', speed: 65, quality: 99, cost: 73 },
    { id: 'o1-pro', name: 'O1 Pro', category: 'openai', speed: 55, quality: 100, cost: 65 },
    { id: 'o1-pro-2025-03-19', name: 'O1 Pro Latest', category: 'openai', speed: 55, quality: 100, cost: 65 },
    { id: 'o1-mini', name: 'O1 Mini', category: 'openai', speed: 80, quality: 92, cost: 88 },
    { id: 'o1-mini-2024-09-12', name: 'O1 Mini September', category: 'openai', speed: 80, quality: 92, cost: 88 },
    { id: 'o1-preview', name: 'O1 Preview', category: 'openai', speed: 60, quality: 100, cost: 70 },
    
    // ==================== OPENAI - O3 SERIES ====================
    { id: 'o3', name: 'O3', category: 'openai', speed: 60, quality: 100, cost: 70 },
    { id: 'o3-2025-04-16', name: 'O3 Latest', category: 'openai', speed: 60, quality: 100, cost: 70 },
    { id: 'o3-pro', name: 'O3 Pro', category: 'openai', speed: 50, quality: 100, cost: 60 },
    { id: 'o3-pro-2025-06-10', name: 'O3 Pro Latest', category: 'openai', speed: 50, quality: 100, cost: 60 },
    { id: 'o3-mini', name: 'O3 Mini', category: 'openai', speed: 75, quality: 93, cost: 85 },
    { id: 'o3-mini-2025-01-31', name: 'O3 Mini Latest', category: 'openai', speed: 75, quality: 93, cost: 85 },
    { id: 'o3-deep-research', name: 'O3 Deep Research', category: 'openai', speed: 40, quality: 100, cost: 55 },
    { id: 'o3-deep-research-2025-06-26', name: 'O3 Deep Research Latest', category: 'openai', speed: 40, quality: 100, cost: 55 },
    
    // ==================== OPENAI - O4 SERIES ====================
    { id: 'o4-mini', name: 'O4 Mini', category: 'openai', speed: 78, quality: 94, cost: 87 },
    { id: 'o4-mini-2025-04-16', name: 'O4 Mini Latest', category: 'openai', speed: 78, quality: 94, cost: 87 },
    { id: 'o4-mini-deep-research', name: 'O4 Mini Deep Research', category: 'openai', speed: 45, quality: 98, cost: 60 },
    { id: 'o4-mini-deep-research-2025-06-26', name: 'O4 Mini Deep Research Latest', category: 'openai', speed: 45, quality: 98, cost: 60 },
    
    // ==================== OPENAI - IMAGE GENERATION ====================
    { id: 'dall-e-2', name: 'DALL-E 2', category: 'openai', speed: 70, quality: 85, cost: 80 },
    { id: 'dall-e-3', name: 'DALL-E 3', category: 'openai', speed: 60, quality: 95, cost: 70 },
    { id: 'gpt-image-1', name: 'GPT Image 1', category: 'openai', speed: 75, quality: 88, cost: 85 },
    { id: 'gpt-image-1-mini', name: 'GPT Image 1 Mini', category: 'openai', speed: 90, quality: 82, cost: 93 },
    
    // ==================== OPENAI - VIDEO GENERATION ====================
    { id: 'sora-2', name: 'SORA-2', category: 'openai', speed: 30, quality: 95, cost: 40 },
    { id: 'sora-2-pro', name: 'SORA-2 Pro', category: 'openai', speed: 25, quality: 98, cost: 35 },
    
    // ==================== OPENAI - AUDIO & VOICE ====================
    { id: 'tts-1', name: 'TTS-1', category: 'openai', speed: 95, quality: 85, cost: 90 },
    { id: 'tts-1-hd', name: 'TTS-1 HD', category: 'openai', speed: 85, quality: 95, cost: 80 },
    { id: 'whisper-1', name: 'Whisper-1', category: 'openai', speed: 90, quality: 95, cost: 88 },
    
    // ==================== OPENAI - EMBEDDING MODELS ====================
    { id: 'text-embedding-3-large', name: 'Embedding 3 Large', category: 'openai', speed: 95, quality: 92, cost: 90 },
    { id: 'text-embedding-3-small', name: 'Embedding 3 Small', category: 'openai', speed: 100, quality: 88, cost: 95 },
    { id: 'text-embedding-ada-002', name: 'Embedding Ada 002', category: 'openai', speed: 98, quality: 85, cost: 93 },
    
    // ==================== ANTHROPIC - CLAUDE 4.5 SERIES ====================
    { id: 'claude-4.5', name: 'Claude 4.5', category: 'claude', speed: 88, quality: 100, cost: 80 },
    { id: 'claude-4.5-opus-20250514', name: 'Claude 4.5 Opus', category: 'claude', speed: 70, quality: 100, cost: 68 },
    { id: 'claude-4.5-sonnet-20250514', name: 'Claude 4.5 Sonnet', category: 'claude', speed: 88, quality: 99, cost: 82 },
    { id: 'claude-4.5-haiku-20250514', name: 'Claude 4.5 Haiku', category: 'claude', speed: 98, quality: 93, cost: 95 },
    
    // ==================== ANTHROPIC - CLAUDE 4 SERIES ====================
    { id: 'claude-4', name: 'Claude 4', category: 'claude', speed: 85, quality: 99, cost: 78 },
    { id: 'claude-4-opus-20250220', name: 'Claude 4 Opus', category: 'claude', speed: 68, quality: 99, cost: 70 },
    { id: 'claude-4-sonnet-20250220', name: 'Claude 4 Sonnet', category: 'claude', speed: 85, quality: 98, cost: 83 },
    { id: 'claude-4-haiku-20250220', name: 'Claude 4 Haiku', category: 'claude', speed: 97, quality: 92, cost: 94 },
    
    // ==================== ANTHROPIC - CLAUDE 3.5 SERIES ====================
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', category: 'claude', speed: 90, quality: 98, cost: 87 },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', category: 'claude', speed: 98, quality: 90, cost: 96 },
    
    // ==================== ANTHROPIC - CLAUDE 3 SERIES ====================
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', category: 'claude', speed: 70, quality: 98, cost: 75 },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', category: 'claude', speed: 85, quality: 95, cost: 87 },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', category: 'claude', speed: 98, quality: 88, cost: 96 },
    
    // ==================== ANTHROPIC - CLAUDE 2 SERIES ====================
    { id: 'claude-2.1', name: 'Claude 2.1', category: 'claude', speed: 80, quality: 88, cost: 85 },
    { id: 'claude-2.0', name: 'Claude 2.0', category: 'claude', speed: 75, quality: 85, cost: 83 },
    
    // ==================== GOOGLE - GEMINI 3 SERIES ====================
    { id: 'gemini-3', name: 'Gemini 3', category: 'gemini', speed: 92, quality: 99, cost: 85 },
    { id: 'gemini-3-pro', name: 'Gemini 3 Pro', category: 'gemini', speed: 82, quality: 100, cost: 78 },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', category: 'gemini', speed: 98, quality: 93, cost: 95 },
    { id: 'gemini-3-nano', name: 'Gemini 3 Nano', category: 'gemini', speed: 100, quality: 88, cost: 98 },
    
    // ==================== GOOGLE - GEMINI 2.5 SERIES ====================
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'gemini', speed: 80, quality: 98, cost: 82 },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'gemini', speed: 96, quality: 91, cost: 93 },
    
    // ==================== GOOGLE - GEMINI 2.0 SERIES ====================
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', category: 'gemini', speed: 100, quality: 92, cost: 100 },
    { id: 'gemini-2.0-flash-thinking-exp-1219', name: 'Gemini 2.0 Flash Thinking', category: 'gemini', speed: 85, quality: 95, cost: 88 },
    
    // ==================== GOOGLE - GEMINI 1.5 SERIES ====================
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'gemini', speed: 85, quality: 95, cost: 90 },
    { id: 'gemini-1.5-pro-exp-0827', name: 'Gemini 1.5 Pro Exp', category: 'gemini', speed: 83, quality: 94, cost: 88 },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'gemini', speed: 98, quality: 88, cost: 98 },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', category: 'gemini', speed: 100, quality: 85, cost: 99 },
    { id: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash 002', category: 'gemini', speed: 97, quality: 87, cost: 97 },
    
    // ==================== GOOGLE - GEMINI 1.0 SERIES ====================
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', category: 'gemini', speed: 82, quality: 90, cost: 92 },
    
    // ==================== GOOGLE - GEMINI EXPERIMENTAL ====================
    { id: 'gemini-exp-1206', name: 'Gemini Exp 1206', category: 'gemini', speed: 88, quality: 93, cost: 90 },
    { id: 'learnlm-1.5-pro-experimental', name: 'LearnLM 1.5 Pro Exp', category: 'gemini', speed: 85, quality: 91, cost: 88 },
    
    // ==================== OLLAMA - LLAMA SERIES ====================
    { id: 'llama3.2:1b', name: 'Llama 3.2 1B', category: 'ollama', speed: 100, quality: 75, cost: 100 },
    { id: 'llama3.2:3b', name: 'Llama 3.2 3B', category: 'ollama', speed: 100, quality: 80, cost: 100 },
    { id: 'llama3.1:8b', name: 'Llama 3.1 8B', category: 'ollama', speed: 98, quality: 85, cost: 100 },
    { id: 'llama3.1:70b', name: 'Llama 3.1 70B', category: 'ollama', speed: 75, quality: 92, cost: 100 },
    
    // ==================== OLLAMA - MISTRAL SERIES ====================
    { id: 'mistral:7b', name: 'Mistral 7B', category: 'ollama', speed: 98, quality: 85, cost: 100 },
    { id: 'mixtral:8x7b', name: 'Mixtral 8x7B', category: 'ollama', speed: 85, quality: 90, cost: 100 },
    
    // ==================== OLLAMA - CODE MODELS ====================
    { id: 'codellama:7b', name: 'CodeLlama 7B', category: 'ollama', speed: 98, quality: 88, cost: 100 },
    { id: 'codellama:13b', name: 'CodeLlama 13B', category: 'ollama', speed: 90, quality: 90, cost: 100 },
    { id: 'deepseek-coder:6.7b', name: 'DeepSeek Coder 6.7B', category: 'ollama', speed: 95, quality: 90, cost: 100 },
    
    // ==================== OLLAMA - OTHER MODELS ====================
    { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', category: 'ollama', speed: 95, quality: 85, cost: 100 },
    { id: 'phi3:mini', name: 'Phi-3 Mini', category: 'ollama', speed: 100, quality: 80, cost: 100 },
    { id: 'gemma2:9b', name: 'Gemma2 9B', category: 'ollama', speed: 95, quality: 83, cost: 100 },
    
    // ==================== GITHUB MODELS - OPENAI ====================
    { id: 'gpt-5.1-preview', name: 'GitHub GPT-5.1 Preview', category: 'github', speed: 92, quality: 99, cost: 100 },
    { id: 'gpt-5-turbo-2024-07-18', name: 'GitHub GPT-5 Turbo', category: 'github', speed: 95, quality: 97, cost: 100 },
    { id: 'gpt-4o-mini', name: 'GitHub GPT-4o Mini', category: 'github', speed: 100, quality: 90, cost: 100 },
    { id: 'gpt-4o', name: 'GitHub GPT-4o', category: 'github', speed: 95, quality: 98, cost: 100 },
    
    // ==================== GITHUB MODELS - ANTHROPIC ====================
    { id: 'claude-4.5-sonnet', name: 'GitHub Claude 4.5 Sonnet', category: 'github', speed: 88, quality: 99, cost: 100 },
    { id: 'claude-4-opus', name: 'GitHub Claude 4 Opus', category: 'github', speed: 68, quality: 99, cost: 100 },
    { id: 'claude-3.5-sonnet', name: 'GitHub Claude 3.5 Sonnet', category: 'github', speed: 90, quality: 98, cost: 100 },
    { id: 'claude-3-opus', name: 'GitHub Claude 3 Opus', category: 'github', speed: 70, quality: 98, cost: 100 },
    
    // ==================== GITHUB MODELS - GOOGLE ====================
    { id: 'gemini-3-pro-latest', name: 'GitHub Gemini 3 Pro', category: 'github', speed: 82, quality: 100, cost: 100 },
    { id: 'gemini-3-flash-latest', name: 'GitHub Gemini 3 Flash', category: 'github', speed: 98, quality: 93, cost: 100 },
    { id: 'gemini-2.5-pro-latest', name: 'GitHub Gemini 2.5 Pro', category: 'github', speed: 80, quality: 98, cost: 100 },
    { id: 'gemini-2.0-flash-exp', name: 'GitHub Gemini 2.0 Flash', category: 'github', speed: 100, quality: 92, cost: 100 },
    
    // ==================== GITHUB MODELS - MICROSOFT ====================
    { id: 'Phi-4', name: 'Phi-4', category: 'github', speed: 95, quality: 88, cost: 100 },
    
    // ==================== GITHUB MODELS - META ====================
    { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', category: 'github', speed: 78, quality: 94, cost: 100 },
    { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', category: 'github', speed: 60, quality: 95, cost: 100 },
    { id: 'Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', category: 'github', speed: 75, quality: 92, cost: 100 },
    { id: 'Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', category: 'github', speed: 95, quality: 85, cost: 100 },
    
    // ==================== GITHUB MODELS - MISTRAL ====================
    { id: 'Mistral-large-2411', name: 'Mistral Large', category: 'github', speed: 80, quality: 93, cost: 100 },
    { id: 'Mistral-large', name: 'Mistral Large Latest', category: 'github', speed: 80, quality: 93, cost: 100 },
    { id: 'Mistral-small', name: 'Mistral Small', category: 'github', speed: 90, quality: 85, cost: 100 },
    { id: 'Mistral-Nemo', name: 'Mistral Nemo', category: 'github', speed: 93, quality: 87, cost: 100 },
    
    // ==================== GITHUB MODELS - COHERE ====================
    { id: 'Cohere-command-r-plus-08-2024', name: 'Command R+ August', category: 'github', speed: 85, quality: 91, cost: 100 },
    { id: 'Cohere-command-r-plus', name: 'Command R+', category: 'github', speed: 85, quality: 90, cost: 100 },
    { id: 'Cohere-command-r-08-2024', name: 'Command R August', category: 'github', speed: 90, quality: 88, cost: 100 },
    { id: 'Cohere-command-r', name: 'Command R', category: 'github', speed: 90, quality: 87, cost: 100 },
    
    // ==================== GITHUB MODELS - AI21 ====================
    { id: 'AI21-Jamba-1.5-Large', name: 'Jamba 1.5 Large', category: 'github', speed: 88, quality: 88, cost: 100 },
    { id: 'AI21-Jamba-1.5-Mini', name: 'Jamba 1.5 Mini', category: 'github', speed: 95, quality: 83, cost: 100 },
    
    // ==================== DEEPSEEK ====================
    { id: 'deepseek-chat', name: 'DeepSeek Chat', category: 'deepseek', speed: 88, quality: 90, cost: 95 },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', category: 'deepseek', speed: 70, quality: 95, cost: 88 }
  ];

  const comparisonPrompts = [
    {
      name: "⚡ Speed Test",
      prompt: "List 5 benefits of renewable energy. Be concise.",
      focus: "Response speed and efficiency"
    },
    {
      name: "🧮 Complex Reasoning",
      prompt: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? Show your reasoning step by step.",
      focus: "Logical reasoning ability"
    },
    {
      name: "💻 Code Challenge",
      prompt: "Write a Python function that finds the longest palindromic substring in a given string. Include comments and handle edge cases.",
      focus: "Code quality and completeness"
    },
    {
      name: "🎨 Creative Writing",
      prompt: "Write a short story about a time traveler who accidentally changes history. Keep it under 200 words but make it engaging.",
      focus: "Creativity and storytelling"
    },
    {
      name: "📊 Data Analysis",
      prompt: "Compare the environmental impact of electric cars vs gasoline cars. Consider manufacturing, usage, and disposal phases.",
      focus: "Analytical depth and accuracy"
    }
  ];

  const compareModels = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt!');
      return;
    }

    if (selectedModels.length < 2) {
      alert('Please select at least 2 models to compare!');
      return;
    }

    setIsLoading(true);
    const newResults = {};

    // Test all selected models simultaneously
    const promises = selectedModels.map(async (modelId) => {
      const startTime = Date.now();
      try {
        const response = await fetch('http://127.0.0.1:8005/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelId,
            prompt: prompt
          })
        });

        const data = await response.json();
        const endTime = Date.now();

        return {
          modelId,
          success: true,
          response: data.response,
          responseTime: endTime - startTime,
          tokens: data.tokens || 0,
          cost: data.cost || 0
        };
      } catch (error) {
        return {
          modelId,
          success: false,
          error: error.message,
          responseTime: 0,
          tokens: 0,
          cost: 0
        };
      }
    });

    const results = await Promise.all(promises);
    
    results.forEach(result => {
      newResults[result.modelId] = result;
    });

    setResults(newResults);
    setIsLoading(false);
  };

  const toggleModel = (modelId) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const getModelInfo = (modelId) => {
    return availableModels.find(m => m.id === modelId);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#00ff88';
    if (score >= 70) return '#ffa500';
    if (score >= 50) return '#ff6b6b';
    return '#8b5a3c';
  };

  const getBestModel = (metric) => {
    if (!Object.keys(results).length) return null;
    
    let bestModel = null;
    let bestValue = -1;

    Object.entries(results).forEach(([modelId, result]) => {
      if (!result.success) return;
      
      let value = 0;
      switch (metric) {
        case 'speed':
          value = result.responseTime > 0 ? 10000 / result.responseTime : 0;
          break;
        case 'efficiency':
          value = result.tokens > 0 ? result.tokens / result.responseTime : 0;
          break;
        case 'cost':
          value = result.cost > 0 ? 1 / result.cost : 100;
          break;
        default:
          return;
      }
      
      if (value > bestValue) {
        bestValue = value;
        bestModel = modelId;
      }
    });

    return bestModel;
  };

  return (
    <div className="model-comparison">
      <div className="comparison-header">
        <h2>⚔️ Model Battle Arena</h2>
        <p>Compare multiple AI models side by side</p>
      </div>

      <div className="comparison-content">
        {/* Model Selection */}
        <div className="model-selection">
          <h3>🎯 Select Models to Compare (Max 4)</h3>
          <div className="model-grid">
            {availableModels.map(model => (
              <div 
                key={model.id}
                className={`model-card ${selectedModels.includes(model.id) ? 'selected' : ''}`}
                onClick={() => toggleModel(model.id)}
              >
                <div className="model-info">
                  <h4>{model.name}</h4>
                  <div className="model-stats">
                    <div className="stat">
                      <span>Speed</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ 
                            width: `${model.speed}%`,
                            backgroundColor: getScoreColor(model.speed)
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="stat">
                      <span>Quality</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ 
                            width: `${model.quality}%`,
                            backgroundColor: getScoreColor(model.quality)
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="stat">
                      <span>Cost Efficiency</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ 
                            width: `${model.cost}%`,
                            backgroundColor: getScoreColor(model.cost)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedModels.includes(model.id) && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="quick-prompts">
          <h3>⚡ Comparison Prompts</h3>
          <div className="prompt-buttons">
            {comparisonPrompts.map((p, index) => (
              <button
                key={index}
                className="prompt-button"
                onClick={() => setPrompt(p.prompt)}
              >
                <span className="prompt-name">{p.name}</span>
                <span className="prompt-focus">{p.focus}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="prompt-section">
          <h3>💬 Test Prompt</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt to test across all selected models..."
            className="prompt-input"
            rows={4}
          />
          
          <div className="comparison-controls">
            <button 
              className="compare-button"
              onClick={compareModels}
              disabled={isLoading || selectedModels.length < 2 || !prompt.trim()}
            >
              {isLoading ? '🔄 Comparing...' : `⚔️ Battle ${selectedModels.length} Models`}
            </button>
            
            <div className="view-mode">
              <span>View Mode:</span>
              <select value={compareMode} onChange={(e) => setCompareMode(e.target.value)}>
                <option value="speed">⚡ Speed Focus</option>
                <option value="quality">🎯 Quality Focus</option>
                <option value="cost">💰 Cost Focus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="results-section">
            <h3>🏆 Battle Results</h3>
            
            {/* Performance Summary */}
            <div className="performance-summary">
              <div className="winner-card">
                <h4>🏃‍♂️ Speed Champion</h4>
                <span className="winner">{getBestModel('speed') && getModelInfo(getBestModel('speed'))?.name}</span>
              </div>
              <div className="winner-card">
                <h4>💰 Cost Champion</h4>
                <span className="winner">{getBestModel('cost') && getModelInfo(getBestModel('cost'))?.name}</span>
              </div>
              <div className="winner-card">
                <h4>⚡ Efficiency Champion</h4>
                <span className="winner">{getBestModel('efficiency') && getModelInfo(getBestModel('efficiency'))?.name}</span>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="results-grid">
              {selectedModels.map(modelId => {
                const result = results[modelId];
                const modelInfo = getModelInfo(modelId);
                
                if (!result) return null;

                return (
                  <div key={modelId} className="result-card">
                    <div className="result-header">
                      <h4>{modelInfo?.name}</h4>
                      {result.success ? (
                        <div className="metrics">
                          <span>⚡ {result.responseTime}ms</span>
                          <span>💰 ${result.cost?.toFixed(4) || '0.0000'}</span>
                          <span>🔢 {result.tokens} tokens</span>
                        </div>
                      ) : (
                        <span className="error">❌ Failed</span>
                      )}
                    </div>
                    
                    <div className="result-content">
                      {result.success ? (
                        <div className="response">
                          <p>{result.response}</p>
                        </div>
                      ) : (
                        <div className="error-message">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt Helper */}
        <PromptHelper onInsertPrompt={(promptText) => setPrompt(prompt + '\n' + promptText)} />
      </div>
    </div>
  );
};

export default ModelComparison;