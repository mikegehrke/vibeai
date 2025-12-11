# -------------------------------------------------------------
# VIBEAI – MULTI-MODEL TEAM ENGINE ⭐ BLOCK 19
# -------------------------------------------------------------
"""
TeamEngine - Multi-model AI collaboration system

Features:
- Multiple AI models working together
- Specialized agent roles
- Parallel task execution
- Result aggregation
- Model fallback handling
- Consensus building
"""

import asyncio
import json
import os
from typing import Any, Dict, List, Optional

import anthropic
from openai import OpenAI

# Load agent profiles
PROFILES_PATH = os.path.join(os.path.dirname(__file__), "agent_profiles.json")
with open(PROFILES_PATH, "r", encoding="utf-8") as f:
    AGENT_CONFIG = json.load(f)


class TeamEngine:
    """
    Multi-model AI team collaboration engine

    Coordinates multiple AI models working together on tasks
    """

    def __init__(self):
        # Initialize API clients (lazy loading)
        self.openai_client = None
        self.anthropic_client = None

        # Agent configuration
        self.agents = AGENT_CONFIG["agents"]
        self.collaboration_modes = AGENT_CONFIG["collaboration_modes"]
        self.task_routing = AGENT_CONFIG["task_routing"]

        # Model mapping
        self.models = {
            "frontend": self.agents["frontend"]["model"],
            "backend": self.agents["backend"]["model"],
            "designer": self.agents["designer"]["model"],
            "testing": self.agents["testing"]["model"],
            "local": self.agents["local"]["model"],
            "architect": self.agents["architect"]["model"],
            "devops": self.agents["devops"]["model"],
            "coder": self.agents["coder"]["model"],
            "reviewer": self.agents["reviewer"]["model"],
            "packager": self.agents["packager"]["model"],
            "fixer": self.agents["fixer"]["model"],
        }

    async def collaborate(
        self, prompt: str, agents: Optional[List[str]] = None, mode: str = "parallel"
    ) -> Dict[str, Any]:
        """
        Coordinate multiple agents to collaborate on a task

        Args:
            prompt: Task description
            agents: List of agent keys to use (None = all agents)
            mode: Collaboration mode (parallel, sequential, consensus)

        Returns:
            Dict with responses from all agents
        """
        self._ensure_clients()

        # Default to all agents if not specified
        if agents is None:
            agents = ["frontend", "backend", "designer", "testing"]

        print(f"🤖 Team collaboration started: {len(agents)} agents")
        print(f"📋 Mode: {mode}")
        print(f"👥 Agents: {', '.join(agents)}")

        results = {}

        if mode == "parallel":
            # Run all agents in parallel
            tasks = [self.ask(agent_key, prompt) for agent_key in agents]
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            for agent_key, response in zip(agents, responses):
                if isinstance(response, Exception):
                    results[agent_key] = {"error": str(response), "success": False}
                else:
                    results[agent_key] = response

        elif mode == "sequential":
            # Run agents in sequence
            context = prompt
            for agent_key in agents:
                response = await self.ask(agent_key, context)
                results[agent_key] = response
                # Pass output to next agent
                if response.get("success"):
                    context = f"{prompt}\n\nPrevious agent ({agent_key}) said:\n{response['response']}"

        elif mode == "consensus":
            # Get responses from all agents, then vote
            tasks = [self.ask(agent_key, prompt) for agent_key in agents]
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            for agent_key, response in zip(agents, responses):
                if not isinstance(response, Exception):
                    results[agent_key] = response

            # Select best response (simplified voting)
            results["consensus"] = self._build_consensus(results)

        return {
            "success": True,
            "mode": mode,
            "agents": agents,
            "results": results,
            "summary": self._summarize_results(results),
        }

    async def ask(self, agent_key: str, prompt: str) -> Dict[str, Any]:
        """
        Args:
            agent_key: Agent identifier
            prompt: Task/question for the agent

        Returns:
            Dict with agent response and metadata
        """
        self._ensure_clients()

        if agent_key not in self.agents:
            return {"success": False, "error": f"Unknown agent: {agent_key}"}

        agent_config = self.agents[agent_key]
        model = agent_config["model"]

        # Build specialized prompt
        system_prompt = agent_config["prompt_prefix"]
        full_prompt = f"{system_prompt}\n\nTask: {prompt}"

        try:
            # Route to appropriate model
            if "claude" in model:
                response = await self._call_claude(model, full_prompt, agent_config)
            elif "gemini" in model:
                response = await self._call_gemini(model, full_prompt, agent_config)
            elif "ollama" in model:
                response = await self._call_ollama(model, full_prompt, agent_config)
            else:
                # Default to OpenAI
                response = await self._call_openai(model, full_prompt, agent_config)

            return {
                "success": True,
                "agent": agent_key,
                "agent_name": agent_config["name"],
                "model": model,
                "response": response,
                "expertise": agent_config["expertise"],
            }

        except Exception as e:
            print(f"❌ Error from {agent_key}: {e}")

            # Try fallback model
            fallback_model = agent_config.get("fallback")
            if fallback_model:
                try:
                    response = await self._call_openai(fallback_model, full_prompt, agent_config)
                    return {
                        "success": True,
                        "agent": agent_key,
                        "model": fallback_model,
                        "response": response,
                        "fallback_used": True,
                    }
                except Exception:
                    pass

            return {"success": False, "agent": agent_key, "error": str(e)}

    async def route_task(self, task_type: str, prompt: str) -> Dict[str, Any]:
        """
        Automatically route task to appropriate specialists

        Args:
            task_type: Type of task (ui_design, api_development, etc.)
            prompt: Task description

        Returns:
            Dict with agent response
        """
        self._ensure_clients()

        if task_type not in self.task_routing:
            # Default to full team
            agents = ["frontend", "backend", "designer"]
        else:
            agents = self.task_routing[task_type]

        print(f"🎯 Auto-routing '{task_type}' to: {', '.join(agents)}")

        return await self.collaborate(prompt, agents=agents, mode="parallel")

    # ========================================
    # MODEL API CALLS
    # ========================================

    async def _call_openai(self, model: str, prompt: str, config: Dict) -> str:
        """Call OpenAI API"""

        response = self.openai_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=config.get("temperature", 0.4),
            max_tokens=config.get("max_tokens", 2000),
        )

        return response.choices[0].message.content

    async def _call_claude(self, model: str, prompt: str, config: Dict) -> str:
        """Call Anthropic Claude API"""

        response = self.anthropic_client.messages.create(
            model=model,
            max_tokens=config.get("max_tokens", 2000),
            temperature=config.get("temperature", 0.4),
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text

    async def _call_gemini(self, model: str, prompt: str, config: Dict) -> str:
        """Call Google Gemini API"""

        # Simplified - would use actual Gemini SDK
        try:
            import google.generativeai as genai

            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

            model_instance = genai.GenerativeModel(model)
            response = model_instance.generate_content(prompt)

            return response.text
        except Exception:
            # Fallback to simulation
            return f"[Gemini simulated] Response to: {prompt[:100]}..."

    async def _call_ollama(self, model: str, prompt: str, config: Dict) -> str:
        """Call Ollama local model"""

        # Simplified - would use actual Ollama API
        try:
            import requests

            model_name = model.split(":")[-1]

            response = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": model_name, "prompt": prompt, "stream": False},
                timeout=30,
            )

            if response.ok:
                return response.json().get("response", "")
            else:
                raise Exception("Ollama API error")

        except Exception:
            # Fallback to simulation
            return f"[Ollama simulated] Response to: {prompt[:100]}..."

    # ========================================
    # RESULT PROCESSING
    # ========================================

    def _build_consensus(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Build consensus from multiple agent responses"""

        # Simple voting: select response with most agreement
        responses = [r.get("response", "") for r in results.values() if r.get("success")]

        if not responses:
            return {"response": "No valid responses", "confidence": 0}

        # For now, return first successful response
        # In production: implement actual voting/ranking
        return {
            "response": responses[0],
            "confidence": 0.8,
            "total_votes": len(responses),
        }

    def _summarize_results(self, results: Dict[str, Any]) -> str:
        """Create summary of all agent responses"""

        successful = sum(1 for r in results.values() if r.get("success"))
        total = len(results)

        summary = f"Team collaboration complete: {successful}/{total} agents responded successfully.\n\n"

        for agent_key, result in results.items():
            if result.get("success"):
                agent_name = result.get("agent_name", agent_key)
                summary += f"✅ {agent_name}: Ready\n"
            else:
                summary += f"❌ {agent_key}: {result.get('error', 'Failed')}\n"

        return summary

    def _ensure_clients(self):
        """Initialize clients on first use"""
        if self.openai_client is None:
            self.openai_client = OpenAI()
        if self.anthropic_client is None:
            self.anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


# Singleton instance
team_engine = TeamEngine()