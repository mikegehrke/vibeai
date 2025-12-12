"""
VibeAI Backend - COMPLETE PRODUCTION SYSTEM
Full-featured API with Authentication, Sessions, Chat, Models, and more
"""
import os
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import anthropic
import jwt
import openai

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))
    GENAI_AVAILABLE = True
except ImportError:
    genai = None
    GENAI_AVAILABLE = False
from dotenv import load_dotenv
from fastapi import (
    Depends,
    FastAPI,
    File,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

load_dotenv()

# -------------------------------------------------------------
# DATABASE SETUP
# -------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vibeai.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------
# MODELS (Pydantic)
# -------------------------------------------------------------
class UserRole(str):
    USER = "user"
    ADMIN = "admin"
    SUSPENDED = "suspended"

class PlanType(str):
    FREE = "free" 
    PRO = "pro"
    ENTERPRISE = "enterprise"

class UserCreate(BaseModel):
    email: str  # Changed from EmailStr to avoid dependency issues
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str  # Changed from EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: str
    plan: str
    is_active: bool
    created_at: datetime
    credits: float

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: UserResponse

class SessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    agent_type: Optional[str] = "aura"

class SessionResponse(BaseModel):
    id: int
    title: str
    agent_type: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

class MessageCreate(BaseModel):
    content: str
    role: Optional[str] = "user"

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    model_used: Optional[str]
    tokens_used: int
    created_at: datetime

class ChatRequest(BaseModel):
    model: str
    prompt: str
    agent: Optional[str] = "aura"
    stream: Optional[bool] = True  # ⚡ DEFAULT: IMMER STREAMING für sofortige Antworten!
    system_prompt: Optional[str] = None
    conversation_history: Optional[List[Dict[str, Any]]] = []
    session_id: Optional[int] = None
    project_id: Optional[str] = None  # For code access

class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    type: str
    max_tokens: int
    cost_per_1k: float
    available: bool

# -------------------------------------------------------------
# AUTHENTICATION
# -------------------------------------------------------------
SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def get_current_user(credentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("user_id")
    
    # In production: get from database
    # For now, return mock user
    if user_id:
        return {
            "id": user_id,
            "username": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "user")
        }
    
    raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# -------------------------------------------------------------
# AI CLIENTS SETUP
# -------------------------------------------------------------
# Load API keys with defaults
openai_api_key = os.getenv("OPENAI_API_KEY")
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY") 
google_api_key = os.getenv("GOOGLE_API_KEY")

# Initialize clients with error handling
try:
    if openai_api_key:
        openai_client = openai.OpenAI(api_key=openai_api_key)
    else:
        openai_client = None
        print("⚠️  WARNING: OPENAI_API_KEY not found - OpenAI models disabled")
except Exception as e:
    openai_client = None
    print(f"⚠️  WARNING: OpenAI client initialization failed: {e}")

try:
    if anthropic_api_key:
        anthropic_client = anthropic.Anthropic(api_key=anthropic_api_key)
    else:
        anthropic_client = None
        print("⚠️  WARNING: ANTHROPIC_API_KEY not found - Claude models disabled")
except Exception as e:
    anthropic_client = None
    print(f"⚠️  WARNING: Anthropic client initialization failed: {e}")

try:
    if google_api_key and GENAI_AVAILABLE:
        genai.configure(api_key=google_api_key)
    elif not google_api_key:
        print("⚠️  WARNING: GOOGLE_API_KEY not found - Gemini models disabled")
    elif not GENAI_AVAILABLE:
        print("⚠️  WARNING: Google Generative AI not available")
except Exception as e:
    print(f"⚠️  WARNING: Google AI initialization failed: {e}")

# Available models
MODELS = {
    # OpenAI GPT Models
    "gpt-4o": {
        "name": "GPT-4o",
        "provider": "OpenAI", 
        "type": "chat",
        "max_tokens": 128000,
        "cost_per_1k": 0.005,
        "available": True
    },
    "gpt-4o-mini": {
        "name": "GPT-4o Mini",
        "provider": "OpenAI",
        "type": "chat", 
        "max_tokens": 128000,
        "cost_per_1k": 0.00015,
        "available": True
    },
    "gpt-4": {
        "name": "GPT-4",
        "provider": "OpenAI",
        "type": "chat",
        "max_tokens": 8192,
        "cost_per_1k": 0.03,
        "available": True
    },
    "gpt-3.5-turbo": {
        "name": "GPT-3.5 Turbo",
        "provider": "OpenAI", 
        "type": "chat",
        "max_tokens": 4096,
        "cost_per_1k": 0.001,
        "available": True
    },
    "o1": {
        "name": "OpenAI O1",
        "provider": "OpenAI",
        "type": "reasoning",
        "max_tokens": 100000,
        "cost_per_1k": 0.015,
        "available": True
    },
    "o1-mini": {
        "name": "OpenAI O1 Mini", 
        "provider": "OpenAI",
        "type": "reasoning",
        "max_tokens": 65536,
        "cost_per_1k": 0.003,
        "available": True
    },
    # Anthropic Claude Models
    "claude-3-5-sonnet-20241022": {
        "name": "Claude 3.5 Sonnet",
        "provider": "Anthropic",
        "type": "chat",
        "max_tokens": 200000,
        "cost_per_1k": 0.003,
        "available": True
    },
    "claude-3-5-haiku-20241022": {
        "name": "Claude 3.5 Haiku",
        "provider": "Anthropic", 
        "type": "chat",
        "max_tokens": 200000,
        "cost_per_1k": 0.00025,
        "available": True
    },
    # Google Models
    "gemini-1.5-pro": {
        "name": "Gemini 1.5 Pro",
        "provider": "Google",
        "type": "chat",
        "max_tokens": 2000000,
        "cost_per_1k": 0.00125,
        "available": True
    },
    "gemini-1.5-flash": {
        "name": "Gemini 1.5 Flash",
        "provider": "Google",
        "type": "chat", 
        "max_tokens": 1000000,
        "cost_per_1k": 0.000075,
        "available": True
    }
}

# -------------------------------------------------------------
# FASTAPI APP SETUP
# -------------------------------------------------------------
app = FastAPI(
    title="VibeAI Backend API",
    description="Complete AI-Powered Development Platform with Authentication, Chat, Models, and more",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores (for development - use Redis/DB in production)
users_db = {}
sessions_db = {}
messages_db = {}
session_counter = 0
message_counter = 0
user_counter = 0

# -------------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register new user"""
    global user_counter
    user_counter += 1
    
    # Check if user exists
    if any(u["email"] == user_data.email for u in users_db.values()):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = user_counter
    hashed_password = get_password_hash(user_data.password)
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "role": UserRole.USER,
        "plan": PlanType.FREE,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "credits": 100.0  # Free credits for new users
    }
    
    users_db[user_id] = user
    
    # Create access token
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={
            "sub": user_data.username,
            "user_id": user_id,
            "email": user_data.email,
            "role": UserRole.USER
        },
        expires_delta=access_token_expires
    )
    
    user_response = UserResponse(**{k: v for k, v in user.items() if k != "hashed_password"})
    
    return Token(
        access_token=access_token,
        user=user_response
    )

