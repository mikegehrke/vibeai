# backend/main.py
# VibeAI 2.0 - Enhanced API with Model Testing

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
import os
import time
import json
from dotenv import load_dotenv
from generator import generate_code
from git_sync import push_to_github
from composer import compose_project
from planner import plan_app
from model_api import model_router

# Load environment variables
load_dotenv()

app = FastAPI(title="VibeAI 2.0 API", version="2.0.0")

# Add model management router
app.include_router(model_router)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models for API requests
class ChatRequest(BaseModel):
    model: str
    prompt: str
    settings: Optional[dict] = None

class TestModelRequest(BaseModel):
    model: str
    prompt: str

class GenerateAppRequest(BaseModel):
    template: str  # flutter, react, vue, nextjs
    description: str
    model: Optional[str] = "gpt-4o"
    features: Optional[list] = []

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "VibeAI 2.0 API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "models": "/api/models",
            "chat": "/api/chat (POST)",
            "test": "/api/test-model (POST)",
            "build": "/build (POST)",
            "generate": "/generate (POST)"
        },
        "total_models": 88
    }

# New API endpoints for model testing
@app.post("/api/chat")
async def chat_with_model(request: ChatRequest):
    """Chat with any OpenAI model"""
    try:
        start_time = time.time()
        
        # Default settings
        settings = request.settings or {}
        temperature = settings.get('temperature', 0.7)
        max_tokens = settings.get('maxTokens', 4000)  # Erhöht auf 4000 für längere Antworten
        top_p = settings.get('topP', 1.0)
        frequency_penalty = settings.get('frequencyPenalty', 0)
        presence_penalty = settings.get('presencePenalty', 0)
        
        # Handle different model types
        if request.model.startswith('dall-e'):
            # Image generation
            try:
                client = openai.OpenAI()
                response = client.images.generate(
                    model=request.model,
                    prompt=request.prompt,
                    n=1,
                    size="1024x1024"
                )
                
                return {
                    "response": f"🎨 Image generated successfully!\nURL: {response.data[0].url if response and response.data else 'Generated image URL would be here'}",
                    "responseTime": int((time.time() - start_time) * 1000),
                    "tokens": len(request.prompt.split()),
                    "cost": 0.02,  # Approximate cost
                    "type": "image"
                }
            except Exception as e:
                return {
                    "response": f"🎨 Image generation simulated for {request.model}\nPrompt: {request.prompt}\n(OpenAI API not configured)",
                    "responseTime": int((time.time() - start_time) * 1000),
                    "tokens": len(request.prompt.split()),
                    "cost": 0.02,
                    "type": "image"
                }
            
        elif request.model in ['whisper-1']:
            # Audio transcription (placeholder)
            return {
                "response": "🎵 Audio model ready! Please upload an audio file for transcription.",
                "responseTime": int((time.time() - start_time) * 1000),
                "tokens": 0,
                "cost": 0.006,
                "type": "audio"
            }
            
        elif request.model.startswith('tts-'):
            # Text-to-speech (placeholder)
            return {
                "response": f"🔊 Text-to-Speech ready!\nInput: {request.prompt}\nAudio would be generated with {request.model}",
                "responseTime": int((time.time() - start_time) * 1000),
                "tokens": len(request.prompt.split()),
                "cost": 0.015,
                "type": "tts"
            }
            
        elif 'embedding' in request.model:
            # Embeddings
            try:
                client = openai.OpenAI()
                response = client.embeddings.create(
                    model=request.model,
                    input=request.prompt
                )
                
                return {
                    "response": f"📊 Embedding generated!\nDimensions: {len(response.data[0].embedding) if response and response.data else 1536}\nFirst 5 values: {response.data[0].embedding[:5] if response and response.data else [0.1, 0.2, 0.3, 0.4, 0.5]}",
                    "responseTime": int((time.time() - start_time) * 1000),
                    "tokens": len(request.prompt.split()),
                    "cost": 0.0001,
                    "type": "embedding"
                }
            except Exception as e:
                return {
                    "response": f"📊 Embedding simulated for {request.model}\nInput: {request.prompt}\n(OpenAI API not configured)",
                    "responseTime": int((time.time() - start_time) * 1000),
                    "tokens": len(request.prompt.split()),
                    "cost": 0.0001,
                    "type": "embedding"
                }
            
        else:
            # Regular chat completion
            try:
                client = openai.OpenAI()
                
                # Different models need different parameters
                model_lower = request.model.lower()
                
                # Reasoning models (O-series) - NO temperature, top_p, frequency_penalty, presence_penalty
                if any(x in model_lower for x in ['o1', 'o3', 'o4']):
                    response = client.chat.completions.create(
                        model=request.model,
                        messages=[
                            {"role": "user", "content": request.prompt}
                        ],
                        max_completion_tokens=max_tokens
                    )
                
                # GPT-5 series - NO custom parameters except max_completion_tokens
                elif model_lower.startswith('gpt-5'):
                    response = client.chat.completions.create(
                        model=request.model,
                        messages=[
                            {"role": "user", "content": request.prompt}
                        ],
                        max_completion_tokens=max_tokens
                    )
                
                # GPT-4.1 series - uses max_completion_tokens
                elif 'gpt-4.1' in model_lower:
                    response = client.chat.completions.create(
                        model=request.model,
                        messages=[
                            {"role": "user", "content": request.prompt}
                        ],
                        temperature=temperature,
                        max_completion_tokens=max_tokens,
                        top_p=top_p,
                        frequency_penalty=frequency_penalty,
                        presence_penalty=presence_penalty
                    )
                
                # Audio/Realtime models - simple parameters
                elif any(x in model_lower for x in ['audio', 'realtime']):
                    response = client.chat.completions.create(
                        model=request.model,
                        messages=[
                            {"role": "user", "content": request.prompt}
                        ],
                        max_tokens=max_tokens
                    )
                
                # Standard models (GPT-4o, GPT-3.5, etc.) - full parameters with max_tokens
                else:
                    response = client.chat.completions.create(
                        model=request.model,
                        messages=[
                            {"role": "user", "content": request.prompt}
                        ],
                        temperature=temperature,
                        max_tokens=max_tokens,
                        top_p=top_p,
                        frequency_penalty=frequency_penalty,
                        presence_penalty=presence_penalty
                    )
                
                # Calculate cost (approximate)
                input_tokens = getattr(response.usage, 'prompt_tokens', 0) if response and response.usage else 0
                output_tokens = getattr(response.usage, 'completion_tokens', 0) if response and response.usage else 0
                total_tokens = getattr(response.usage, 'total_tokens', 0) if response and response.usage else 0
                cost = calculate_cost(request.model, input_tokens, output_tokens)
                
                return {
                    "response": response.choices[0].message.content if response and response.choices else "No response generated",
                    "responseTime": int((time.time() - start_time) * 1000),
                    "tokens": total_tokens,
                    "cost": cost,
                    "type": "chat"
                }
            except Exception as e:
                # Log the actual error for debugging
                print(f"❌ OpenAI API Error for model {request.model}: {str(e)}")
                
                # Return error details to frontend
                return {
                    "response": f"❌ API Error: {str(e)}\n\nModel: {request.model}\nPlease check the backend logs for details.",
                    "responseTime": int((time.time() - start_time) * 1000),
                    "tokens": 0,
                    "cost": 0,
                    "type": "chat",
                    "error": str(e)
                }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-model")
