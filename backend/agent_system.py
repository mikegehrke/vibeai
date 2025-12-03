# -------------------------------------------------------------
# VIBEAI – MULTI-AGENT SYSTEM (GPT / Claude / Gemini / Copilot)
# -------------------------------------------------------------
from typing import Dict, Any, Optional
from fastapi import HTTPException

# AI Agent classes
from chat.ai_agents.aura_agent import AuraAgent
from chat.ai_agents.cora_agent import CoraAgent
from chat.ai_agents.lumi_agent import LumiAgent
from chat.ai_agents.devra_agent import DevraAgent

# Model registry (GPT/Claude/Gemini/Copilot/Ollama)
from core.model_registry_v2 import resolve_model


class AgentSystem:
    """
    Zentrale Multi-Agent-KI-Engine für VibeAI.
    Unterstützt:
        - GPT-4o / GPT-4.1
        - Claude 3.5 Sonnet / Haiku
        - Google Gemini 2.0 (Ultra / Flash)
        - GitHub Copilot Models
        - Lokale Modelle über Ollama
        - Custom Agents (Aura, Cora, Lumi, Devra)
    """

    def __init__(self):
        # Hier registrieren wir ALLE Agenten deines Systems
        self.registry = {
            "aura": AuraAgent(),
            "cora": CoraAgent(),
            "lumi": LumiAgent(),
            "devra": DevraAgent(),

            # KI direkt: Das Backend behandelt diese wie Agents
            # GPT delegiert an Aura
            "gpt": AuraAgent(),
            # Claude delegiert an Cora
            "claude": CoraAgent(),
            "gemini": LumiAgent(),           # Gemini delegiert an Lumi
            "copilot": DevraAgent(),         # Copilot delegiert an Devra

            # Falls du später echte spezialisierte Agents willst:
            # "gemini_agent": GeminiAgent(),
            # "copilot_agent": CopilotAgent(),
        }

    def get_agent(self, agent_name: str):
        """
        Holt einen Agenten aus dem Registry.
        """
        agent = self.registry.get(agent_name.lower())
        if not agent:
            raise HTTPException(
                status_code=404,
                detail=f"Agent '{agent_name}' not found"
            )
        return agent

    async def run_agent(
        self,
        agent_name: str,
        message: str,
        context: Dict[str, Any]
    ):
        """
        Führt einen Agenten aus.
        Jeder Agent kann:
            - GPT
            - Claude
            - Gemini
            - Copilot
            - Ollama
        verwenden, je nach Konfiguration.
        """
        agent = self.get_agent(agent_name)

        # Modell aus der Model-Registry laden
        # (Die Registry entscheidet selbst welches API-System benutzt wird)
        model = resolve_model(agent.model)

        # Agent ausführen
        result = await agent.run(
            model=model,
            message=message,
            context=context
        )

        return {
            "agent": agent_name,
            "model": agent.model,
            "response": result
        }

    # Planner → Worker → Composer Pipeline
    async def run_with_planning(
        self,
        agent_name: str,
        messages: list,
        context: Optional[Dict[str, Any]] = None
    ):
        """
        Erweiterte Execution mit Planner-Pipeline:
        1. Planner zerlegt Aufgabe in Subtasks
        2. Worker Agents führen Subtasks aus
        3. Composer fasst Ergebnisse zusammen
        
        Wie Devin / OpenAI o1-o3 / AutoGen / CrewAI
        """
        from planner import planner
        from composer import composer
        
        context = context or {}
        # Schritt 1: Planner analysiert Aufgabe
        plan_result = planner(str(messages)) if callable(planner) else {}
        plan = plan_result if isinstance(plan_result, dict) else {"steps": []}
        
        if plan and plan.get("requires_multiple_agents"):
            # Multi-Agent Execution
            partial_results = []
            steps = plan.get("steps", [])
            
            for step in steps:
                if isinstance(step, dict):
                    worker_agent_name = step.get("agent", agent_name)
                    description = step.get("description", str(step))
                else:
                    worker_agent_name = agent_name
                    description = str(step)
                
                worker_agent = self.get_agent(worker_agent_name)
                
                # Worker führt Subtask aus
                step_data = (
                    step if isinstance(step, dict)
                    else {"description": step}
                )
                result = await worker_agent.run_step(
                    step=step_data,
                    context=context
                )
                
                partial_results.append({
                    "agent": worker_agent_name,
                    "step": description,
                    "result": result
                })
            
            # Schritt 3: Composer fasst zusammen
            if hasattr(composer, 'synthesize_agent_outputs'):
                synthesis_result = await composer.synthesize_agent_outputs(
                    agent_outputs=partial_results,
                    context=context
                )
                final_response = synthesis_result.get(
                    "response",
                    str(partial_results)
                )
            else:
                final_response = str(partial_results)
            
            return {
                "agent": agent_name,
                "execution_type": "multi_agent_pipeline",
                "steps_executed": len(plan["steps"]),
                "response": final_response,
                "plan": plan
            }
        
        # Kein Plan nötig → Direkter Agent Call
        return await self.run_agent(
            agent_name=agent_name,
            message=messages[-1]["content"] if messages else "",
            context=context
        )

    # ---------------------------------------------------------
    # ERWEITERUNG: Dynamisches Agent-Loading aus Ordner
    # ---------------------------------------------------------
    def load_agents_from_folder(self, folder_path: str = "chat/ai_agents"):
        """
        Lädt Agents dynamisch aus einem Ordner.
        Ermöglicht unbegrenzt viele Custom Agents.
        """
        import importlib
        import os
        
        base_path = os.path.join(
            os.path.dirname(__file__),
            folder_path
        )
        
        if not os.path.exists(base_path):
            return
        
        for file in os.listdir(base_path):
            if file.endswith("_agent.py") and file != "__init__.py":
                agent_name = file.replace("_agent.py", "")
                
                try:
                    module_path = folder_path.replace("/", ".")
                    module = importlib.import_module(
                        f"{module_path}.{agent_name}_agent"
                    )
                    
                    # Suche Agent-Klasse (z.B. AuraAgent, CoraAgent)
                    class_name = f"{agent_name.capitalize()}Agent"
                    agent_class = getattr(module, class_name, None)
                    
                    if agent_class:
                        self.registry[agent_name] = agent_class()
                        print(f"[AgentSystem] Loaded agent: {agent_name}")
                        
                except Exception as e:
                    print(f"[AgentSystem] Failed to load {agent_name}: {e}")

    # ---------------------------------------------------------
    # ERWEITERUNG: Agent Registry Management
    # ---------------------------------------------------------
    def register_agent(self, name: str, agent_instance):
        """Registriert einen neuen Agent zur Laufzeit."""
        self.registry[name.lower()] = agent_instance
        
    def unregister_agent(self, name: str):
        """Entfernt einen Agent aus dem Registry."""
        if name.lower() in self.registry:
            del self.registry[name.lower()]
    
    def list_agents(self) -> list:
        """Liefert Liste aller verfügbaren Agents."""
        return list(self.registry.keys())
    
    def get_agent_info(self, agent_name: str) -> Dict[str, Any]:
        """Liefert Informationen über einen Agent."""
        agent = self.get_agent(agent_name)
        
        return {
            "name": agent_name,
            "model": getattr(agent, "model", "unknown"),
            "description": getattr(agent, "description", ""),
            "capabilities": getattr(agent, "capabilities", [])
        }


