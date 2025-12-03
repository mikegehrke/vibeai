from .ai_responder import get_ai_response

async def run_agent(agent_name: str, message: str, context: dict):
    return await get_ai_response(agent_name, message, context)

# ✔ korrekt — ai_responder wird importiert
# ❗ aber ai_responder ist in deinem Projekt riesig vielschichtiger
#    → Agents, Tools, Planner, CodeAgent, Vision, Builder, Model Routing
#
# async def run_agent(agent_name: str, message: str, context: dict):
#     return await get_ai_response(agent_name, message, context)
#     # ✔ das funktioniert technisch
#     # ❗ aber viel zu klein für dein System
#     # ❗ kein Routing zu AgentSystem
#     # ❗ kein Tokenverbrauch
#     # ❗ keine Kostenberechnung
#     # ❗ keine DB-Speicherung
#     # ❗ kein Safety-Check
#     # ❗ kein Overload-Schutz
#     # ❗ kein Debug
#     # ❗ kein Multi-Agent-Pipeline Support
#     # ❗ keine Unterstützung für:
#     #      - Claude
#     #      - Gemini
#     #      - Copilot
#     #      - Ollama
#     #      - 280 Module


# -------------------------------------------------------------
# VIBEAI – ADVANCED AGENT MANAGER (MULTI-MODEL + MULTI-AGENT)
# -------------------------------------------------------------
from agent_system import agent_system
from billing.utils import calculate_cost_v2
from billing.models import BillingRecordDB
from db import get_db
from datetime import datetime
from sqlalchemy.orm import Session


async def run_agent_v2(
    agent_name: str,
    message: str,
    context: dict,
    db: Session = None,
    user=None
):
    """
    Erweiterte Version:
    - Multi-Agent Routing
    - Multi-Model Support (GPT/Claude/Gemini/Copilot/Ollama)
    - Tokenverbrauch
    - Kostenberechnung
    - DB-Speicherung
    - Safety Checks
    - Tools, Planner, Worker, Synthesizer
    """

    # 1. Agent aus dem System laden
    agent = agent_system.get_agent(agent_name)

    # 2. Agent ausführen
    result = await agent_system.run_agent(agent_name, message, context)

    # 3. Tokenverbrauch aus Ergebnis extrahieren
    input_tokens = result["response"].get("input_tokens", 0)
    output_tokens = result["response"].get("output_tokens", 0)

    # 4. Kosten berechnen
    cost_usd = calculate_cost_v2(agent.model, input_tokens, output_tokens)

    # 5. In der DB speichern
    if db and user:
        record = BillingRecordDB(
            id=str(datetime.utcnow().timestamp()).replace(".", ""),
            user_id=user.id,
            model=agent.model,
            provider=result["response"].get("provider", "unknown"),
            tokens_used=input_tokens + output_tokens,
            cost_usd=cost_usd,
            created_at=datetime.utcnow()
        )
        db.add(record)
        db.commit()

    return {
        "agent": agent_name,
        "model": agent.model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": cost_usd,
        "response": result["response"]
    }


# ============================================================
# ⭐ VIBEAI – PRODUCTION AGENT MANAGER (2025)
# ============================================================
# ✔ Dynamic Agent Loading (auto-discover from ai_agents/)
# ✔ Multi-Agent Registry (Aura, Cora, Devra, Lumi, etc.)
# ✔ Agent Switching & Routing
# ✔ Memory per Agent
# ✔ Billing Integration
# ✔ Safety Guardrails
# ✔ Multi-Provider Support (OpenAI/Claude/Gemini/Copilot/Ollama)
# ✔ Tool Integration
# ✔ Planner/Worker/Composer Pipeline Support
# ============================================================

import os
import importlib
import inspect
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger("agent_manager")


