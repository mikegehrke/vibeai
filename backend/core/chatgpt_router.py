"""
ChatGPT 5.1 Complete System
Exakt wie OpenAI ChatGPT mit allen Features
"""

import json
import os
from typing import Any, Dict, List, Optional

import anthropic
import openai
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(prefix="/chatgpt", tags=["ChatGPT"])


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None
    model: Optional[str] = None
    agent: Optional[str] = None


class ChatRequest(BaseModel):
    prompt: str
    model: str = "gpt-4o"
    agent: Optional[str] = None
    webSearch: bool = False
    messages: List[ChatMessage] = []
    systemPrompt: Optional[str] = None
    temperature: float = 1.0
    maxTokens: int = 4000


class AgentConfig(BaseModel):
    id: str
    name: str
    systemPrompt: str
    temperature: float = 1.0
    enableWebSearch: bool = False


# Agenten-Konfigurationen
AGENTS = {
    "deep-research": AgentConfig(
        id="deep-research",
        name="Deep Research",
        systemPrompt="""Du bist ein Deep Research Assistent.
        
Deine Aufgabe:
- Ausführliche Recherche zu jedem Thema
- Quellenangaben und Faktencheck
- Strukturierte, umfassende Antworten
- Pro/Contra Abwägungen
- Aktuelle Informationen

Antworte immer mit:
1. Executive Summary
2. Detaillierte Analyse
3. Quellen und Referenzen
4. Fazit und Empfehlungen""",
        temperature=0.7,
        enableWebSearch=True
    ),
    "code-assistant": AgentConfig(
        id="code-assistant",
        name="Code Assistent",
        systemPrompt="""Du bist ein Expert Code Assistent für ALLE Programmiersprachen.

📚 UNTERSTÜTZTE SPRACHEN (40+):

WEB FRONTEND:
• JavaScript, TypeScript, HTML, CSS/SCSS/Sass
• React, Vue, Angular, Svelte, Next.js, Nuxt

BACKEND:
• Python (FastAPI, Django, Flask)
• Node.js (Express, Nest.js, Fastify)
• Go (Gin, Echo, Fiber)
• Rust (Actix, Rocket, Axum)
• Java (Spring Boot, Quarkus)
• C# (ASP.NET Core, Blazor)
• PHP (Laravel, Symfony)
• Ruby (Rails, Sinatra)

MOBILE:
• Swift (iOS - SwiftUI, UIKit)
• Kotlin (Android - Jetpack Compose)
• Dart (Flutter)
• React Native, Java Android

SYSTEMS:
• C, C++, Rust, Assembly

DATA SCIENCE:
• Python (NumPy, Pandas, TensorFlow, PyTorch)
• R, Julia, MATLAB

SCRIPTING:
• Bash, PowerShell, Perl, Lua

FUNCTIONAL:
• Haskell, Scala, Elixir, F#

DATABASE:
• SQL (PostgreSQL, MySQL, SQLite)
• NoSQL (MongoDB, Redis, Cassandra)

MARKUP/CONFIG:
• YAML, JSON, XML, Markdown, TOML

🎯 FÄHIGKEITEN:
• Code in JEDER Sprache schreiben
• Multi-Language Projekte (z.B. React + Python + Rust)
• Framework-übergreifend arbeiten
• Best Practices für jede Sprache
• Performance Optimierung
• Security & Code Review
• Bug Fixing & Debugging
• Architektur & Design Patterns

FORMAT:
```language
code hier
```

Erkläre immer WARUM und nicht nur WIE.""",
        temperature=0.3,
        enableWebSearch=False
    ),
    "image-generator": AgentConfig(
        id="image-generator",
        name="Bild erstellen",
        systemPrompt="""Du bist ein DALL-E 3 Prompt Expert.

Erstelle detaillierte Bild-Prompts:
- Beschreibe Stil, Farben, Komposition
- Technische Details (Perspektive, Beleuchtung)
- Stimmung und Atmosphäre
- Künstlerische Referenzen

Ich generiere dann das Bild mit DALL-E 3.""",
        temperature=1.0,
        enableWebSearch=False
    ),
    "shopping": AgentConfig(
        id="shopping",
        name="Shopping-Assistent",
        systemPrompt="""Du bist ein Shopping-Berater.

Hilf bei:
- Produktvergleichen
- Preis-Leistungs-Analysen
- Kaufempfehlungen
- Alternativen finden
- Reviews zusammenfassen

Gib strukturierte Empfehlungen mit Pro/Contra.""",
        temperature=0.8,
        enableWebSearch=True
    ),
    "data-analyst": AgentConfig(
        id="data-analyst",
        name="Datenanalyst",
        systemPrompt="""Du bist ein Datenanalyst.

Spezialisiert auf:
- Datenanalyse und Visualisierung
- Statistik und Trends
- Python (pandas, numpy, matplotlib)
- SQL Queries
- Interpretationen

Zeige Code und Erklärungen.""",
        temperature=0.5,
        enableWebSearch=False
    )
}


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Streaming Chat wie ChatGPT"""
    
    async def generate():
        try:
            # Agent-Konfiguration
            agent_config = None
            if request.agent and request.agent in AGENTS:
                agent_config = AGENTS[request.agent]
            
            # System Prompt
            system_prompt = agent_config.systemPrompt if agent_config else request.systemPrompt
            temperature = agent_config.temperature if agent_config else request.temperature
            
            # Model Mapping (GPT-5 existiert nicht - mappe zu GPT-4o)
            model = request.model
            if "gpt-5" in model.lower() or "gpt-4o-transcribe" in model.lower():
                model = "gpt-4o"
            elif "o3" in model.lower() or "o4" in model.lower():
                model = "o1-preview"  # O3/O4 nicht verfügbar
            
            # Messages aufbauen
            messages = []
            if system_prompt and "o1" not in model:
                messages.append({"role": "system", "content": system_prompt})
            
            # Chat History
            for msg in request.messages:
                messages.append({
                    "role": msg.role if msg.role != "assistant" else "assistant",
                    "content": msg.content
                })
            
            # Aktuelle Frage
            user_content = request.prompt
            if request.webSearch or (agent_config and agent_config.enableWebSearch):
                user_content = f"[WEB SEARCH]\n{request.prompt}"
            
            messages.append({"role": "user", "content": user_content})
            
            # OpenAI Models
            if any(x in model.lower() for x in ["gpt", "o1", "o3", "o4"]):
                client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                
                # O1 models brauchen spezielle Parameter
                if "o1" in model.lower():
                    # Kein system prompt, keine temperature bei O1
                    messages = [m for m in messages if m["role"] != "system"]
                    
                    stream = client.chat.completions.create(
                        model=model,
                        messages=messages,
                        stream=True
                    )
                else:
                    stream = client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=request.maxTokens,
                        stream=True
                    )
                
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
            
            # Claude Models
            elif "claude" in model.lower():
                client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
                
                # Claude erwartet anderes Format
                claude_messages = [m for m in messages if m["role"] != "system"]
                system = system_prompt or ""
                
                with client.messages.stream(
                    model=model,
                    max_tokens=request.maxTokens,
                    temperature=temperature,
                    system=system,
                    messages=claude_messages
                ) as stream:
                    for text in stream.text_stream:
                        yield f"data: {json.dumps({'content': text})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
            
            # Gemini
            elif "gemini" in model.lower():
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
                    
                    gemini_model = genai.GenerativeModel(model)
                    
                    # Baue Prompt zusammen
                    full_prompt = ""
                    if system_prompt:
                        full_prompt += f"{system_prompt}\n\n"
                    full_prompt += request.prompt
                    
                    response = gemini_model.generate_content(
                        full_prompt,
                        stream=True
                    )
                    
                    for chunk in response:
                        if chunk.text:
                            yield f"data: {json.dumps({'content': chunk.text})}\n\n"
                    
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    
                except ImportError:
                    yield f"data: {json.dumps({'error': 'Google AI not available'})}\n\n"
            
            else:
                # Fallback zu GPT-4o
                client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                
                stream = client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    temperature=temperature,
                    max_tokens=request.maxTokens,
                    stream=True
                )
                
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
        
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/agents")
async def get_agents():
    """Liste aller verfügbaren Agenten"""
    return {
        "agents": [
            {
                "id": agent.id,
                "name": agent.name,
                "description": agent.systemPrompt[:100] + "...",
                "webSearch": agent.enableWebSearch
            }
            for agent in AGENTS.values()
        ]
    }


@router.post("/agent/custom")
async def create_custom_agent(config: AgentConfig):
    """Erstelle eigenen Agenten"""
    AGENTS[config.id] = config
    return {"success": True, "agent": config}
