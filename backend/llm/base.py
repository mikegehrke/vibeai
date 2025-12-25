# backend/llm/base.py
# ------------------
# Base-Interface für alle LLM-Clients.
# Jeder Client (OpenAI, Anthropic, Gemini, Ollama)
# muss dieses Interface implementieren.

from abc import ABC, abstractmethod


class BaseLLM(ABC):
    """
    Abstraktes Interface für LLM-Clients.
    
    Alle konkreten Implementierungen müssen:
    - async stream() bereitstellen
    - Text-Chunks yielden (async generator)
    """

    @abstractmethod
    async def stream(self, prompt: str, system_prompt: str = None):
        """
        Streamt Text-Chunks vom Modell.
        
        Args:
            prompt: User-Nachricht
            system_prompt: Optionaler System-Prompt
            
        Yields:
            str: Text-Chunks (Token oder Wort-weise)
        """
        pass