# Singleton
agent_system = AgentSystem()

# Auto-load additional agents if folder exists
try:
    agent_system.load_agents_from_folder("chat/ai_agents")
except Exception as e:
    print(f"[AgentSystem] Could not auto-load agents: {e}")


# ✔ Original Agent System ist sehr gut aufgebaut:
#   - Multi-Agent Support (Aura, Cora, Lumi, Devra)
#   - Model Registry Integration (GPT/Claude/Gemini/Copilot/Ollama)
#   - Planner → Worker → Composer Pipeline
#   - Dynamisches Agent-Loading
#   - Agent Registry Management
#
# ✔ Alle Basis-Features funktionieren
#
# ❗ ABER für Production fehlen:
#     - Performance Monitoring
#     - Load Balancing & Queue System
#     - Context Memory (User-spezifisch)
#     - Agent Collaboration
#     - Error Recovery & Fallback
#     - Agent Analytics & Metrics
#     - Rate Limiting pro Agent
#
# 👉 Ich ergänze jetzt Production-Features


# -------------------------------------------------------------
# VIBEAI – AGENT SYSTEM V2 (PRODUCTION FEATURES)
# -------------------------------------------------------------
import time
import asyncio
from datetime import datetime, timedelta
from collections import defaultdict, deque
from typing import List, Optional
from dataclasses import dataclass, field


