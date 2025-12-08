# backend/model_api.py
# API-Endpoints für Model-Management und -Suche

import os
from typing import List, Optional

from core.model_registry_v2 import ALL_MODELS, get_all_model_ids, get_model_info, get_models_by_provider
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

# Router für Model-Management
model_router = APIRouter(prefix="/models", tags=["models"])


# Pydantic Models für API
class ModelInfo(BaseModel):
    id: str
    name: str
    type: str
    category: str
    max_tokens: Optional[int] = None
    cost_per_token: Optional[float] = None
    available: bool
    description: str


class ModelSearchRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    available_only: bool = True


class ModelTestRequest(BaseModel):
    model_id: str
    test_prompt: str = "Hello, test message"


class ModelTestResponse(BaseModel):
    model_id: str
    available: bool
    response_time: Optional[float] = None
    response_preview: Optional[str] = None
    error: Optional[str] = None


# OpenAI Client Setup
def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("your-new"):
        api_key = os.getenv("OPENAI_API_KEY")
    return OpenAI(api_key=api_key)


# Model-Kategorien und -Informationen
MODEL_DATABASE = {
    # GPT-3.5 Familie
    "gpt-3.5-turbo": {
        "name": "GPT-3.5 Turbo",
        "type": "chat",
        "category": "general",
        "max_tokens": 4096,
        "cost_per_token": 0.001,
        "description": "Schnell und günstig für allgemeine Aufgaben",
    },
    "gpt-3.5-turbo-16k": {
        "name": "GPT-3.5 Turbo 16K",
        "type": "chat",
        "category": "general",
        "max_tokens": 16384,
        "cost_per_token": 0.003,
        "description": "Größerer Kontext für komplexere Aufgaben",
    },
    "gpt-3.5-turbo-1106": {
        "name": "GPT-3.5 Turbo (Nov 2023)",
        "type": "chat",
        "category": "general",
        "max_tokens": 4096,
        "cost_per_token": 0.001,
        "description": "Verbesserte Version mit JSON-Mode",
    },
    # GPT-4 Familie
    "gpt-4": {
        "name": "GPT-4",
        "type": "chat",
        "category": "premium",
        "max_tokens": 8192,
        "cost_per_token": 0.03,
        "description": "Hochqualitative Antworten für komplexe Aufgaben",
    },
    "gpt-4-turbo": {
        "name": "GPT-4 Turbo",
        "type": "chat",
        "category": "premium",
        "max_tokens": 128000,
        "cost_per_token": 0.01,
        "description": "Schnellere GPT-4 Version mit großem Kontext",
    },
    "gpt-4o": {
        "name": "GPT-4o",
        "type": "multimodal",
        "category": "premium",
        "max_tokens": 128000,
        "cost_per_token": 0.005,
        "description": "Multimodal: Text, Bilder, Audio",
    },
    "gpt-4o-mini": {
        "name": "GPT-4o Mini",
        "type": "multimodal",
        "category": "efficient",
        "max_tokens": 128000,
        "cost_per_token": 0.0015,
        "description": "Günstige multimodale Option",
    },
    # GPT-5 Familie (falls verfügbar)
    "gpt-5": {
        "name": "GPT-5",
        "type": "chat",
        "category": "ultra-premium",
        "max_tokens": 200000,
        "cost_per_token": 0.1,
        "description": "Neueste Generation für beste Qualität",
    },
    "gpt-5-mini": {
        "name": "GPT-5 Mini",
        "type": "chat",
        "category": "ultra-premium",
        "max_tokens": 100000,
        "cost_per_token": 0.05,
        "description": "Effiziente GPT-5 Version",
    },
    # O-Series Models
    "o1": {
        "name": "O1",
        "type": "reasoning",
        "category": "reasoning",
        "max_tokens": 32768,
        "cost_per_token": 0.15,
        "description": "Advanced reasoning für komplexe Probleme",
    },
    "o1-mini": {
        "name": "O1 Mini",
        "type": "reasoning",
        "category": "reasoning",
        "max_tokens": 65536,
        "cost_per_token": 0.03,
        "description": "Günstige reasoning option",
    },
}


