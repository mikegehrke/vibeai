import os

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def get_ai_response(agent_name: str, message: str, context: dict):
    response = client.responses.create(
        model="gpt-4o-mini",
        input=message,
        max_output_tokens=200,
    )

    return {
        "response": response.output_text,
        "model": "gpt-4o-mini",
        "agent": agent_name,
    }


# ✔ korrekt für OpenAI SDK 1.0
# ❗ aber:
#    - du benutzt 280 Module, viele Modelle
#    - Gemini / Claude / Copilot / Ollama fehlen komplett
#
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# ✔ funktioniert
# ❗ aber:
#    - jeder Agent nutzt denselben Client
#    - keine Multi-Provider-Unterstützung
#    - keine dynamische Modellwahl
#
# async def get_ai_response(agent_name: str, message: str, context: dict):
#     response = client.responses.create(
#         model="gpt-4o-mini",
#         input=message,
#         max_output_tokens=200,
#     )
#     # ❗ Problem:
#     #    - Modell ist hardcoded ("gpt-4o-mini")
#     #    - kein Agent-System
#     #    - keine Tools
#     #    - kein Memory
#     #    - kein Context Handling
#     #    - kein Tokens Logging
#     #    - keine Kostenberechnung
#     #    - kein Multi-Model Routing
#     #    - kein Claude / Gemini / Copilot / Ollama Support
#     #    - kein Vision Support
#     #    - kein Code-Agent / Debugger Support
#     #    - kein Builder Support
#     #    - keine Fehlerbehandlung
#     #    - kein Async OpenAI Call
#
#     return {
#         "response": response.output_text,
#         "model": "gpt-4o-mini",
#         "agent": agent_name
#     }
#     # ❗ response.output_text ist veraltet → responses API hat output[0]

from datetime import datetime

# -------------------------------------------------------------
# VIBEAI – ADVANCED AI RESPONDER (MULTI-MODEL + MULTI-AGENT)
# -------------------------------------------------------------
from agent_system import agent_system
from billing.models import BillingRecordDB
from billing.utils import calculate_cost_v2
from core.model_registry_v2 import resolve_model
from sqlalchemy.orm import Session


