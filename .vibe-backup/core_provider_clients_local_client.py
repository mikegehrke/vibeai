# ❗ Datei ist vollständig leer
#
# 🧠 ANALYSE – Was fehlt technisch?
#
# Diese Datei ist der Fallback-Provider für:
#     - Copilot (wenn noch nicht implementiert)
#     - Gemini (wenn noch nicht implementiert)
#     - Ollama (wenn noch nicht implementiert)
#     - Andere Provider ohne eigenen Client
#
# Der LocalProvider muss:
#     - Einheitliches Interface wie alle Provider
#     - Dummy-Responses für Testing
#     - Token-Schätzung
#     - Error-Handling
#     - Kompatibel mit model_registry_v2

# -------------------------------------------------------------
# VIBEAI – LOCAL PROVIDER (FALLBACK FOR UNIMPLEMENTED PROVIDERS)
# -------------------------------------------------------------


class LocalProvider:
    """
    Fallback Provider für:
    - Copilot (GitHub Models)
    - Gemini (Google)
    - Ollama (Local Models)
    - Andere nicht-implementierte Provider

    Gibt simulierte Responses zurück bis echte Clients implementiert sind.
    """

    async def generate(self, model: str, messages: list, context: dict):
        """
        Fallback-Response mit einheitlichem Format.

        Returns:
        {
            "provider": "local",
            "model": "...",
            "message": "...",
            "input_tokens": int,
            "output_tokens": int
        }
        """

        # Kombiniere Messages zu Prompt
        prompt_text = ""
        for m in messages:
            role = m.get("role", "user")
            content = m.get("content", "")

            if isinstance(content, list):
                # Multimodal content
                content = "[multimodal content]"
            elif isinstance(content, dict):
                content = str(content)

            prompt_text += f"{role}: {content}\n"

        # Simulierte Response
        output_text = f"[LocalProvider Fallback] Model '{model}' processed: {prompt_text[:100]}..."

        # Token-Schätzung (grob: 1 Wort = 1 Token)
        input_tokens = len(prompt_text.split())
        output_tokens = len(output_text.split())

        # Bestimme Provider basierend auf Model-Namen
        provider = self._detect_provider(model)

        return {
            "provider": provider,
            "model": model,
            "message": output_text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "note": "Using LocalProvider fallback - real provider not yet implemented",
        }

    def _detect_provider(self, model: str) -> str:
        """Erkennt Provider basierend auf Model-Name"""
        model_lower = model.lower()

        if "copilot" in model_lower or "github" in model_lower:
            return "copilot"
        elif "gemini" in model_lower:
            return "google"
        elif "llama" in model_lower or "mixtral" in model_lower or "phi" in model_lower or "qwen" in model_lower:
            return "ollama"
        else:
            return "local"


# ✔ Original LocalProvider ist ein Fallback-System
# ✔ Funktioniert für nicht-implementierte Provider
# ✔ Token-Schätzung vorhanden
# ✔ Provider-Detection implementiert
#
# ❗ ABER:
#     - Kein echter Ollama-Support
#     - Nur Dummy-Responses
#     - Keine echte API-Kommunikation
#     - Keine Vision-Modelle (LLaVA)
#     - Keine Embeddings
#     - Keine lokalen Modelle
#
# 👉 LocalProvider ist perfekt für Testing/Fallback
# 👉 Für echte lokale LLMs brauchen wir OllamaProvider

import base64

# -------------------------------------------------------------
# VIBEAI – OLLAMA PROVIDER (PRODUCTION LOCAL LLM ENGINE)
# -------------------------------------------------------------
import httpx