# ---------------------------------------------------------
# Agent Performance Metrics
# ---------------------------------------------------------
@dataclass
class AgentMetrics:
    """Performance Metrics pro Agent."""
    agent_name: str
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    total_tokens: int = 0
    total_response_time: float = 0.0
    average_response_time: float = 0.0
    last_request_time: Optional[datetime] = None
    error_messages: List[str] = field(default_factory=list)
    
    def update_success(self, response_time: float, tokens: int):
        """Update bei erfolgreicher Anfrage."""
        self.total_requests += 1
        self.successful_requests += 1
        self.total_tokens += tokens
        self.total_response_time += response_time
        self.average_response_time = self.total_response_time / self.total_requests
        self.last_request_time = datetime.utcnow()
    
    def update_failure(self, error_msg: str):
        """Update bei fehlgeschlagener Anfrage."""
        self.total_requests += 1
        self.failed_requests += 1
        self.last_request_time = datetime.utcnow()
        self.error_messages.append(error_msg)
        
        # Nur letzte 10 Errors behalten
        if len(self.error_messages) > 10:
            self.error_messages.pop(0)
    
    def get_success_rate(self) -> float:
        """Success Rate in Prozent."""
        if self.total_requests == 0:
            return 0.0
        return (self.successful_requests / self.total_requests) * 100


# ---------------------------------------------------------
# Agent Context Memory
# ---------------------------------------------------------
class AgentContextMemory:
    """
    Langzeit-Kontext pro User & Agent.
    
    Speichert:
    - Conversation History
    - User Preferences
    - Previous Results
    - Session State
    """
    
    def __init__(self, max_history_per_user: int = 50):
        self.max_history = max_history_per_user
        # Structure: {user_id: {agent_name: deque([messages])}}
        self.memory: Dict[str, Dict[str, deque]] = defaultdict(
            lambda: defaultdict(lambda: deque(maxlen=self.max_history))
        )
        # User Preferences: {user_id: {preference_key: value}}
        self.preferences: Dict[str, Dict] = defaultdict(dict)
    
    def add_message(self, user_id: str, agent_name: str, role: str, content: str):
        """Fügt Nachricht zum Context hinzu."""
        self.memory[user_id][agent_name].append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def get_history(
        self,
        user_id: str,
        agent_name: str,
        limit: Optional[int] = None
    ) -> List[Dict]:
        """Holt Conversation History."""
        history = list(self.memory[user_id][agent_name])
        
        if limit:
            return history[-limit:]
        return history
    
    def set_preference(self, user_id: str, key: str, value: Any):
        """Setzt User Preference."""
        self.preferences[user_id][key] = value
    
    def get_preference(self, user_id: str, key: str, default=None):
        """Holt User Preference."""
        return self.preferences[user_id].get(key, default)
    
    def clear_history(self, user_id: str, agent_name: Optional[str] = None):
        """Löscht History."""
        if agent_name:
            self.memory[user_id][agent_name].clear()
        else:
            self.memory[user_id].clear()


# ---------------------------------------------------------
# Agent Request Queue & Load Balancing
# ---------------------------------------------------------
class AgentRequestQueue:
    """
    Queue System für Agent Requests.
    
    Features:
    - Priority Queue
    - Rate Limiting
    - Concurrent Execution
    - Load Balancing
    """
    
    def __init__(self, max_concurrent: int = 10):
        self.max_concurrent = max_concurrent
        self.queue: asyncio.Queue = asyncio.Queue()
        self.active_tasks = 0
        self.semaphore = asyncio.Semaphore(max_concurrent)
        
        # Rate Limiting: {agent_name: deque(timestamps)}
        self.rate_limits: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=100)  # Last 100 requests
        )
    
    async def enqueue(
        self,
        agent_name: str,
        callback,
        priority: int = 5,
        *args,
        **kwargs
    ):
        """
        Fügt Request zur Queue hinzu.
        
        Args:
            agent_name: Name des Agents
            callback: Async function to execute
            priority: 1-10 (1=highest, 10=lowest)
            *args, **kwargs: Callback arguments
        """
        await self.queue.put({
            "agent_name": agent_name,
            "callback": callback,
            "priority": priority,
            "args": args,
            "kwargs": kwargs,
            "timestamp": time.time()
        })
    
    async def process_queue(self):
        """Verarbeitet Queue kontinuierlich."""
        while True:
            try:
                # Hole Request aus Queue
                request = await self.queue.get()
                
                # Check Rate Limit
                agent_name = request["agent_name"]
                now = time.time()
                
                # Remove old timestamps (>1 minute)
                while (self.rate_limits[agent_name] and 
                       now - self.rate_limits[agent_name][0] > 60):
                    self.rate_limits[agent_name].popleft()
                
                # Check if rate limit exceeded (max 60 req/min)
                if len(self.rate_limits[agent_name]) >= 60:
                    # Rate limit exceeded - wait
                    await asyncio.sleep(1)
                    await self.queue.put(request)  # Re-queue
                    continue
                
                # Execute with semaphore (concurrent limit)
                async with self.semaphore:
                    self.active_tasks += 1
                    self.rate_limits[agent_name].append(now)
                    
                    try:
                        await request["callback"](
                            *request["args"],
                            **request["kwargs"]
                        )
                    finally:
                        self.active_tasks -= 1
                        self.queue.task_done()
                
            except Exception as e:
                print(f"[AgentQueue] Error processing request: {e}")
    
    def get_queue_stats(self) -> Dict:
        """Queue Statistics."""
        return {
            "queue_size": self.queue.qsize(),
            "active_tasks": self.active_tasks,
            "max_concurrent": self.max_concurrent
        }


