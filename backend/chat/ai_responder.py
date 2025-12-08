import os
import logging
import time
from datetime import datetime
from typing import Any, Dict, Optional

from openai import OpenAI
from sqlalchemy.orm import Session

from agent_system import agent_system
from billing.models import BillingRecordDB
from billing.utils import calculate_cost_v2
from core.model_registry_v2 import resolve_model

logger = logging.getLogger("ai_responder")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def get_ai_response(agent_name: str, message: str, context: dict):
    response = client.Completions.create(
        model="gpt-4o-mini",
        prompt=message,
        max_tokens=200,
    )

    return {
        "response": response.choices[0].text,
        "model": "gpt-4o-mini",
        "agent": agent_name,
    }


async def get_ai_response_v2(agent_name: str, message: str, context: dict, db: Session = None, user=None):
    agent = agent_system.get_agent(agent_name)
    model = resolve_model(agent.model)
    result = await agent.run(model=model, message=message, context=context)

    input_tokens = result.get("input_tokens", 0)
    output_tokens = result.get("output_tokens", 0)
    cost_usd = calculate_cost_v2(agent.model, input_tokens, output_tokens)

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


class AIResponder:
    def __init__(self):
        self.max_message_length = 32000
        self.default_agent = "aura"
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

        sanitized = message.strip()

        if len(sanitized) > self.max_message_length:
            return {
                "is_valid": False,
                "error": f"Message too long (max {self.max_message_length} characters)",
                "sanitized_message": sanitized[: self.max_message_length],
            }

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
        context = base_context or {}

        if user_info:
            context["user"] = user_info

        if session_info:
            context["session"] = session_info

        context["timestamp"] = datetime.utcnow().isoformat()

        return context

    def format_response(
        self,
        agent_result: Dict,
        agent_name: str,
        latency: float,
        validation_info: Optional[Dict] = None,
    ) -> Dict[str, Any]:
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
        start_time = time.time()

        validation = self.validate_message(message)

        if not validation["is_valid"]:
            return {
                "status": "error",
                "error": validation["error"],
                "response": f"Invalid message: {validation['error']}",
                "latency": round(time.time() - start_time, 3),
            }

        sanitized_message = validation["sanitized_message"]

        full_context = self.prepare_context(
            base_context=context,
            user_info={"id": getattr(user, "id", None)} if user else None,
        )

        try:
            from chat.agent_router import intelligent_router

            result = await intelligent_router.route(
                message=sanitized_message,
                context=full_context,
                user=user,
                db=db,
                agent_preference=agent_preference,
            )

            latency = time.time() - start_time

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
        raise NotImplementedError("Streaming responses not yet implemented")


ai_responder = AIResponder()


async def get_response(
    message: str,
    context: Optional[Dict] = None,
    agent: Optional[str] = None,
    user: Optional[Any] = None,
    db: Optional[Any] = None,
) -> Dict[str, Any]:
    return await ai_responder.respond(message=message, context=context, agent_preference=agent, user=user, db=db)


async def get_response_from_agent(
    message: str,
    agent_name: str,
    context: Optional[Dict] = None,
    user: Optional[Any] = None,
    db: Optional[Any] = None,
) -> Dict[str, Any]:
    return await ai_responder.respond_with_agent(
        message=message, agent_name=agent_name, context=context, user=user, db=db
    )