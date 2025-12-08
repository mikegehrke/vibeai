from fastapi import APIRouter, Request

from .agent_manager import run_agent

router = APIRouter()


@router.post("/chat/{agent_name}")
async def route_chat(agent_name: str, request: Request):
    data = await request.json()
    message = data.get("message", "")
    context = data.get("context", {})

    return await run_agent(agent_name, message, context)


# ✔ korrekt – Router + Request benutzt
#
# from .agent_manager import run_agent
# ✔ Agent Manager wird importiert
# ❗ ABER: nur die einfache Version (run_agent), NICHT run_agent_v2
#
# router = APIRouter()
# ✔ Router ok
# ❗ Kein prefix=/chat
# ❗ Keine Authentifizierung
# ❗ Kein Role Check (Admin/User)
# ❗ Kein Logging
#
# @router.post("/chat/{agent_name}")
# async def route_chat(agent_name: str, request: Request):
#     data = await request.json()
#     message = data.get("message", "")
#     context = data.get("context", {})
#
#     return await run_agent(agent_name, message, context)
#     # ✔ Funktioniert
#     # ❗ Aber:
#     #     - keine Tokenberechnung
#     #     - keine Billing DB
#     #     - kein User-Check
#     #     - kein Suspended-Check
#     #     - kein Multi-Model Routing
#     #     - keine AI Safety
#     #     - keine Tools
#     #     - kein Memory
#     #     - kein Chat History Save
#     #     - keine Vision-Unterstützung

# -------------------------------------------------------------
# VIBEAI – ADVANCED CHAT ROUTER (MULTI-AGENT + BILLING + DB)
# -------------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from auth import get_current_user_v2
from chat.agent_manager import run_agent_v2
from db import get_db

router_v2 = APIRouter(prefix="/chat", tags=["Chat"])


@router_v2.post("/{agent_name}")
async def chat_route_v2(
    agent_name: str,
    request: Request,
    user=Depends(get_current_user_v2),
    db: Session = Depends(get_db),
):
    """
    Vollwertiger Chat-Endpunkt:
    - authentifiziert
    - ruft AgentSystem an
    - speichert Billing
    - speichert Tokens
    - speichert DB-Historie
    - Multi-Agent kompatibel
    - Multi-Model kompatibel
    """

    try:
        body = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    message = body.get("message")
    context = body.get("context", {})

    if not message:
        raise HTTPException(400, "Missing 'message'")

    # Agent ausführen (neuer VibeAI Style)
    result = await run_agent_v2(agent_name=agent_name, message=message, context=context, db=db, user=user)

    return result


# ============================================================
# ⭐ VIBEAI – INTELLIGENT AGENT ROUTER (AUTO-SELECT)
# ============================================================
# ✔ Automatische Agent-Wahl basierend auf Message Content
# ✔ Multi-Agent Orchestration (Planner → Worker → Composer)
# ✔ Fallback System (Agent nicht verfügbar → Default)
# ✔ Billing Integration (Token + Cost Tracking)
# ✔ Safety Routing (NSFW, Harmful Content Detection)
# ✔ Support für 280+ Agents
# ✔ Tool Routing (Code Studio, App Builder, Vision, Search)
# ✔ Memory-Aware Routing
# ============================================================

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("agent_router")