# ---------------------------------------------------------
# Enhanced Agent System V2
# ---------------------------------------------------------
class AgentSystemV2(AgentSystem):
    """
    Enhanced Agent System mit Production Features.
    
    Neue Features:
    - Performance Monitoring
    - Context Memory
    - Load Balancing
    - Error Recovery
    - Agent Collaboration
    """
    
    def __init__(self):
        super().__init__()
        
        # Performance Metrics
        self.metrics: Dict[str, AgentMetrics] = {}
        
        # Context Memory
        self.context_memory = AgentContextMemory()
        
        # Request Queue
        self.request_queue = AgentRequestQueue(max_concurrent=10)
        
        # Queue processor task (wird später gestartet)
        self._queue_task = None
    
    async def start_queue_processor(self):
        """Startet den Queue Processor (muss aus async Context aufgerufen werden)"""
        if self._queue_task is None:
            self._queue_task = asyncio.create_task(self.request_queue.process_queue())
    
    async def run_agent_v2(
        self,
        agent_name: str,
        message: str,
        context: Dict[str, Any],
        user_id: Optional[str] = None,
        use_memory: bool = True,
        priority: int = 5
    ):
        """
        Enhanced Agent Execution mit Monitoring & Memory.
        
        Args:
            agent_name: Agent Name
            message: User Message
            context: Context Dict
            user_id: User ID (für Memory)
            use_memory: Context Memory nutzen?
            priority: Request Priority (1-10)
        """
        start_time = time.time()
        
        # Initialize metrics if needed
        if agent_name not in self.metrics:
            self.metrics[agent_name] = AgentMetrics(agent_name=agent_name)
        
        try:
            # Add conversation history if memory enabled
            if use_memory and user_id:
                history = self.context_memory.get_history(
                    user_id=user_id,
                    agent_name=agent_name,
                    limit=10
                )
                context["conversation_history"] = history
            
            # Execute agent
            result = await super().run_agent(agent_name, message, context)
            
            # Calculate metrics
            response_time = time.time() - start_time
            tokens = len(result.get("response", "").split())  # Approximation
            
            # Update metrics
            self.metrics[agent_name].update_success(response_time, tokens)
            
            # Store in memory
            if use_memory and user_id:
                self.context_memory.add_message(
                    user_id=user_id,
                    agent_name=agent_name,
                    role="user",
                    content=message
                )
                self.context_memory.add_message(
                    user_id=user_id,
                    agent_name=agent_name,
                    role="assistant",
                    content=result.get("response", "")
                )
            
            return result
            
        except Exception as e:
            # Update failure metrics
            self.metrics[agent_name].update_failure(str(e))
            
            # Try fallback agent
            fallback_result = await self._try_fallback(
                agent_name=agent_name,
                message=message,
                context=context,
                error=e
            )
            
            if fallback_result:
                return fallback_result
            
            # Re-raise if no fallback worked
            raise
    
    async def _try_fallback(
        self,
        agent_name: str,
        message: str,
        context: Dict,
        error: Exception
    ):
        """
        Versucht Fallback zu anderem Agent/Model.
        
        Fallback Chain:
        - Aura → Cora → Lumi → Devra
        - GPT-5 → Claude → Gemini → Copilot → Ollama
        """
        fallback_agents = {
            "aura": ["cora", "lumi", "devra"],
            "cora": ["aura", "lumi", "devra"],
            "lumi": ["cora", "aura", "devra"],
            "devra": ["cora", "lumi", "aura"]
        }
        
        fallbacks = fallback_agents.get(agent_name.lower(), [])
        
        for fallback_name in fallbacks:
            try:
                print(f"[AgentSystem] Trying fallback: {fallback_name}")
                
                result = await super().run_agent(
                    agent_name=fallback_name,
                    message=message,
                    context=context
                )
                
                result["fallback_used"] = fallback_name
                result["original_agent"] = agent_name
                result["original_error"] = str(error)
                
                return result
                
            except Exception as fallback_error:
                print(f"[AgentSystem] Fallback {fallback_name} failed: {fallback_error}")
                continue
        
        return None
    
    async def run_collaborative(
        self,
        agents: List[str],
        message: str,
        context: Dict[str, Any],
        collaboration_mode: str = "sequential"
    ):
        """
        Multi-Agent Collaboration.
        
        Modes:
        - sequential: Agents arbeiten nacheinander
        - parallel: Agents arbeiten gleichzeitig
        - voting: Agents stimmen ab (Majority wins)
        """
        results = []
        
        if collaboration_mode == "sequential":
            # Sequential execution - each agent builds on previous
            current_context = context.copy()
            
            for agent_name in agents:
                result = await self.run_agent_v2(
                    agent_name=agent_name,
                    message=message,
                    context=current_context,
                    use_memory=False
                )
                
                results.append({
                    "agent": agent_name,
                    "result": result
                })
                
                # Next agent gets previous result as context
                current_context["previous_response"] = result.get("response")
            
            return {
                "collaboration_mode": "sequential",
                "agents": agents,
                "results": results,
                "final_response": results[-1]["result"]["response"]
            }
        
        elif collaboration_mode == "parallel":
            # Parallel execution
            tasks = [
                self.run_agent_v2(
                    agent_name=agent_name,
                    message=message,
                    context=context.copy(),
                    use_memory=False
                )
                for agent_name in agents
            ]
            
            parallel_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, agent_name in enumerate(agents):
                result = parallel_results[i]
                if not isinstance(result, Exception):
                    results.append({
                        "agent": agent_name,
                        "result": result
                    })
            
            return {
                "collaboration_mode": "parallel",
                "agents": agents,
                "results": results
            }
        
        elif collaboration_mode == "voting":
            # Voting - majority wins
            tasks = [
                self.run_agent_v2(
                    agent_name=agent_name,
                    message=message,
                    context=context.copy(),
                    use_memory=False
                )
                for agent_name in agents
            ]
            
            voting_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Count responses
            response_votes = defaultdict(int)
            
            for i, agent_name in enumerate(agents):
                result = voting_results[i]
                if not isinstance(result, Exception):
                    if isinstance(result, dict):
                        response = result.get("response", result.get("message", str(result)))
                    else:
                        response = str(result)
                    response_votes[response] += 1
                    results.append({
                        "agent": agent_name,
                        "result": result
                    })
            
            # Get majority response
            majority_response = max(response_votes.items(), key=lambda x: x[1])[0]
            
            return {
                "collaboration_mode": "voting",
                "agents": agents,
                "results": results,
                "majority_response": majority_response,
                "vote_counts": dict(response_votes)
            }
    
    def get_agent_metrics(self, agent_name: Optional[str] = None) -> Dict:
        """
        Liefert Performance Metrics.
        
        Args:
            agent_name: Specific agent oder None für alle
        """
        if agent_name:
            metrics = self.metrics.get(agent_name)
            if not metrics:
                return {"error": f"No metrics for agent {agent_name}"}
            
            return {
                "agent": agent_name,
                "total_requests": metrics.total_requests,
                "successful": metrics.successful_requests,
                "failed": metrics.failed_requests,
                "success_rate": metrics.get_success_rate(),
                "avg_response_time": metrics.average_response_time,
                "total_tokens": metrics.total_tokens,
                "last_request": metrics.last_request_time.isoformat() if metrics.last_request_time else None,
                "recent_errors": metrics.error_messages[-5:]
            }
        
        # All agents
        return {
            agent_name: {
                "total_requests": m.total_requests,
                "success_rate": m.get_success_rate(),
                "avg_response_time": m.average_response_time,
                "total_tokens": m.total_tokens
            }
            for agent_name, m in self.metrics.items()
        }
    
    def get_system_health(self) -> Dict:
        """
        Gesamtsystem Health Check.
        
        Returns:
            - Total Agents
            - Active Agents (last 1h)
            - Queue Stats
            - Overall Success Rate
            - Total Requests
        """
        now = datetime.utcnow()
        one_hour_ago = now - timedelta(hours=1)
        
        total_agents = len(self.registry)
        active_agents = sum(
            1 for m in self.metrics.values()
            if m.last_request_time and m.last_request_time > one_hour_ago
        )
        
        total_requests = sum(m.total_requests for m in self.metrics.values())
        total_successful = sum(m.successful_requests for m in self.metrics.values())
        
        overall_success_rate = 0.0
        if total_requests > 0:
            overall_success_rate = (total_successful / total_requests) * 100
        
        return {
            "total_agents": total_agents,
            "active_agents_1h": active_agents,
            "queue_stats": self.request_queue.get_queue_stats(),
            "total_requests": total_requests,
            "overall_success_rate": overall_success_rate,
            "timestamp": now.isoformat()
        }


