# backend/llm/openai_client.py
# ---------------------------
# OpenAI Client-Wrapper für LLM-Router

import os
import openai
from llm.base import BaseLLM


class OpenAIClient(BaseLLM):
    """
    OpenAI GPT Client mit Streaming-Support.
    """

    def __init__(self, model: str = "gpt-4o-mini", api_key: str = None):
        """
        Args:
            model: OpenAI Modell-ID (z.B. "gpt-4o", "gpt-4o-mini")
            api_key: Optional API Key (nutzt ENV wenn nicht gegeben)
        """
        self.model = model
        self.client = openai.OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))

    async def stream(self, prompt: str, system_prompt: str = None):
        """
        Streamt Antwort von OpenAI.
        
        Args:
            prompt: User-Nachricht
            system_prompt: Optionaler System-Prompt
            
        Yields:
            str: Text-Chunks
        """
        import asyncio
        
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
            
        messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True,
                temperature=0.7,
            )

            # OpenAI stream ist synchron, also in executor laufen lassen
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    await asyncio.sleep(0)  # Yield control

        except Exception as e:
            yield f"❌ OpenAI Error: {str(e)}"