async def test_model(request: TestModelRequest):
    """Quick model test endpoint"""
    try:
        chat_request = ChatRequest(
            model=request.model,
            prompt=request.prompt
        )
        return await chat_with_model(chat_request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate approximate cost based on model and token usage"""
    
    # Cost per 1K tokens (input, output) - These are approximate rates
    costs = {
        # GPT-5 Series (Premium pricing)
        'gpt-5': (0.10, 0.30),
        'gpt-5-pro': (0.15, 0.45),
        'gpt-5-mini': (0.003, 0.006),
        'gpt-5-nano': (0.001, 0.002),
        
        # GPT-4 Series
        'gpt-4o': (0.005, 0.015),
        'gpt-4o-mini': (0.00015, 0.0006),
        'gpt-4.1': (0.01, 0.03),
        'gpt-4.1-mini': (0.002, 0.006),
        
        # O-Series (Reasoning models - higher cost)
        'o1': (0.06, 0.24),
        'o1-pro': (0.12, 0.48),
        'o1-mini': (0.012, 0.048),
        'o3': (0.08, 0.32),
        'o3-pro': (0.16, 0.64),
        'o3-mini': (0.016, 0.064),
        
        # GPT-3.5 Series
        'gpt-3.5-turbo': (0.0005, 0.0015),
        'gpt-3.5-turbo-16k': (0.003, 0.004),
    }
    
    # Default cost if model not found
    default_cost = (0.01, 0.03)
    
    # Find matching model (handle versioned models)
    model_cost = default_cost
    for cost_model, cost in costs.items():
        if model.startswith(cost_model):
            model_cost = cost
            break
    
    input_cost = (input_tokens / 1000) * model_cost[0]
    output_cost = (output_tokens / 1000) * model_cost[1]
    
    return round(input_cost + output_cost, 6)

@app.get("/api/models")
async def get_available_models():
    """Get list of all available models"""
    return {
        "models": [
            # GPT-5 Series
            "gpt-5", "gpt-5-pro", "gpt-5-mini", "gpt-5-nano",
            "gpt-5-search-api", "gpt-5-codex", "gpt-5-chat-latest",
            
            # GPT-4 Series  
            "gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini",
            "chatgpt-4o-latest",
            
            # O-Series (Reasoning)
            "o1", "o1-pro", "o1-mini", "o3", "o3-pro", "o3-mini",
            "o4-mini", "o3-deep-research",
            
            # Image Models
            "dall-e-2", "dall-e-3", "gpt-image-1", "gpt-image-1-mini",
            
            # Video Models
            "sora-2", "sora-2-pro",
            
            # Audio Models
            "whisper-1", "tts-1", "tts-1-hd", "gpt-audio", "gpt-audio-mini",
            
            # Specialized Models
            "text-embedding-ada-002", "text-embedding-3-small", "text-embedding-3-large",
            "omni-moderation-latest", "codex-mini-latest"
        ],
        "total": 88
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0", "models_available": 88}

# Original endpoints below
async def build(request: Request):
    """
    Vollständiger Workflow: Beschreibung → Architekturplan → Code-Generation
    """
    try:
        data = await request.json()
        description = data.get("description", "")
        
        if not description.strip():
            return {"error": "Beschreibung darf nicht leer sein"}
        
        # Schritt 1: Architekturplan erstellen
        plan = plan_app(description)
        if "error" in plan:
            return {"error": f"Planungsfehler: {plan['error']}"}
        
        # Schritt 2: Projekt zusammenstellen
        result = compose_project(plan, "output_project")
        
        return {"status": "success", "plan": plan, "generated_files": result}
        
    except Exception as e:
        return {"error": f"Build-Fehler: {str(e)}"}

@app.post("/generate")
async def generate(request: Request):
    """
    Nimmt eine Beschreibung entgegen (z. B. 'Flutter Login App'),
    ruft die KI auf und erstellt komplette Projektstruktur.
    """
    data = await request.json()
    description = data.get("description", "")

    # KI-Code erzeugen
    project_path = "generated_project"
    os.makedirs(project_path, exist_ok=True)
    generated_files = generate_code(description, project_path)

    # Lese alle generierten Dateien
    files_content = {}
    for file_path in generated_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                # Verwende relativen Pfad als Key
                relative_path = os.path.relpath(file_path, project_path)
                files_content[relative_path] = f.read()
        except Exception as e:
            relative_path = os.path.relpath(file_path, project_path)
            files_content[relative_path] = f"Fehler beim Lesen: {str(e)}"

    # optional: Push zu GitHub
    git_url = push_to_github(project_path)

    return {
        "status": "ok", 
        "files": generated_files, 
        "files_content": files_content,
        "project_structure": list(files_content.keys()),
        "repo": git_url
    }

# Voice Features - Whisper & TTS
from fastapi import File, UploadFile
from fastapi.responses import StreamingResponse
import io

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio using Whisper API"""
    try:
        client = openai.OpenAI()
        
        # Read audio file
        audio_data = await file.read()
        audio_file = io.BytesIO(audio_data)
        audio_file.name = file.filename or "audio.webm"
        
        # Transcribe with Whisper
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        
        return {
            "text": transcription.text,
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
async def text_to_speech(request: Request):
    """Convert text to speech using OpenAI TTS"""
    try:
        data = await request.json()
        text = data.get('text', '')
        voice = data.get('voice', 'alloy')
        model = data.get('model', 'tts-1')
        
        client = openai.OpenAI()
        
        # Generate speech
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=text
        )
        
        # Return audio stream
        audio_data = io.BytesIO()
        for chunk in response.iter_bytes():
            audio_data.write(chunk)
        audio_data.seek(0)
        
        return StreamingResponse(
            audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=speech.mp3"
            }
        )
    except Exception as e:
        print(f"❌ TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 🚀 INTELLIGENT CODE GENERATION ENDPOINTS

@app.post("/api/generate-project")
async def generate_project(request: GenerateAppRequest):
    """Generate complete project with MVVM structure, tests, and professional architecture"""
    try:
        print(f"🏗️ Generating PROFESSIONAL {request.template} project: {request.description}")
        
        # Initialize OpenAI client
        from openai import OpenAI
        client = OpenAI()
        
        template_prompts = {
            "flutter": f"""Create a COMPLETE production-ready Flutter app with PROFESSIONAL MVVM structure:

PROJECT: {request.description}
FEATURES: {', '.join(request.features) if request.features else 'Core functionality'}

MANDATORY STRUCTURE - PROVIDE ALL THESE FILES:

```yaml pubspec.yaml
name: my_app
description: {request.description}
version: 1.0.0
environment:
  sdk: '>=3.0.0 <4.0.0'
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.0.5
  http: ^1.1.0
  shared_preferences: ^2.2.2
dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.4
```

```dart lib/main.dart
// App entry point with Provider setup
```

```dart lib/views/home_view.dart
// Main UI with loading/error states
```

```dart lib/viewmodels/home_viewmodel.dart
// MVVM ViewModel with business logic
```

```dart lib/models/user_model.dart
// Data models with JSON serialization
```

```dart lib/services/api_service.dart
// HTTP service for API calls
```

```dart lib/services/storage_service.dart
// Local storage with SharedPreferences
```

```dart lib/utils/constants.dart
// App-wide constants
```

```dart test/viewmodel_test.dart
// Unit tests for ViewModel
```

```markdown README.md
# Setup and run instructions
```

REQUIREMENTS:
- Full MVVM architecture
- Provider state management
- Error handling everywhere
- Loading states
- Null safety
- Production-ready code
""",

            "react": f"""Create a COMPLETE production-ready React app with PROFESSIONAL structure:

PROJECT: {request.description}
FEATURES: {', '.join(request.features) if request.features else 'Core functionality'}

MANDATORY STRUCTURE - PROVIDE ALL FILES:

```json package.json
{{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {{
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.20.0"
  }},
  "devDependencies": {{
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "jest": "^29.7.0"
  }}
}}
```

```jsx src/App.jsx
// Main component with routing
```

```jsx src/components/Home.jsx
// Home page component
```

```jsx src/hooks/useApi.js
// Custom hook for API calls
```

```jsx src/services/api.js
// Axios API service
```

```jsx src/context/AppContext.jsx
// Global state management
```

```css src/App.css
// Styling
```

```jsx src/__tests__/App.test.js
// Jest unit tests
```

```markdown README.md
# Setup instructions
```

REQUIREMENTS:
- Component architecture
- Custom hooks
- Context API
- Error boundaries
- Loading states
- TypeScript-ready
""",

            "python": f"""Create a COMPLETE production-ready Python app with CLEAN ARCHITECTURE:

PROJECT: {request.description}
FEATURES: {', '.join(request.features) if request.features else 'Core functionality'}

MANDATORY STRUCTURE - PROVIDE ALL FILES:

```txt requirements.txt
fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
pytest==7.4.4
```

```python src/main.py
# Application entry point
```

```python src/models/models.py
# SQLAlchemy models
```

```python src/services/service.py
# Business logic layer
```

```python src/database/db.py
# Database connection
```

```python src/config/settings.py
# Configuration management
```

```python src/utils/logger.py
# Logging setup
```

```python tests/test_service.py
# Pytest unit tests
```

```markdown README.md
# Setup and usage
```

REQUIREMENTS:
- Clean architecture
- Type hints everywhere
- Async/await
- Error handling
- Logging
- Unit tests
"""
        }
        
        prompt = template_prompts.get(request.template, template_prompts["flutter"])
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert software architect. Generate COMPLETE, PRODUCTION-READY projects with MVVM/Clean Architecture. Include ALL files with complete code. NO placeholders!"},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=16000,
            temperature=0.7
        )
        
        generated_code = response.choices[0].message.content or ""
        files = parse_generated_code(generated_code, request.template)
        
        return {
            "success": True,
            "template": request.template,
            "files": files,
            "raw_output": generated_code,
            "model_used": response.model,
            "tokens_used": response.usage.total_tokens if response.usage else 0,
            "project_type": "professional_mvvm"
        }
        
    except Exception as e:
        print(f"❌ Project generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/fix-errors")
