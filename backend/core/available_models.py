"""
Dynamischer Model Discovery Service
Fragt alle AI-Provider ab welche Modelle verfügbar sind
"""
import os
from typing import Dict, List

import anthropic
import openai
from dotenv import load_dotenv
from fastapi import APIRouter

load_dotenv()

router = APIRouter(prefix="/api/models", tags=["models"])


async def get_openai_models() -> List[Dict]:
    """Hole alle verfügbaren OpenAI Modelle vom Account"""
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        models = client.models.list()
        
        available = []
        for model in models.data:
            # Filtere nur Chat-Modelle
            if any(x in model.id for x in ["gpt", "o1", "o3"]):
                available.append({
                    "id": model.id,
                    "name": model.id,
                    "provider": "OpenAI",
                    "type": "chat",
                    "created": model.created,
                    "owned_by": model.owned_by
                })
        
        return sorted(available, key=lambda x: x["created"], reverse=True)
    except Exception as e:
        print(f"OpenAI models error: {e}")
        return []


async def get_anthropic_models() -> List[Dict]:
    """Hole alle verfügbaren Anthropic (Claude) Modelle"""
    try:
        # Anthropic hat keine list() API, nutze bekannte Modelle
        known_models = [
            "claude-3-5-sonnet-20241022",
            "claude-3-5-sonnet-20240620", 
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307",
            "claude-2.1",
            "claude-2.0",
        ]
        
        # Teste welche funktionieren
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        available = []
        
        for model_id in known_models:
            try:
                # Quick test ob Modell existiert
                client.messages.create(
                    model=model_id,
                    max_tokens=1,
                    messages=[{"role": "user", "content": "test"}]
                )
                available.append({
                    "id": model_id,
                    "name": model_id,
                    "provider": "Anthropic",
                    "type": "chat"
                })
            except Exception:
                continue
        
        return available
    except Exception as e:
        print(f"Anthropic models error: {e}")
        return []


async def get_google_models() -> List[Dict]:
    """Hole alle verfügbaren Google Gemini Modelle"""
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        
        models = genai.list_models()
        available = []
        
        for model in models:
            # Nur Gemini Chat-Modelle
            if "generateContent" in model.supported_generation_methods:
                available.append({
                    "id": model.name.replace("models/", ""),
                    "name": model.display_name,
                    "provider": "Google",
                    "type": "chat",
                    "description": model.description
                })
        
        return available
    except Exception as e:
        print(f"Google models error: {e}")
        return []


async def get_github_models() -> List[Dict]:
    """Hole alle verfügbaren GitHub Models (Phi, etc.)"""
    try:
        client = openai.OpenAI(
            api_key=os.getenv("GITHUB_TOKEN"),
            base_url="https://models.inference.ai.azure.com"
        )
        
        models = client.models.list()
        available = []
        
        for model in models.data:
            available.append({
                "id": model.id,
                "name": model.id,
                "provider": "GitHub",
                "type": "chat"
            })
        
        return available
    except Exception as e:
        print(f"GitHub models error: {e}")
        return []


async def get_ollama_models() -> List[Dict]:
    """Hole alle lokal installierten Ollama Modelle"""
    try:
        import httpx
        
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ollama_url}/api/tags")
            
            if response.status_code == 200:
                data = response.json()
                available = []
                
                for model in data.get("models", []):
                    available.append({
                        "id": model["name"],
                        "name": model["name"],
                        "provider": "Ollama",
                        "type": "chat",
                        "size": model.get("size", 0),
                        "modified": model.get("modified_at")
                    })
                
                return available
        
        return []
    except Exception as e:
        print(f"Ollama models error: {e}")
        return []


@router.get("/available")
async def get_available_models():
    """
    Gibt ALLE verfügbaren Modelle von ALLEN Providern zurück
    Fragt dynamisch ab welche Modelle im Account verfügbar sind
    """
    
    # Parallele Abfrage aller Provider
    import asyncio
    
    openai_task = asyncio.create_task(get_openai_models())
    anthropic_task = asyncio.create_task(get_anthropic_models())
    google_task = asyncio.create_task(get_google_models())
    github_task = asyncio.create_task(get_github_models())
    ollama_task = asyncio.create_task(get_ollama_models())
    
    # Warte auf alle
    openai_models = await openai_task
    anthropic_models = await anthropic_task
    google_models = await google_task
    github_models = await github_task
    ollama_models = await ollama_task
    
    # Kombiniere alle
    all_models = {
        "openai": openai_models,
        "anthropic": anthropic_models,
        "google": google_models,
        "github": github_models,
        "ollama": ollama_models
    }
    
    # Statistiken
    total = sum(len(models) for models in all_models.values())
    
    return {
        "total": total,
        "providers": {
            "openai": len(openai_models),
            "anthropic": len(anthropic_models),
            "google": len(google_models),
            "github": len(github_models),
            "ollama": len(ollama_models)
        },
        "models": all_models
    }


@router.get("/providers")
async def get_providers_status():
    """Zeigt Status aller AI-Provider"""
    
    providers = {
        "openai": {
            "name": "OpenAI",
            "api_key": bool(os.getenv("OPENAI_API_KEY")),
            "status": "configured" if os.getenv("OPENAI_API_KEY") else "missing"
        },
        "anthropic": {
            "name": "Anthropic (Claude)",
            "api_key": bool(os.getenv("ANTHROPIC_API_KEY")),
            "status": "configured" if os.getenv("ANTHROPIC_API_KEY") else "missing"
        },
        "google": {
            "name": "Google (Gemini)",
            "api_key": bool(os.getenv("GOOGLE_API_KEY")),
            "status": "configured" if os.getenv("GOOGLE_API_KEY") else "missing"
        },
        "github": {
            "name": "GitHub Models",
            "api_key": bool(os.getenv("GITHUB_TOKEN")),
            "status": "configured" if os.getenv("GITHUB_TOKEN") else "missing"
        },
        "ollama": {
            "name": "Ollama (Local)",
            "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            "status": "local"
        }
    }
    
    return providers
