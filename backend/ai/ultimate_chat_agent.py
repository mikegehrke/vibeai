"""
Clean Ultimate Chat Agent without lint errors
"""
from typing import Optional, List, Dict
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel
import openai
import anthropic


class ChatMessage(BaseModel):
    id: str
    role: str  # user, assistant, system
    content: str
    timestamp: datetime
    attachments: Optional[List[Dict]] = []
    model_used: Optional[str] = None
    agent_type: Optional[str] = None


class ChatSession(BaseModel):
    id: str
    title: str
    messages: List[ChatMessage] = []
    model: str = "gpt-4"
    agent_type: str = "code_assistant"
    created_at: datetime
    updated_at: datetime


class FileAttachment(BaseModel):
    filename: str
    content_type: str
    size: int
    base64_content: str


class AgentCapability(BaseModel):
    name: str
    description: str
    icon: str
    supported_models: List[str]


class UltimateChatAgent:
    def __init__(self):
        # Initialize AI clients
        self.openai_client = None
        self.anthropic_client = None
        
        # Available models
        self.models = {
            "gpt-4": {
                "name": "GPT-4",
                "provider": "openai",
                "capabilities": ["text", "code", "analysis", "images"],
                "icon": "🧠"
            },
            "gpt-4-turbo": {
                "name": "GPT-4 Turbo",
                "provider": "openai",
                "capabilities": ["text", "code", "analysis", "images"],
                "icon": "⚡"
            },
            "claude-3-sonnet": {
                "name": "Claude 3 Sonnet",
                "provider": "anthropic",
                "capabilities": ["text", "code", "analysis", "reasoning"],
                "icon": "🎭"
            },
            "claude-3-opus": {
                "name": "Claude 3 Opus",
                "provider": "anthropic",
                "capabilities": ["text", "code", "analysis", "reasoning"],
                "icon": "🎨"
            }
        }
        
        # Available agents
        self.agents = {
            "code_assistant": AgentCapability(
                name="Code Assistant",
                description="Hilft beim Programmieren",
                icon="💻",
                supported_models=["gpt-4", "claude-3-sonnet"]
            ),
            "auto_coder": AgentCapability(
                name="Auto Coder",
                description="Automatische Code-Generierung",
                icon="🤖",
                supported_models=["gpt-4-turbo", "claude-3-sonnet"]
            )
        }
        
        # Active sessions
        self.sessions: Dict[str, ChatSession] = {}
        
        self._load_api_keys()
        
    def _load_api_keys(self):
        """Load API keys from environment or config"""
        try:
            import os
            openai_key = os.getenv("OPENAI_API_KEY")
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")
            
            if openai_key:
                self.openai_client = openai.AsyncOpenAI(api_key=openai_key)
                
            if anthropic_key:
                self.anthropic_client = anthropic.AsyncAnthropic(
                    api_key=anthropic_key
                )
                
        except Exception as e:
            print(f"Warning: Could not load API keys: {e}")
    
    async def create_session(
        self, 
        title: str = "New Chat", 
        model: str = "gpt-4", 
        agent_type: str = "code_assistant"
    ) -> ChatSession:
        """Create new chat session"""
        session_id = f"session_{datetime.now().timestamp()}"
        
        session = ChatSession(
            id=session_id,
            title=title,
            model=model,
            agent_type=agent_type,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.sessions[session_id] = session
        return session
    
    async def send_message(
        self, 
        session_id: str, 
        content: str, 
        attachments: Optional[List[FileAttachment]] = None
    ) -> ChatMessage:
        """Send message and get AI response"""
        
        if session_id not in self.sessions:
            raise HTTPException(
                status_code=404, 
                detail="Session not found"
            )
            
        session = self.sessions[session_id]
        
        # Create user message
        user_message = ChatMessage(
            id=f"msg_{datetime.now().timestamp()}",
            role="user",
            content=content,
            timestamp=datetime.now(),
            attachments=[att.dict() for att in (attachments or [])]
        )
        
        session.messages.append(user_message)
        
        # Get AI response
        response_content = await self._get_ai_response(
            session, content, attachments
        )
        
        # Create assistant message
        assistant_message = ChatMessage(
            id=f"msg_{datetime.now().timestamp() + 0.1}",
            role="assistant", 
            content=response_content,
            timestamp=datetime.now(),
            model_used=session.model,
            agent_type=session.agent_type
        )
        
        session.messages.append(assistant_message)
        session.updated_at = datetime.now()
        
        return assistant_message
    
    async def _get_ai_response(
        self, 
        session: ChatSession, 
        content: str, 
        attachments: Optional[List[FileAttachment]]
    ) -> str:
        """Get response from configured AI model"""
        
        model_config = self.models.get(session.model)
        if not model_config:
            return "❌ Model not configured"
        
        try:
            # Simple mock response for now
            return f"AI response for: {content}"
            
        except Exception as e:
            return f"❌ **Fehler:** {str(e)}"


# Global instance
ultimate_agent = UltimateChatAgent()