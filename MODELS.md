# VibeAI - Complete Model Registry

## 267+ AI Models Available

VibeAI unterstützt jetzt **267 verschiedene AI-Modelle** von allen großen Anbietern!

### 📊 Model-Verteilung

| Provider | Anzahl | Beschreibung |
|----------|--------|--------------|
| **OpenAI** | 62 | GPT-5.1, GPT-5, GPT-4.1, GPT-4o, O3, O1, Codex |
| **Anthropic** | 25 | Claude 4.5, 4, 3.5, 3, 2 |
| **Google** | 28 | Gemini 3, 2.5, 2.0, 1.5, 1.0 |
| **GitHub** | 26 | GitHub Copilot Models (GPT, Claude, Gemini) |
| **GitHub Azure** | 27 | Phi, Llama, Mistral, Cohere, AI21, NVIDIA |
| **Ollama** | 98 | Llama, Mistral, Code-Models, Qwen, Phi, Gemma |
| **Stability** | 1 | Stable Diffusion XL |

### 🚀 Verwendung

#### Backend API
```bash
# Alle Models auflisten
curl http://127.0.0.1:8005/models/list

# Model-Info abrufen
curl http://127.0.0.1:8005/models/info/gpt-5.1

# Verfügbare Models
curl http://127.0.0.1:8005/models/available
```

#### Frontend
Alle Models sind automatisch im Frontend-Dropdown verfügbar:
- ChatInterface
- ChatInterfaceEnhanced
- ModelComparison
- ModelDashboard

### 📦 OpenAI Models (62)

#### GPT-5.1 Series (6)
- gpt-5.1, gpt-5.1-turbo, gpt-5.1-mini
- gpt-5.1-preview, gpt-5.1-codex, gpt-5.1-codex-mini

#### GPT-5 Series (5)
- gpt-5, gpt-5-turbo, gpt-5-mini
- gpt-5-preview, gpt-5-32k

#### GPT-4.1 Series (5)
- gpt-4.1, gpt-4.1-turbo, gpt-4.1-mini
- gpt-4.1-preview, gpt-4.1-32k

#### GPT-4o Series (9)
- gpt-4o, gpt-4o-mini, chatgpt-4o-latest
- gpt-4o-2024-11-20, gpt-4o-2024-08-06, gpt-4o-2024-05-13
- gpt-4o-mini-2024-07-18, gpt-4o-realtime-preview, gpt-4o-audio-preview

#### GPT-4 Series (8)
- gpt-4, gpt-4-turbo, gpt-4-turbo-preview
- gpt-4-turbo-2024-04-09, gpt-4-0613, gpt-4-0314
- gpt-4-32k, gpt-4-32k-0613

#### GPT-3.5 Series (6)
- gpt-3.5-turbo, gpt-3.5-turbo-0125, gpt-3.5-turbo-1106
- gpt-3.5-turbo-16k, gpt-3.5-turbo-16k-0613, gpt-3.5-turbo-instruct

#### O-Series (9)
- o3, o3-mini, o3-preview, o3-turbo, o3-mini-turbo
- o1, o1-preview, o1-mini, o1-2024-12-17

#### Codex (5)
- codex, codex-turbo, codex-mini
- code-davinci-002, code-cushman-001

#### Multimodal (3)
- dall-e-3, dall-e-2

#### Audio (4)
- whisper-1, whisper-large-v3
- tts-1, tts-1-hd

#### Embeddings (3)
- text-embedding-3-large, text-embedding-3-small
- text-embedding-ada-002

### 🤖 Anthropic Claude (25)

#### Claude 4.5 (7)
- claude-4.5, claude-4.5-opus, claude-4.5-sonnet, claude-4.5-haiku
- claude-opus-4.5, claude-sonnet-4.5, claude-haiku-4.5

#### Claude 4 (6)
- claude-4, claude-4-opus, claude-4-sonnet, claude-4-haiku
- claude-4.0, claude-4.0-opus