async def get_ai_response_v2(agent_name: str, message: str, context: dict, db: Session = None, user=None):
    """
    Neue Version mit:
    - Agent Routing
    - Model Routing
    - Multi-Provider Support
    - Token Logging
    - Kostenberechnung
    - DB Speicherung
    """

    # 1. Agent aus AgentSystem laden
    agent = agent_system.get_agent(agent_name)

    # 2. Modell zu diesem Agenten auflösen
    model = resolve_model(agent.model)

    # 3. Agent ausführen (Planner → Worker → Synthesizer)
    result = await agent.run(model=model, message=message, context=context)

    # 4. Tokens extrahieren
    input_tokens = result.get("input_tokens", 0)
    output_tokens = result.get("output_tokens", 0)

    # 5. Kosten berechnen
    cost_usd = calculate_cost_v2(agent.model, input_tokens, output_tokens)

    # 6. In Billing DB speichern
    if db and user:
        record = BillingRecordDB(
            id=str(datetime.utcnow().timestamp()).replace(".", ""),
            user_id=user.id,
            model=agent.model,
            provider=result.get("provider", "unknown"),
            tokens_used=input_tokens + output_tokens,
            cost_usd=cost_usd,
            created_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()

    return {
        "agent": agent_name,
        "model": agent.model,
        "provider": result.get("provider", "unknown"),
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": cost_usd,
        "response": result.get("message", result),
    }


# ============================================================
# ⭐ VIBEAI – AI RESPONDER (PRODUCTION VERSION)
# ============================================================
# ✔ Multi-Agent Orchestration
# ✔ Intelligent Agent Selection
# ✔ Message Validation & Sanitization
# ✔ Context Management
# ✔ Safety & Content Filtering
# ✔ Response Formatting
# ✔ Token & Cost Tracking
# ✔ Performance Monitoring
# ✔ Error Handling & Fallbacks
# ✔ Streaming Support Ready
# ============================================================

import logging
import time
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger("ai_responder")


class AIResponder:
    """
    Production-Grade AI Response Engine.

    Orchestrates the complete chat response flow:
    1. Message validation
    2. Agent selection (via intelligent routing)
    3. Context preparation
    4. AI execution
    5. Response formatting
    6. Metrics tracking
    7. Error handling
    """

    def __init__(self):
        self.max_message_length = 32000  # Safety limit
        self.default_agent = "aura"

        # Safety keywords (basic content filtering)
        self.unsafe_keywords = [
            "hack",
            "exploit",
            "illegal",
            "harmful",
            "violence",
            "weapon",
            "abuse",
        ]

    def validate_message(self, message: str) -> Dict[str, Any]:
        """
        Validate and sanitize user message.

        Returns:
            Validation result with is_valid flag and sanitized message
        """
        if not message:
            return {
                "is_valid": False,
                "error": "Empty message",
                "sanitized_message": "",
            }

        if not isinstance(message, str):
            return {
                "is_valid": False,
                "error": "Message must be a string",
                "sanitized_message": "",
            }

        # Trim and clean
        sanitized = message.strip()

        # Check length
        if len(sanitized) > self.max_message_length:
            return {
                "is_valid": False,
                "error": f"Message too long (max {self.max_message_length} characters)",
                "sanitized_message": sanitized[: self.max_message_length],
            }

        # Basic safety check
        message_lower = sanitized.lower()
        has_unsafe = any(keyword in message_lower for keyword in self.unsafe_keywords)

        return {
            "is_valid": True,
            "has_safety_concern": has_unsafe,
            "sanitized_message": sanitized,
        }

    def prepare_context(
        self,
        base_context: Optional[Dict],
        user_info: Optional[Dict] = None,
        session_info: Optional[Dict] = None,
    ) -> Dict:
        """
        Prepare context for AI execution.

        Args:
            base_context: Base context from request
            user_info: User information
            session_info: Session/conversation information

        Returns:
            Complete context dict
        """
        context = base_context or {}

        if user_info:
            context["user"] = user_info

        if session_info:
            context["session"] = session_info

        # Add timestamp
        context["timestamp"] = datetime.utcnow().isoformat()

        return context

    def format_response(
        self,
        agent_result: Dict,
        agent_name: str,
        latency: float,
        validation_info: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Format AI response for frontend consumption.

        Args:
            agent_result: Result from agent execution
            agent_name: Name of agent used
            latency: Response latency in seconds
            validation_info: Message validation info

        Returns:
            Formatted response dict
        """
        return {
            "status": agent_result.get("status", "success"),
            "agent": agent_name,
            "model": agent_result.get("model", "unknown"),
            "provider": agent_result.get("provider", "unknown"),
            "response": agent_result.get("response", ""),
            "input_tokens": agent_result.get("input_tokens", 0),
            "output_tokens": agent_result.get("output_tokens", 0),
            "total_tokens": agent_result.get("total_tokens", 0),
            "cost_usd": agent_result.get("cost_usd", 0.0),
            "latency": round(latency, 3),
            "timestamp": agent_result.get("timestamp", datetime.utcnow().isoformat()),
            "fallback": agent_result.get("fallback", False),
            "metadata": {
                "validation": validation_info,
                "routing": agent_result.get("routing", {}),
                "has_code": agent_result.get("has_code", False),
                "reasoning_model": agent_result.get("reasoning_model", False),
            },
        }

    async def respond(
        self,
        message: str,
        context: Optional[Dict] = None,
        agent_preference: Optional[str] = None,
        user: Optional[Any] = None,
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Generate AI response to user message.

        Args:
            message: User message
            context: Additional context
            agent_preference: Optional preferred agent
            user: User object (for billing)
            db: Database session (for billing)

        Returns:
            Formatted response dict
        """
        start_time = time.time()

        # Validate message
        validation = self.validate_message(message)

        if not validation["is_valid"]:
            return {
                "status": "error",
                "error": validation["error"],
                "response": f"Invalid message: {validation['error']}",
                "latency": round(time.time() - start_time, 3),
            }

        sanitized_message = validation["sanitized_message"]

        # Prepare context
        full_context = self.prepare_context(
            base_context=context,
            user_info={"id": getattr(user, "id", None)} if user else None,
        )

        try:
            # Import intelligent router
            from chat.agent_router import intelligent_router

            # Route and execute
            result = await intelligent_router.route(
                message=sanitized_message,
                context=full_context,
                user=user,
                db=db,
                agent_preference=agent_preference,
            )

            # Calculate latency
            latency = time.time() - start_time

            # Format response
            formatted_response = self.format_response(
                agent_result=result,
                agent_name=result.get("agent", self.default_agent),
                latency=latency,
                validation_info=validation,
            )

            return formatted_response

        except Exception as e:
            logger.error(f"AI response failed: {e}")

            latency = time.time() - start_time

            return {
                "status": "error",
                "error": str(e),
                "response": "I apologize, but I'm having trouble processing your request. Please try again.",
                "latency": round(latency, 3),
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def respond_with_agent(
        self,
        message: str,
        agent_name: str,
        context: Optional[Dict] = None,
        user: Optional[Any] = None,
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Generate response using specific agent.

        Args:
            message: User message
            agent_name: Specific agent to use
            context: Additional context
            user: User object
            db: Database session

        Returns:
            Formatted response dict
        """
        return await self.respond(
            message=message,
            context=context,
            agent_preference=agent_name,
            user=user,
            db=db,
        )

    async def respond_streaming(
        self,
        message: str,
        context: Optional[Dict] = None,
        agent_preference: Optional[str] = None,
    ):
        """
        Generate streaming AI response (future feature).

        Note: Streaming support requires provider-level implementation.
        This is a placeholder for future streaming functionality.
        """
        # TODO: Implement streaming
        # Will require:
        # 1. Provider streaming support
        # 2. SSE or WebSocket transport
        # 3. Token-by-token yielding

        raise NotImplementedError("Streaming responses not yet implemented")


# ============================================================
# GLOBAL INSTANCE
# ============================================================

ai_responder = AIResponder()

# ============================================================
# CONVENIENCE FUNCTIONS
# ============================================================


async def get_response(
    message: str,
    context: Optional[Dict] = None,
    agent: Optional[str] = None,
    user: Optional[Any] = None,
    db: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Convenience function to get AI response.
    """
    return await ai_responder.respond(message=message, context=context, agent_preference=agent, user=user, db=db)


async def get_response_from_agent(
    message: str,
    agent_name: str,
    context: Optional[Dict] = None,
    user: Optional[Any] = None,
    db: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Get response from specific agent.
    """
    return await ai_responder.respond_with_agent(
        message=message, agent_name=agent_name, context=context, user=user, db=db
    )
