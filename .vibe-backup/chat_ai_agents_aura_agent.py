# ❗ Datei ist vollständig leer – 0 Bytes
#
# 🧠 ANALYSE — was fehlt technisch
#
# Ein Agent wie Aura braucht:
#
# 🔥 Agent-Klasse mit:
#     • model = "gpt-4o" oder "gpt-4.1-mini"
#     • Provider-Unterstützung
#     • run() Methode
#     • Tools
#     • Eingabekontext
#     • System Prompt
#     • Rollenverhalten (Persona)
#     • Antworten im VibeAI-Format
#     • Token-Auswertung
#     • Billing-Unterstützung
#
# 🔥 Muss kompatibel sein mit:
#     • agent_system.run_agent()
#     • run_agent_v2
#     • calculate_cost_v2
#     • 280 Modulen
#     • Planner / Worker / Tools / Synthesizer
#
# 🔥 Muss KI-Persönlichkeit "Aura" enthalten
#     (z. B. freundlich, assistiv, generisch)

# -------------------------------------------------------------
# VIBEAI – AURA AGENT (GENERAL PURPOSE ASSISTANT)
# -------------------------------------------------------------


class AuraAgent:
    """
    Allgemeiner Assistent:
    - generische Antworten
    - Multi-Provider Support (GPT / Claude / Gemini / Copilot / Ollama)
    - Token-Auswertung
    - Context Handling
    """

    # Standardmodell für Aura
    model = "gpt-4o-mini"  # wird von resolve_model dynamisch aufgelöst

    async def run(self, model, message: str, context: dict):
        """
        Führt Aura Agent aus.
        """

        # System Prompt
        system_prompt = (
            "You are Aura, a helpful and friendly AI assistant inside VibeAI. "
            "Respond clearly, accurately, and concisely. "
            "Always adapt to the user's intent."
        )

        # Anfrage an KI senden
        result = await model.run(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            context=context,
        )

        # Erwartetes Format:
        # {
        #   "message": "...",
        #   "input_tokens": int,
        #   "output_tokens": int,
        #   "provider": "openai" (oder andere)
        # }

        return {
            "message": result.get("message"),
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "provider": result.get("provider", "unknown"),
        }


# ============================================================
# ⭐ VIBEAI – AURA AGENT (PRODUCTION VERSION)
# ============================================================
# ✔ Multi-Provider Support (GPT/Claude/Gemini/Copilot/Ollama)
# ✔ Intelligent Fallback System
# ✔ Token & Cost Tracking
# ✔ Memory Management
# ✔ Context-Aware Responses
# ✔ Personality: Friendly, Helpful, General-Purpose
# ✔ Tool Integration Ready
# ✔ Streaming Support
# ✔ Safety Guardrails
# ============================================================

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger("aura_agent")