async def fix_errors(request: dict):
    """Automatically fix code errors with AI"""
    try:
        from openai import OpenAI
        client = OpenAI()
        
        code = request.get("code", "")
        language = request.get("language", "python")
        errors = request.get("errors", [])
        
        print(f"🔧 Fixing {language} code errors...")
        
        prompt = f"""Fix ALL errors in this {language} code:

```{language}
{code}
```

ERRORS REPORTED:
{chr(10).join(f"- {err}" for err in errors)}

Return COMPLETE corrected code with:
1. All syntax/runtime errors fixed
2. Improved error handling
3. Best practices applied
4. Type safety added
5. Comments explaining major fixes

Format response as:
```{language}
[COMPLETE CORRECTED CODE]
```

EXPLANATION:
[What was fixed and why]"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert debugger. Fix code errors and improve quality."},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=8000,
            temperature=0.3
        )
        
        result = response.choices[0].message.content or ""
        
        # Extract fixed code
        import re
        code_match = re.search(r'```\w*\n(.*?)```', result, re.DOTALL)
        fixed_code = code_match.group(1) if code_match else result
        
        return {
            "success": True,
            "fixed_code": fixed_code,
            "full_response": result,
            "tokens_used": response.usage.total_tokens if response.usage else 0
        }
        
    except Exception as e:
        print(f"❌ Error fixing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/improve-code")
async def improve_code(request: dict):
    """Improve code quality with conversation history support"""
    try:
        from openai import OpenAI
        client = OpenAI()
        
        code = request.get("code", "")
        language = request.get("language", "python")
        instruction = request.get("instruction", "")
        conversation_history = request.get("conversation_history", [])
        
        print(f"✨ Improving {language} code with instruction: {instruction}")
        
        # Build messages with conversation history
        messages = [
            {"role": "system", "content": """You are an expert code assistant. Follow user instructions precisely.
