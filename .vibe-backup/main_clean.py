"""VibeAI - Clean Minimal Version"""

import json
import os
from typing import Optional

import anthropic

# AI Clients
import openai
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

try:
    import google.generativeai as genai

    genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))  # type: ignore
    GENAI_AVAILABLE = True
except (ImportError, AttributeError):
    genai = None
    GENAI_AVAILABLE = False

load_dotenv()

app = FastAPI(title="VibeAI API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    model: str
    prompt: str
    agent: Optional[str] = "aura"
    stream: Optional[bool] = False
    system_prompt: Optional[str] = None
    conversation_history: Optional[list] = []  # Add conversation history


@app.get("/")
async def root():
    return {"name": "VibeAI API", "status": "running", "version": "2.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


def build_messages(request: ChatRequest):
    """Build messages array from conversation history + current prompt"""
    messages = []

    # Add system prompt if provided
    if request.system_prompt and not any(x in request.model.lower() for x in ["o1", "o3", "gpt-5"]):
        messages.append({"role": "system", "content": request.system_prompt})

    # Add conversation history
    if request.conversation_history:
        for msg in request.conversation_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})

    # Add current prompt
    if request.system_prompt and any(x in request.model.lower() for x in ["o1", "o3", "gpt-5"]):
        # O1/O3/GPT-5: prepend system prompt to user message
        messages.append({"role": "user", "content": f"{request.system_prompt}\n\n{request.prompt}"})
    else:
        messages.append({"role": "user", "content": request.prompt})

    return messages


async def stream_chat(request: ChatRequest):
    """Stream chat responses word-by-word"""
    try:
        model = request.model.lower()

        # OpenAI/GitHub/GPT Models - Best streaming support
        if "gpt" in model or "o1" in model or "phi" in model or "o" == model[0]:
            if "phi" in model:
                client = openai.OpenAI(
                    api_key=os.getenv("GITHUB_TOKEN"),
                    base_url="https://models.inference.ai.azure.com",
                )
            else:
                client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

            # O1/O3/GPT-5 don't support streaming well, use regular response
            if any(x in model for x in ["o1", "o3", "gpt-5"]):
                messages = build_messages(request)

                response = client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    max_completion_tokens=16000,
                    timeout=120.0,
                )
                content = response.choices[0].message.content or ""
                yield f"data: {json.dumps({'content': content, 'done': True})}\n\n"
            else:
                # Streaming for GPT-4o, GPT-4o-mini, etc.
                messages = build_messages(request)

                stream = client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2000,
                    stream=True,
                )
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"

        # Gemini Models
        elif "gemini" in model:
            if not GENAI_AVAILABLE or genai is None:
                yield f'data: {{"error": "Google Generative AI not available", "done": true}}\n\n'
                return
            genai_model = genai.GenerativeModel(request.model)  # type: ignore
            response = genai_model.generate_content(request.prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield f"data: {json.dumps({'content': chunk.text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        # Claude Models
        elif "claude" in model:
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            with client.messages.stream(
                model=request.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": request.prompt}],
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {json.dumps({'content': text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        # Ollama
        else:
            import httpx

            ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            async with httpx.AsyncClient() as http_client:
                async with http_client.stream(
                    "POST",
                    f"{ollama_url}/api/generate",
                    json={
                        "model": request.model,
                        "prompt": request.prompt,
                        "stream": True,
                    },
                    timeout=60.0,
                ) as response:
                    async for line in response.aiter_lines():
                        if line:
                            data = json.loads(line)
                            if data.get("response"):
                                yield f"data: {json.dumps({'content': data['response']})}\n\n"
                    yield f"data: {json.dumps({'done': True})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat with AI models - supports streaming"""

    # If streaming requested, return streaming response
    if request.stream:
        return StreamingResponse(stream_chat(request), media_type="text/event-stream")

    # Non-streaming response
    try:
        model = request.model.lower()

        # Claude Models (Anthropic)
        if "claude" in model:
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            message = client.messages.create(
                model=request.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": request.prompt}],
            )
            # Extract text from content blocks
            response_text = ""
            for block in message.content:
                if hasattr(block, "text") and hasattr(block, "__class__") and block.__class__.__name__ == "TextBlock":
                    response_text += block.text  # type: ignore
            return {
                "response": response_text,
                "model": request.model,
                "agent": request.agent,
                "provider": "Anthropic",
                "success": True,
            }

        # Gemini Models (Google)
        elif "gemini" in model:
            if not GENAI_AVAILABLE or genai is None:
                return {
                    "error": "Google Generative AI not available. Install with: pip install google-generativeai",
                    "success": False,
                }
            genai_model = genai.GenerativeModel(request.model)  # type: ignore
            response = genai_model.generate_content(request.prompt)
            return {
                "response": response.text,
                "model": request.model,
                "agent": request.agent,
                "provider": "Google",
                "success": True,
            }

        # GitHub Models or OpenAI Models
        elif "gpt" in model or "o1" in model or "phi" in model or "o" == model[0]:
            # GitHub Models use same API as OpenAI
            if "phi" in model:
                # Use GitHub Models endpoint
                client = openai.OpenAI(
                    api_key=os.getenv("GITHUB_TOKEN"),
                    base_url="https://models.inference.ai.azure.com",
                )
            else:
                # Use OpenAI directly
                client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

            # O1, O3, GPT-5 models use max_completion_tokens
            if any(x in model for x in ["o1", "o3", "gpt-5"]):
                print(f"⏳ Starting GPT-5/O1/O3 request (can take 30-60s)...")

                # Build messages with conversation history
                messages = build_messages(request)

                response = client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    max_completion_tokens=16000,  # High limit: reasoning_tokens + output_tokens
                    timeout=120.0,  # 2 minutes for reasoning models
                )
                print(f"✅ GPT-5/O1/O3 responded!")
                print(f"🔍 Finish reason: {response.choices[0].finish_reason}")
                print(f"🔍 Usage: {response.usage}")
                if response.choices[0].message.content:
                    print(f"🔍 Content length: {len(response.choices[0].message.content)} chars")
                else:
                    print(f"⚠️  WARNING: Empty content! finish_reason={response.choices[0].finish_reason}")
            else:
                # Build messages with conversation history
                messages = build_messages(request)

                response = client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2000,
                    timeout=60.0,  # 1 minute for normal models
                )

            return {
                "response": response.choices[0].message.content,
                "model": request.model,
                "agent": request.agent,
                "provider": "GitHub Models" if "phi" in model else "OpenAI",
                "success": True,
            }

        # Ollama Models
        else:
            import httpx

            ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

            # Build full prompt with conversation history
            full_prompt = ""
            if request.system_prompt:
                full_prompt += f"{request.system_prompt}\n\n"

            # Add conversation history
            if request.conversation_history:
                for msg in request.conversation_history:
                    role_label = "User" if msg["role"] == "user" else "Assistant"
                    full_prompt += f"{role_label}: {msg['content']}\n\n"

            # Add current prompt
            full_prompt += f"User: {request.prompt}\n\nAssistant:"

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{ollama_url}/api/generate",
                    json={
                        "model": request.model,
                        "prompt": full_prompt,
                        "stream": False,
                    },
                    timeout=60.0,
                )
                data = response.json()
                return {
                    "response": data.get("response", ""),
                    "model": request.model,
                    "agent": request.agent,
                    "provider": "Ollama",
                    "success": True,
                }

    except Exception as e:
        return {"response": f"Error: {str(e)}", "success": False, "error": str(e)}