@model_router.get("/available", response_model=List[ModelInfo])
async def get_available_models():
    """
    Gibt alle 280+ verfügbaren Modelle zurück - MIT BESTEN CODING-MODELLEN ZUERST
    """
    try:
        available_models = []

        # BESTE CODING-MODELLE ZUERST (wie GitHub Copilot arbeitet)
        best_coding_models = [
            {
                "id": "qwen2.5-coder:7b",
                "name": "Qwen2.5-Coder 7B (Ollama LOKAL)",
                "type": "chat",
                "category": "premium",
                "max_tokens": 32000,
                "available": True,
                "description": "💻 LOKAL & KOSTENLOS! Speziell für Coding optimiert",
            },
            {
                "id": "gpt-4o",
                "name": "GPT-4o (OpenAI)",
                "type": "multimodal",
                "category": "premium",
                "max_tokens": 128000,
                "available": True,
                "description": "⭐ OpenAI Multimodal - Sehr gut für Coding",
            },
            {
                "id": "github-gpt-4o",
                "name": "GPT-4o (GitHub KOSTENLOS)",
                "type": "multimodal",
                "category": "premium",
                "max_tokens": 128000,
                "available": True,
                "description": "🎁 KOSTENLOS mit GitHub Copilot!",
            },
            {
                "id": "llama3.2:3b",
                "name": "Llama 3.2 3B (Ollama LOKAL)",
                "type": "chat",
                "category": "general",
                "max_tokens": 128000,
                "available": True,
                "description": "💻 LOKAL & KOSTENLOS! Klein und schnell",
            },
            {
                "id": "github-Meta-Llama-3.1-405B-Instruct",
                "name": "Llama 3.1 405B (GitHub KOSTENLOS)",
                "type": "chat",
                "category": "premium",
                "max_tokens": 128000,
                "available": True,
                "description": "🎁 KOSTENLOS! Meta's größtes Modell",
            },
            {
                "id": "github-Mistral-large-2407",
                "name": "Mistral Large (GitHub KOSTENLOS)",
                "type": "chat",
                "category": "premium",
                "max_tokens": 128000,
                "available": True,
                "description": "🎁 KOSTENLOS! Mistral's bestes",
            },
        ]

        for model_info in best_coding_models:
            available_models.append(ModelInfo(**model_info))

        # Dann alle anderen Modelle
        for model_id, info in ALL_MODELS.items():
            # Skip wenn schon in best_coding_models
            if any(m["id"] == model_id for m in best_coding_models):
                continue

            available_models.append(
                ModelInfo(
                    id=model_id,
                    name=model_id.replace("-", " ").replace("_", " ").title(),
                    type=info["type"],
                    category=info["category"],
                    max_tokens=info.get("context", 4096),
                    available=True,
                    description=f"{info['provider']} - {info['type']} model",
                )
            )

        return available_models

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching models: {str(e)}")


@model_router.get("/search", response_model=List[ModelInfo])
async def search_models(
    query: Optional[str] = Query(None, description="Suchbegriff für Model-Namen"),
    category: Optional[str] = Query(None, description="Model-Kategorie (general, premium, reasoning, etc.)"),
    available_only: bool = Query(True, description="Nur verfügbare Modelle anzeigen"),
):
    """
    Sucht nach Modellen basierend auf Kriterien
    """
    try:
        # Hole verfügbare Modelle
        if available_only:
            available_models = await get_available_models()
            model_pool = {m.id: m for m in available_models}
        else:
            # Alle bekannten Modelle aus der Datenbank
            model_pool = {}
            for model_id, info in MODEL_DATABASE.items():
                model_pool[model_id] = ModelInfo(id=model_id, available=False, **info)  # Wird später getestet

        results = []
        for model_id, model_info in model_pool.items():
            # Filter nach Query
            if query and query.lower() not in model_id.lower() and query.lower() not in model_info.name.lower():
                continue

            # Filter nach Kategorie
            if category and model_info.category != category:
                continue

            results.append(model_info)

        return sorted(results, key=lambda x: (x.category, x.name))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching models: {str(e)}")


