"""
Ultimate Chat Agent with Advanced Features
- Multi-Model Support (OpenAI, Anthropic, Local) 
- File Upload/Download
- Automatic Code Generation & Fixing
- Agent Switching
- Image Generation
- Copy/Paste/Export Functions
"""

import os
import json
import base64
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
                "capabilities": ["text", "code", "analysis", "images",
                               "vision"],
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
                "capabilities": ["text", "code", "analysis", "reasoning", "creative"],
                "icon": "🎨"
            }
        }
        
        # Available agents
        self.agents = {
            "code_assistant": AgentCapability(
                name="Code Assistant",
                description="Hilft beim Programmieren, Debugging und Code-Review",
                icon="💻",
                supported_models=["gpt-4", "claude-3-sonnet"]
            ),
            "creative_writer": AgentCapability(
                name="Creative Writer", 
                description="Erstellt kreative Inhalte, Texte und Geschichten",
                icon="✍️",
                supported_models=["gpt-4", "claude-3-opus"]
            ),
            "data_analyst": AgentCapability(
                name="Data Analyst",
                description="Analysiert Daten und erstellt Visualisierungen", 
                icon="📊",
                supported_models=["gpt-4-turbo", "claude-3-sonnet"]
            ),
            "ui_designer": AgentCapability(
                name="UI Designer",
                description="Erstellt UI/UX Designs und Prototypen",
                icon="🎨",
                supported_models=["gpt-4", "claude-3-opus"]
            ),
            "project_manager": AgentCapability(
                name="Project Manager",
                description="Verwaltet Projekte und koordiniert Tasks",
                icon="📋",
                supported_models=["gpt-4", "claude-3-sonnet"]
            ),
            "auto_coder": AgentCapability(
                name="Auto Coder",
                description="Automatische Code-Generierung und -Reparatur",
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
            openai_key = os.getenv("OPENAI_API_KEY")
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")
            
            if openai_key:
                self.openai_client = openai.AsyncOpenAI(api_key=openai_key)
                
            if anthropic_key:
                self.anthropic_client = anthropic.AsyncAnthropic(api_key=anthropic_key)
                
        except Exception as e:
            print(f"Warning: Could not load API keys: {e}")
    
    async def create_session(self, title: str = "New Chat", model: str = "gpt-4", agent_type: str = "code_assistant") -> ChatSession:
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
        attachments: Optional[List[FileAttachment]] = None,
        auto_execute: bool = False
    ) -> ChatMessage:
        """Send message and get AI response"""
        
        if session_id not in self.sessions:
            raise HTTPException(status_code=404, detail="Session not found")
            
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
        response_content = await self._get_ai_response(session, content, attachments)
        
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
        
        # Auto-execute if requested
        if auto_execute and self._should_auto_execute(response_content):
            await self._auto_execute_code(session, response_content)
            
        return assistant_message
    
    async def _get_ai_response(self, session: ChatSession, content: str, attachments: Optional[List[FileAttachment]]) -> str:
        """Get response from configured AI model"""
        
        model_config = self.models.get(session.model)
        if not model_config:
            return "❌ Model not configured"
            
        agent_config = self.agents.get(session.agent_type)
        if not agent_config:
            return "❌ Agent type not found"
        
        # Build system prompt based on agent type
        system_prompt = self._build_system_prompt(agent_config)
        
        # Build conversation history
        messages = self._build_conversation_history(session, system_prompt)
        
        # Add current message with attachments
        user_content = content
        if attachments:
            user_content += f"\n\n[{len(attachments)} Datei(en) angehängt]"
            
        messages.append({"role": "user", "content": user_content})
        
        try:
            if model_config["provider"] == "openai":
                return await self._get_openai_response(session.model, messages)
            elif model_config["provider"] == "anthropic":
                return await self._get_anthropic_response(session.model, messages)
            else:
                return "❌ Provider not supported yet"
                
        except Exception as e:
            return f"❌ **Fehler:** {str(e)}\n\nFallback: Simulierte Antwort für '{content}'"
    
    def _build_system_prompt(self, agent_config: AgentCapability) -> str:
        """Build system prompt based on agent type"""
        
        base_prompt = f"""Du bist ein {agent_config.name} - {agent_config.description}.

**FÄHIGKEITEN:**
- Dateien erstellen, bearbeiten und verwalten
- Code automatisch generieren und reparieren  
- Projekte vollständig aufbauen
- Fehler automatisch beheben
- Bilder analysieren und generieren
- Workflows automatisieren

**VERHALTEN:**
- Antworte präzise und hilfreich
- Führe Tasks automatisch aus wenn möglich
- Erstelle funktionierenden Code
- Behebe Fehler proaktiv
- Erkläre deine Schritte

**TOOLS VERFÜGBAR:**
- File Operations (create, edit, delete)
- Code Execution & Debugging
- Image Processing & Generation  
- Project Management
- API Integrations
- Build & Deploy Automation
"""

        agent_specific = {
            "code_assistant": """
**SPEZIALISIERUNG:**
- Vollautomatische Code-Generierung
- Intelligente Fehlerkorrektur
- Performance-Optimierung
- Testing & Debugging
- Dokumentation erstellen
""",
            "auto_coder": """
**SPEZIALISIERUNG:**
- Komplett autonome Code-Entwicklung
- Automatische Projekt-Erstellung
- KI-gesteuerte Architektur-Entscheidungen
- Self-Healing Code
- Zero-Manual-Intervention Development
""",
            "creative_writer": """
**SPEZIALISIERUNG:**
- Kreative Inhalte generieren
- Storytelling & Narrative
- Marketing-Texte erstellen
- Blog-Posts & Artikel
- Copywriting & Content Strategy
""",
            "data_analyst": """
**SPEZIALISIERUNG:**
- Datenanalyse & Visualisierung
- Machine Learning Modelle
- Statistische Auswertungen
- Dashboard-Erstellung
- Predictive Analytics
""",
            "ui_designer": """
**SPEZIALISIERUNG:**
- UI/UX Design & Prototyping
- Responsive Web Design
- Mobile App Interfaces
- Design Systems erstellen
- User Experience Optimization
""",
            "project_manager": """
**SPEZIALISIERUNG:**
- Projekt-Planung & Koordination
- Team-Management & Communication
- Timeline & Milestone Tracking
- Risk Assessment & Mitigation
- Quality Assurance & Delivery
"""
        }
        
        return base_prompt + agent_specific.get(agent_config.name.lower().replace(" ", "_"), "")
    
    def _build_conversation_history(self, session: ChatSession, system_prompt: str) -> List[Dict]:
        """Build conversation history for AI model"""
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add recent messages (keep last 10 for context)
        recent_messages = session.messages[-10:] if len(session.messages) > 10 else session.messages
        
        for msg in recent_messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
            
        return messages
    
    async def _get_openai_response(self, model: str, messages: List[Dict]) -> str:
        """Get response from OpenAI"""
        if not self.openai_client:
            return "❌ OpenAI client not configured"
            
        response = await self.openai_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=2000,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    async def _get_anthropic_response(self, model: str, messages: List[Dict]) -> str:
        """Get response from Anthropic"""
        if not self.anthropic_client:
            return "❌ Anthropic client not configured"
            
        # Separate system message from conversation
        system_message = ""
        conversation_messages = []
        
        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                conversation_messages.append(msg)
        
        response = await self.anthropic_client.messages.create(
            model=model.replace("claude-3-", "claude-3-"),
            max_tokens=2000,
            system=system_message,
            messages=conversation_messages
        )
        
        return response.content[0].text
    
    def _should_auto_execute(self, content: str) -> bool:
        """Check if response contains executable code"""
        keywords = ["```", "def ", "class ", "import ", "from ", "async def"]
        return any(keyword in content for keyword in keywords)
    
    async def _auto_execute_code(self, session: ChatSession, content: str) -> None:
        """Automatically execute code if safe"""
        # Implementation for code execution
        pass
    
    async def upload_file(self, session_id: str, file_data: bytes, filename: str, content_type: str) -> FileAttachment:
        """Upload and process file"""
        
        # Convert to base64 for storage
        base64_content = base64.b64encode(file_data).decode('utf-8')
        
        attachment = FileAttachment(
            filename=filename,
            content_type=content_type,
            size=len(file_data),
            base64_content=base64_content
        )
        
        return attachment
    
    async def generate_image(self, prompt: str, style: str = "realistic") -> str:
        """Generate image using AI"""
        if not self.openai_client:
            return "❌ Image generation not available"
            
        # Use DALL-E 3 for image generation
        response = await self.openai_client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        
        return response.data[0].url
    
    async def switch_model(self, session_id: str, new_model: str) -> bool:
        """Switch AI model for session"""
        if session_id not in self.sessions:
            return False
            
        if new_model not in self.models:
            return False
            
        self.sessions[session_id].model = new_model
        return True
    
    async def switch_agent(self, session_id: str, new_agent: str) -> bool:
        """Switch agent type for session"""
        if session_id not in self.sessions:
            return False
            
        if new_agent not in self.agents:
            return False
            
        self.sessions[session_id].agent_type = new_agent
        return True
    
    def export_chat(self, session_id: str, format: str = "markdown") -> str:
        """Export chat session"""
        if session_id not in self.sessions:
            return ""
            
        session = self.sessions[session_id]
        
        if format == "markdown":
            export_content = f"# {session.title}\n\n"
            export_content += f"**Model:** {session.model}\n"
            export_content += f"**Agent:** {session.agent_type}\n"
            export_content += f"**Created:** {session.created_at}\n\n"
            
            for msg in session.messages:
                role_icon = "👤" if msg.role == "user" else "🤖"
                export_content += f"## {role_icon} {msg.role.title()}\n\n"
                export_content += f"{msg.content}\n\n"
                export_content += f"*{msg.timestamp}*\n\n---\n\n"
                
            return export_content
            
        return json.dumps([msg.dict() for msg in session.messages], indent=2)
    
    def get_available_models(self) -> Dict:
        """Get list of available AI models"""
        return self.models
    
    def get_available_agents(self) -> Dict:
        """Get list of available agent types"""
        return {name: agent.dict() for name, agent in self.agents.items()}
    
    def get_session_stats(self, session_id: str) -> Dict:
        """Get session statistics"""
        if session_id not in self.sessions:
            return {}
            
        session = self.sessions[session_id]
        
        return {
            "message_count": len(session.messages),
            "user_messages": len([m for m in session.messages if m.role == "user"]),
            "assistant_messages": len([m for m in session.messages if m.role == "assistant"]),
            "session_duration": (datetime.now() - session.created_at).total_seconds(),
            "last_activity": session.updated_at,
            "current_model": session.model,
            "current_agent": session.agent_type
        }

# Global instance
ultimate_agent = UltimateChatAgent()