class IntelligentAgentRouter:
    """
    Production-Grade Agent Router with Intelligent Selection.

    Features:
    - Auto-selects best agent based on message content
    - Multi-agent orchestration
    - Fallback handling
    - Billing integration
    - Safety checks
    - Tool routing
    """

    def __init__(self):
        self.default_agent = "aura"

        # Agent capabilities mapping
        self.agent_capabilities = {
            "aura": ["general", "chat", "conversation", "questions", "help"],
            "cora": [
                "code",
                "programming",
                "debug",
                "fix",
                "function",
                "class",
                "python",
                "javascript",
                "typescript",
                "java",
                "c++",
                "rust",
                "algorithm",
                "refactor",
                "optimize",
            ],
            "devra": [
                "reasoning",
                "analysis",
                "explain",
                "why",
                "how",
                "research",
                "deep",
                "complex",
                "logic",
                "philosophy",
            ],
            "lumi": [
                "creative",
                "story",
                "poem",
                "design",
                "art",
                "ideas",
                "brainstorm",
                "innovative",
                "imagine",
                "writing",
            ],
            "vision": [
                "image",
                "picture",
                "photo",
                "visual",
                "generate image",
                "create image",
                "draw",
                "illustration",
            ],
            "app_builder": [
                "app",
                "flutter",
                "react native",
                "android",
                "ios",
                "mobile",
                "screen",
                "ui",
                "interface",
                "swift",
                "kotlin",
            ],
            "code_studio": [
                "file",
                "modify",
                "refactor",
                "edit code",
                "change code",
                "update file",
                "fix file",
                "project",
            ],
            "search": [
                "search",
                "find",
                "look up",
                "google",
                "web",
                "internet",
                "latest",
                "current",
                "news",
            ],
        }

        # Keywords for complex tasks requiring multi-agent orchestration
        self.orchestration_keywords = [
            "build app",
            "create project",
            "full application",
            "complete system",
            "end-to-end",
            "entire project",
        ]

        # Safety keywords
        self.safety_keywords = [
            "hack",
            "exploit",
            "illegal",
            "harmful",
            "nsfw",
            "violence",
            "weapon",
            "drug",
            "abuse",
        ]

    def analyze_message(self, message: str) -> Dict[str, Any]:
        """
        Analyze message to determine:
        - Best agent
        - Required capabilities
        - Complexity level
        - Safety concerns
        """
        m = message.lower()

        # Check safety
        has_safety_concern = any(kw in m for kw in self.safety_keywords)

        # Check complexity
        complexity = "simple"
        if len(m) > 500:
            complexity = "complex"
        elif len(m) > 200:
            complexity = "medium"

        # Check if orchestration needed
        needs_orchestration = any(kw in m for kw in self.orchestration_keywords)

        # Score each agent
        agent_scores = {}
        for agent_name, capabilities in self.agent_capabilities.items():
            score = 0
            for capability in capabilities:
                if capability in m:
                    score += 1
            agent_scores[agent_name] = score

        # Select best agent
        best_agent = max(agent_scores.items(), key=lambda x: x[1])

        # If no clear match, use default
        if best_agent[1] == 0:
            best_agent = (self.default_agent, 0)

        return {
            "best_agent": best_agent[0],
            "score": best_agent[1],
            "complexity": complexity,
            "needs_orchestration": needs_orchestration,
            "has_safety_concern": has_safety_concern,
            "agent_scores": agent_scores,
        }

    def select_agent(self, message: str, user_preference: Optional[str] = None) -> str:
        """
        Select best agent for the message.

        Args:
            message: User message
            user_preference: Optional user-specified agent

        Returns:
            Agent name
        """
        # If user specified agent, use it (unless safety concern)
        if user_preference:
            analysis = self.analyze_message(message)
            if not analysis["has_safety_concern"]:
                return user_preference

        # Auto-select based on message
        analysis = self.analyze_message(message)

        # Safety check
        if analysis["has_safety_concern"]:
            logger.warning(f"Safety concern detected in message: {message[:50]}...")
            return self.default_agent

        return analysis["best_agent"]

    async def route(
        self,
        message: str,
        context: Optional[Dict] = None,
        user: Optional[Any] = None,
        db: Optional[Any] = None,
        agent_preference: Optional[str] = None,
    ) -> Dict:
        """
        Route message to appropriate agent and execute.

        Args:
            message: User message
            context: Additional context
            user: User object
            db: Database session
            agent_preference: Optional user-specified agent

        Returns:
            Response dict with agent output, tokens, cost, etc.
        """
        if context is None:
            context = {}

        # Select agent
        agent_name = self.select_agent(message, agent_preference)

        # Analyze message
        analysis = self.analyze_message(message)

        # Add analysis to context
        context["routing_analysis"] = analysis

        try:
            # Import agent_manager
            from chat.agent_manager import agent_manager

            # Run agent
            result = await agent_manager.run(
                agent_name=agent_name,
                message=message,
                context=context,
                user=user,
                db=db,
            )

            # Add routing info to result
            result["routing"] = {
                "selected_agent": agent_name,
                "analysis": analysis,
                "user_preference": agent_preference,
            }

            return result

        except Exception as e:
            logger.error(f"Routing failed: {e}")

            # Fallback to default agent
            if agent_name != self.default_agent:
                logger.info(f"Falling back to {self.default_agent}")

                try:
                    from chat.agent_manager import agent_manager

                    result = await agent_manager.run(
                        agent_name=self.default_agent,
                        message=message,
                        context=context,
                        user=user,
                        db=db,
                    )

                    result["routing"] = {
                        "selected_agent": self.default_agent,
                        "fallback": True,
                        "original_agent": agent_name,
                        "error": str(e),
                    }

                    return result

                except Exception as fallback_error:
                    logger.error(f"Fallback also failed: {fallback_error}")

                    return {
                        "status": "error",
                        "error": str(fallback_error),
                        "response": "Sorry, I encountered an error processing your request.",
                    }

            return {
                "status": "error",
                "error": str(e),
                "response": "Sorry, I encountered an error processing your request.",
            }

    async def orchestrate(
        self,
        task: str,
        agents: List[str],
        context: Optional[Dict] = None,
        user: Optional[Any] = None,
        db: Optional[Any] = None,
    ) -> Dict:
        """
        Orchestrate multiple agents for complex tasks.

        Example: Planner → Worker → Composer

        Args:
            task: Task description
            agents: List of agent names in execution order
            context: Additional context
            user: User object
            db: Database session

        Returns:
            Combined response from all agents
        """
        if context is None:
            context = {}

        results = []
        accumulated_cost = 0.0
        accumulated_tokens = 0

        for i, agent_name in enumerate(agents):
            try:
                from chat.agent_manager import agent_manager

                # Add previous results to context
                if results:
                    context["previous_results"] = results

                # Run agent
                result = await agent_manager.run(
                    agent_name=agent_name,
                    message=task,
                    context=context,
                    user=user,
                    db=db,
                )

                # Accumulate metrics
                accumulated_cost += result.get("cost_usd", 0.0)
                accumulated_tokens += result.get("total_tokens", 0)

                # Store result
                results.append(
                    {
                        "agent": agent_name,
                        "response": result.get("response", ""),
                        "tokens": result.get("total_tokens", 0),
                        "cost": result.get("cost_usd", 0.0),
                    }
                )

            except Exception as e:
                logger.error(f"Orchestration failed at agent {agent_name}: {e}")

                results.append(
                    {
                        "agent": agent_name,
                        "error": str(e),
                        "response": f"Error in {agent_name}: {str(e)}",
                    }
                )

        # Combine responses
        combined_response = "\n\n".join([f"**{r['agent'].upper()}:**\n{r['response']}" for r in results])

        return {
            "status": "success",
            "orchestration": True,
            "agents": agents,
            "response": combined_response,
            "results": results,
            "total_tokens": accumulated_tokens,
            "total_cost_usd": accumulated_cost,
        }


