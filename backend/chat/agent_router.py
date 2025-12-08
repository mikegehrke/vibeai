from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import logging
from typing import Any, Dict, List, Optional

from auth import get_current_user_v2
from chat.agent_manager import run_agent, run_agent_v2
from db import get_db

logger = logging.getLogger("agent_router")

router = APIRouter()
router_v2 = APIRouter(prefix="/chat", tags=["Chat"])
router_intelligent = APIRouter(prefix="/chat/smart", tags=["Intelligent Chat"])


@router.post("/chat/{agent_name}")
async def route_chat(agent_name: str, request: Request):
    data = await request.json()
    message = data.get("message", "")
    context = data.get("context", {})

    return await run_agent(agent_name, message, context)


@router_v2.post("/{agent_name}")
async def chat_route_v2(
    agent_name: str,
    request: Request,
    user=Depends(get_current_user_v2),
    db: Session = Depends(get_db),
):
    try:
        body = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    message = body.get("message")
    context = body.get("context", {})

    if not message:
        raise HTTPException(400, "Missing 'message'")

    result = await run_agent_v2(agent_name=agent_name, message=message, context=context, db=db, user=user)

    return result


class IntelligentAgentRouter:
    def __init__(self):
        self.default_agent = "aura"
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
        self.orchestration_keywords = [
            "build app",
            "create project",
            "full application",
            "complete system",
            "end-to-end",
            "entire project",
        ]
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
        m = message.lower()
        has_safety_concern = any(kw in m for kw in self.safety_keywords)
        complexity = "simple"
        if len(m) > 500:
            complexity = "complex"
        elif len(m) > 200:
            complexity = "medium"
        needs_orchestration = any(kw in m for kw in self.orchestration_keywords)
        agent_scores = {}
        for agent_name, capabilities in self.agent_capabilities.items():
            score = 0
            for capability in capabilities:
                if capability in m:
                    score += 1
            agent_scores[agent_name] = score
        best_agent = max(agent_scores.items(), key=lambda x: x[1])
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
        if user_preference:
            analysis = self.analyze_message(message)
            if not analysis["has_safety_concern"]:
                return user_preference
        analysis = self.analyze_message(message)
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
        if context is None:
            context = {}
        agent_name = self.select_agent(message, agent_preference)
        analysis = self.analyze_message(message)
        context["routing_analysis"] = analysis
        try:
            from chat.agent_manager import agent_manager
            result = await agent_manager.run(
                agent_name=agent_name,
                message=message,
                context=context,
                user=user,
                db=db,
            )
            result["routing"] = {
                "selected_agent": agent_name,
                "analysis": analysis,
                "user_preference": agent_preference,
            }
            return result
        except Exception as e:
            logger.error(f"Routing failed: {e}")
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
        if context is None:
            context = {}
        results = []
        accumulated_cost = 0.0
        accumulated_tokens = 0
        for i, agent_name in enumerate(agents):
            try:
                from chat.agent_manager import agent_manager
                if results:
                    context["previous_results"] = results
                result = await agent_manager.run(
                    agent_name=agent_name,
                    message=task,
                    context=context,
                    user=user,
                    db=db,
                )
                accumulated_cost += result.get("cost_usd", 0.0)
                accumulated_tokens += result.get("total_tokens", 0)
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


intelligent_router = IntelligentAgentRouter()


@router_intelligent.post("/auto")
async def auto_route_chat(request: Request, user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    message = body.get("message")
    context = body.get("context", {})

    if not message:
        raise HTTPException(400, "Missing 'message'")

    result = await intelligent_router.route(message=message, context=context, user=user, db=db)

    return result


@router_intelligent.post("/orchestrate")
async def orchestrate_agents(request: Request, user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
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

    result = await intelligent_router.orchestrate(task=task, agents=agents, context=context, user=user, db=db)

    return result


@router_intelligent.get("/analyze")
async def analyze_message_route(message: str, user=Depends(get_current_user_v2)):
    if not message:
        raise HTTPException(400, "Missing 'message' parameter")

    analysis = intelligent_router.analyze_message(message)

    return analysis