#### Claude 3.5 (5)
- claude-3.5, claude-3-5-opus
- claude-3-5-sonnet-20241022, claude-3-5-sonnet-20240620
- claude-3-5-haiku-20241022

#### Claude 3 (4)
- claude-3, claude-3-opus-20240229
- claude-3-sonnet-20240229, claude-3-haiku-20240307

#### Claude 2 (3)
- claude-2.1, claude-2.0, claude-instant-1.2

### 🔷 Google Gemini (28)

#### Gemini 3 (5)
- gemini-3, gemini-3-pro, gemini-3-ultra, gemini-3-flash, gemini-3-nano

#### Gemini 2.5 (3)
- gemini-2.5, gemini-2.5-pro, gemini-2.5-flash

#### Gemini 2.0 (5)
- gemini-2.0, gemini-2.0-pro, gemini-2.0-ultra, gemini-2.0-nano
- gemini-2.0-flash-exp

#### Gemini 1.5 (7)
- gemini-1.5, gemini-1.5-pro, gemini-1.5-pro-latest
- gemini-1.5-flash, gemini-1.5-flash-latest
- gemini-1.5-flash-8b, gemini-1.5-flash-002

#### Gemini 1.0 (5)
- gemini-1.0, gemini-1.0-pro, gemini-1.0-ultra
- gemini-pro, gemini-pro-vision

#### Experimental (2)
- gemini-bananas, gemini-banana-001

#### Embeddings (1)
- text-embedding-004

### 🐙 GitHub Models (26)

#### GPT Series (12)
- github-gpt-4o, github-gpt-4.1, github-gpt-4.1-mini
- github-gpt-4, github-gpt-4-turbo, github-gpt-4-mini
- github-o3, github-o3-mini, github-o1, github-o1-preview
- github-codex, github-codex-turbo

#### Claude Series (10)
- github-claude-4.5, github-claude-4.5-opus, github-claude-4.5-sonnet
- github-claude-4, github-claude-4-opus
- github-claude-3.5, github-claude-3.5-sonnet, github-claude-3.5-haiku
- github-claude-3, github-claude-3-opus

#### Gemini Series (4)
- github-gemini-3, github-gemini-2.5
- github-gemini-2.0-flash, github-gemini-1.5-pro

### 🔧 GitHub Azure Models (27)

#### Phi (7)
- Phi-4, Phi-3.5-mini-instruct, Phi-3.5-MoE-instruct
- Phi-3-mini-4k-instruct, Phi-3-mini-128k-instruct
- Phi-3-small-8k-instruct, Phi-3-medium-4k-instruct

#### Llama (7)
- Meta-Llama-3.1-405B-Instruct, Meta-Llama-3.1-70B-Instruct
- Meta-Llama-3.1-8B-Instruct, Meta-Llama-3-70B-Instruct
- Meta-Llama-3-8B-Instruct
- Llama-3.2-90B-Vision-Instruct, Llama-3.2-11B-Vision-Instruct

#### Mistral (6)
- Mistral-large, Mistral-large-2411, Mistral-large-2407
- Mistral-Nemo, Mistral-small, Mistral-7B-Instruct-v0.3

#### Cohere (3)
- Cohere-command-r, Cohere-command-r-plus, Cohere-command-r-08-2024

#### AI21 (3)
- AI21-Jamba-1.5-Large, AI21-Jamba-1.5-Mini, AI21-Jamba-Instruct

#### NVIDIA (1)
- nvidia/Llama-3.1-Nemotron-70B-Instruct

### 🦙 Ollama Models (98)

#### Llama 3.3 (2)
- llama3.3, llama3.3:70b

#### Llama 3.2 (4)
- llama3.2, llama3.2:1b, llama3.2:3b, llama3.2:11b

#### Llama 3.1 (4)
- llama3.1, llama3.1:8b, llama3.1:70b, llama3.1:405b

