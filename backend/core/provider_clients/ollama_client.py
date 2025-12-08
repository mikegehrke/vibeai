import httpx


class OllamaProvider:
    """
    Ollama Local AI Client:
    - Lokale KI-Modelle (llama-3.1, phi3, deepseek, mixtral, mistral, etc.)
    - Kostenlos (0 USD)
    - Super schnell
    - Perfekt für Free Tier & Dev Mode
    - Vision Unterstützung möglich (llava)
    - Kompatibel mit Multi-Agent-System (Aura/Cora/Devra/Lumi)
    - Billing → 0 USD (aber Tokens werden sauber erfasst)
    - Fallback wenn Ollama nicht läuft
    - Einheitliche Antwortstruktur
    """

    BASE_URL = "http://localhost:11434"

    async def generate(self, model: str, messages: list, context: dict):
        """
        Einheitliche Schnittstelle für Ollama.
        Kompatibel mit VibeAI ModelWrapper.

        Args:
            model: Ollama Modellname (llama3.1, phi3, deepseek-coder, etc.)
            messages: Liste von {role, content} Nachrichten
            context: Kontext mit max_tokens, temperature, etc.

        Returns:
            {
                provider: "ollama",
                model: str,
                message: str,
                input_tokens: int,
                output_tokens: int
            }
        """

        url = f"{self.BASE_URL}/api/chat"

        # Ollama Chat Format
        ollama_messages = []
        for m in messages:
            role = m.get("role", "user")
            content = m.get("content")

            # Text & Multimodal Verarbeitung
            if isinstance(content, list):
                # Vision Support (für llava o.ä.)
                text_parts = []
                images = []
                for part in content:
                    if part.get("type") == "input_image":
                        # Base64 Image für Vision-Modelle
                        images.append(part.get("image", ""))
                    elif part.get("type") == "input_text":
                        text_parts.append(part.get("text", ""))
                    else:
                        text_parts.append(str(part))

                message_content = " ".join(text_parts)
                msg = {"role": role, "content": message_content}
                if images:
                    msg["images"] = images
                ollama_messages.append(msg)
            else:
                ollama_messages.append({"role": role, "content": str(content)})

        body = {
            "model": model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": context.get("temperature", 0.7),
                "num_predict": context.get("max_tokens", 500),
            },
        }

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                resp = await client.post(url, json=body)
                data = resp.json()

                # Ollama Output extrahieren
                output_text = data.get("message", {}).get("content", "")

                # Token Schätzung (Ollama liefert keine echten Tokens)
                # Wir schätzen: ~4 chars = 1 token (Standard-Regel)
                input_text = " ".join([str(m.get("content", "")) for m in ollama_messages])
                input_tokens = len(input_text) // 4
                output_tokens = len(output_text) // 4

            except Exception as e:
                # Fallback wenn Ollama nicht läuft
                output_text = (
                    f"Ollama unavailable. Please ensure Ollama is running on {self.BASE_URL}. Error: {str(e)}"
                )
                input_tokens = 0
                output_tokens = 0

        return {
            "provider": "ollama",
            "model": model,
            "message": output_text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }

    async def generate_embeddings(self, model: str, text: str):
        """
        Optional: Embeddings Generation für RAG/Search.

        Args:
            model: Embedding-Modell (z.B. "nomic-embed-text")
            text: Text für Embedding

        Returns:
            List[float]: Embedding-Vektor
        """
        url = f"{self.BASE_URL}/api/embeddings"

        body = {"model": model, "prompt": text}

        async with httpx.AsyncClient(timeout=15) as client:
            try:
                resp = await client.post(url, json=body)
                data = resp.json()
                return data.get("embedding", [])
            except Exception:
                return []