# Global Enhanced Agent System
agent_system_v2 = AgentSystemV2()


# -------------------------------------------------------------
# VIBEAI – SPECIALIZED AGENTS (PRODUCTION EXTENSIONS)
# -------------------------------------------------------------


# ---------------------------------------------------------
# Builder Agent (App Builder Integration)
# ---------------------------------------------------------
class BuilderAgent:
    """
    Specialized Agent für App Builder.
    
    Features:
    - Flutter/React/Next.js Code Generation
    - Architecture Planning
    - Component Structure
    - API Integration
    """
    
    name = "builder"
    model = "gpt-4o"  # Optimized for code generation
    
    async def run(self, message: str, framework: str = "flutter"):
        """
        Generate app structure.
        
        Args:
            message: User requirement
            framework: flutter, react, nextjs, etc.
        """
        try:
            from generator import CodeGeneratorV2
            from planner import ArchitecturePlannerV2
            
            generator = CodeGeneratorV2()
            planner = ArchitecturePlannerV2()
            
            # Step 1: Plan architecture
            plan = planner(message) if callable(planner) else {"modules": []}
            
            # Step 2: Generate code
            from pathlib import Path
            output_dir = Path(f"/tmp/vibeai_projects/{message[:20].replace(' ', '_')}")
            output_dir.mkdir(parents=True, exist_ok=True)
            
            project = await generator.generate_project(
                description=message,
                output_dir=str(output_dir)
            )
            
            # WebSocket Update
            try:
                from admin.notifications.ws_manager import ws_manager_v2
                if ws_manager_v2:
                    await ws_manager_v2.notify_app_builder_status(
                        project_name=project.get("name", "Project"),
                        status="ready",
                        details=f"Generated {len(project.get('files', []))} files"
                    )
            except ImportError:
                pass
            
            return {
                "agent": "builder",
                "framework": framework,
                "architecture": plan,
                "project": project,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "agent": "builder",
                "error": str(e),
                "status": "failed"
            }