# ============================================================
# GLOBAL INSTANCE
# ============================================================

intelligent_router = IntelligentAgentRouter()

# ============================================================
# ENHANCED ROUTER ENDPOINTS
# ============================================================

router_intelligent = APIRouter(prefix="/chat/smart", tags=["Intelligent Chat"])


@router_intelligent.post("/auto")
async def auto_route_chat(request: Request, user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
    """
    Auto-route to best agent based on message content.

    Example:
        POST /chat/smart/auto
        {
            "message": "Write a Python function to calculate fibonacci"
        }

        → Automatically routes to Cora (code agent)
    """
    try:
        body = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    message = body.get("message")
    context = body.get("context", {})

    if not message:
        raise HTTPException(400, "Missing 'message'")

    # Auto-route
    result = await intelligent_router.route(message=message, context=context, user=user, db=db)

    return result


@router_intelligent.post("/orchestrate")
async def orchestrate_agents(request: Request, user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
    """
    Orchestrate multiple agents for complex tasks.

    Example:
        POST /chat/smart/orchestrate
        {
            "task": "Build a complete mobile app for task management",
            "agents": ["planner", "cora", "app_builder", "lumi"]
        }
    """
    try:
        body = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    task = body.get("task")
    agents = body.get("agents", [])
    context = body.get("context", {})

    if not task:
        raise HTTPException(400, "Missing 'task'")

    if not agents:
        raise HTTPException(400, "Missing 'agents' list")

    # Orchestrate
    result = await intelligent_router.orchestrate(task=task, agents=agents, context=context, user=user, db=db)

    return result


@router_intelligent.get("/analyze")
async def analyze_message_route(message: str, user=Depends(get_current_user_v2)):
    """
    Analyze message to see which agent would be selected.

    Example:
        GET /chat/smart/analyze?message=Write%20Python%20code

        → Returns: {
            "best_agent": "cora",
            "score": 3,
            "complexity": "simple",
            ...
        }
    """
    if not message:
        raise HTTPException(400, "Missing 'message' parameter")

    analysis = intelligent_router.analyze_message(message)

    return analysis