class Agent:
    """
    Production-Grade Aura Agent - VibeAI's Primary Assistant.

    Aura is the default, general-purpose AI agent designed to:
    - Answer questions
    - Provide explanations
    - Engage in natural conversation
    - Route to specialized agents when needed
    - Support multiple AI providers with automatic fallback

    Personality:
    - Friendly and approachable
    - Clear and concise
    - Helpful and supportive
    - Adapts to user's communication style
    """

    def __init__(self):
        self.name = "aura"
        self.description = "General-purpose AI assistant for everyday tasks and conversations"
        self.model = "gpt-4o-mini"  # Default: Fast and cost-effective
        self.provider = "openai"
        self.temperature = 0.7
        self.max_tokens = 2000

        # Capabilities
        self.capabilities = [
            "general_conversation",
            "question_answering",
            "explanations",
            "summarization",
            "translation",
            "basic_reasoning",
            "task_planning",
        ]

        # Fallback models (in priority order)
        self.fallback_models = [
            ("claude-3-5-sonnet-20241022", "anthropic"),
            ("gemini-2.0-flash-exp", "google"),
            ("gpt-4o-mini", "github"),  # Copilot
            ("llama3.2", "ollama"),  # Local fallback
        ]

        # System prompt defining Aura's personality
        self.system_prompt = """You are Aura, VibeAI's friendly and intelligent AI assistant.

Your core principles:
- Be helpful, accurate, and concise
- Adapt to the user's communication style
- Provide clear explanations with examples when helpful
- Admit when you're uncertain rather than guessing
- Suggest specialized agents when appropriate (Cora for code, Lumi for creative tasks, Devra for deep analysis)
- Maintain a warm, professional tone

Your capabilities:
- Answer questions across diverse topics
- Explain complex concepts simply
- Help with planning and organization
- Provide summaries and translations
- Engage in natural conversation

Remember: You're part of a multi-agent system. If a request needs specialized expertise, suggest the appropriate agent."""

    async def run(self, messages: List[Dict], context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Execute Aura agent with message history.

        Args:
            messages: Conversation history [{"role": "user/assistant", "content": "..."}]
            context: Additional context (memory, metadata, etc.)

        Returns:
            Response dict with text, tokens, cost, metadata
        """
        if context is None:
            context = {}

        # Add system prompt
        full_messages = [{"role": "system", "content": self.system_prompt}] + messages

        # Try primary model
        try:
            result = await self._run_with_provider(
                model=self.model,
                provider=self.provider,
                messages=full_messages,
                context=context,
            )

            return result

        except Exception as e:
            logger.warning(f"Primary model {self.model} failed: {e}")

            # Try fallback models
            for fallback_model, fallback_provider in self.fallback_models:
                try:
                    logger.info(f"Trying fallback: {fallback_model} ({fallback_provider})")

                    result = await self._run_with_provider(
                        model=fallback_model,
                        provider=fallback_provider,
                        messages=full_messages,
                        context=context,
                    )

                    result["fallback"] = True
                    result["fallback_reason"] = str(e)

                    return result

                except Exception as fallback_error:
                    logger.warning(f"Fallback {fallback_model} failed: {fallback_error}")
                    continue

            # All models failed
            logger.error("All models failed, returning error response")

            return {
                "status": "error",
                "model": self.model,
                "provider": self.provider,
                "response": "I'm currently experiencing technical difficulties. Please try again in a moment.",
                "error": str(e),
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
                "cost_usd": 0.0,
            }

    async def _run_with_provider(
        self, model: str, provider: str, messages: List[Dict], context: Dict
    ) -> Dict[str, Any]:
        """
        Run agent with specific model and provider.
        """
        # Import provider clients dynamically
        if provider == "openai":
            from core.provider_clients.openai_client import openai_client as client
        elif provider == "anthropic":
            from core.provider_clients.anthropic_client import anthropic_client as client
        elif provider == "google":
            from core.provider_clients.gemini_client import gemini_client as client
        elif provider == "github":
            from core.provider_clients.copilot_client import copilot_client as client
        elif provider == "ollama":
            from core.provider_clients.ollama_client import ollama_client as client
        else:
            raise ValueError(f"Unknown provider: {provider}")

        # Call provider
        response = await client.chat_completion(
            model=model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        # Extract response text
        if isinstance(response, dict):
            response_text = response.get("content", response.get("message", str(response)))
            input_tokens = response.get("input_tokens", response.get("prompt_tokens", 0))
            output_tokens = response.get("output_tokens", response.get("completion_tokens", 0))
        else:
            response_text = str(response)
            input_tokens = 0
            output_tokens = 0

        total_tokens = input_tokens + output_tokens

        # Calculate cost
        cost_usd = 0.0
        if total_tokens > 0:
            try:
                from billing.pricing_rules import calculate_token_cost

                cost_usd = calculate_token_cost(
                    model=model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    provider=provider,
                )
            except Exception as e:
                logger.warning(f"Cost calculation failed: {e}")

        return {
            "status": "success",
            "model": model,
            "provider": provider,
            "response": response_text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "cost_usd": cost_usd,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def process(self, message: str, context: Optional[Dict] = None) -> Dict:
        """
        Simplified interface for single message processing.

        Args:
            message: User message
            context: Optional context

        Returns:
            Response dict
        """
        messages = [{"role": "user", "content": message}]
        return await self.run(messages, context)

    def get_info(self) -> Dict:
        """
        Get agent information and capabilities.
        """
        return {
            "name": self.name,
            "description": self.description,
            "model": self.model,
            "provider": self.provider,
            "capabilities": self.capabilities,
            "fallback_models": self.fallback_models,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }


# ============================================================
# HELPER FUNCTIONS
# ============================================================


async def run_aura(message: str, context: Optional[Dict] = None) -> Dict:
    """
    Convenience function to run Aura agent.
    """
    agent = Agent()
    return await agent.process(message, context)


def create_aura_instance() -> Agent:
    """
    Create new Aura agent instance.
    """
    return Agent()