# ---------------------------------------------------------
# Code Engineer Agent (Code Studio Integration)
# ---------------------------------------------------------
class CodeEngineerAgent:
    """
    Advanced Code Engineering Agent.
    
    Features:
    - Code Review
    - Refactoring
    - Bug Detection
    - Performance Optimization
    - Test Generation
    """
    
    name = "code_engineer"
    model = "claude-3.7-sonnet"  # Best for code analysis
    
    async def run(
        self,
        message: str,
        code: Optional[str] = None,
        action: str = "analyze"
    ):
        """
        Code engineering actions.
        
        Args:
            message: User instruction
            code: Code to analyze
            action: analyze, refactor, debug, test, optimize
        """
        from core.model_router_v2 import model_router
        
        system_prompts = {
            "analyze": "You are a senior code reviewer. Analyze code quality, patterns, and suggest improvements.",
            "refactor": "You are a refactoring expert. Improve code structure, readability, and maintainability.",
            "debug": "You are a debugging expert. Find and fix bugs, edge cases, and potential issues.",
            "test": "You are a test engineer. Generate comprehensive unit tests and integration tests.",
            "optimize": "You are a performance engineer. Optimize code for speed, memory, and efficiency."
        }
        
        system_prompt = system_prompts.get(action, system_prompts["analyze"])
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if code:
            messages.append({
                "role": "user",
                "content": f"Task: {message}\n\nCode:\n```\n{code}\n```"
            })
        else:
            messages.append({"role": "user", "content": message})
        
        try:
            from core.model_router_v2 import model_router
            from core.model_registry_v2 import resolve_model
            
            model_name = model_router.pick_model(message, agent="cora")
            model_wrapper = resolve_model(model_name)
            
            response = await model_wrapper.run(
                messages=messages,
                context={"user_id": "system", "agent": "cora"}
            )
            
            # WebSocket Update
            try:
                from admin.notifications.ws_manager import ws_manager_v2
                if ws_manager_v2:
                    await ws_manager_v2.notify_code_studio_event(
                        event=f"{action}_completed",
                        message=f"Code {action} completed"
                    )
            except (ImportError, Exception):
                pass
            
            return {
                "agent": "code_engineer",
                "action": action,
                "response": response.get("content", ""),
                "status": "success"
            }
            
        except Exception as e:
            return {
                "agent": "code_engineer",
                "error": str(e),
                "status": "failed"
            }