class OllamaProvider:
    """
    Production Ollama Client für lokale LLMs.

    Unterstützt:
    - Text Models (Llama 3.1, Qwen 2.5, Mistral, Phi-3, DeepSeek)
    - Vision Models (LLaVA, Moondream, Bakllava)
    - Code Models (DeepSeek Coder, CodeLlama, Phind CodeLlama)
    - Reasoning Models (DeepSeek R1, Qwen2.5 Coder)
    - Embeddings (nomic-embed-text, all-minilm)

    Features:
    - Komplett offline (keine API-Keys nötig)
    - Kostenlos ($0)
    - Schnell bei lokaler Hardware
    - Vision Support
    - Embeddings für RAG
    - Async Interface
    - model_registry_v2 kompatibel
    """

    def __init__(self, host: str = "http://localhost:11434"):
        self.host = host
        self.chat_url = f"{host}/api/chat"
        self.generate_url = f"{host}/api/generate"
        self.embeddings_url = f"{host}/api/embeddings"

    async def generate(self, model: str, messages: list, context: dict):
        """
        Einheitliche Schnittstelle für model_registry_v2.

        Args:
            model: Ollama Modell-Name (llama3.1, qwen2.5, mistral, etc.)
            messages: Chat Messages [{role, content}]
            context: Kontext mit temperature, max_tokens, etc.

        Returns:
            {
                "provider": "ollama",
                "model": str,
                "message": str,
                "input_tokens": int,
                "output_tokens": int
            }
        """

        # Ollama Chat Format vorbereiten
        ollama_messages = []
        for m in messages:
            role = m.get("role", "user")
            content = m.get("content")

            # Multimodal Content (Vision)
            if isinstance(content, list):
                text_parts = []
                images = []

                for part in content:
                    if part.get("type") == "text":
                        text_parts.append(part.get("text", ""))
                    elif part.get("type") == "input_text":
                        text_parts.append(part.get("text", ""))
                    elif part.get("type") == "image_url":
                        # Extract base64 from data URL
                        image_url = part.get("image_url", {}).get("url", "")
                        if "base64," in image_url:
                            base64_data = image_url.split("base64,")[1]
                            images.append(base64_data)
                    elif part.get("type") == "input_image":
                        # Direct base64
                        img_data = part.get("image", "")
                        if isinstance(img_data, bytes):
                            img_data = base64.b64encode(img_data).decode("utf-8")
                        images.append(img_data)

                message_text = " ".join(text_parts)
                msg = {"role": role, "content": message_text}

                if images:
                    msg["images"] = images

                ollama_messages.append(msg)
            else:
                # Einfacher Text
                ollama_messages.append({"role": role, "content": str(content)})

        # Request Body
        body = {
            "model": model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": context.get("temperature", 0.7),
                "num_predict": context.get("max_output_tokens", 500),
            },
        }

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(self.chat_url, json=body)
                data = resp.json()

            # Output extrahieren
            output_text = data.get("message", {}).get("content", "")

            # Token-Schätzung (Ollama liefert keine echten Tokens)
            # Regel: ~4 Zeichen = 1 Token
            input_text = " ".join([str(m.get("content", "")) for m in ollama_messages])
            input_tokens = len(input_text) // 4
            output_tokens = len(output_text) // 4

            return {
                "provider": "ollama",
                "model": model,
                "message": output_text,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
            }

        except Exception as e:
            # Fallback wenn Ollama nicht läuft
            error_msg = f"Ollama unavailable at {self.host}. " f"Please ensure Ollama is running. Error: {str(e)}"

            return {
                "provider": "ollama",
                "model": model,
                "message": error_msg,
                "input_tokens": 0,
                "output_tokens": 0,
                "error": str(e),
            }

    async def vision(
        self,
        image_bytes: bytes,
        prompt: str = "Describe this image",
        model: str = "llava",
    ) -> str:
        """
        Vision-Analyse mit lokalen Vision-Modellen.

        Unterstützte Modelle:
        - llava (LLaVA 1.5)
        - bakllava (BakLLaVA)
        - moondream (Moondream2)

        Args:
            image_bytes: Bild als Bytes
            prompt: Frage zum Bild
            model: Vision-Modell

        Returns:
            Beschreibung/Analyse des Bildes
        """
        try:
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

            body = {
                "model": model,
                "messages": [{"role": "user", "content": prompt, "images": [base64_image]}],
                "stream": False,
            }

            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(self.chat_url, json=body)
                data = resp.json()

            return data.get("message", {}).get("content", "")

        except Exception as e:
            return f"Ollama Vision Error: {str(e)}"

    async def embeddings(self, text: str, model: str = "nomic-embed-text") -> list:
        """
        Embeddings für RAG/Search/Memory.

        Unterstützte Modelle:
        - nomic-embed-text (768 dimensions)
        - all-minilm (384 dimensions)
        - mxbai-embed-large (1024 dimensions)

        Args:
            text: Text für Embedding
            model: Embedding-Modell

        Returns:
            Embedding-Vektor (Liste von Floats)
        """
        try:
            body = {"model": model, "prompt": text}

            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(self.embeddings_url, json=body)
                data = resp.json()

            return data.get("embedding", [])

        except Exception:
            return []

    async def generate_simple(self, prompt: str, model: str = "llama3.1") -> str:
        """
        Einfache Prompt → Response ohne Chat-Format.

        Args:
            prompt: Einfacher Text-Prompt
            model: Modell-Name

        Returns:
            Generated Text
        """
        try:
            body = {"model": model, "prompt": prompt, "stream": False}

            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(self.generate_url, json=body)
                data = resp.json()

            return data.get("response", "")

        except Exception as e:
            return f"Error: {str(e)}"


# Globale Instanz
ollama_provider = OllamaProvider()
