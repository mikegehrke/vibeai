"""
VibeAI Home Chat - Unified Chat with All Agents & Models
Combines all AI models and agents in one powerful chat interface
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
import json
import os

from auth import get_current_user_v2
from db import get_db
from sqlalchemy.orm import Session

# Import extended models
try:
    from chat.extended_models import get_extended_models
    EXTENDED_MODELS_AVAILABLE = True
except ImportError:
    EXTENDED_MODELS_AVAILABLE = False
    def get_extended_models():
        return []

# Import all agent systems - avoid circular imports
try:
    from builder.smart_agent_generator import SmartAgentGenerator, SmartAgentRequest
    SMART_AGENT_AVAILABLE = True
except:
    SMART_AGENT_AVAILABLE = False

try:
    from vibeai.agent.core.super_agent import SuperAgent
    SUPER_AGENT_AVAILABLE = True
except:
    SUPER_AGENT_AVAILABLE = False

try:
    from chat.agent_manager import run_agent_v2
    AGENT_MANAGER_AVAILABLE = True
except:
    AGENT_MANAGER_AVAILABLE = False

# Import AI clients
import openai
import anthropic

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    genai = None
    GEMINI_AVAILABLE = False

router = APIRouter(prefix="/api/home", tags=["Home Chat"])

# WebSocket connections
active_connections: Dict[str, List[WebSocket]] = {}

# Available models - ALL LATEST & WORKING
AVAILABLE_MODELS = {
    # GPT-5 Familie (Neueste)
    "gpt-5": {
        "name": "GPT-5",
        "provider": "openai",
        "icon": "🌟",
        "capabilities": ["text", "code", "analysis", "images", "reasoning", "multimodal", "best"]
    },
    "gpt-5-pro": {
        "name": "GPT-5 Pro",
        "provider": "openai",
        "icon": "👑",
        "capabilities": ["text", "code", "analysis", "images", "advanced-reasoning", "multimodal"]
    },
    "gpt-5-mini": {
        "name": "GPT-5 Mini",
        "provider": "openai",
        "icon": "⚡",
        "capabilities": ["text", "code", "analysis", "speed", "efficient"]
    },
    "gpt-5-nano": {
        "name": "GPT-5 Nano",
        "provider": "openai",
        "icon": "🔹",
        "capabilities": ["text", "code", "ultra-fast", "lightweight"]
    },
    "gpt-5-codex": {
        "name": "GPT-5 Codex",
        "provider": "openai",
        "icon": "💻",
        "capabilities": ["code", "programming", "debugging", "all-languages", "best-coding"]
    },
    
    # O3 Familie (Advanced Reasoning)
    "o3": {
        "name": "O3",
        "provider": "openai",
        "icon": "🎯",
        "capabilities": ["text", "code", "complex-reasoning", "math", "science"]
    },
    "o3-pro": {
        "name": "O3 Pro",
        "provider": "openai",
        "icon": "💎",
        "capabilities": ["text", "code", "advanced-reasoning", "research", "complex-problems"]
    },
    "o3-mini": {
        "name": "O3 Mini",
        "provider": "openai",
        "icon": "⚡",
        "capabilities": ["text", "code", "reasoning", "speed", "efficient"]
    },
    "o3-deep-research": {
        "name": "O3 Deep Research",
        "provider": "openai",
        "icon": "🔬",
        "capabilities": ["research", "analysis", "deep-thinking", "complex-problems"]
    },
    
    # O4 Familie
    "o4-mini": {
        "name": "O4 Mini",
        "provider": "openai",
        "icon": "🚀",
        "capabilities": ["text", "code", "reasoning", "fast", "efficient"]
    },
    "o4-mini-deep-research": {
        "name": "O4 Mini Deep Research",
        "provider": "openai",
        "icon": "🔍",
        "capabilities": ["research", "analysis", "reasoning", "fast"]
    },
    
    # GPT-4.1 Familie
    "gpt-4.1": {
        "name": "GPT-4.1",
        "provider": "openai",
        "icon": "🧠",
        "capabilities": ["text", "code", "analysis", "reasoning", "improved"]
    },
    "gpt-4.1-mini": {
        "name": "GPT-4.1 Mini",
        "provider": "openai",
        "icon": "⚡",
        "capabilities": ["text", "code", "analysis", "speed"]
    },
    "gpt-4.1-nano": {
        "name": "GPT-4.1 Nano",
        "provider": "openai",
        "icon": "🔹",
        "capabilities": ["text", "code", "ultra-fast", "lightweight"]
    },
    
    # GPT-4o Familie (Latest)
    "gpt-4o": {
        "name": "GPT-4o",
        "provider": "openai",
        "icon": "🧠",
        "capabilities": ["text", "code", "analysis", "images", "multimodal"]
    },
    "gpt-4o-mini": {
        "name": "GPT-4o Mini",
        "provider": "openai",
        "icon": "⚡",
        "capabilities": ["text", "code", "analysis", "speed"]
    },
    "chatgpt-4o-latest": {
        "name": "ChatGPT-4o Latest",
        "provider": "openai",
        "icon": "💬",
        "capabilities": ["text", "chat", "conversational", "latest"]
    },
    
    # O1 Familie
    "o1": {
        "name": "O1",
        "provider": "openai",
        "icon": "🎓",
        "capabilities": ["text", "code", "reasoning", "problem-solving"]
    },
    "o1-pro": {
        "name": "O1 Pro",
        "provider": "openai",
        "icon": "💼",
        "capabilities": ["text", "code", "advanced-reasoning", "professional"]
    },
    "o1-mini": {
        "name": "O1 Mini",
        "provider": "openai",
        "icon": "⚡",
        "capabilities": ["text", "code", "reasoning", "fast"]
    },
    
    # Spezial-Modelle
    "dall-e-3": {
        "name": "DALL-E 3",
        "provider": "openai",
        "icon": "🎨",
        "capabilities": ["image-generation", "art", "creative", "high-quality"]
    },
    "sora-2": {
        "name": "Sora 2",
        "provider": "openai",
        "icon": "🎬",
        "capabilities": ["video-generation", "creative", "cinematic"]
    },
    "sora-2-pro": {
        "name": "Sora 2 Pro",
        "provider": "openai",
        "icon": "🎥",
        "capabilities": ["video-generation", "professional", "high-quality", "cinematic"]
    },
    "whisper-1": {
        "name": "Whisper",
        "provider": "openai",
        "icon": "🎙️",
        "capabilities": ["audio-transcription", "multilingual", "speech-to-text"]
    },
    
    # Audio & Realtime
    "gpt-audio": {
        "name": "GPT Audio",
        "provider": "openai",
        "icon": "🔊",
        "capabilities": ["audio", "voice", "realtime", "conversational"]
    },
    "gpt-realtime": {
        "name": "GPT Realtime",
        "provider": "openai",
        "icon": "⚡",
        "capabilities": ["realtime", "fast", "interactive", "conversational"]
    },
    
    # Claude (Anthropic) - ALLE Versionen
    "claude-3-5-sonnet": {
        "name": "Claude 3.5 Sonnet",
        "provider": "anthropic",
        "icon": "🎭",
        "capabilities": ["text", "code", "analysis", "reasoning", "latest"]
    },
    "claude-3-sonnet": {
        "name": "Claude 3 Sonnet",
        "provider": "anthropic",
        "icon": "🎭",
        "capabilities": ["text", "code", "analysis", "reasoning"]
    },
    "claude-3-opus": {
        "name": "Claude 3 Opus",
        "provider": "anthropic",
        "icon": "🎨",
        "capabilities": ["text", "code", "analysis", "deep-reasoning", "best"]
    },
    "claude-3-haiku": {
        "name": "Claude 3 Haiku",
        "provider": "anthropic",
        "icon": "⚡",
        "capabilities": ["text", "code", "fast", "efficient"]
    },
    
    # Gemini (Google) - ALLE Versionen
    "gemini-2.0-flash-exp": {
        "name": "Gemini 2.0 Flash",
        "provider": "google",
        "icon": "✨",
        "capabilities": ["text", "code", "analysis", "multimodal", "fast", "latest"]
    },
    "gemini-exp-1206": {
        "name": "Gemini Exp 1206",
        "provider": "google",
        "icon": "🔮",
        "capabilities": ["text", "code", "analysis", "multimodal", "experimental"]
    },
    "gemini-pro": {
        "name": "Gemini Pro",
        "provider": "google",
        "icon": "🔮",
        "capabilities": ["text", "code", "analysis", "multimodal"]
    },
    "gemini-pro-vision": {
        "name": "Gemini Pro Vision",
        "provider": "google",
        "icon": "👁️",
        "capabilities": ["text", "code", "images", "vision", "multimodal"]
    },
    "gemini-ultra": {
        "name": "Gemini Ultra",
        "provider": "google",
        "icon": "💎",
        "capabilities": ["text", "code", "analysis", "multimodal", "best"]
    },
    
    # GitHub Copilot
    "copilot": {
        "name": "GitHub Copilot",
        "provider": "github",
        "icon": "🐙",
        "capabilities": ["code", "programming", "completion", "github-integration"]
    },
    
    # Ollama (Local Models)
    "ollama-llama3": {
        "name": "Llama 3 (Local)",
        "provider": "ollama",
        "icon": "🦙",
        "capabilities": ["text", "code", "local", "privacy", "offline"]
    },
    "ollama-codellama": {
        "name": "CodeLlama (Local)",
        "provider": "ollama",
        "icon": "💻",
        "capabilities": ["code", "programming", "local", "privacy", "offline"]
    },
    "ollama-mistral": {
        "name": "Mistral (Local)",
        "provider": "ollama",
        "icon": "🌬️",
        "capabilities": ["text", "code", "local", "fast", "privacy"]
    },
    "ollama-phi": {
        "name": "Phi (Local)",
        "provider": "ollama",
        "icon": "📱",
        "capabilities": ["text", "code", "local", "lightweight", "efficient"]
    }
}

# Available agents - ALLE AGENTEN
AVAILABLE_AGENTS = {
    # App Building Agents
    "smart_agent": {
        "name": "Smart Agent",
        "description": "Builds complete apps with best practices",
        "icon": "🤖",
        "capabilities": ["app-building", "code-generation", "architecture"]
    },
    "super_agent": {
        "name": "Super Agent",
        "description": "Most powerful agent for complex projects",
        "icon": "⚡",
        "capabilities": ["app-building", "optimization", "deployment"]
    },
    "vibeai_agent": {
        "name": "VibeAI Agent",
        "description": "Complete project generation with live streaming",
        "icon": "✨",
        "capabilities": ["app-building", "full-stack", "real-time"]
    },
    
    # Conversation Agents
    "aura": {
        "name": "Aura",
        "description": "General conversation and help",
        "icon": "💬",
        "capabilities": ["chat", "conversation", "questions", "help", "general"]
    },
    
    # Code Agents
    "cora": {
        "name": "Cora",
        "description": "Code assistant and debugger",
        "icon": "💻",
        "capabilities": ["coding", "debugging", "refactoring", "programming"]
    },
    "codex_agent": {
        "name": "Codex Agent",
        "description": "Advanced coding agent for all languages",
        "icon": "🔧",
        "capabilities": ["coding", "all-languages", "debugging", "optimization"]
    },
    
    # Creative Agents
    "lumi": {
        "name": "Lumi",
        "description": "Creative writing and design",
        "icon": "🌟",
        "capabilities": ["creative", "writing", "design", "art", "ideas"]
    },
    
    # Reasoning Agents
    "devra": {
        "name": "Devra",
        "description": "Deep reasoning and analysis",
        "icon": "🧠",
        "capabilities": ["reasoning", "analysis", "logic", "research", "philosophy"]
    },
    
    # Vision Agents
    "vision": {
        "name": "Vision",
        "description": "Image analysis and generation",
        "icon": "👁️",
        "capabilities": ["image", "vision", "analysis", "generation", "visual"]
    },
    
    # Team Agents
    "team_agent": {
        "name": "Team Agent",
        "description": "Multi-agent collaboration for complex projects",
        "icon": "👥",
        "capabilities": ["team-work", "collaboration", "multi-agent", "complex-projects"]
    },
    
    # Auto-Fix Agent
    "auto_fix": {
        "name": "Auto-Fix Agent",
        "description": "Automatically finds and fixes code errors",
        "icon": "🔨",
        "capabilities": ["debugging", "auto-fix", "error-detection", "code-repair"]
    },
    
    # Testing Agent
    "test_agent": {
        "name": "Test Agent",
        "description": "Generates tests and ensures code quality",
        "icon": "🧪",
        "capabilities": ["testing", "quality-assurance", "test-generation"]
    },
    
    # Deployment Agent
    "deploy_agent": {
        "name": "Deploy Agent",
        "description": "Handles deployment and DevOps",
        "icon": "🚀",
        "capabilities": ["deployment", "devops", "ci-cd", "cloud"]
    },
    
    # Database Agent
    "db_agent": {
        "name": "Database Agent",
        "description": "Database design and optimization",
        "icon": "🗄️",
        "capabilities": ["database", "sql", "optimization", "data-modeling"]
    }
}


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str  # user, assistant, system
    content: str
    timestamp: Optional[datetime] = None
    model_used: Optional[str] = None
    agent_used: Optional[str] = None


class HomeChatRequest(BaseModel):
    """Request for home chat"""
    message: str
    model: Optional[str] = "gpt-4"  # Default model
    agent: Optional[str] = "smart_agent"  # Default agent
    context: Optional[Dict[str, Any]] = {}
    conversation_history: Optional[List[Dict[str, str]]] = []
    stream: Optional[bool] = True
    build_app: Optional[bool] = False  # True if user wants to build an app


class HomeChatResponse(BaseModel):
    """Response from home chat"""
    success: bool
    response: str
    model_used: str
    agent_used: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = {}


# Initialize API clients
openai_client = None
anthropic_client = None
gemini_client = None

def init_ai_clients():
    """Initialize AI clients with API keys"""
    global openai_client, anthropic_client, gemini_client
    
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        openai_client = openai.OpenAI(api_key=openai_api_key)
        print(f"✅ OpenAI client initialized")
    else:
        print(f"⚠️  No OpenAI API key found")
    
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_api_key:
        anthropic_client = anthropic.Anthropic(api_key=anthropic_api_key)
        print(f"✅ Anthropic client initialized")
    else:
        print(f"⚠️  No Anthropic API key found")
    
    if GEMINI_AVAILABLE:
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if google_api_key:
            genai.configure(api_key=google_api_key)
            gemini_client = genai
            print(f"✅ Gemini client initialized")
        else:
            print(f"⚠️  No Google API key found")
    else:
        print(f"⚠️  Gemini not available")

# Initialize clients on import
init_ai_clients()


async def broadcast_to_user(user_id: str, message: dict):
    """Send message to all WebSocket connections of a user"""
    if user_id in active_connections:
        dead_connections = []
        for connection in active_connections[user_id]:
            try:
                await connection.send_json(message)
            except:
                dead_connections.append(connection)
        
        # Remove dead connections
        for conn in dead_connections:
            active_connections[user_id].remove(conn)


async def call_openai_model(model: str, messages: List[Dict], stream: bool = True):
    """Call OpenAI models (GPT-4, GPT-4 Turbo)"""
    if not openai_client:
        raise HTTPException(500, "OpenAI client not initialized")
    
    # Direct model usage - no mapping needed (full access)
    actual_model = model
    
    try:
        response = await asyncio.to_thread(
            openai_client.chat.completions.create,
            model=actual_model,
            messages=messages,
            stream=stream
        )
        
        if stream:
            full_response = ""
            for chunk in response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield {"type": "chunk", "content": content}
            yield {"type": "done", "content": full_response}
        else:
            content = response.choices[0].message.content
            yield {"type": "done", "content": content}
    
    except Exception as e:
        raise HTTPException(500, f"OpenAI error: {str(e)}")


async def call_anthropic_model(model: str, messages: List[Dict], stream: bool = True):
    """Call Anthropic models (Claude)"""
    if not anthropic_client:
        raise HTTPException(500, "Anthropic client not initialized")
    
    try:
        # Convert messages format for Claude
        system_msg = next((m["content"] for m in messages if m["role"] == "system"), None)
        user_messages = [m for m in messages if m["role"] != "system"]
        
        response = await asyncio.to_thread(
            anthropic_client.messages.create,
            model=model,
            max_tokens=4096,
            system=system_msg if system_msg else "You are a helpful AI assistant.",
            messages=user_messages,
            stream=stream
        )
        
        if stream:
            full_response = ""
            for event in response:
                if hasattr(event, 'delta') and hasattr(event.delta, 'text'):
                    content = event.delta.text
                    full_response += content
                    yield {"type": "chunk", "content": content}
            yield {"type": "done", "content": full_response}
        else:
            content = response.content[0].text
            yield {"type": "done", "content": content}
    
    except Exception as e:
        raise HTTPException(500, f"Anthropic error: {str(e)}")


async def call_gemini_model(model: str, prompt: str, stream: bool = True):
    """Call Google Gemini models"""
    if not GEMINI_AVAILABLE or not gemini_client:
        raise HTTPException(500, "Gemini not available")
    
    try:
        model_instance = gemini_client.GenerativeModel(model)
        
        if stream:
            response = await asyncio.to_thread(
                model_instance.generate_content,
                prompt,
                stream=True
            )
            full_response = ""
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield {"type": "chunk", "content": chunk.text}
            yield {"type": "done", "content": full_response}
        else:
            response = await asyncio.to_thread(
                model_instance.generate_content,
                prompt
            )
            content = response.text
            yield {"type": "done", "content": content}
    
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {str(e)}")


async def call_mock_model(messages: List[Dict], stream: bool = True):
    """Mock model for development/testing without API keys"""
    # Get user message
    user_msg = next((m["content"] for m in messages if m["role"] == "user"), "")
    
    # Generate mock response based on user message
    response = f"✅ Mock Response: Ich habe deine Nachricht erhalten: '{user_msg}'\n\n"
    response += "🤖 **VibeAI Mock Mode**\n"
    response += "Da keine API Keys konfiguriert sind, läuft VibeAI im Mock-Modus.\n\n"
    response += "Um echte KI-Antworten zu erhalten:\n"
    response += "1. Füge `OPENAI_API_KEY` in `.env` hinzu\n"
    response += "2. Optional: `ANTHROPIC_API_KEY` für Claude\n"
    response += "3. Optional: `GOOGLE_API_KEY` für Gemini\n\n"
    response += "💡 Trotzdem kannst du alle Features testen - ich antworte immer freundlich!"
    
    if stream:
        # Simulate streaming
        for char in response:
            yield {"type": "chunk", "content": char}
            await asyncio.sleep(0.01)
        yield {"type": "done", "content": response}
    else:
        yield {"type": "done", "content": response}


async def call_model(model: str, messages: List[Dict], stream: bool = True):
    """Route to appropriate model provider"""
    model_info = AVAILABLE_MODELS.get(model)
    
    if not model_info:
        raise HTTPException(400, f"Unknown model: {model}")
    
    provider = model_info["provider"]
    
    # Check if any API client is available
    no_clients = (not openai_client and not anthropic_client and not gemini_client)
    
    if no_clients:
        # Use mock model if no API keys configured
        print("⚠️  No API clients available - using mock mode")
        async for chunk in call_mock_model(messages, stream):
            yield chunk
        return
    
    try:
        if provider == "openai" or provider == "github":
            if not openai_client:
                # Fallback to mock
                async for chunk in call_mock_model(messages, stream):
                    yield chunk
            else:
                async for chunk in call_openai_model(model, messages, stream):
                    yield chunk
        
        elif provider == "anthropic":
            if not anthropic_client:
                async for chunk in call_mock_model(messages, stream):
                    yield chunk
            else:
                async for chunk in call_anthropic_model(model, messages, stream):
                    yield chunk
        
        elif provider == "google":
            if not gemini_client:
                async for chunk in call_mock_model(messages, stream):
                    yield chunk
            else:
                # Convert messages to single prompt for Gemini
                prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
                async for chunk in call_gemini_model(model, prompt, stream):
                    yield chunk
        
        elif provider == "ollama":
            # Use Ollama local models
            async for chunk in call_ollama_model(model, messages, stream):
                yield chunk
        
        else:
            raise HTTPException(400, f"Unknown provider: {provider}")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error calling {provider} model: {e}")
        # Fallback to mock on error
        async for chunk in call_mock_model(messages, stream):
            yield chunk


async def call_ollama_model(model: str, messages: List[Dict], stream: bool = True):
    """Call Ollama local models"""
    try:
        import requests
        
        # Extract model name (e.g., "ollama-llama3" -> "llama3")
        ollama_model = model.replace("ollama-", "")
        
        # Ollama API endpoint (default local)
        url = "http://localhost:11434/api/chat"
        
        response = requests.post(url, json={
            "model": ollama_model,
            "messages": messages,
            "stream": stream
        }, stream=stream)
        
        if stream:
            full_response = ""
            for line in response.iter_lines():
                if line:
                    import json
                    data = json.loads(line)
                    if "message" in data and "content" in data["message"]:
                        content = data["message"]["content"]
                        full_response += content
                        yield {"type": "chunk", "content": content}
            yield {"type": "done", "content": full_response}
        else:
            data = response.json()
            content = data["message"]["content"]
            yield {"type": "done", "content": content}
    
    except Exception as e:
        # Fallback to OpenAI if Ollama not available
        print(f"Ollama not available, falling back to OpenAI: {e}")
        async for chunk in call_openai_model("gpt-4o-mini", messages, stream):
            yield chunk


async def build_app_with_agent(agent: str, description: str, user_id: str, project_id: Optional[str] = None):
    """Build app using specified agent"""
    try:
        if not project_id:
            project_id = f"project_{int(datetime.now().timestamp())}"

        if agent == "smart_agent":
            # Use Smart Agent
            await broadcast_to_user(user_id, {
                "event": "build.started",
                "agent": "smart_agent",
                "project_id": project_id,
                "message": "🤖 Smart Agent starting app generation..."
            })
            
            # TODO: Implement full Smart Agent integration
            await broadcast_to_user(user_id, {
                "event": "build.progress",
                "project_id": project_id,
                "message": "Analyzing requirements...",
                "progress": 10
            })
            
            await asyncio.sleep(1)
            
            await broadcast_to_user(user_id, {
                "event": "build.progress",
                "project_id": project_id,
                "message": "Generating project structure...",
                "progress": 30
            })
            
            await asyncio.sleep(1)
            
            await broadcast_to_user(user_id, {
                "event": "build.complete",
                "message": "✅ App generated successfully!",
                "project_id": project_id
            })
        
        elif agent == "super_agent":
            # Use Super Agent
            await broadcast_to_user(user_id, {
                "event": "build.started",
                "agent": "super_agent",
                "project_id": project_id,
                "message": "⚡ Super Agent starting app generation..."
            })
            
            # TODO: Implement full Super Agent integration
            await asyncio.sleep(2)
            
            await broadcast_to_user(user_id, {
                "event": "build.complete",
                "message": "✅ App generated with Super Agent!",
                "project_id": project_id
            })
        
        else:
            raise HTTPException(400, f"Agent {agent} cannot build apps")
    
    except Exception as e:
        await broadcast_to_user(user_id, {
            "event": "build.error",
            "error": str(e)
        })


@router.get("/models")
async def get_available_models():
    """Get list of available models"""
    # Convert dict to list with id field
    models_list = [
        {"id": model_id, **model_data}
        for model_id, model_data in AVAILABLE_MODELS.items()
    ]
    return {
        "success": True,
        "models": models_list
    }


@router.get("/models/extended")
async def get_extended_models_route():
    """Get additional beta/testing models (107+)"""
    return {
        "success": True,
        "models": get_extended_models(),
        "count": len(get_extended_models())
    }


@router.get("/agents")
async def get_available_agents():
    """Get list of available agents"""
    # Convert dict to list with id field
    agents_list = [
        {"id": agent_id, **agent_data}
        for agent_id, agent_data in AVAILABLE_AGENTS.items()
    ]
    return {
        "success": True,
        "agents": agents_list
    }


@router.post("/chat")
async def home_chat(
    request: HomeChatRequest,
    db: Session = Depends(get_db)
):
    """
    Main home chat endpoint
    Handles all chat requests with any model/agent combination
    """
    try:
        # For now, use a default user_id (we can add auth later)
        user_id = "default_user"
        
        # Build conversation history
        messages = []
        
        # Add system prompt - AGENT-SPECIFIC
        agent_prompts = {
            "aura": "You are Aura, a friendly and helpful AI assistant. You excel at general conversation, answering questions, and providing helpful information. Always respond in the user's language. Be warm, approachable, and natural in conversation.",
            
            "cora": "You are Cora, an expert code assistant and debugger. You specialize in programming, debugging, code review, and refactoring. You understand all programming languages and best practices. Always respond in the user's language. Be precise, technical, and helpful.",
            
            "lumi": "You are Lumi, a creative AI assistant specializing in design, writing, and creative ideas. You help with UI/UX design, creative writing, branding, and artistic concepts. Always respond in the user's language. Be imaginative, inspiring, and helpful.",
            
            "devra": "You are Devra, a deep reasoning and analysis specialist. You excel at complex problem-solving, logical analysis, research, and philosophical discussions. Always respond in the user's language. Be thorough, analytical, and insightful.",
            
            "smart_agent": "You are Smart Agent, an expert app builder. You create complete applications with best practices, proper architecture, and clean code. Always respond in the user's language. Be professional, thorough, and detail-oriented.",
            
            "super_agent": "You are Super Agent, the most powerful AI for complex projects. You handle enterprise-level applications, optimization, and deployment. Always respond in the user's language. Be professional, comprehensive, and expert-level.",
            
            "vibeai_agent": "You are VibeAI Agent, specializing in real-time full-stack project generation. You build complete applications with live streaming and comprehensive features. Always respond in the user's language. Be efficient, modern, and thorough.",
        }
        
        system_prompt = agent_prompts.get(request.agent, "You are VibeAI, a powerful multilingual AI assistant. Always respond in the user's language. Be helpful, clear, and natural.")
        
        # DEBUG
        print(f"🎭 Agent: {request.agent}")
        print(f"📝 System Prompt: {system_prompt[:100]}...")
        
        messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        # Add conversation history
        if request.conversation_history:
            messages.extend(request.conversation_history)
        
        # Add current message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Check if user wants to build an app
        if request.build_app:
            project_id = f"project_{int(datetime.now().timestamp())}"
            # User clicked START button - start building!
            asyncio.create_task(build_app_with_agent(request.agent, request.message, user_id, project_id))
            
            return HomeChatResponse(
                success=True,
                response="🚀 Starting app generation! I'll keep you updated via WebSocket.",
                model_used=request.model,
                agent_used=request.agent,
                timestamp=datetime.now(),
                metadata={"building": True, "project_id": project_id}
            )
        
        # Detect if user describes an app idea - stricter matching
        message_lower = request.message.lower()
        app_keywords = [
            "erstelle app", "erstelle eine app", "baue app", "baue eine app",
            "create app", "create an app", "build app", "build an app", 
            "make app", "make an app", "entwickle app"
        ]
        if any(keyword in message_lower for keyword in app_keywords):
            # Generate plan first, let user confirm with START button
            plan_response = ""
            async for chunk in call_model(request.model, messages + [
                {"role": "system", "content": "Generate a brief project plan. End with: 'Ready to start? Click the START button!'"}
            ], False):
                if chunk["type"] == "done":
                    plan_response = chunk["content"]
            
            return HomeChatResponse(
                success=True,
                response=plan_response,
                model_used=request.model,
                agent_used=request.agent,
                timestamp=datetime.now(),
                metadata={"ready_to_build": True, "requires_confirmation": True}
            )
        
        # Regular chat - call the actual AI model
        full_response = ""
        
        async for chunk in call_model(request.model, messages, request.stream):
            if chunk["type"] == "chunk":
                full_response += chunk["content"]
                # Broadcast chunk via WebSocket if connected
                await broadcast_to_user(user_id, {
                    "event": "chat.chunk",
                    "content": chunk["content"]
                })
            elif chunk["type"] == "done":
                full_response = chunk["content"]
        
        return HomeChatResponse(
            success=True,
            response=full_response,
            model_used=request.model,
            agent_used=request.agent,
            timestamp=datetime.now()
        )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Chat error: {str(e)}")


@router.websocket("/ws")
async def websocket_home_chat(
    websocket: WebSocket,
    token: Optional[str] = None
):
    """
    WebSocket endpoint for real-time chat updates
    """
    await websocket.accept()
    
    # TODO: Verify token and get user_id
    # For now, use a stable default user_id so broadcasts reach the client
    user_id = "default_user"
    
    if user_id not in active_connections:
        active_connections[user_id] = []
    
    active_connections[user_id].append(websocket)
    
    try:
        await websocket.send_json({
            "event": "connected",
            "message": "✅ Connected to VibeAI Home Chat"
        })
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Echo back for now
            await websocket.send_json({
                "event": "echo",
                "data": data
            })
    
    except WebSocketDisconnect:
        if user_id in active_connections:
            active_connections[user_id].remove(websocket)
        print(f"❌ WebSocket disconnected for user {user_id}")


@router.post("/chat/stream")
async def stream_home_chat(
    request: HomeChatRequest,
    db: Session = Depends(get_db)
):
    """
    Streaming chat endpoint using Server-Sent Events
    """
    async def generate():
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are VibeAI, a powerful AI assistant."
                }
            ]
            
            if request.conversation_history:
                messages.extend(request.conversation_history)
            
            messages.append({
                "role": "user",
                "content": request.message
            })
            
            async for chunk in call_model(request.model, messages, stream=True):
                if chunk["type"] == "chunk":
                    yield f"data: {json.dumps({'content': chunk['content']})}\n\n"
                elif chunk["type"] == "done":
                    yield f"data: {json.dumps({'done': True, 'content': chunk['content']})}\n\n"
        
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