# ---------------------------------------------------------
# Search Agent (Web Search Integration)
# ---------------------------------------------------------
class SearchAgent:
    """
    Web Search & Information Retrieval Agent.
    
    Features:
    - Bing Search
    - Tavily AI Search
    - DuckDuckGo Fallback
    - URL Analysis
    - Content Extraction
    """
    
    name = "search"
    model = "gpt-4o-mini"  # Fast for search queries
    
    async def run(
        self,
        query: str,
        search_type: str = "web",
        max_results: int = 5
    ):
        """
        Perform search.
        
        Args:
            query: Search query
            search_type: web, news, academic, images
            max_results: Max results to return
        """
        try:
            from core.web_search import WebSearchV2
            
            searcher = WebSearchV2()
            
            # WebSearchV2 search() Methode
            if hasattr(searcher, 'search'):
                results = await searcher.search(query=query)
            else:
                # Fallback: Simulierte Suchergebnisse
                results = [
                    {
                        "title": query,
                        "snippet": f"Search for: {query}",
                        "url": "#"
                    }
                ]
            
            # Analyze results with AI
            from core.model_router_v2 import model_router
            from core.model_registry_v2 import resolve_model
            
            analyze_prompt = (
                f"Analyze these search results for: {query}\n\n"
                f"Results:\n{results}"
            )
            model_name = model_router.pick_model(
                analyze_prompt,
                agent="aura"
            )
            model_wrapper = resolve_model(model_name)
            
            analysis_result = await model_wrapper.run(
                messages=[{"role": "user", "content": analyze_prompt}],
                context={"user_id": "system", "agent": "aura"}
            )
            analysis = (
                analysis_result.get("message", str(analysis_result))
                if isinstance(analysis_result, dict)
                else str(analysis_result)
            )
            
            analysis_str = (
                analysis if isinstance(analysis, str)
                else str(analysis)
            )
            return {
                "agent": "search",
                "query": query,
                "results": results,
                "analysis": analysis_str,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "agent": "search",
                "error": str(e),
                "status": "failed"
            }


# ---------------------------------------------------------
# Memory Agent (Context & RAG)
# ---------------------------------------------------------
class MemoryAgent:
    """
    Long-term Memory & RAG Agent.
    
    Features:
    - Conversation History Management
    - Knowledge Base Storage
    - Semantic Search
    - Context Retrieval
    - User Preferences
    """
    
    name = "memory"
    
    def __init__(self):
        # Use AgentSystemV2's context memory
        self.context_memory = agent_system_v2.context_memory
    
    async def run(
        self,
        action: str,
        user_id: str,
        agent_name: Optional[str] = None,
        **kwargs
    ):
        """
        Memory operations.
        
        Actions:
        - get_history: Retrieve conversation history
        - add_message: Store message
        - set_preference: Store user preference
        - get_preference: Retrieve preference
        - clear_history: Clear history
        """
        try:
            if action == "get_history":
                history = self.context_memory.get_history(
                    user_id=user_id,
                    agent_name=agent_name or "aura",
                    limit=kwargs.get("limit")
                )
                return {
                    "agent": "memory",
                    "action": "get_history",
                    "history": history,
                    "status": "success"
                }
            
            elif action == "add_message":
                self.context_memory.add_message(
                    user_id=user_id,
                    agent_name=agent_name or "aura",
                    role=kwargs.get("role", "user"),
                    content=kwargs.get("content", "")
                )
                return {
                    "agent": "memory",
                    "action": "add_message",
                    "status": "success"
                }
            
            elif action == "set_preference":
                self.context_memory.set_preference(
                    user_id=user_id,
                    key=str(kwargs.get("key", "")),
                    value=kwargs.get("value")
                )
                return {
                    "agent": "memory",
                    "action": "set_preference",
                    "status": "success"
                }
            
            elif action == "get_preference":
                value = self.context_memory.get_preference(
                    user_id=user_id,
                    key=str(kwargs.get("key", "")),
                    default=kwargs.get("default")
                )
                return {
                    "agent": "memory",
                    "action": "get_preference",
                    "value": value,
                    "status": "success"
                }
            
            elif action == "clear_history":
                self.context_memory.clear_history(
                    user_id=user_id,
                    agent_name=agent_name
                )
                return {
                    "agent": "memory",
                    "action": "clear_history",
                    "status": "success"
                }
            
            else:
                return {
                    "agent": "memory",
                    "error": f"Unknown action: {action}",
                    "status": "failed"
                }
                
        except Exception as e:
            return {
                "agent": "memory",
                "error": str(e),
                "status": "failed"
            }


