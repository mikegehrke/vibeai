"""
VIBEAI – TEAM COLLABORATION ENGINE
Multi-Agent Team für komplexe Aufgaben
"""

import os
from typing import Any, Dict, List, Optional

from ai.providers.model_clients import ModelClient


class TeamEngine:
    """
    Team Collaboration Engine - Multi-Agent Brainstorming
    """

    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None

        self.agents = {
            "lead_developer": {
                "role": "Lead Developer",
                "expertise": "Architecture, Code Structure, Best Practices",
            },
            "code_reviewer": {
                "role": "Code Reviewer",
                "expertise": "Code Quality, Testing, Refactoring",
            },
            "ui_ux_designer": {
                "role": "UI/UX Designer",
                "expertise": "User Experience, Interface Design",
            },
            "db_architect": {
                "role": "Database Architect",
                "expertise": "Data Modeling, Performance, Queries",
            },
            "performance_optimizer": {
                "role": "Performance Optimizer",
                "expertise": "Speed, Memory, Optimization",
            },
            "security_expert": {
                "role": "Security Expert",
                "expertise": "Security, Authentication, Authorization",
            },
            "tester": {"role": "Tester", "expertise": "Testing Strategies, Edge Cases"},
            "error_fixer": {
                "role": "Error Fixer",
                "expertise": "Debugging, Error Handling",
            },
        }

        self.default_team = ["lead_developer", "code_reviewer", "ui_ux_designer"]

    def _ensure_clients(self):
        if self.openai_client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.openai_client = ModelClient(provider="openai", api_key=api_key)

        if self.anthropic_client is None:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                self.anthropic_client = ModelClient(provider="anthropic", api_key=api_key)

    async def collaborate(
        self, task: str, team_members: Optional[List[str]] = None, parallel: bool = True
    ) -> Dict[str, Any]:
        """Team collaboration on task"""
        self._ensure_clients()

        if team_members is None:
            team_members = self.default_team

        responses = {}

        if parallel:
            import asyncio

            tasks = [self.ask(agent_key, task) for agent_key in team_members]
            results = await asyncio.gather(*tasks)

            for agent_key, result in zip(team_members, results):
                responses[agent_key] = result
        else:
            for agent_key in team_members:
                responses[agent_key] = await self.ask(agent_key, task)

        return {
            "success": True,
            "task": task,
            "team_members": team_members,
            "responses": responses,
        }

    async def ask(self, agent_key: str, prompt: str) -> Dict[str, Any]:
        """Ask specific agent for response"""
        self._ensure_clients()

        if agent_key not in self.agents:
            return {"success": False, "error": f"Unknown agent: {agent_key}"}

        agent = self.agents[agent_key]

        system_prompt = f"""You are {agent['role']}.
Your expertise: {agent['expertise']}

Provide expert advice from your role's perspective."""

        if self.openai_client:
            response = await self.openai_client.complete(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
            )

            return {
                "success": True,
                "agent": agent_key,
                "role": agent["role"],
                "response": response.get("content", ""),
            }

        return {"success": False, "error": "No API client available"}

    async def review_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Team code review"""
        team = ["lead_developer", "code_reviewer", "tester"]

        prompt = f"""Review this {language} code: