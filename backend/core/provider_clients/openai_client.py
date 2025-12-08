import base64
import os

import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class OpenAIProvider:
    """
    Universeller OpenAI-Client.
    Unterstützt:
    - GPT-5.x (z.B. gpt-5, gpt-5.1, gpt-5-mini)
    - GPT-4.1 / 4.1-mini
    - GPT-4o / 4o-mini / 4o-realtime / 4o-audio
    - o-Series (o1, o3, o3-mini, o3-mini-high)
    - 3.5-turbo (Legacy)
    - Ruby / Code-Augmented Modelle
    - künftige Modelle automatisch

    Zukunftssicher: Wenn OpenAI morgen "gpt-6", "gpt-7" oder "o5"
    veröffentlicht, funktioniert alles automatisch.
    """

    API_URL = "https://api.openai.com/v1/chat/completions"

    async def generate(self, model: str, messages: list, context: dict):
        """
        Einheitliche Schnittstelle für VibeAI.
        OpenAI Modelle benötigen:
        - model
        - messages (role + content)
        - max_tokens
        - temperature
        - evtl. vision/audio parts

        Args:
            model: OpenAI Modellname (gpt-5, gpt-4o, o3, etc.)
            messages: Liste von {role, content} Nachrichten
            context: Kontext mit max_output_tokens, temperature, etc.

        Returns:
            {
                provider: "openai",
                model: str,
                message: str,
                input_tokens: int,
                output_tokens: int
            }
        """

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        # Multimodal: Vision, Audio, Files
        prepared_messages = []
        for m in messages:
            role = m.get("role")
            content = m.get("content")

            # multimodale Inhalte
            if isinstance(content, list):
                parts = []
                for c in content:
                    if c.get("type") == "input_text":
                        parts.append({"type": "text", "text": c["text"]})

                    elif c.get("type") == "input_image":
                        # OpenAI benötigt Base64
                        image_b64 = base64.b64encode(c["image"]).decode("utf-8")
                        parts.append(
                            {
                                "type": "image_url",
                                "image_url": f"data:image/jpeg;base64,{image_b64}",
                            }
                        )

                    elif c.get("type") == "input_audio":
                        parts.append(
                            {
                                "type": "input_audio",
                                "audio": c["audio"].decode("latin1"),
                                "format": "wav",
                            }
                        )

                prepared_messages.append({"role": role, "content": parts})
            else:
                # normaler Text
                prepared_messages.append({"role": role, "content": content})

        body = {
            "model": model,
            "messages": prepared_messages,
            "max_tokens": context.get("max_output_tokens", 500),
            "temperature": context.get("temperature", 0.4),
        }

        # Realtime-Modelle haben Zusatzparameter
        if "realtime" in model:
            body["stream"] = False

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(self.API_URL, headers=headers, json=body)
                data = resp.json()

            output = data.get("choices", [{}])[0].get("message", {}).get("content", "")

            usage = data.get("usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)

        except Exception as e:
            output = f"OpenAI error: {str(e)}"
            input_tokens = 0
            output_tokens = 0

        return {
            "provider": "openai",
            "model": model,
            "message": output,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }