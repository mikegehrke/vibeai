"""
VibeAI 2.0 - Complete Model Registry
280+ AI Models - All Providers (Nov 2025)
"""

# Complete Model Registry - All available models across all providers
ALL_MODELS = {
    # OpenAI GPT-5.1 (Latest)
    "gpt-5.1": {
        "provider": "openai",
        "category": "gpt-5.1",
        "type": "chat",
        "context": 200000,
    },
    "gpt-5.1-turbo": {
        "provider": "openai",
        "category": "gpt-5.1",
        "type": "chat",
        "context": 200000,
    },
    "gpt-5.1-mini": {
        "provider": "openai",
        "category": "gpt-5.1",
        "type": "chat",
        "context": 128000,
    },
    "gpt-5.1-preview": {
        "provider": "openai",
        "category": "gpt-5.1",
        "type": "chat",
        "context": 200000,
    },
    "gpt-5.1-codex": {
        "provider": "openai",
        "category": "gpt-5.1",
        "type": "code",
        "context": 200000,
    },
    "gpt-5.1-codex-mini": {
        "provider": "openai",
        "category": "gpt-5.1",
        "type": "code",
        "context": 128000,
    },
    # OpenAI GPT-5
    "gpt-5": {
        "provider": "openai",
        "category": "gpt-5",
        "type": "chat",
        "context": 200000,
    },
    "gpt-5-turbo": {
        "provider": "openai",
        "category": "gpt-5",
        "type": "chat",
        "context": 200000,
    },
    "gpt-5-mini": {
        "provider": "openai",
        "category": "gpt-5",
        "type": "chat",
        "context": 128000,
    },
    "gpt-5-preview": {
        "provider": "openai",
        "category": "gpt-5",
        "type": "chat",
        "context": 200000,
    },
    "gpt-5-32k": {
        "provider": "openai",
        "category": "gpt-5",
        "type": "chat",
        "context": 32000,
    },
    # OpenAI GPT-4.1
    "gpt-4.1": {
        "provider": "openai",
        "category": "gpt-4.1",
        "type": "chat",
        "context": 128000,
    },
    "gpt-4.1-turbo": {
        "provider": "openai",
        "category": "gpt-4.1",
        "type": "chat",
        "context": 128000,
    },
    "gpt-4.1-mini": {
        "provider": "openai",
        "category": "gpt-4.1",
        "type": "chat",
        "context": 128000,
    },
    "gpt-4.1-preview": {
        "provider": "openai",
        "category": "gpt-4.1",
        "type": "chat",
        "context": 128000,
    },
    "gpt-4.1-32k": {
        "provider": "openai",
        "category": "gpt-4.1",
        "type": "chat",
        "context": 32000,
    },
    # OpenAI GPT-4o
    "gpt-4o": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "multimodal",
        "context": 128000,
    },
    "gpt-4o-2024-11-20": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "multimodal",
        "context": 128000,
    },
    "gpt-4o-2024-08-06": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "multimodal",
        "context": 128000,
    },
    "gpt-4o-2024-05-13": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "multimodal",
        "context": 128000,
    },
    "gpt-4o-mini": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "multimodal",
        "context": 128000,
    },
    "gpt-4o-mini-2024-07-18": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "multimodal",
        "context": 128000,
    },
    "gpt-4o-realtime-preview": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "realtime",
        "context": 128000,
    },
    "gpt-4o-audio-preview": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "audio",
        "context": 128000,
    },
    "chatgpt-4o-latest": {
        "provider": "openai",
        "category": "gpt-4o",
        "type": "chat",
        "context": 128000,
    },
    # OpenAI GPT-4
    "gpt-4-turbo": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 128000,
    },
    "gpt-4-turbo-preview": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 128000,
    },
    "gpt-4-turbo-2024-04-09": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 128000,
    },
    "gpt-4": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 8192,
    },
    "gpt-4-0613": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 8192,
    },
    "gpt-4-0314": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 8192,
    },
    "gpt-4-32k": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 32768,
    },
    "gpt-4-32k-0613": {
        "provider": "openai",
        "category": "gpt-4",
        "type": "chat",
        "context": 32768,
    },
    # OpenAI GPT-3.5
    "gpt-3.5-turbo": {
        "provider": "openai",
        "category": "gpt-3.5",
        "type": "chat",
        "context": 4096,
    },
    "gpt-3.5-turbo-0125": {
        "provider": "openai",
        "category": "gpt-3.5",
        "type": "chat",
        "context": 16385,
    },
    "gpt-3.5-turbo-1106": {
        "provider": "openai",
        "category": "gpt-3.5",
        "type": "chat",
        "context": 16385,
    },
    "gpt-3.5-turbo-16k": {
        "provider": "openai",
        "category": "gpt-3.5",
        "type": "chat",
        "context": 16385,
    },
    "gpt-3.5-turbo-16k-0613": {
        "provider": "openai",
        "category": "gpt-3.5",
        "type": "chat",
        "context": 16385,
    },
    "gpt-3.5-turbo-instruct": {
        "provider": "openai",
        "category": "gpt-3.5",
        "type": "instruct",
        "context": 4096,
    },
    # OpenAI O3
    "o3": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    "o3-mini": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    "o3-preview": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    "o3-turbo": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    "o3-mini-turbo": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    # OpenAI O1
    "o1": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    "o1-preview": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    "o1-mini": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 128000,
    },
    "o1-2024-12-17": {
        "provider": "openai",
        "category": "o-series",
        "type": "reasoning",
        "context": 200000,
    },
    # OpenAI Codex
    "codex": {
        "provider": "openai",
        "category": "codex",
        "type": "code",
        "context": 8000,
    },
    "codex-turbo": {
        "provider": "openai",
        "category": "codex",
        "type": "code",
        "context": 8000,
    },
    "codex-mini": {
        "provider": "openai",
        "category": "codex",
        "type": "code",
        "context": 8000,
    },
    "code-davinci-002": {
        "provider": "openai",
        "category": "codex",
        "type": "code",
        "context": 8000,
    },
    "code-cushman-001": {
        "provider": "openai",
        "category": "codex",
        "type": "code",
        "context": 2048,
    },
    # Anthropic Claude 4.5
    "claude-4.5": {
        "provider": "anthropic",
        "category": "claude-4.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-4.5-opus": {
        "provider": "anthropic",
        "category": "claude-4.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-4.5-sonnet": {
        "provider": "anthropic",
        "category": "claude-4.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-4.5-haiku": {
        "provider": "anthropic",
        "category": "claude-4.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-opus-4.5": {
        "provider": "anthropic",
        "category": "claude-4.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-sonnet-4.5": {
        "provider": "anthropic",
        "category": "claude-4.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-haiku-4.5": {
        "provider": "anthropic",
        "category": "claude-4.5",
        "type": "chat",
        "context": 200000,
    },
    # Anthropic Claude 4
    "claude-4": {
        "provider": "anthropic",
        "category": "claude-4",
        "type": "chat",
        "context": 200000,
    },
    "claude-4-opus": {
        "provider": "anthropic",
        "category": "claude-4",
        "type": "chat",
        "context": 200000,
    },
    "claude-4-sonnet": {
        "provider": "anthropic",
        "category": "claude-4",
        "type": "chat",
        "context": 200000,
    },
    "claude-4-haiku": {
        "provider": "anthropic",
        "category": "claude-4",
        "type": "chat",
        "context": 200000,
    },
    "claude-4.0": {
        "provider": "anthropic",
        "category": "claude-4",
        "type": "chat",
        "context": 200000,
    },
    "claude-4.0-opus": {
        "provider": "anthropic",
        "category": "claude-4",
        "type": "chat",
        "context": 200000,
    },
    # Anthropic Claude 3.5
    "claude-3.5": {
        "provider": "anthropic",
        "category": "claude-3.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-3-5-sonnet-20241022": {
        "provider": "anthropic",
        "category": "claude-3.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-3-5-sonnet-20240620": {
        "provider": "anthropic",
        "category": "claude-3.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-3-5-haiku-20241022": {
        "provider": "anthropic",
        "category": "claude-3.5",
        "type": "chat",
        "context": 200000,
    },
    "claude-3-5-opus": {
        "provider": "anthropic",
        "category": "claude-3.5",
        "type": "chat",
        "context": 200000,
    },
    # Anthropic Claude 3
    "claude-3": {
        "provider": "anthropic",
        "category": "claude-3",
        "type": "chat",
        "context": 200000,
    },
    "claude-3-opus-20240229": {
        "provider": "anthropic",
        "category": "claude-3",
        "type": "chat",
        "context": 200000,
    },
    "claude-3-sonnet-20240229": {
        "provider": "anthropic",
        "category": "claude-3",
        "type": "chat",
        "context": 200000,
    },
    "claude-3-haiku-20240307": {
        "provider": "anthropic",
        "category": "claude-3",
        "type": "chat",
        "context": 200000,
    },
    # Anthropic Claude 2
    "claude-2.1": {
        "provider": "anthropic",
        "category": "claude-2",
        "type": "chat",
        "context": 100000,
    },
    "claude-2.0": {
        "provider": "anthropic",
        "category": "claude-2",
        "type": "chat",
        "context": 100000,
    },
    "claude-instant-1.2": {
        "provider": "anthropic",
        "category": "claude-2",
        "type": "chat",
        "context": 100000,
    },
    # Google Gemini 3
    "gemini-3": {
        "provider": "google",
        "category": "gemini-3",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-3-pro": {
        "provider": "google",
        "category": "gemini-3",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-3-ultra": {
        "provider": "google",
        "category": "gemini-3",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-3-flash": {
        "provider": "google",
        "category": "gemini-3",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-3-nano": {
        "provider": "google",
        "category": "gemini-3",
        "type": "multimodal",
        "context": 32000,
    },
    # Google Gemini 2.5
    "gemini-2.5": {
        "provider": "google",
        "category": "gemini-2.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-2.5-pro": {
        "provider": "google",
        "category": "gemini-2.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-2.5-flash": {
        "provider": "google",
        "category": "gemini-2.5",
        "type": "multimodal",
        "context": 1000000,
    },
    # Google Gemini 2.0
    "gemini-2.0": {
        "provider": "google",
        "category": "gemini-2.0",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-2.0-flash-exp": {
        "provider": "google",
        "category": "gemini-2.0",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-2.0-pro": {
        "provider": "google",
        "category": "gemini-2.0",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-2.0-ultra": {
        "provider": "google",
        "category": "gemini-2.0",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-2.0-nano": {
        "provider": "google",
        "category": "gemini-2.0",
        "type": "multimodal",
        "context": 32000,
    },
    # Google Gemini 1.5
    "gemini-1.5": {
        "provider": "google",
        "category": "gemini-1.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-1.5-pro": {
        "provider": "google",
        "category": "gemini-1.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-1.5-pro-latest": {
        "provider": "google",
        "category": "gemini-1.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-1.5-flash": {
        "provider": "google",
        "category": "gemini-1.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-1.5-flash-latest": {
        "provider": "google",
        "category": "gemini-1.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-1.5-flash-8b": {
        "provider": "google",
        "category": "gemini-1.5",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-1.5-flash-002": {
        "provider": "google",
        "category": "gemini-1.5",
        "type": "multimodal",
        "context": 1000000,
    },
    # Google Gemini 1.0
    "gemini-1.0": {
        "provider": "google",
        "category": "gemini-1.0",
        "type": "multimodal",
        "context": 32000,
    },
    "gemini-1.0-pro": {
        "provider": "google",
        "category": "gemini-1.0",
        "type": "multimodal",
        "context": 32000,
    },
    "gemini-1.0-ultra": {
        "provider": "google",
        "category": "gemini-1.0",
        "type": "multimodal",
        "context": 32000,
    },
    "gemini-pro": {
        "provider": "google",
        "category": "gemini-1.0",
        "type": "chat",
        "context": 32000,
    },
    "gemini-pro-vision": {
        "provider": "google",
        "category": "gemini-1.0",
        "type": "multimodal",
        "context": 16000,
    },
    # Google Gemini Experimental
    "gemini-bananas": {
        "provider": "google",
        "category": "gemini-experimental",
        "type": "multimodal",
        "context": 1000000,
    },
    "gemini-banana-001": {
        "provider": "google",
        "category": "gemini-experimental",
        "type": "multimodal",
        "context": 1000000,
    },
    # GitHub Models - GPT
    "github-gpt-4o": {
        "provider": "github",
        "category": "github-gpt",
        "type": "multimodal",
        "context": 128000,
    },
    "github-gpt-4.1": {
        "provider": "github",
        "category": "github-gpt",
        "type": "chat",
        "context": 128000,
    },
    "github-gpt-4.1-mini": {
        "provider": "github",
        "category": "github-gpt",
        "type": "chat",
        "context": 128000,
    },
    "github-gpt-4": {
        "provider": "github",
        "category": "github-gpt",
        "type": "chat",
        "context": 8192,
    },
    "github-gpt-4-turbo": {
        "provider": "github",
        "category": "github-gpt",
        "type": "chat",
        "context": 128000,
    },
    "github-gpt-4-mini": {
        "provider": "github",
        "category": "github-gpt",
        "type": "chat",
        "context": 128000,
    },
    "github-o3": {
        "provider": "github",
        "category": "github-gpt",
        "type": "reasoning",
        "context": 128000,
    },
    "github-o3-mini": {
        "provider": "github",
        "category": "github-gpt",
        "type": "reasoning",
        "context": 128000,
    },
    "github-o1": {
        "provider": "github",
        "category": "github-gpt",
        "type": "reasoning",
        "context": 128000,
    },
    "github-o1-preview": {
        "provider": "github",
        "category": "github-gpt",
        "type": "reasoning",
        "context": 128000,
    },
    "github-codex": {
        "provider": "github",
        "category": "github-gpt",
        "type": "code",
        "context": 8000,
    },
    "github-codex-turbo": {
        "provider": "github",
        "category": "github-gpt",
        "type": "code",
        "context": 8000,
    },
    # GitHub Models - Claude
    "github-claude-4.5": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-4.5-opus": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-4.5-sonnet": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-4": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-4-opus": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-3.5": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-3.5-sonnet": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-3.5-haiku": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-3": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    "github-claude-3-opus": {
        "provider": "github",
        "category": "github-claude",
        "type": "chat",
        "context": 200000,
    },
    # GitHub Models - Gemini
    "github-gemini-3": {
        "provider": "github",
        "category": "github-gemini",
        "type": "multimodal",
        "context": 1000000,
    },
    "github-gemini-2.5": {
        "provider": "github",
        "category": "github-gemini",
        "type": "multimodal",
        "context": 1000000,
    },
    "github-gemini-2.0-flash": {
        "provider": "github",
        "category": "github-gemini",
        "type": "multimodal",
        "context": 1000000,
    },
    "github-gemini-1.5-pro": {
        "provider": "github",
        "category": "github-gemini",
        "type": "multimodal",
        "context": 1000000,
    },
    # Ollama - Llama 3.3
    "llama3.3": {
        "provider": "ollama",
        "category": "llama-3.3",
        "type": "chat",
        "context": 128000,
    },
    "llama3.3:70b": {
        "provider": "ollama",
        "category": "llama-3.3",
        "type": "chat",
        "context": 128000,
    },
    # Ollama - Llama 3.2
    "llama3.2": {
        "provider": "ollama",
        "category": "llama-3.2",
        "type": "chat",
        "context": 128000,
    },
    "llama3.2:1b": {
        "provider": "ollama",
        "category": "llama-3.2",
        "type": "chat",
        "context": 128000,
    },
    "llama3.2:3b": {
        "provider": "ollama",
        "category": "llama-3.2",
        "type": "chat",
        "context": 128000,
    },
    "llama3.2:11b": {
        "provider": "ollama",
        "category": "llama-3.2",
        "type": "chat",
        "context": 128000,
    },
    # Ollama - Llama 3.1
    "llama3.1": {
        "provider": "ollama",
        "category": "llama-3.1",
        "type": "chat",
        "context": 128000,
    },
    "llama3.1:8b": {
        "provider": "ollama",
        "category": "llama-3.1",
        "type": "chat",
        "context": 128000,
    },
    "llama3.1:70b": {
        "provider": "ollama",
        "category": "llama-3.1",
        "type": "chat",
        "context": 128000,
    },
    "llama3.1:405b": {
        "provider": "ollama",
        "category": "llama-3.1",
        "type": "chat",
        "context": 128000,
    },
    # Ollama - Llama 3
    "llama3": {
        "provider": "ollama",
        "category": "llama-3",
        "type": "chat",
        "context": 8192,
    },
    "llama3:8b": {
        "provider": "ollama",
        "category": "llama-3",
        "type": "chat",
        "context": 8192,
    },
    "llama3:70b": {
        "provider": "ollama",
        "category": "llama-3",
        "type": "chat",
        "context": 8192,
    },
    # Ollama - Llama 2
    "llama2": {
        "provider": "ollama",
        "category": "llama-2",
        "type": "chat",
        "context": 4096,
    },
    "llama2:7b": {
        "provider": "ollama",
        "category": "llama-2",
        "type": "chat",
        "context": 4096,
    },
    "llama2:13b": {
        "provider": "ollama",
        "category": "llama-2",
        "type": "chat",
        "context": 4096,
    },
    "llama2:70b": {
        "provider": "ollama",
        "category": "llama-2",
        "type": "chat",
        "context": 4096,
    },
    # Ollama - Mistral
    "mistral": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "mistral:7b": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "mistral:latest": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "mistral-small": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "mistral-small:24b": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "mistral-large": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    "mistral-large:latest": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    "mixtral": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "mixtral:8x7b": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "mixtral:8x22b": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 64000,
    },
    "mistral-nemo": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    "mistral-nemo:12b": {
        "provider": "ollama",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    # Ollama - Code Models
    "codellama": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "codellama:7b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "codellama:13b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "codellama:34b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "codellama:70b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 100000,
    },
    "codegemma": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 8192,
    },
    "codegemma:7b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 8192,
    },
    "deepseek-coder": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "deepseek-coder:6.7b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "deepseek-coder:33b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "deepseek-coder-v2": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "deepseek-coder-v2:16b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "qwen2.5-coder": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 32000,
    },
    "qwen2.5-coder:7b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 32000,
    },
    "qwen2.5-coder:32b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 32000,
    },
    "starcoder2": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "starcoder2:7b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    "starcoder2:15b": {
        "provider": "ollama",
        "category": "code",
        "type": "code",
        "context": 16000,
    },
    # Ollama - Qwen
    "qwen2.5": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 32000,
    },
    "qwen2.5:7b": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 32000,
    },
    "qwen2.5:14b": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 32000,
    },
    "qwen2.5:32b": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 32000,
    },
    "qwen2.5:72b": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 32000,
    },
    "qwen2": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 32000,
    },
    "qwen2:7b": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 32000,
    },
    "qwen": {"provider": "ollama", "category": "qwen", "type": "chat", "context": 8192},
    "qwen:7b": {
        "provider": "ollama",
        "category": "qwen",
        "type": "chat",
        "context": 8192,
    },
    # Ollama - Phi
    "phi3": {
        "provider": "ollama",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "phi3:mini": {
        "provider": "ollama",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "phi3:medium": {
        "provider": "ollama",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "phi3:14b": {
        "provider": "ollama",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "phi3.5": {
        "provider": "ollama",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "phi3.5:latest": {
        "provider": "ollama",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    # Ollama - Gemma
    "gemma2": {
        "provider": "ollama",
        "category": "gemma",
        "type": "chat",
        "context": 8192,
    },
    "gemma2:2b": {
        "provider": "ollama",
        "category": "gemma",
        "type": "chat",
        "context": 8192,
    },
    "gemma2:9b": {
        "provider": "ollama",
        "category": "gemma",
        "type": "chat",
        "context": 8192,
    },
    "gemma2:27b": {
        "provider": "ollama",
        "category": "gemma",
        "type": "chat",
        "context": 8192,
    },
    "gemma": {
        "provider": "ollama",
        "category": "gemma",
        "type": "chat",
        "context": 8192,
    },
    "gemma:7b": {
        "provider": "ollama",
        "category": "gemma",
        "type": "chat",
        "context": 8192,
    },
    # Ollama - Other Models
    "neural-chat": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "neural-chat:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "starling-lm": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "starling-lm:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "vicuna": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 2048,
    },
    "vicuna:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 2048,
    },
    "vicuna:13b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 2048,
    },
    "vicuna:33b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 2048,
    },
    "orca-mini": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 2048,
    },
    "orca-mini:3b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 2048,
    },
    "orca-mini:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 2048,
    },
    "orca2": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "orca2:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "orca2:13b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "dolphin-mixtral": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 32000,
    },
    "dolphin-mixtral:8x7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 32000,
    },
    "dolphin-mixtral:8x22b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 64000,
    },
    "dolphin-mistral": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 32000,
    },
    "dolphin-mistral:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 32000,
    },
    "yi": {"provider": "ollama", "category": "other", "type": "chat", "context": 4096},
    "yi:6b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "yi:34b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "solar": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "solar:10.7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "openchat": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "openchat:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "wizardlm2": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "wizardlm2:7b": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 8192,
    },
    "nous-hermes2": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    "nous-hermes2:latest": {
        "provider": "ollama",
        "category": "other",
        "type": "chat",
        "context": 4096,
    },
    # GitHub Azure Models - Phi
    "Phi-4": {
        "provider": "github-azure",
        "category": "phi",
        "type": "chat",
        "context": 16000,
    },
    "Phi-3.5-mini-instruct": {
        "provider": "github-azure",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "Phi-3.5-MoE-instruct": {
        "provider": "github-azure",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "Phi-3-mini-4k-instruct": {
        "provider": "github-azure",
        "category": "phi",
        "type": "chat",
        "context": 4096,
    },
    "Phi-3-mini-128k-instruct": {
        "provider": "github-azure",
        "category": "phi",
        "type": "chat",
        "context": 128000,
    },
    "Phi-3-small-8k-instruct": {
        "provider": "github-azure",
        "category": "phi",
        "type": "chat",
        "context": 8192,
    },
    "Phi-3-medium-4k-instruct": {
        "provider": "github-azure",
        "category": "phi",
        "type": "chat",
        "context": 4096,
    },
    # GitHub Azure Models - Llama
    "Meta-Llama-3.1-405B-Instruct": {
        "provider": "github-azure",
        "category": "llama",
        "type": "chat",
        "context": 128000,
    },
    "Meta-Llama-3.1-70B-Instruct": {
        "provider": "github-azure",
        "category": "llama",
        "type": "chat",
        "context": 128000,
    },
    "Meta-Llama-3.1-8B-Instruct": {
        "provider": "github-azure",
        "category": "llama",
        "type": "chat",
        "context": 128000,
    },
    "Meta-Llama-3-70B-Instruct": {
        "provider": "github-azure",
        "category": "llama",
        "type": "chat",
        "context": 8192,
    },
    "Meta-Llama-3-8B-Instruct": {
        "provider": "github-azure",
        "category": "llama",
        "type": "chat",
        "context": 8192,
    },
    "Llama-3.2-90B-Vision-Instruct": {
        "provider": "github-azure",
        "category": "llama",
        "type": "multimodal",
        "context": 128000,
    },
    "Llama-3.2-11B-Vision-Instruct": {
        "provider": "github-azure",
        "category": "llama",
        "type": "multimodal",
        "context": 128000,
    },
    # GitHub Azure Models - Mistral
    "Mistral-large": {
        "provider": "github-azure",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    "Mistral-large-2411": {
        "provider": "github-azure",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    "Mistral-large-2407": {
        "provider": "github-azure",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    "Mistral-Nemo": {
        "provider": "github-azure",
        "category": "mistral",
        "type": "chat",
        "context": 128000,
    },
    "Mistral-small": {
        "provider": "github-azure",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    "Mistral-7B-Instruct-v0.3": {
        "provider": "github-azure",
        "category": "mistral",
        "type": "chat",
        "context": 32000,
    },
    # GitHub Azure Models - Cohere
    "Cohere-command-r": {
        "provider": "github-azure",
        "category": "cohere",
        "type": "chat",
        "context": 128000,
    },
    "Cohere-command-r-plus": {
        "provider": "github-azure",
        "category": "cohere",
        "type": "chat",
        "context": 128000,
    },
    "Cohere-command-r-08-2024": {
        "provider": "github-azure",
        "category": "cohere",
        "type": "chat",
        "context": 128000,
    },
    # GitHub Azure Models - AI21
    "AI21-Jamba-1.5-Large": {
        "provider": "github-azure",
        "category": "ai21",
        "type": "chat",
        "context": 256000,
    },
    "AI21-Jamba-1.5-Mini": {
        "provider": "github-azure",
        "category": "ai21",
        "type": "chat",
        "context": 256000,
    },
    "AI21-Jamba-Instruct": {
        "provider": "github-azure",
        "category": "ai21",
        "type": "chat",
        "context": 256000,
    },
    # GitHub Azure Models - NVIDIA
    "nvidia/Llama-3.1-Nemotron-70B-Instruct": {
        "provider": "github-azure",
        "category": "nvidia",
        "type": "chat",
        "context": 128000,
    },
    # OpenAI - Image Generation
    "dall-e-3": {
        "provider": "openai",
        "category": "image",
        "type": "image",
        "context": 0,
    },
    "dall-e-2": {
        "provider": "openai",
        "category": "image",
        "type": "image",
        "context": 0,
    },
    "stable-diffusion-xl": {
        "provider": "stability",
        "category": "image",
        "type": "image",
        "context": 0,
    },
    # OpenAI - Audio Models
    "whisper-1": {
        "provider": "openai",
        "category": "audio",
        "type": "speech-to-text",
        "context": 0,
    },
    "whisper-large-v3": {
        "provider": "openai",
        "category": "audio",
        "type": "speech-to-text",
        "context": 0,
    },
    "tts-1": {
        "provider": "openai",
        "category": "audio",
        "type": "text-to-speech",
        "context": 0,
    },
    "tts-1-hd": {
        "provider": "openai",
        "category": "audio",
        "type": "text-to-speech",
        "context": 0,
    },
    # OpenAI - Embeddings
    "text-embedding-3-large": {
        "provider": "openai",
        "category": "embedding",
        "type": "embedding",
        "context": 8191,
    },
    "text-embedding-3-small": {
        "provider": "openai",
        "category": "embedding",
        "type": "embedding",
        "context": 8191,
    },
    "text-embedding-ada-002": {
        "provider": "openai",
        "category": "embedding",
        "type": "embedding",
        "context": 8191,
    },
    "text-embedding-004": {
        "provider": "google",
        "category": "embedding",
        "type": "embedding",
        "context": 2048,
    },
}


def get_model_info(model_id: str) -> dict:
    """Get information about a specific model"""
    return ALL_MODELS.get(
        model_id,
        {"provider": "unknown", "category": "unknown", "type": "chat", "context": 4096},
    )


def get_models_by_provider(provider: str) -> list:
    """Get all models for a specific provider"""
    return [model_id for model_id, info in ALL_MODELS.items() if info["provider"] == provider]


def get_models_by_category(category: str) -> list:
    """Get all models in a specific category"""
    return [model_id for model_id, info in ALL_MODELS.items() if info["category"] == category]


def get_models_by_type(model_type: str) -> list:
    """Get all models of a specific type"""
    return [model_id for model_id, info in ALL_MODELS.items() if info["type"] == model_type]


def get_all_model_ids() -> list:
    """Get all model IDs"""
    return list(ALL_MODELS.keys())


def get_provider_stats() -> dict:
    """Get statistics about providers"""
    providers = {}
    for info in ALL_MODELS.values():
        provider = info["provider"]
        providers[provider] = providers.get(provider, 0) + 1
    return providers


# ✔ ALL_MODELS Dictionary ist RIESIG und vollständig (280+ Modelle)
# ✔ get_model_info, get_models_by_provider, etc. funktionieren
#
# ❗ ABER ES FEHLT:
#     - resolve_model() Funktion (KRITISCH für dein System)
#     - ModelWrapper Klasse
#     - Provider-Client Integration
#     - Keine Verbindung zu provider_clients/
#     - Keine async run() Methode
#     - Kein einheitliches Interface für Agents
#     - Keine Token-Tracking Integration
#     - Keine Billing-Kompatibilität
#
# 👉 Das Dictionary ist perfekt, aber es braucht eine Runtime-Schicht

from core.provider_clients.anthropic_client import AnthropicProvider
from core.provider_clients.local_client import LocalProvider

# -------------------------------------------------------------
# VIBEAI – MODEL REGISTRY V2 RUNTIME (PROVIDER INTEGRATION)
# -------------------------------------------------------------
from core.provider_clients.openai_client import OpenAIProvider


class ModelRegistryV2:
    """
    Runtime-Schicht für Model Registry.
    Verbindet ALL_MODELS mit Provider-Clients.
    """

    def __init__(self):
        # Provider Instanzen
        self.providers = {
            "openai": OpenAIProvider(),
            "anthropic": AnthropicProvider(),
            "google": LocalProvider(),  # Fallback bis Google-Client fertig
            "github": LocalProvider(),  # Fallback bis GitHub-Client fertig
            "github-azure": LocalProvider(),  # Fallback
            "ollama": LocalProvider(),
            "stability": LocalProvider(),
            "unknown": LocalProvider(),
        }

    def resolve_model(self, model_name: str):
        """
        Löst Modellname zu Provider + Wrapper auf.
        """
        model_info = get_model_info(model_name)
        provider_name = model_info.get("provider", "unknown")
        provider = self.providers.get(provider_name, self.providers["unknown"])

        return ModelWrapper(model=model_name, provider=provider, info=model_info)


class ModelWrapper:
    """
    Einheitliche Schnittstelle für alle Modelle.
    Egal ob GPT, Claude, Gemini, Copilot, Ollama.
    """

    def __init__(self, model, provider, info):
        self.model = model
        self.provider = provider
        self.info = info

    async def run(self, messages, context):
        """
        Delegiert an Provider.
        Erwartet einheitliches Format:

        {
            "message": "...",
            "input_tokens": int,
            "output_tokens": int,
            "provider": "openai"
        }
        """
        return await self.provider.generate(model=self.model, messages=messages, context=context)


# -------------------------------------------------------------
# Globale Instanz
# -------------------------------------------------------------
model_registry_v2 = ModelRegistryV2()


def resolve_model(model_name: str):
    """
    Hauptfunktion: Modellname → ModelWrapper

    Beispiel:
    model = resolve_model("gpt-4o")
    result = await model.run(messages=[...], context={})
    """
    return model_registry_v2.resolve_model(model_name)