#### Llama 3 (3)
- llama3, llama3:8b, llama3:70b

#### Llama 2 (4)
- llama2, llama2:7b, llama2:13b, llama2:70b

#### Mistral (12)
- mistral, mistral:7b, mistral:latest
- mistral-small, mistral-small:24b
- mistral-large, mistral-large:latest
- mixtral, mixtral:8x7b, mixtral:8x22b
- mistral-nemo, mistral-nemo:12b

#### Code Models (18)
- codellama, codellama:7b, codellama:13b, codellama:34b, codellama:70b
- codegemma, codegemma:7b
- deepseek-coder, deepseek-coder:6.7b, deepseek-coder:33b
- deepseek-coder-v2, deepseek-coder-v2:16b
- qwen2.5-coder, qwen2.5-coder:7b, qwen2.5-coder:32b
- starcoder2, starcoder2:7b, starcoder2:15b

#### Qwen (9)
- qwen2.5, qwen2.5:7b, qwen2.5:14b, qwen2.5:32b, qwen2.5:72b
- qwen2, qwen2:7b, qwen, qwen:7b

#### Phi (6)
- phi3, phi3:mini, phi3:medium, phi3:14b, phi3.5, phi3.5:latest

#### Gemma (6)
- gemma2, gemma2:2b, gemma2:9b, gemma2:27b, gemma, gemma:7b

#### Other Models (30)
- neural-chat, neural-chat:7b
- starling-lm, starling-lm:7b
- vicuna, vicuna:7b, vicuna:13b, vicuna:33b
- orca-mini, orca-mini:3b, orca-mini:7b
- orca2, orca2:7b, orca2:13b
- dolphin-mixtral, dolphin-mixtral:8x7b, dolphin-mixtral:8x22b
- dolphin-mistral, dolphin-mistral:7b
- yi, yi:6b, yi:34b
- solar, solar:10.7b
- openchat, openchat:7b
- wizardlm2, wizardlm2:7b
- nous-hermes2, nous-hermes2:latest

### 🎨 Image & Audio Models

#### Image Generation (3)
- dall-e-3, dall-e-2 (OpenAI)
- stable-diffusion-xl (Stability)

#### Audio (4)
- whisper-1, whisper-large-v3 (Speech-to-Text)
- tts-1, tts-1-hd (Text-to-Speech)

#### Embeddings (4)
- text-embedding-3-large, text-embedding-3-small (OpenAI)
- text-embedding-ada-002 (OpenAI)
- text-embedding-004 (Google)

## 🔧 Backend Implementation

Die Model-Registry ist in `/backend/core/model_registry_v2.py` implementiert:

```python
from core.model_registry_v2 import (
    ALL_MODELS,
    get_model_info,
    get_models_by_provider,
    get_models_by_category,
    get_all_model_ids
)
```

## 📱 Frontend Integration

Alle Models sind automatisch im Frontend verfügbar. Die Model-Liste wird dynamisch geladen.

### Verwendung in React:
```jsx
const models = {
  'OpenAI GPT-5.1': ['gpt-5.1', 'gpt-5.1-turbo', ...],
  'Claude 4.5': ['claude-4.5-opus', ...],
  // ... alle 267 Models
}
```

## ✅ Status

- ✅ 267 Models implementiert
- ✅ Backend API endpoints funktionieren
- ✅ Frontend hat alle Models
- ✅ Model-Info verfügbar
- ✅ Provider-Kategorisierung
- ✅ Type-Klassifizierung (chat, code, multimodal, etc.)

## 🚀 Nächste Schritte

1. Model-Testing für alle Provider
2. Automatische Verfügbarkeitsprüfung
3. Performance-Benchmarks
4. Cost-Tracking pro Model
5. Model-Recommendations basierend auf Task

---

**Stand:** 26. November 2025  
**Version:** VibeAI 2.0  
**Total Models:** 267+