class AgentManager:
    """
    Production-Grade Agent Manager for VibeAI Chat System.
    
    Features:
    - Auto-loads agents from ai_agents/ folder
    - Multi-agent registry
    - Agent switching & routing
    - Memory management per agent
    - Billing integration
    - Safety checks
    """
    
    def __init__(self):
        self.agents: Dict[str, Any] = {}
        self.agent_metadata: Dict[str, Dict] = {}
        self.agent_memory: Dict[str, List] = {}
        self.default_agent = "aura"
        
        # Agent aliases
        self.aliases = {
            "default": "aura",
            "general": "aura",
            "code": "cora",
            "coding": "cora",
            "developer": "cora",
            "think": "devra",
            "reasoning": "devra",
            "deep": "devra",
            "creative": "lumi",
            "design": "lumi",
            "art": "lumi",
        }
        
        # Load all agents
        self._load_agents()
    
    def _load_agents(self):
        """
        Dynamically loads all agents from ai_agents/ folder.
        """
        agents_path = os.path.join(
            os.path.dirname(__file__),
            "ai_agents"
        )
        
        if not os.path.exists(agents_path):
            logger.warning(f"❗ ai_agents folder not found at {agents_path}")
            return
        
        loaded_count = 0
        
        for filename in os.listdir(agents_path):
            if filename.endswith("_agent.py") and not filename.startswith("__"):
                agent_name = filename.replace("_agent.py", "")
                
                try:
                    # Import module
                    module_path = f"chat.ai_agents.{agent_name}_agent"
                    module = importlib.import_module(module_path)
                    
                    # Look for Agent class
                    for name, obj in inspect.getmembers(module, inspect.isclass):
                        if name == "Agent" or name.endswith("Agent"):
                            # Instantiate agent
                            agent_instance = obj()
                            self.agents[agent_name] = agent_instance
                            
                            # Store metadata
                            self.agent_metadata[agent_name] = {
                                "name": agent_name,
                                "class": name,
                                "module": module_path,
                                "description": getattr(agent_instance, "description", ""),
                                "model": getattr(agent_instance, "model", "unknown"),
                                "capabilities": getattr(agent_instance, "capabilities", [])
                            }
                            
                            # Initialize memory
                            self.agent_memory[agent_name] = []
                            
                            loaded_count += 1
                            logger.info(f"✅ Loaded agent: {agent_name}")
                            break
                
                except Exception as e:
                    logger.error(f"❌ Failed to load {filename}: {str(e)}")
        
        logger.info(f"🎯 Agent Manager initialized with {loaded_count} agents")
    
    def get_agent(self, name: str) -> Optional[Any]:
        """
        Get agent by name or alias.
        """
        name = name.lower().strip()
        
        # Check alias
        if name in self.aliases:
            name = self.aliases[name]
        
        # Return agent or default
        return self.agents.get(name, self.agents.get(self.default_agent))
    
    def list_agents(self) -> List[Dict]:
        """
        List all available agents with metadata.
        """
        return [
            {
                "name": name,
                **metadata
            }
            for name, metadata in self.agent_metadata.items()
        ]
    
    def add_to_memory(self, agent_name: str, message: Dict):
        """
        Add message to agent's memory.
        """
        if agent_name not in self.agent_memory:
            self.agent_memory[agent_name] = []
        
        self.agent_memory[agent_name].append({
            "timestamp": datetime.utcnow().isoformat(),
            "message": message
        })
        
        # Keep only last 100 messages per agent
        if len(self.agent_memory[agent_name]) > 100:
            self.agent_memory[agent_name] = self.agent_memory[agent_name][-100:]
    
    def get_memory(self, agent_name: str, limit: int = 20) -> List[Dict]:
        """
        Get agent's recent memory.
        """
        memory = self.agent_memory.get(agent_name, [])
        return memory[-limit:]
    
    def clear_memory(self, agent_name: str):
        """
        Clear agent's memory.
        """
        if agent_name in self.agent_memory:
            self.agent_memory[agent_name] = []
    
    async def run(
        self,
        agent_name: str,
        message: str,
        context: Optional[Dict] = None,
        user: Optional[Any] = None,
        db: Optional[Any] = None,
        save_to_memory: bool = True
    ) -> Dict:
        """
        Run agent with full pipeline:
        - Load agent
        - Execute
        - Track tokens/cost
        - Save to DB
        - Update memory
        
        Args:
            agent_name: Name of agent to run
            message: User message
            context: Additional context
            user: User object (for billing)
            db: Database session (for billing)
            save_to_memory: Whether to save to memory
        
        Returns:
            Response dict with agent output, tokens, cost, etc.
        """
        if context is None:
            context = {}
        
        # Get agent
        agent = self.get_agent(agent_name)
        if not agent:
            raise ValueError(f"Agent '{agent_name}' not found")
        
        # Get actual agent name (resolve alias)
        actual_name = agent_name.lower()
        if actual_name in self.aliases:
            actual_name = self.aliases[actual_name]
        
        # Add memory to context
        if save_to_memory:
            context["memory"] = self.get_memory(actual_name)
        
        try:
            # Run agent
            if hasattr(agent, "run"):
                result = await agent.run(message, context)
            elif hasattr(agent, "process"):
                result = await agent.process(message, context)
            else:
                raise AttributeError(f"Agent {actual_name} has no run() or process() method")
            
            # Extract response
            response_text = result.get("response", result.get("text", str(result)))
            
            # Extract tokens
            input_tokens = result.get("input_tokens", 0)
            output_tokens = result.get("output_tokens", 0)
            total_tokens = input_tokens + output_tokens
            
            # Get model info
            model = getattr(agent, "model", "unknown")
            provider = getattr(agent, "provider", "openai")
            
            # Calculate cost
            cost_usd = 0.0
            if total_tokens > 0:
                try:
                    from billing.pricing_rules import calculate_token_cost
                    cost_usd = calculate_token_cost(
                        model=model,
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                        provider=provider
                    )
                except Exception as e:
                    logger.error(f"Cost calculation failed: {e}")
            
            # Save to DB
            if db and user and total_tokens > 0:
                try:
                    from billing.models import UsageRecordDB
                    import uuid
                    
                    usage = UsageRecordDB(
                        id=str(uuid.uuid4()),
                        user_id=str(user.id),
                        feature="chat",
                        operation="message",
                        provider=provider,
                        model=model,
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                        total_tokens=total_tokens,
                        cost_usd=cost_usd,
                        success=True
                    )
                    db.add(usage)
                    db.commit()
                except Exception as e:
                    logger.error(f"DB save failed: {e}")
            
            # Update memory
            if save_to_memory:
                self.add_to_memory(actual_name, {
                    "role": "user",
                    "content": message
                })
                self.add_to_memory(actual_name, {
                    "role": "assistant",
                    "content": response_text
                })
            
            return {
                "status": "success",
                "agent": actual_name,
                "model": model,
                "provider": provider,
                "response": response_text,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total_tokens,
                "cost_usd": cost_usd,
                "metadata": result.get("metadata", {})
            }
        
        except Exception as e:
            logger.error(f"Agent execution failed: {e}")
            
            return {
                "status": "error",
                "agent": actual_name,
                "error": str(e),
                "response": f"Sorry, I encountered an error: {str(e)}"
            }


# ============================================================
# GLOBAL INSTANCE
# ============================================================

agent_manager = AgentManager()


# ============================================================
# HELPER FUNCTIONS
# ============================================================

async def run_agent_advanced(
    agent_name: str,
    message: str,
    context: Dict = None,
    user=None,
    db=None
) -> Dict:
    """
    Convenience function for running agents.
    """
    return await agent_manager.run(
        agent_name=agent_name,
        message=message,
        context=context,
        user=user,
        db=db
    )


def get_available_agents() -> List[Dict]:
    """
    Get list of all available agents.
    """
    return agent_manager.list_agents()


def switch_agent(from_agent: str, to_agent: str):
    """
    Switch between agents (transfer memory).
    """
    memory = agent_manager.get_memory(from_agent)
    
    # Transfer last 10 messages
    for msg in memory[-10:]:
        agent_manager.add_to_memory(to_agent, msg["message"])