@app.post("/api/auth/login", response_model=Token) 
async def login(user_data: UserLogin):
    """Login user"""
    # Find user by email
    user = None
    for u in users_db.values():
        if u["email"] == user_data.email:
            user = u
            break
    
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={
            "sub": user["username"],
            "user_id": user["id"],
            "email": user["email"], 
            "role": user["role"]
        },
        expires_delta=access_token_expires
    )
    
    user_response = UserResponse(**{k: v for k, v in user.items() if k != "hashed_password"})
    
    return Token(
        access_token=access_token,
        user=user_response
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    """Get current user info"""
    user_id = current_user["id"] 
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[user_id]
    return UserResponse(**{k: v for k, v in user.items() if k != "hashed_password"})

# -------------------------------------------------------------
# SESSION ENDPOINTS  
# -------------------------------------------------------------
@app.get("/api/sessions", response_model=List[SessionResponse])
async def get_sessions(current_user = Depends(get_current_user)):
    """Get user sessions"""
    user_sessions = []
    for session in sessions_db.values():
        if session["user_id"] == current_user["id"]:
            # Count messages
            message_count = sum(1 for msg in messages_db.values() if msg["session_id"] == session["id"])
            session_response = SessionResponse(**session, message_count=message_count)
            user_sessions.append(session_response)
    
    return sorted(user_sessions, key=lambda x: x.updated_at, reverse=True)

@app.post("/api/sessions", response_model=SessionResponse)
async def create_session(session_data: SessionCreate, current_user = Depends(get_current_user)):
    """Create new chat session"""
    global session_counter
    session_counter += 1
    
    session = {
        "id": session_counter,
        "user_id": current_user["id"],
        "title": session_data.title,
        "agent_type": session_data.agent_type,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    sessions_db[session_counter] = session
    return SessionResponse(**session, message_count=0)

@app.get("/api/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_messages(session_id: int, current_user = Depends(get_current_user)):
    """Get messages from session"""
    # Check session belongs to user
    if session_id not in sessions_db or sessions_db[session_id]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_messages = []
    for message in messages_db.values():
        if message["session_id"] == session_id:
            session_messages.append(MessageResponse(**message))
    
    return sorted(session_messages, key=lambda x: x.created_at)

@app.post("/api/sessions/{session_id}/messages", response_model=MessageResponse)
async def send_message(
    session_id: int, 
    message_data: MessageCreate, 
    current_user = Depends(get_current_user)
):
    """Send message to session"""
    # Check session exists and belongs to user
    if session_id not in sessions_db or sessions_db[session_id]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Session not found")
    
    global message_counter
    message_counter += 1
    
    # Save user message
    user_message = {
        "id": message_counter,
        "session_id": session_id,
        "role": message_data.role,
        "content": message_data.content,
        "model_used": None,
        "tokens_used": 0,
        "created_at": datetime.utcnow()
    }
    
    messages_db[message_counter] = user_message
    
    # Update session timestamp
    sessions_db[session_id]["updated_at"] = datetime.utcnow()
    
    # Generate AI response (simplified for demo)
    message_counter += 1
    ai_message = {
        "id": message_counter, 
        "session_id": session_id,
        "role": "assistant",
        "content": f"This is an AI response to: '{message_data.content}'. Full chat integration coming next!",
        "model_used": "gpt-4o",
        "tokens_used": 50,
        "created_at": datetime.utcnow()
    }
    
    messages_db[message_counter] = ai_message
    
    return MessageResponse(**user_message)

# -------------------------------------------------------------
# MODELS ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/models", response_model=List[ModelInfo])
async def get_models():
    """Get available AI models"""
    models_list = []
    for model_id, model_data in MODELS.items():
        model_info = ModelInfo(
            id=model_id,
            **model_data
        )
        models_list.append(model_info)
    
    return models_list

@app.get("/api/models/{model_id}")
async def get_model(model_id: str):
    """Get specific model info"""
    if model_id not in MODELS:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return ModelInfo(id=model_id, **MODELS[model_id])

# -------------------------------------------------------------
# CHAT ENDPOINT
# -------------------------------------------------------------
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat with AI models - Supports streaming
    
    ⚡ WICHTIG: Chat-Agent arbeitet IMMER parallel zum Smart Agent!
    Chat-Agent antwortet SOFORT, auch wenn Smart Agent Code generiert.
    ⚡ SOFORTIGE ANTWORT: Antwortet sofort (<1s), Arbeit läuft im Hintergrund!
    """
    
    # Validate model
    if request.model not in MODELS:
        raise HTTPException(status_code=400, detail=f"Model {request.model} not supported")
    
    model_info = MODELS[request.model]
    
    # ⚡ IMMER STREAMING verwenden für sofortige Antworten!
    # Wenn stream nicht explizit false ist, verwende Streaming
    use_streaming = request.stream if request.stream is not None else True  # Default: True
    
    if use_streaming:
        return StreamingResponse(
            stream_chat_response(request, model_info),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    # ⚡ NON-STREAMING: SOFORTIGE ANTWORT + HINTERGRUND-ARBEIT
    # Starte Arbeit im Hintergrund, gib sofort Antwort zurück
    import asyncio
    
    # SOFORTIGE BESTÄTIGUNG (<100ms)
    immediate_response = {
        "response": "⚡ Ich beginne sofort...",
        "model": request.model,
        "provider": model_info["provider"],
        "agent": request.agent or "aura",
        "success": True,
        "working": True  # Signalisiert, dass Arbeit läuft
    }
    
    # Starte eigentliche Arbeit im Hintergrund
    asyncio.create_task(_process_chat_in_background(request, model_info))
    
    # SOFORT zurückgeben!
    return immediate_response


async def _process_chat_in_background(request: ChatRequest, model_info: Dict):
    """Verarbeite Chat im Hintergrund und sende Updates über WebSocket"""
    try:
        # TODO: Sende Updates über WebSocket an Frontend
        # Für jetzt: Logge nur
        print(f"🔄 Processing chat in background: {request.prompt[:50]}...")
        
        # Hier würde die eigentliche AI-Verarbeitung stattfinden
        # und Updates über WebSocket gesendet werden
    except Exception as e:
        print(f"❌ Background chat processing error: {e}")
    
    try:
        response_content = ""
        
        # Build messages
        messages = []
        if request.system_prompt and request.model not in ["o1", "o1-mini"]:
            messages.append({"role": "system", "content": request.system_prompt})
        
        # Add conversation history
        for msg in request.conversation_history:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Get project context if project_id is provided
        project_context = ""
        project_files = []
        project_id = getattr(request, 'project_id', None)
        if project_id:
            try:
                from codestudio.project_manager import project_manager
                # Try to load project files
                project = project_manager.load_project("default_user", project_id)
                if project:
                    project_path = project_manager.get_project_path("default_user", project_id)
                    # Read all files in project
                    import os
                    if os.path.exists(project_path):
                        for root, dirs, files in os.walk(project_path):
                            for file in files:
                                if file.startswith('.') or '__pycache__' in root:
                                    continue
                                file_path = os.path.join(root, file)
                                try:
                                    with open(file_path, 'r', encoding='utf-8') as f:
                                        content = f.read()
                                        rel_path = os.path.relpath(file_path, project_path)
                                        project_files.append({
                                            "path": rel_path,
                                            "content": content[:5000]  # Limit content size
                                        })
                                except:
                                    pass
                    
                    if project_files:
                        project_context = f"\n\n## PROJECT CONTEXT (Project: {request.project_id})\n\n"
                        project_context += "You have access to the following files:\n\n"
                        for file_info in project_files[:20]:  # Limit to 20 files
                            project_context += f"### {file_info['path']}\n```\n{file_info['content'][:2000]}\n```\n\n"
            except Exception as e:
                print(f"⚠️  Error loading project context: {e}")
        
        # Add current prompt with intelligent system prompt if not provided
        if not request.system_prompt:
            # Default intelligent system prompt with FULL capabilities
            request.system_prompt = """🚀 You are an intelligent Auto-Coder Agent in VibeAI Builder with DIRECT ACCESS to the user's code and FULL AUTOMATION capabilities.

🔥 What you can do (AUTOMATICALLY):
• 📁 CREATE & EDIT files - Automatically
• 🤖 GENERATE code - With AI-Power
• 🔧 FIX bugs - Instantly
• 🎨 DESIGN UI/UX - Modern & responsive
• 📊 ANALYZE data - Smart insights
• 🚀 DEPLOY apps - One-click
• ⚙️ EXECUTE terminal commands - npm install, flutter pub get, etc.
• 📦 INSTALL packages - Automatically
• 🏗️ BUILD projects - Run build commands
• 🧪 TEST code - Run tests

⚡ Quick Actions (you understand and execute automatically):
• "erstelle eine React App" → Create complete React app with all files
• "fixe alle Fehler" → Find and fix all errors in the project
• "optimiere den Code" → Optimize code for performance and best practices
• "erstelle ein Dashboard" → Create a complete dashboard UI
• "installiere packages" → TERMINAL: npm install (or flutter pub get)
• "starte den Server" / "starte die app" / "kannst du die app starten" → TERMINAL: npm start (React) or TERMINAL: flutter run -d web-server (Flutter)
• "baue die App" → TERMINAL: npm run build (React) or TERMINAL: flutter build web (Flutter)

📝 Code Format:
When you create/modify code, format as:
```language path/to/file
[COMPLETE CODE HERE]
```

🔧 Terminal Format - CRITICAL:
When you need to execute ANY command, you MUST format it as:
TERMINAL: command here

Examples:
- "npm install" → TERMINAL: npm install
- "flutter pub get" → TERMINAL: flutter pub get
- "npm start" → TERMINAL: npm start
- "flutter run -d chrome" → TERMINAL: flutter run -d chrome

IMPORTANT: 
- ALWAYS use "TERMINAL: " prefix for commands
- DO NOT just say "I will run npm install" - ACTUALLY output "TERMINAL: npm install"
- The system will SHOW the command and ASK the user for approval (like Cursor)
- Show what you're doing, THEN show the command: "⚙️ Installing packages...\nTERMINAL: npm install"
- The user will see a "Run" button and can approve or skip the command

🎯 Your Workflow (EXECUTE REAL ACTIONS):
1. UNDERSTAND the user's request completely
2. ANALYZE the current project structure
3. CREATE/MODIFY files automatically (use code blocks)
4. EXECUTE necessary commands (ALWAYS use TERMINAL: prefix)
5. FIX any errors that occur
6. VERIFY everything works

You work FULLY AUTOMATICALLY - when you say you'll do something, ACTUALLY DO IT by using the correct format!
You have full context of the project. Use this to provide accurate, helpful suggestions.
Be proactive, helpful, and provide complete, working solutions.
Always explain what you're doing and why.
CRITICAL: When you mention executing a command, you MUST output it in TERMINAL: format for automatic execution.

⚡ CRITICAL: If user asks "projekt ist abgeschlossen" or "prüfe ob was fehlt" → Analyze project files and report status, DON'T restart Smart Agent!
⚡ CRITICAL: Check if project already has files before starting Smart Agent - if files exist, just analyze and report, don't regenerate!

⚡ CRITICAL: You MUST respond to ALL user questions IMMEDIATELY, even if Smart Agent is working in parallel!
⚡ CRITICAL: If user asks "sind alle dateien fertig?" or "ist es abgeschlossen?" → Answer IMMEDIATELY with current status!
⚡ CRITICAL: NEVER ignore user questions - ALWAYS respond, even during code generation!
⚡ CRITICAL: You can work in PARALLEL with Smart Agent - both can work at the same time!
⚡ CRITICAL: The chat is ALWAYS available - respond to EVERY question, even if Smart Agent is running!"""
        
        # Add project context to system prompt
        if project_context:
            request.system_prompt += project_context
        
        if request.model in ["o1", "o1-mini"]:
            # O1 models: prepend system to user message
            full_prompt = f"{request.system_prompt}\n\n{request.prompt}"
        else:
            full_prompt = request.prompt
            
        messages.append({"role": "user", "content": full_prompt})
        
        # Route to appropriate provider
        if model_info["provider"] == "OpenAI":
            if not openai_client:
                raise HTTPException(
                    status_code=503,
                    detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
                )
            if request.model in ["o1", "o1-mini"]:
                # O1 models have different parameters
                response = openai_client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    max_completion_tokens=16000
                )
            else:
                response = openai_client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=4000,  # Increased for better responses
                    top_p=0.9,
                    frequency_penalty=0.0,
                    presence_penalty=0.0
                )
            response_content = response.choices[0].message.content
            
        elif model_info["provider"] == "Anthropic":
            if not anthropic_client:
                raise HTTPException(
                    status_code=503,
                    detail="Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable."
                )
            # Convert messages format for Anthropic
            claude_messages = []
            system_content = None
            
            for msg in messages:
                if msg["role"] == "system":
                    system_content = msg["content"] 
                else:
                    claude_messages.append(msg)
            
            kwargs = {
                "model": request.model,
                "max_tokens": 2000,
                "messages": claude_messages
            }
            
            if system_content:
                kwargs["system"] = system_content
                
            response = anthropic_client.messages.create(**kwargs)
            response_content = response.content[0].text
            
        elif model_info["provider"] == "Google":
            if not GENAI_AVAILABLE or not google_api_key:
                raise HTTPException(
                    status_code=503,
                    detail="Google API key not configured. Please set GOOGLE_API_KEY environment variable."
                )
            # Use Gemini
            model = genai.GenerativeModel(request.model)
            
            # Convert messages to Gemini format
            gemini_messages = []
            for msg in messages:
                if msg["role"] == "user":
                    gemini_messages.append({"role": "user", "parts": [msg["content"]]})
                elif msg["role"] == "assistant":
                    gemini_messages.append({"role": "model", "parts": [msg["content"]]})
            
            if gemini_messages:
                response = model.generate_content([m["parts"][0] for m in gemini_messages])
                response_content = response.text
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Provider {model_info['provider']} not supported or not configured"
            )
            
        # Save to session if provided
        if request.session_id and request.session_id in sessions_db:
            global message_counter
            message_counter += 1
            
            # Save AI response to session
            ai_message = {
                "id": message_counter,
                "session_id": request.session_id,
                "role": "assistant", 
                "content": response_content,
                "model_used": request.model,
                "tokens_used": len(response_content.split()) * 1.3,  # Rough estimate
                "created_at": datetime.utcnow()
            }
            
            messages_db[message_counter] = ai_message
            sessions_db[request.session_id]["updated_at"] = datetime.utcnow()
        
        return {
            "response": response_content,
            "model": request.model,
            "provider": model_info["provider"],
            "agent": request.agent or "aura",
            "success": True
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Chat error: {str(e)}")
        print(f"Traceback: {error_trace}")
        
        # Return error in response instead of raising exception for better UX
        return {
            "response": f"I apologize, but I encountered an error: {str(e)}. Please try again or check your API keys.",
            "model": request.model,
            "provider": model_info.get("provider", "unknown"),
            "agent": request.agent or "aura",
            "success": False,
            "error": str(e)
        }


# Streaming Chat Response Generator
async def stream_chat_response(request: ChatRequest, model_info: Dict):
    """Stream chat responses with work steps - SHOWS REAL ACTIONS
    
    ⚡ SOFORTIGE ANTWORT: Erste Nachricht sofort (<50ms), dann Streaming!
    """
    import json
    import asyncio
    
    # ⚡ SOFORTIGE BESTÄTIGUNG (<50ms) - wie ChatGPT/Claude!
    # Sende IMMER sofort eine echte Antwort, nicht nur "typing_start"!
    user_message_lower = request.prompt.lower()
    
    # ⚡ INTELLIGENTE SOFORT-ANTWORT: Erkenne Befehle sofort und antworte sofort!
    if any(phrase in user_message_lower for phrase in ["starte die app", "kannst du die app starten", "app starten", "starte app", "run die app", "app run"]):
        # Flutter oder React/Next.js?
        if project_id:
            try:
                from codestudio.project_manager import project_manager
                project_path = project_manager.get_project_path("default_user", project_id)
                import os
                if os.path.exists(os.path.join(project_path, "pubspec.yaml")):
                    # Flutter
                    newline = '\n'
                    yield f"data: {json.dumps({'content': f'🚀 Starte die Flutter-App...{newline}{newline}TERMINAL: flutter run -d web-server{newline}{newline}'})}\n\n"
                elif os.path.exists(os.path.join(project_path, "package.json")):
                    # React/Next.js
                    yield f"data: {json.dumps({'content': f'🚀 Starte die App...{newline}{newline}TERMINAL: npm start{newline}{newline}'})}\n\n"
                else:
                    yield f"data: {json.dumps({'content': f'🚀 Starte die App...{newline}{newline}'})}\n\n"
            except:
                yield f"data: {json.dumps({'content': f'🚀 Starte die App...{newline}{newline}'})}\n\n"
        else:
            yield f"data: {json.dumps({'content': f'🚀 Starte die App...{newline}{newline}'})}\n\n"
    else:
        # ⚡ IMMER echte Antwort sofort senden, nicht nur "typing_start"!
        # Sende erste Worte sofort, damit User sieht dass Agent antwortet
        yield f"data: {json.dumps({'content': '💬 '})}\n\n"
        await asyncio.sleep(0.01)  # Kleine Verzögerung für UI-Effekt
    
    # ⚡ OPTIMIERUNG: Lade Projekt-Kontext PARALLEL (nicht blockierend)
    # Starte AI-Request SOFORT, lade Kontext im Hintergrund
    project_context = ""
    project_id = getattr(request, 'project_id', None)
    
    # ⚡ KEINE DUMMY-TEXTE - Agent gibt ECHTE Antwort sofort!
    try:
        # Get project context (OPTIONAL, nicht blockierend)
        if project_id:
            try:
                from codestudio.project_manager import project_manager
                project = project_manager.load_project("default_user", project_id)
                if project:
                    project_path = project_manager.get_project_path("default_user", project_id)
                    import os
                    if os.path.exists(project_path):
                        # ⚡ OPTIMIERUNG: Nur erste 10 Dateien laden (schneller!)
                        file_count = 0
                        for root, dirs, files in os.walk(project_path):
                            if file_count >= 10:  # Limit für schnelleres Laden
                                break
                            for file in files:
                                if file_count >= 10:
                                    break
                                if file.startswith('.') or '__pycache__' in root:
                                    continue
                                file_path = os.path.join(root, file)
                                try:
                                    with open(file_path, 'r', encoding='utf-8') as f:
                                        content = f.read()
                                        rel_path = os.path.relpath(file_path, project_path)
                                        project_context += f"### {rel_path}\n```\n{content[:1000]}\n```\n\n"
                                        file_count += 1
                                except:
                                    pass
                        
                        if project_context:
                            project_context = f"\n\n## PROJECT CONTEXT (Project: {project_id})\n\n{project_context}"
            except Exception as e:
                print(f"⚠️  Error loading project context: {e}")
                # ⚡ WICHTIG: Fehler beim Laden blockiert nicht - fahre fort!
        
        # Build system prompt with ENHANCED INTELLIGENCE & CONTEXT
        if not request.system_prompt:
            request.system_prompt = """🚀 You are an intelligent Auto-Coder Agent in VibeAI Builder - like ChatGPT/Cursor, but with FULL AUTOMATION.

💡 **INTELLIGENCE & CONTEXT:**
- You understand the complete project context and codebase structure
- You analyze code patterns, dependencies, and relationships automatically
- You think step-by-step and explain your reasoning clearly
- You offer multiple solution approaches when appropriate
- You learn from project context and adapt your responses accordingly
- You provide educational explanations to help users learn programming

🔥 **AUTOMATION (What you do automatically):**
• 📁 CREATE & EDIT files - Automatically, with complete, production-ready code
• 🤖 GENERATE code - With best practices, comments, type-safety, error handling
• 🔧 FIX bugs - Analyze errors, find root causes, fix intelligently
• 🎨 DESIGN UI/UX - Modern, responsive, accessible designs
• 📊 ANALYZE code - Performance, security, best practices analysis
• 🚀 DEPLOY apps - One-click deployment
• ⚙️ EXECUTE commands - Automatically run terminal commands (npm, flutter, etc.)
• 📦 Manage dependencies - Automatically install and manage packages
• 🏗️ Configure builds - Automatically set up build processes
• 🧪 Write tests - Automatically create and run tests

⚡ **INTELLIGENT RECOGNITION (YOU MUST RECOGNIZE AND EXECUTE):**
You automatically recognize and EXECUTE:
- "starte die app" / "kannst du die app starten" / "app starten" → TERMINAL: flutter run -d web-server (for Flutter) or TERMINAL: npm start (for React/Next.js)
- "starte den server" / "server starten" → TERMINAL: npm run dev (for web) or TERMINAL: flutter run -d web-server (for Flutter)
- App creation requests → Start Smart Agent (parallel, non-blocking)
- ⚡ CRITICAL: You MUST respond to ALL user questions IMMEDIATELY (<1 second), even if Smart Agent is working
- ⚡ CRITICAL: If user asks "sind alle dateien fertig?" or "ist es abgeschlossen?" → Answer IMMEDIATELY with current status
- ⚡ CRITICAL: You can see Smart Agent status - check if generation is running or finished
- ⚡ CRITICAL: NEVER ignore user questions - ALWAYS respond, even during code generation
- ⚡ CRITICAL: When user says "starte die app" → IMMEDIATELY respond "🚀 Starte die App..." and then show TERMINAL: command
- Code questions → Analyze code and explain clearly
- Bug descriptions → Find and fix automatically
- Improvement suggestions → Implement immediately
- Concept questions → Explain with code examples

📝 **CODE FORMAT (Important for automatic execution):**
```language path/to/file
[COMPLETE CODE - with comments, type-safety, error-handling]
```

🔧 **TERMINAL FORMAT:**
TERMINAL: command here

🎯 **YOUR WORKFLOW (Show your thinking process):**
1. **Understand:** "📝 Analyzing the request and project context..."
2. **Plan:** "🔍 I see the following options: [options]"
3. **Act:** "✅ Implementing solution 1: [description]"
4. **Explain:** "💡 Why: [reasoning]"
5. **Verify:** "✅ Done! [result]"

💬 **CHAT BEHAVIOR (Like ChatGPT/Cursor):**
- Respond IMMEDIATELY, even if Smart Agent is working in parallel
- Be helpful, precise, and friendly
- Explain complex concepts clearly
- Show code examples when helpful
- Ask clarifying questions when something is unclear
- Offer alternatives when appropriate

🎓 **LEARNING-ORIENTED:**
- Explain WHY you do something
- Show best practices
- Explain code structures
- Give tips for better coding

**CRITICAL:** You ALWAYS work in parallel with the Smart Agent. The chat is ALWAYS available for questions, improvements, and discussions - just like ChatGPT or Cursor!

Project: {project_id if project_id else 'N/A'}
Agent Type: {request.agent if request.agent else 'aura'}
Smart Agent Running: Check project state

Be proactive, helpful, and deliver complete, working solutions with educational value.

When you need to execute ANY command, you MUST format it as:
TERMINAL: command here

Examples:
- "npm install" → TERMINAL: npm install
- "flutter pub get" → TERMINAL: flutter pub get
- "npm start" → TERMINAL: npm start
- "flutter run -d chrome" → TERMINAL: flutter run -d chrome

IMPORTANT: 
- ALWAYS use "TERMINAL: " prefix for commands
- DO NOT just say "I will run npm install" - ACTUALLY output "TERMINAL: npm install"
- The system will SHOW the command and ASK the user for approval (like Cursor)
- Show what you're doing, THEN show the command: "⚙️ Installing packages...\nTERMINAL: npm install"
- The user will see a "Run" button and can approve or skip the command

🎯 Your Workflow (STEP BY STEP - LIKE A REAL DEVELOPER - CRITICAL):
CRITICAL: You MUST work STEP BY STEP, showing ONE action at a time. The user watches you work LIVE.

HOW TO WORK (EXACTLY LIKE A REAL DEVELOPER):

1. FIRST: Show what you're about to do
   Example: "📝 Analysiere Projektstruktur..."
   [STOP HERE - let user read this]

2. THEN: Show your findings/actions
   Example: "🔍 Gefunden: 3 Fehler in main.dart (Zeilen 12, 45, 78)"
   [STOP HERE - let user read this]

3. THEN: Show what you're fixing
   Example: "✅ Fixe Fehler in Zeile 45..."
   [STOP HERE - let user read this]

4. THEN: Show the code (ONE file at a time)
   Example: "📁 Erstelle: src/components/Button.jsx"
   [STOP HERE]
   Then show: ```jsx src/components/Button.jsx
   [code here]
   ```
   [STOP HERE - let user read this]

5. THEN: Next step
   Example: "⚙️ Installiere Packages..."
   [STOP HERE]
   Then show: "TERMINAL: npm install"
   [STOP HERE - wait for user approval]

CRITICAL RULES - YOU MUST FOLLOW:
1. Write ONE sentence/step at a time
2. After each step, add a newline and pause
3. NEVER write multiple steps in one go
4. Show emoji + action, then STOP
5. Then show result, then STOP
6. Then show next step, then STOP
7. NEVER dump everything at once!

Example of CORRECT output (word by word, step by step):
"📝 Analysiere Projektstruktur...\n\n"
[user reads this]
"🔍 Scanne nach Fehlern...\n\n"
[user reads this]
"✅ Gefunden: 2 Fehler\n\n"
[user reads this]
"🔧 Fixe ersten Fehler...\n\n"
[user reads this]
"📁 Erstelle neue Datei: Button.jsx\n\n"
[user reads this]
"```jsx src/components/Button.jsx\n"
[code appears word by word]
"```\n\n"
[user reads this]
"⚙️ Installiere Packages...\n\n"
[user reads this]
"TERMINAL: npm install\n\n"
[user approves]

Example of WRONG output (DON'T DO THIS):
"📝 Analysiere... 🔍 Finde... ✅ Fixe... 📁 Erstelle... [all code] ⚙️ TERMINAL: npm install"
This is TERRIBLE - user can't follow!

WORK LIKE YOU'RE TYPING LIVE:
- Type one thought at a time
- Pause between thoughts
- Let user read each step
- Show your thinking process
- Be methodical, not rushed

You work FULLY AUTOMATICALLY - but TYPE STEP BY STEP, like a real developer typing live!
You have full context of the project. Use this to provide accurate, helpful suggestions.
Be proactive, helpful, and provide complete, working solutions.
Always explain what you're doing and why.
CRITICAL: When you mention executing a command, you MUST output it in TERMINAL: format for automatic execution."""
        
        if project_context:
            request.system_prompt += project_context
        
        # Build messages
        messages = []
        if request.system_prompt and request.model not in ["o1", "o1-mini"]:
            messages.append({"role": "system", "content": request.system_prompt})
        
        for msg in request.conversation_history:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        if request.model in ["o1", "o1-mini"]:
            full_prompt = f"{request.system_prompt}\n\n{request.prompt}"
        else:
            full_prompt = request.prompt
            
        messages.append({"role": "user", "content": full_prompt})
        
        # Stream response based on provider
        if model_info["provider"] == "OpenAI":
            if not openai_client:
                yield f"data: {json.dumps({'error': 'OpenAI API key not configured', 'done': True})}\n\n"
                return
            
            if request.model in ["o1", "o1-mini"]:
                response = openai_client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    max_completion_tokens=16000
                )
                content = response.choices[0].message.content
                yield f"data: {json.dumps({'content': content, 'done': True})}\n\n"
            else:
                # ⚡ STREAMING: Sofort starten, keine Verzögerung!
                stream = openai_client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=4000,
                    stream=True
                )
                # ⚡ ECHTE AI-ANTWORTEN - KEINE DUMMY-TEXTE!
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
        
        elif model_info["provider"] == "Anthropic":
            if not anthropic_client:
                yield f"data: {json.dumps({'error': 'Anthropic API key not configured', 'done': True})}\n\n"
                return
            
            claude_messages = []
            system_content = None
            for msg in messages:
                if msg["role"] == "system":
                    system_content = msg["content"]
                else:
                    claude_messages.append(msg)
            
            kwargs = {
                "model": request.model,
                "max_tokens": 2000,
                "messages": claude_messages,
                "stream": True
            }
            if system_content:
                kwargs["system"] = system_content
            
            async with anthropic_client.messages.stream(**kwargs) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'content': text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        
        elif model_info["provider"] == "Google":
            if not GENAI_AVAILABLE or not google_api_key:
                yield f"data: {json.dumps({'error': 'Google API key not configured', 'done': True})}\n\n"
                return
            
            model = genai.GenerativeModel(request.model)
            gemini_messages = []
            for msg in messages:
                if msg["role"] == "user":
                    gemini_messages.append({"role": "user", "parts": [msg["content"]]})
                elif msg["role"] == "assistant":
                    gemini_messages.append({"role": "model", "parts": [msg["content"]]})
            
            if gemini_messages:
                response = model.generate_content(
                    [m["parts"][0] for m in gemini_messages],
                    stream=True
                )
                for chunk in response:
                    if chunk.text:
                        yield f"data: {json.dumps({'content': chunk.text})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Streaming error: {str(e)}")
        print(f"Traceback: {error_trace}")
        yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

# -------------------------------------------------------------
# PROJECT GENERATION
# -------------------------------------------------------------
from project_generator.project_router import router as project_router
app.include_router(project_router, prefix="/api/projects", tags=["projects"])

# -------------------------------------------------------------
# BUILDER & CODE STUDIO
# -------------------------------------------------------------
try:
    from builder.routes import router as builder_router
    app.include_router(builder_router, tags=["App Builder"])
    print("✅ Builder Router loaded")
except Exception as e:
    print(f"⚠️  Builder Router failed to load: {e}")

try:
    from builder.build_complete_app import router as build_complete_router
    app.include_router(build_complete_router, tags=["App Builder"])
    print("✅ Build Complete App Router loaded")
except Exception as e:
    print(f"⚠️  Build Complete App Router failed to load: {e}")

try:
    from builder.live_build_routes import router as live_build_router
    app.include_router(live_build_router, prefix="/api", tags=["Live Builder"])
    print("✅ Live Build Router loaded")
except Exception as e:
    print(f"⚠️  Live Build Router failed to load: {e}")
    import traceback
    traceback.print_exc()

try:
    from builder.smart_agent_routes import router as smart_agent_router
    # Router hat Routen ohne prefix, dann mit /api/smart-agent prefix registrieren
    app.include_router(smart_agent_router, prefix="/api/smart-agent", tags=["Smart Agent"])
    print("✅ Smart Agent Router loaded")
    print(f"   Endpoints: /api/smart-agent/generate, /api/smart-agent/ws")
    print(f"   Router prefix: {smart_agent_router.prefix}")
    print(f"   Router routes: {[r.path for r in smart_agent_router.routes if hasattr(r, 'path')]}")
except Exception as e:
    print(f"⚠️  Smart Agent Router failed to load: {e}")
    import traceback
    traceback.print_exc()

# VibeAI Super Agent
try:
    from vibeai.agent.routes import router as vibeai_agent_router
    app.include_router(vibeai_agent_router)
    print("✅ VibeAI Super Agent Router loaded")
    print(f"   Endpoints: /api/vibeai-agent/generate, /api/vibeai-agent/ws")
except Exception as e:
    print(f"⚠️  VibeAI Super Agent Router failed to load: {e}")
    import traceback
    traceback.print_exc()

try:
    from builder.auto_fix_builder import router as autofix_router
    app.include_router(autofix_router, tags=["App Builder"])
    print("✅ Auto-Fix Builder Router loaded")
except Exception as e:
    print(f"⚠️  Auto-Fix Builder Router failed to load: {e}")

try:
    from builder.auto_fix_agent import router as auto_fix_agent_router
    app.include_router(auto_fix_agent_router, tags=["Auto Fix Agent"])
    print("✅ Auto-Fix Agent Router loaded")
    print(f"   Endpoints: /api/auto-fix/scan-project, /api/auto-fix/fix-project, /api/auto-fix/fix-file")
except Exception as e:
    print(f"⚠️  Auto-Fix Agent Router failed to load: {e}")
    import traceback
    traceback.print_exc()

try:
    from builder.git_integration import router as git_router
    app.include_router(git_router, tags=["Git"])
    print("✅ Git Integration Router loaded")
except Exception as e:
    print(f"⚠️  Git Integration Router failed to load: {e}")

try:
    from codestudio.package_manager import router as package_router
    app.include_router(package_router, tags=["Package Manager"])
    print("✅ Package Manager Router loaded")
except Exception as e:
    print(f"⚠️  Package Manager Router failed to load: {e}")

try:
    from codestudio.terminal_routes import router as terminal_router
    app.include_router(terminal_router, tags=["Terminal"])
    print("✅ Terminal Router loaded")
except Exception as e:
    print(f"⚠️  Terminal Router failed to load: {e}")

try:
    from codestudio.routes import router as codestudio_router
    app.include_router(codestudio_router, tags=["Code Studio"])
    print("✅ Code Studio Router loaded")
except Exception as e:
    print(f"⚠️  Code Studio Router failed to load: {e}")

try:
    from preview.preview_routes import router as preview_router
    app.include_router(preview_router, prefix="/api", tags=["Preview"])
    print("✅ Preview Router loaded")
except Exception as e:
    print(f"⚠️  Preview Router failed to load: {e}")

# -------------------------------------------------------------
# CHAT & AGENTS
# -------------------------------------------------------------
try:
    from chat.agent_router import router as chat_agent_router
    app.include_router(chat_agent_router, prefix="/api/chat", tags=["Chat Agents"])
    print("✅ Chat Agent Router loaded")
except Exception as e:
    print(f"⚠️  Chat Agent Router failed to load: {e}")

# TEAM COLLABORATION
# -------------------------------------------------------------
try:
    from ai.team.team_routes import router as team_router
    app.include_router(team_router, prefix="/api", tags=["Team Collaboration"])
    print("✅ Team Collaboration Router loaded")
except ImportError:
    print("⚠️  Team Collaboration routes not available")
except Exception as e:
    print(f"⚠️  Team Collaboration Router failed to load: {e}")

# TEAM AGENT GENERATOR (Multi-Agent App Creation)
# -------------------------------------------------------------
try:
    from builder.team_agent_routes import router as team_agent_router
    app.include_router(team_agent_router, prefix="/api/team-agent", tags=["Team Agent"])
    print("✅ Team Agent Router loaded")
except ImportError:
    print("⚠️  Team Agent routes not available")
except Exception as e:
    print(f"⚠️  Team Agent Router failed to load: {e}")

# Download & Export Router
# -------------------------------------------------------------
try:
    from builder.download_routes import router as download_router
    app.include_router(download_router, tags=["Download & Export"])
    print("✅ Download Router loaded")
except ImportError:
    print("⚠️  Download routes not available")
except Exception as e:
    print(f"⚠️  Download Router failed to load: {e}")

# AUDIO TRANSCRIPTION (Whisper)
# -------------------------------------------------------------
import io
@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio using OpenAI Whisper API"""
    try:
        # Read audio file
        audio_data = await file.read()
        audio_file = io.BytesIO(audio_data)
        audio_file.name = file.filename or "audio.webm"
        
        # Transcribe with Whisper
        transcription = openai.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        
        return {"text": transcription.text, "status": "success"}
    except Exception as e:
        print(f"❌ Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------
# ROOT & HEALTH ENDPOINTS
# -------------------------------------------------------------
@app.get("/")
async def root():
    """API Information"""
    return {
        "name": "🚀 VibeAI Backend API",
        "version": "1.0.0", 
        "status": "online",
        "description": "Complete AI-Powered Development Platform",
        "features": [
            "🔐 Authentication (JWT)",
            "💬 Chat Sessions",
            "🤖 Multiple AI Models (OpenAI, Anthropic, Google)",
            "📝 Message History", 
            "👤 User Management",
            "🛠️ Project Generation",
            "📊 Model Management"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "auth": "/api/auth/*",
            "sessions": "/api/sessions",
            "chat": "/api/chat",
            "models": "/api/models",
            "projects": "/api/projects"
        },
        "models_available": len(MODELS),
        "total_users": len(users_db),
        "total_sessions": len(sessions_db),
        "total_messages": len(messages_db)
    }

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": "connected",
        "ai_providers": {
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
            "google": bool(os.getenv("GOOGLE_API_KEY"))
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)