@model_router.post("/test", response_model=ModelTestResponse)
async def test_model(request: ModelTestRequest):
    """
    Testet ob ein spezifisches Model verfügbar ist
    """
    import time

    try:
        client = get_openai_client()
        start_time = time.time()

        response = client.chat.completions.create(
            model=request.model_id,
            messages=[{"role": "user", "content": request.test_prompt}],
            max_tokens=50,
        )

        response_time = time.time() - start_time
        response_text = response.choices[0].message.content or ""

        return ModelTestResponse(
            model_id=request.model_id,
            available=True,
            response_time=round(response_time, 3),
            response_preview=(response_text[:100] + "..." if len(response_text) > 100 else response_text),
        )

    except Exception as e:
        return ModelTestResponse(model_id=request.model_id, available=False, error=str(e))


@model_router.get("/categories")
async def get_model_categories():
    """
    Gibt alle verfügbaren Model-Kategorien zurück
    """
    categories = {}
    for model_id, info in MODEL_DATABASE.items():
        category = info["category"]
        if category not in categories:
            categories[category] = {
                "name": category,
                "models": [],
                "description": get_category_description(category),
            }
        categories[category]["models"].append(model_id)

    return categories


def get_category_description(category: str) -> str:
    descriptions = {
        "general": "Allgemeine Modelle für Standard-Aufgaben",
        "premium": "Hochqualitative Modelle für komplexe Aufgaben",
        "ultra-premium": "Neueste Generation mit bester Qualität",
        "efficient": "Optimiert für Geschwindigkeit und Kosten",
        "reasoning": "Spezialisiert auf logisches Denken und Problemlösung",
        "multimodal": "Unterstützt Text, Bilder und andere Medien",
        "coding": "Optimiert für Code-Generation und -Analyse",
        "other": "Andere spezialisierte Modelle",
    }
    return descriptions.get(category, "Spezielle Model-Kategorie")


@model_router.get("/best-for/{task}")
async def get_best_model_for_task(task: str):
    """
    Empfiehlt das beste verfügbare Model für eine spezifische Aufgabe
    """
    # Hole verfügbare Modelle
    available_models = await get_available_models()
    available_ids = [m.id for m in available_models]

    # Task-spezifische Prioritäten
    task_priorities = {
        "coding": [
            "gpt-5",
            "o1",
            "gpt-4o",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo-16k",
        ],
        "writing": ["gpt-5", "gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
        "reasoning": ["o1", "o1-mini", "gpt-5", "gpt-4o", "gpt-4"],
        "analysis": ["gpt-5", "o1", "gpt-4o", "gpt-4-turbo", "gpt-4"],
        "creative": ["gpt-5", "gpt-4o", "gpt-4", "gpt-3.5-turbo"],
        "fast": ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-3.5-turbo-1106"],
        "cheap": ["gpt-3.5-turbo", "gpt-4o-mini", "gpt-3.5-turbo-1106"],
    }

    priorities = task_priorities.get(task.lower(), task_priorities["coding"])

    # Finde bestes verfügbares Model
    for model_id in priorities:
        if model_id in available_ids:
            model_info = next(m for m in available_models if m.id == model_id)
            return {
                "task": task,
                "recommended_model": model_info,
                "reason": f"Bestes verfügbares Model für {task}",
                "alternatives": [m for m in available_models if m.id in priorities[1:4]],
            }

    # Fallback
    if available_models:
        return {
            "task": task,
            "recommended_model": available_models[0],
            "reason": "Fallback: Erstes verfügbares Model",
            "alternatives": available_models[1:4],
        }

    raise HTTPException(status_code=404, detail="Keine Modelle verfügbar")


@model_router.get("/list")
async def list_all_models():
    """
    Gibt eine einfache Liste aller 280+ Model-IDs zurück
    """
    return {
        "total": len(ALL_MODELS),
        "models": get_all_model_ids(),
        "by_provider": {
            "openai": get_models_by_provider("openai"),
            "anthropic": get_models_by_provider("anthropic"),
            "google": get_models_by_provider("google"),
            "github": get_models_by_provider("github"),
            "github-azure": get_models_by_provider("github-azure"),
            "ollama": get_models_by_provider("ollama"),
            "stability": get_models_by_provider("stability"),
        },
    }


@model_router.get("/info/{model_id}")
async def get_model_details(model_id: str):
    """
    Gibt Details zu einem spezifischen Model zurück
    """
    info = get_model_info(model_id)
    if info.get("provider") == "unknown":
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

    return {"id": model_id, **info}