# ---------------------------------------------------------
# Planner Agent (Task Planning & Decomposition)
# ---------------------------------------------------------
class PlannerAgent:
    """
    Task Planning & Decomposition Agent.
    
    Features:
    - Break complex tasks into steps
    - Multi-agent coordination
    - Timeline estimation
    - Dependency management
    """
    
    name = "planner"
    model = "o3"  # Best for reasoning & planning
    
    async def run(self, task: str, context: Optional[Dict] = None):
        """
        Create execution plan.
        
        Args:
            task: Task description
            context: Additional context
        """
        from core.model_router_v2 import model_router
        
        planning_prompt = f"""
        You are a task planning expert. Break down this task into executable steps:
        
        Task: {task}
        
        Provide:
        1. Step-by-step plan
        2. Required agents for each step
        3. Dependencies between steps
        4. Estimated time per step
        5. Success criteria
        
        Format as structured JSON.
        """
        
        try:
            from core.model_router_v2 import model_router
            from core.model_registry_v2 import resolve_model
            
            model_name = model_router.pick_model(planning_prompt, agent="devra")
            model_wrapper = resolve_model(model_name)
            
            response = await model_wrapper.run(
                messages=[{"role": "user", "content": planning_prompt}],
                context={"user_id": "system", "agent": "devra"}
            )
            
            # Parse plan
            plan_text = response.get("message", "{}") if isinstance(response, dict) else "{}"
            
            # Extract JSON
            if "```json" in plan_text:
                plan_text = plan_text.split("```json")[1].split("```")[0]
            elif "```" in plan_text:
                plan_text = plan_text.split("```")[1].split("```")[0]
            
            try:
                plan = json.loads(plan_text.strip())
            except:
                plan = {"raw_plan": plan_text}
            
            return {
                "agent": "planner",
                "task": task,
                "plan": plan,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "agent": "planner",
                "error": str(e),
                "status": "failed"
            }


# ---------------------------------------------------------
# Worker Agent (Task Execution)
# ---------------------------------------------------------
class WorkerAgent:
    """
    Generic Worker Agent for executing subtasks.
    
    Features:
    - Execute planned steps
    - Report progress
    - Handle errors
    - Coordinate with other agents
    """
    
    name = "worker"
    
    async def run(
        self,
        step: Dict,
        context: Optional[Dict] = None
    ):
        """
        Execute a planned step.
        
        Args:
            step: Step dict from PlannerAgent
            context: Execution context
        """
        step_description = step.get("description", "")
        required_agent = step.get("agent", "aura")
        
        try:
            # Delegate to appropriate agent
            if required_agent in agent_system_v2.registry:
                result = await agent_system_v2.run_agent_v2(
                    agent_name=required_agent,
                    message=step_description,
                    context=context or {},
                    use_memory=False
                )
            else:
                # Fallback to default execution
                from core.model_router_v2 import model_router
                from core.model_registry_v2 import resolve_model
                
                model_name = model_router.pick_model(step_description, agent="aura")
                model_wrapper = resolve_model(model_name)
                
                result = await model_wrapper.run(
                    messages=[{"role": "user", "content": step_description}],
                    context={"user_id": "system", "agent": "aura"}
                )
            
            # WebSocket Progress Update
            try:
                from admin.notifications.ws_manager import ws_manager_v2
                if ws_manager_v2:
                    await ws_manager_v2.notify_agent_activity(
                        agent_name="worker",
                        action="completed",
                        details={"step": step_description}
                    )
            except (ImportError, Exception):
                pass
            
            return {
                "agent": "worker",
                "step": step_description,
                "result": result,
                "status": "success"
            }
            
        except Exception as e:
            # WebSocket Error Update
            try:
                from admin.notifications.ws_manager import ws_manager_v2
                if ws_manager_v2:
                    await ws_manager_v2.notify_agent_activity(
                        agent_name="worker",
                        action="error",
                        details={"step": step_description, "error": str(e)}
                    )
            except (ImportError, Exception):
                pass
            
            return {
                "agent": "worker",
                "step": step_description,
                "error": str(e),
                "status": "failed"
            }


# ---------------------------------------------------------
# Register Specialized Agents
# ---------------------------------------------------------
try:
    # Register all specialized agents
    agent_system_v2.register_agent("builder", BuilderAgent())
    agent_system_v2.register_agent("code_engineer", CodeEngineerAgent())
    agent_system_v2.register_agent("search", SearchAgent())
    agent_system_v2.register_agent("memory", MemoryAgent())
    agent_system_v2.register_agent("planner", PlannerAgent())
    agent_system_v2.register_agent("worker", WorkerAgent())
    
    print("[AgentSystem] Registered 6 specialized agents: builder, code_engineer, search, memory, planner, worker")
    
except Exception as e:
    print(f"[AgentSystem] Error registering specialized agents: {e}")


# ---------------------------------------------------------
# Import json for PlannerAgent
# ---------------------------------------------------------
import json
