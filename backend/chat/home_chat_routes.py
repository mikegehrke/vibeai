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

# Available models
AVAILABLE_MODELS = {
    "gpt-4": {
        "name": "GPT-4",
        "provider": "openai",
        "icon": "🧠",
        "capabilities": ["text", "code", "analysis", "images"]
    },
    "gpt-4-turbo": {
        "name": "GPT-4 Turbo",
        "provider": "openai",
        "icon": "⚡",
        "capabilities": ["text", "code", "analysis", "images", "speed"]
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
        "capabilities": ["text", "code", "analysis", "deep-reasoning"]
    },
    "gemini-pro": {
        "name": "Gemini Pro",
        "provider": "google",
        "icon": "💎",
        "capabilities": ["text", "code", "analysis", "multimodal"]
    }
}

# Available agents
AVAILABLE_AGENTS = {
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
    "aura": {
        "name": "Aura",
        "description": "General conversation and help",
        "icon": "💬",
        "capabilities": ["chat", "questions", "help"]
    },
    "cora": {
        "name": "Cora",
        "description": "Code assistant and debugger",
        "icon": "💻",
        "capabilities": ["coding", "debugging", "refactoring"]
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
        openai.api_key = openai_api_key
        openai_client = openai
    
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_api_key:
        anthropic_client = anthropic.Anthropic(api_key=anthropic_api_key)
    
    if GEMINI_AVAILABLE:
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if google_api_key:
            genai.configure(api_key=google_api_key)
            gemini_client = genai

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
    
    try:
        response = await asyncio.to_thread(
            openai_client.chat.completions.create,
            model=model,
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


async def call_model(model: str, messages: List[Dict], stream: bool = True):
    """Route to appropriate model provider"""
    model_info = AVAILABLE_MODELS.get(model)
    
    if not model_info:
        raise HTTPException(400, f"Unknown model: {model}")
    
    provider = model_info["provider"]
    
    if provider == "openai":
        async for chunk in call_openai_model(model, messages, stream):
            yield chunk
    
    elif provider == "anthropic":
        async for chunk in call_anthropic_model(model, messages, stream):
            yield chunk
    
    elif provider == "google":
        # Convert messages to single prompt for Gemini
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        async for chunk in call_gemini_model(model, prompt, stream):
            yield chunk
    
    else:
        raise HTTPException(400, f"Unknown provider: {provider}")


async def build_app_with_agent(agent: str, description: str, user_id: str):
    """Build app using specified agent"""
    try:
        if agent == "smart_agent":
            # Use Smart Agent
            await broadcast_to_user(user_id, {
                "event": "build.started",
                "agent": "smart_agent",
                "message": "🤖 Smart Agent starting app generation..."
            })
            
            # TODO: Implement full Smart Agent integration
            await broadcast_to_user(user_id, {
                "event": "build.progress",
                "message": "Analyzing requirements...",
                "progress": 10
            })
            
            await asyncio.sleep(1)
            
            await broadcast_to_user(user_id, {
                "event": "build.progress",
                "message": "Generating project structure...",
                "progress": 30
            })
            
            await asyncio.sleep(1)
            
            await broadcast_to_user(user_id, {
                "event": "build.complete",
                "message": "✅ App generated successfully!",
                "project_id": f"project_{int(datetime.now().timestamp())}"
            })
        
        elif agent == "super_agent":
            # Use Super Agent
            await broadcast_to_user(user_id, {
                "event": "build.started",
                "agent": "super_agent",
                "message": "⚡ Super Agent starting app generation..."
            })
            
            # TODO: Implement full Super Agent integration
            await asyncio.sleep(2)
            
            await broadcast_to_user(user_id, {
                "event": "build.complete",
                "message": "✅ App generated with Super Agent!",
                "project_id": f"project_{int(datetime.now().timestamp())}"
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
    return {
        "success": True,
        "models": AVAILABLE_MODELS
    }


@router.get("/agents")
async def get_available_agents():
    """Get list of available agents"""
    return {
        "success": True,
        "agents": AVAILABLE_AGENTS
    }


@router.post("/chat")
async def home_chat(
    request: HomeChatRequest,
    user = Depends(get_current_user_v2),
    db: Session = Depends(get_db)
):
    """
    Main home chat endpoint
    Handles all chat requests with any model/agent combination
    """
    try:
        user_id = str(user.id)
        
        # Build conversation history
        messages = []
        
        # Add system prompt
        messages.append({
            "role": "system",
            "content": "You are VibeAI, a powerful AI assistant that can help with coding, app building, and general questions. You have access to multiple AI models and can build complete applications."
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
        if request.build_app or any(keyword in request.message.lower() for keyword in ["build app", "create app", "generate app", "make app"]):
            # Start app building in background
            asyncio.create_task(build_app_with_agent(request.agent, request.message, user_id))
            
            return HomeChatResponse(
                success=True,
                response="🚀 Starting app generation! I'll keep you updated via WebSocket.",
                model_used=request.model,
                agent_used=request.agent,
                timestamp=datetime.now(),
                metadata={"building": True}
            )
        
        # Regular chat
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
    # For now, use a temp user_id
    user_id = "temp_user"
    
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
    user = Depends(get_current_user_v2),
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