When modifying code:
1. Apply the EXACT changes requested
2. Keep all other code unchanged
3. Maintain code structure and style
4. Return ONLY the modified code in a code block
5. Add a brief explanation of what you changed

Be conversational and remember context from previous messages."""}
        ]
        
        # Add conversation history for context
        if conversation_history:
            messages.extend(conversation_history[:-1])  # All except current message
        
        # Add current request with code
        current_prompt = f"""Current code:
```{language}
{code}
```

User request: {instruction}

Please apply the requested changes and explain what you did."""

        messages.append({"role": "user", "content": current_prompt})
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_completion_tokens=8000,
            temperature=0.7
        )
        
        result = response.choices[0].message.content or ""
        
        # Extract improved code
        import re
        code_match = re.search(r'```\w*\n(.*?)```', result, re.DOTALL)
        improved_code = code_match.group(1).strip() if code_match else code
        
        # Extract explanation (text before or after code block)
        explanation_parts = re.split(r'```\w*\n.*?```', result, flags=re.DOTALL)
        explanation = ' '.join(p.strip() for p in explanation_parts if p.strip())
        
        if not explanation:
            explanation = f"✅ Applied changes: {instruction}"
        
        return {
            "success": True,
            "improved_code": improved_code,
            "explanation": explanation,
            "tokens_used": response.usage.total_tokens if response.usage else 0
        }
        
    except Exception as e:
        print(f"❌ Code improvement failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/explain-code")
async def explain_code(request: dict):
    """Explain code in detail"""
    try:
        from openai import OpenAI
        client = OpenAI()
        
        code = request.get("code", "")
        language = request.get("language", "python")
        
        prompt = f"""Explain this {language} code in detail:

```{language}
{code}
```

Provide:
1. Overall purpose
2. Step-by-step explanation
3. Design patterns used
4. Potential issues
5. Suggestions for improvement"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a code educator. Explain code clearly and thoroughly."},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=4000,
            temperature=0.7
        )
        
        return {
            "success": True,
            "explanation": response.choices[0].message.content or "",
            "tokens_used": response.usage.total_tokens if response.usage else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/git/status")
async def git_status(request: dict):
    """Check git status of project"""
    try:
        import subprocess
        project_path = request.get("project_path", "")
        
        if not project_path:
            return {"success": False, "message": "project_path required"}
        
        # Check if .git exists
        import os
        git_dir = os.path.join(project_path, ".git")
        
        if not os.path.exists(git_dir):
            return {"success": False, "message": "Not a git repository"}
        
        # Get status
        result = subprocess.run(
            ["git", "status", "--short"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        return {
            "success": True,
            "message": "Git repository active",
            "changes": result.stdout,
            "is_clean": len(result.stdout.strip()) == 0
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/api/git/init")
async def git_init(request: dict):
    """Initialize git repository in project"""
    try:
        import subprocess
        project_path = request.get("project_path", "")
        
        if not project_path:
            raise HTTPException(status_code=400, detail="project_path required")
        
        # Initialize git
        result = subprocess.run(
            ["git", "init"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        return {
            "success": result.returncode == 0,
            "message": "Git initialized successfully" if result.returncode == 0 else result.stderr,
            "output": result.stdout
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/git/commit")
async def git_commit(request: dict):
    """Commit changes to git"""
    try:
        import subprocess
        project_path = request.get("project_path", "")
        message = request.get("message", "Auto commit")
        
        # Add all files
        subprocess.run(["git", "add", "."], cwd=project_path)
        
        # Commit
        result = subprocess.run(
            ["git", "commit", "-m", message],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        return {
            "success": result.returncode == 0,
            "message": message,
            "output": result.stdout + result.stderr
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/git/push")
async def git_push(request: dict):
    """Push to remote repository"""
    try:
        import subprocess
        project_path = request.get("project_path", "")
        remote = request.get("remote", "origin")
        branch = request.get("branch", "main")
        
        result = subprocess.run(
            ["git", "push", remote, branch],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        return {
            "success": result.returncode == 0,
            "message": f"Pushed to {remote}/{branch}",
            "output": result.stdout + result.stderr
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/git/pull")
async def git_pull(request: dict):
    """Pull from remote repository"""
    try:
        import subprocess
        project_path = request.get("project_path", "")
        
        result = subprocess.run(
            ["git", "pull"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        return {
            "success": result.returncode == 0,
            "message": "Pulled successfully",
            "output": result.stdout + result.stderr
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/github/create-repo")
async def github_create_repo(request: dict):
    """Create GitHub repository and push code"""
    try:
        import subprocess
        import os
        
        repo_name = request.get("repo_name", "")
        project_path = request.get("project_path", "")
        github_token = os.getenv("GITHUB_TOKEN")
        
        if not github_token:
            return {
                "success": False,
                "message": "GITHUB_TOKEN not configured in .env",
                "manual_instructions": f"""
1. Go to https://github.com/new
2. Create repo: {repo_name}
3. Run in terminal:
   cd {project_path}
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/{repo_name}.git
   git push -u origin main
"""
            }
        
        # Create repo via GitHub API
        import requests
        response = requests.post(
            "https://api.github.com/user/repos",
            headers={
                "Authorization": f"token {github_token}",
                "Accept": "application/vnd.github.v3+json"
            },
            json={
                "name": repo_name,
                "private": False,
                "auto_init": False
            }
        )
        
        if response.status_code == 201:
            repo_data = response.json()
            clone_url = repo_data["clone_url"]
            
            # Initialize git and push
            subprocess.run(["git", "init"], cwd=project_path)
            subprocess.run(["git", "add", "."], cwd=project_path)
            subprocess.run(["git", "commit", "-m", "Initial commit from VibeAI"], cwd=project_path)
            subprocess.run(["git", "remote", "add", "origin", clone_url.replace("https://", f"https://{github_token}@")], cwd=project_path)
            subprocess.run(["git", "push", "-u", "origin", "main"], cwd=project_path)
            
            return {
                "success": True,
                "message": "Repository created and code pushed!",
                "repo_url": repo_data["html_url"]
            }
        else:
            return {
                "success": False,
                "message": f"GitHub API error: {response.json().get('message', 'Unknown error')}"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/build-complete-app")
async def build_complete_app(request: dict):
    """
    Build COMPLETE production-ready app: code + tests + store assets + deployment
    """
    try:
        from openai import OpenAI
        client = OpenAI()
        
        description = request.get("description", "")
        platform = request.get("platform", "flutter")
        features = request.get("features", [])
        app_name = request.get("app_name", "MyApp")
        
        print(f"🏗️ Building COMPLETE {platform} app: {app_name}")
        
        all_files = []
        steps = []
        
        # MEGA PROMPT - Generate everything at once
        mega_prompt = f"""Build a COMPLETE, PRODUCTION-READY {platform} app called "{app_name}":

DESCRIPTION: {description}
FEATURES: {', '.join(features)}

Generate EVERYTHING needed for a professional app:

1. PROJECT STRUCTURE & CORE FILES
   - Config files (pubspec.yaml/package.json/requirements.txt)
   - Main entry point
   - Navigation/routing
   - State management
   - Folder structure

2. FEATURE IMPLEMENTATION
   - All UI screens/pages
   - Business logic/ViewModels
   - API services
   - Models & data classes
   - Local storage
   - Error handling

3. TESTS
   - Unit tests
   - Widget/Component tests
   - Integration tests
   - Test utilities

4. STORE ASSETS (in /store/ folder)
   - APP_STORE_DESCRIPTION.md
   - GOOGLE_PLAY_DESCRIPTION.md
   - PRIVACY_POLICY.md
   - TERMS_OF_SERVICE.md
   - KEYWORDS.md

5. DEPLOYMENT (in /deployment/ folder)
   - .github/workflows/ci-cd.yml
   - fastlane/Fastfile (mobile)
   - vercel.json or netlify.toml (web)
   - .env.example
   - DEPLOYMENT_GUIDE.md

6. DOCUMENTATION
   - Complete README.md with setup instructions

Format EVERY file as:
```language path/to/filename
[COMPLETE CODE]
```

Make it PRODUCTION-READY with:
- Clean architecture
- Error handling
- Loading states
- Responsive design
- Best practices
- Store-ready
- Deploy-ready"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert full-stack developer and app architect. Generate COMPLETE, production-ready apps with ALL files, tests, store assets, and deployment configs. NO placeholders!"},
                {"role": "user", "content": mega_prompt}
            ],
            max_completion_tokens=16000,
            temperature=0.7
        )
        
        generated_content = response.choices[0].message.content or ""
        all_files = parse_generated_code(generated_content, platform)
        
        # Organize files by category
        structure_files = [f for f in all_files if any(x in f["filename"].lower() for x in ['pubspec', 'package.json', 'requirements', 'main.', 'app.'])]
        feature_files = [f for f in all_files if any(x in f["filename"].lower() for x in ['screen', 'page', 'view', 'component', 'service', 'model'])]
        test_files = [f for f in all_files if 'test' in f["filename"].lower()]
        store_files = [f for f in all_files if 'store/' in f["filename"].lower() or any(x in f["filename"].upper() for x in ['PRIVACY', 'TERMS', 'DESCRIPTION'])]
        deploy_files = [f for f in all_files if any(x in f["filename"].lower() for x in ['deployment', 'ci-cd', 'fastlane', 'vercel', 'netlify', '.env'])]
        doc_files = [f for f in all_files if f["filename"].lower().endswith('.md')]
        
        steps = [
            {"step": 1, "name": "Project Structure", "files": len(structure_files), "status": "completed"},
            {"step": 2, "name": "Features", "files": len(feature_files), "status": "completed"},
            {"step": 3, "name": "Tests", "files": len(test_files), "status": "completed"},
            {"step": 4, "name": "Store Assets", "files": len(store_files), "status": "completed"},
            {"step": 5, "name": "Deployment", "files": len(deploy_files), "status": "completed"},
            {"step": 6, "name": "Documentation", "files": len(doc_files), "status": "completed"}
        ]
        
        print(f"✅ Generated {len(all_files)} files!")
        
        return {
            "success": True,
            "app_name": app_name,
            "platform": platform,
            "total_files": len(all_files),
            "files": all_files,
            "steps": steps,
            "file_categories": {
                "structure": structure_files,
                "features": feature_files,
                "tests": test_files,
                "store": store_files,
                "deployment": deploy_files,
                "docs": doc_files
            },
            "message": f"🎉 Complete {platform} app ready for stores & deployment!"
        }
        
    except Exception as e:
        print(f"❌ Build failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 🚀 APP GENERATOR ENDPOINT
@app.post("/api/generate-app")
async def generate_app(request: GenerateAppRequest):
    """
    Generate complete app code using GPT-4o
    Templates: flutter, react, vue, nextjs, react-native
    """
    try:
        print(f"🎨 Generating {request.template} app: {request.description}")
        
        # Template-specific prompts
        template_prompts = {
            "flutter": f"""Create a complete Flutter app with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Complete main.dart file with all code
2. pubspec.yaml with dependencies
3. README.md with setup instructions
4. File structure explanation

Use Material Design 3, clean architecture, and best practices.
Make it production-ready and fully functional.""",

            "react": f"""Create a complete React app with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Complete src/App.jsx with all components
2. package.json with dependencies
3. index.html
4. Basic CSS styling
5. README.md with setup instructions

Use modern React hooks, clean code, and best practices.""",

            "vue": f"""Create a complete Vue 3 app with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Complete App.vue and components
2. package.json with dependencies
3. index.html
4. Basic styling
5. README.md

Use Vue 3 Composition API and best practices.""",

            "nextjs": f"""Create a complete Next.js app with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. pages/index.js and necessary pages
2. package.json
3. components/
4. Styling (Tailwind CSS)
5. README.md

Use Next.js 14, App Router, and TypeScript if beneficial.""",

            "react-native": f"""Create a complete React Native app with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Complete App.js with navigation
2. package.json
3. Components structure
4. README.md with setup

Use modern React Native practices and Expo if suitable.""",

            "swift-ios": f"""Create a complete Swift iOS app with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Complete ContentView.swift and other views
2. App.swift
3. Project structure
4. README.md with Xcode setup

Use SwiftUI, MVVM architecture, and iOS best practices.""",

            "kotlin-android": f"""Create a complete Kotlin Android app with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. MainActivity.kt and other activities
2. build.gradle files
3. XML layouts
4. README.md with Android Studio setup

Use Jetpack Compose or XML, MVVM, and Android best practices.""",

            "python": f"""Create a complete Python application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Complete main.py with all code
2. requirements.txt
3. README.md with setup instructions
4. Config files if needed

Use modern Python 3.10+, type hints, and best practices.""",

            "php": f"""Create a complete PHP application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. index.php and other PHP files
2. composer.json if using packages
3. Database schema if needed
4. README.md with setup

Use modern PHP 8+, PSR standards, and best practices.""",

            "node": f"""Create a complete Node.js application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. server.js or index.js
2. package.json with dependencies
3. Route files if needed
4. README.md with setup

Use modern ES6+, async/await, and Node.js best practices.""",

            "django": f"""Create a complete Django application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. views.py, models.py, urls.py
2. requirements.txt
3. settings.py configuration
4. README.md with setup

Use Django 4+, class-based views, and Django best practices.""",

            "laravel": f"""Create a complete Laravel application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Controllers, Models, Routes
2. composer.json
3. Migration files
4. README.md with setup

Use Laravel 10+, Eloquent ORM, and Laravel best practices.""",

            "express": f"""Create a complete Express.js application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. app.js with routes and middleware
2. package.json
3. Route handlers
4. README.md

Use Express 4+, middleware, and Node.js best practices.""",

            "fastapi": f"""Create a complete FastAPI application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. main.py with routes and models
2. requirements.txt
3. Pydantic models
4. README.md

Use FastAPI, async/await, type hints, and Python best practices.""",

            "spring-boot": f"""Create a complete Spring Boot application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Main application class and controllers
2. pom.xml or build.gradle
3. Entity classes and repositories
4. README.md

Use Spring Boot 3+, JPA, and Java best practices.""",

            "dotnet": f"""Create a complete .NET application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. Program.cs and controllers
2. .csproj file
3. Models and services
4. README.md

Use .NET 8, ASP.NET Core, and C# best practices.""",

            "go": f"""Create a complete Go application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. main.go with handlers
2. go.mod
3. Package structure
4. README.md

Use Go 1.21+, standard library, and Go best practices.""",

            "rust": f"""Create a complete Rust application with the following description:
{request.description}

Features to include: {', '.join(request.features) if request.features else 'Basic functionality'}

Provide:
1. main.rs with complete code
2. Cargo.toml
3. Module structure
4. README.md

Use Rust 2021 edition, error handling, and Rust best practices."""
        }
        
        prompt = template_prompts.get(request.template, template_prompts["react"])
        
        # Call OpenAI
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model=request.model or "gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert software developer. Generate clean, production-ready code. Always provide complete, working code without placeholders or TODOs."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_completion_tokens=16000,  # GPT-4o supports up to 16k completion tokens
            temperature=0.7
        )
        
        generated_code = response.choices[0].message.content or ""
        
        # Parse the generated code into files
        files = parse_generated_code(generated_code, request.template)
        
        return {
            "success": True,
            "template": request.template,
            "description": request.description,
            "files": files,
            "raw_output": generated_code,
            "model_used": request.model,
            "tokens_used": response.usage.total_tokens if response.usage else 0
        }
        
    except Exception as e:
        print(f"❌ App generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def parse_generated_code(code: str, template: str):
    """Parse GPT output into separate files"""
    files = []
    
    # Simple parser - looks for markdown code blocks
    import re
    
    # Pattern: ```language filename\ncode\n```
    pattern = r'```(\w+)?\s*([^\n]*)\n(.*?)```'
    matches = re.findall(pattern, code, re.DOTALL)
    
    for lang, filename, content in matches:
        if filename:
            files.append({
                "filename": filename.strip(),
                "language": lang or "text",
                "code": content.strip()
            })
    
    # If no files found, create default main file
    if not files:
        main_files = {
            "flutter": "main.dart",
            "react": "App.jsx",
            "vue": "App.vue",
            "nextjs": "page.js",
            "react-native": "App.js"
        }
        files.append({
            "filename": main_files.get(template, "main.js"),
            "language": template,
            "code": code
        })
    
    return files

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8005, reload=True)
