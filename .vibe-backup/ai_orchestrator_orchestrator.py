# -------------------------------------------------------------
# VIBEAI – MULTI AGENT ORCHESTRATOR
# -------------------------------------------------------------
"""
Complete Agent Orchestrator

Handles:
- Intent Classification
- Agent Routing
- Context Management
- Multi-Step Workflows
"""

from typing import Dict, Optional


class AgentOrchestrator:
    """Main orchestrator for all AI agents."""

    def __init__(self):
        self.agents = {}
        self._initialize_agents()

    def _initialize_agents(self):
        """Lazy import to avoid circular dependencies."""
        from ai.orchestrator.agents.build_agent import build_agent
        from ai.orchestrator.agents.code_agent import code_agent
        from ai.orchestrator.agents.deploy_agent import deploy_agent
        from ai.orchestrator.agents.preview_agent import preview_agent
        from ai.orchestrator.agents.ui_agent import ui_agent

        self.agents = {
            "ui": ui_agent,
            "code": code_agent,
            "preview": preview_agent,
            "build": build_agent,
            "deploy": deploy_agent,
        }

    async def handle(self, user_id: str, project_id: str, prompt: str, context: Optional[Dict] = None) -> Dict:
        """
        Main entry point for agent orchestration.

        Args:
            user_id: User identifier
            project_id: Project identifier
            prompt: User prompt/command
            context: Optional context data

        Returns:
            {
                "agent": "ui_agent",
                "intent": "ui",
                "result": {...},
                "success": True
            }
        """
        from ai.orchestrator.memory.project_context import project_context

        # Load project context
        ctx = project_context.load(user_id, project_id)

        # Classify intent
        intent = self.classify_intent(prompt)

        try:
            if intent == "ui":
                screen = await self.agents["ui"].create_ui(prompt, ctx)
                project_context.add_screen(user_id, project_id, screen)
                return {
                    "agent": "ui_agent",
                    "intent": "ui",
                    "result": screen,
                    "success": True,
                }

            elif intent == "code":
                screen = project_context.get_last_screen(user_id, project_id)
                framework = ctx.get("framework", "flutter")
                code = await self.agents["code"].generate_code(screen, framework)
                project_context.add_code(user_id, project_id, code)
                return {
                    "agent": "code_agent",
                    "intent": "code",
                    "result": code,
                    "success": True,
                }

            elif intent == "preview":
                result = await self.agents["preview"].update_preview(user_id, project_id)
                return {
                    "agent": "preview_agent",
                    "intent": "preview",
                    "result": result,
                    "success": True,
                }

            elif intent == "build":
                build = await self.agents["build"].start_build(user_id, project_id, prompt)
                return {
                    "agent": "build_agent",
                    "intent": "build",
                    "result": build,
                    "success": True,
                }

            elif intent == "deploy":
                url = await self.agents["deploy"].deploy_project(user_id, project_id)
                return {
                    "agent": "deploy_agent",
                    "intent": "deploy",
                    "result": {"url": url},
                    "success": True,
                }

            else:
                return {
                    "agent": "none",
                    "intent": "unknown",
                    "result": {"message": "Intent not recognized"},
                    "success": False,
                }

        except Exception as e:
            return {
                "agent": "error",
                "intent": intent,
                "result": {"error": str(e)},
                "success": False,
            }

    def classify_intent(self, prompt: str) -> str:
        """
        Classify user intent from prompt.

        Returns: ui | code | preview | build | deploy | unknown
        """
        p = prompt.lower()

        # UI Generation
        if any(
            word in p
            for word in [
                "screen",
                "ui",
                "design",
                "interface",
                "layout",
                "komponente",
                "button",
                "input",
            ]
        ):
            return "ui"

        # Code Generation
        if any(
            word in p
            for word in [
                "code",
                "flutter",
                "react",
                "vue",
                "programmier",
                "entwickle",
                "implementier",
            ]
        ):
            return "code"

        # Preview
        if any(word in p for word in ["preview", "zeige", "ansicht", "vorschau", "live", "anzeige"]):
            return "preview"

        # Build
        if any(
            word in p
            for word in [
                "build",
                "apk",
                "web build",
                "kompilier",
                "baue",
                "erstelle apk",
            ]
        ):
            return "build"

        # Deploy
        if any(word in p for word in ["deploy", "veröffentlich", "publish", "hochladen", "verteilen"]):
            return "deploy"

        return "unknown"

    async def execute_workflow(
        self,
        user_id: str,
        project_id: str,
        workflow: str,
        params: Optional[Dict] = None,
    ) -> Dict:
        """
        Execute predefined workflow.

        Workflows:
        - create_app: UI → Code → Preview
        - build_app: Code → Build → Deploy
        - full_cycle: UI → Code → Preview → Build → Deploy
        """
        results = []

        if workflow == "create_app":
            # Step 1: Create UI
            ui_result = await self.handle(user_id, project_id, params.get("prompt", "Create app UI"))
            results.append(ui_result)

            # Step 2: Generate Code
            code_result = await self.handle(user_id, project_id, "Generate code")
            results.append(code_result)

            # Step 3: Preview
            preview_result = await self.handle(user_id, project_id, "Show preview")
            results.append(preview_result)

        elif workflow == "build_app":
            # Step 1: Build
            build_result = await self.handle(user_id, project_id, "Build app")
            results.append(build_result)

            # Step 2: Deploy
            deploy_result = await self.handle(user_id, project_id, "Deploy app")
            results.append(deploy_result)

        elif workflow == "full_cycle":
            # Complete workflow
            prompts = [
                params.get("prompt", "Create app"),
                "Generate code",
                "Show preview",
                "Build app",
                "Deploy app",
            ]

            for prompt in prompts:
                result = await self.handle(user_id, project_id, prompt)
                results.append(result)

        return {
            "workflow": workflow,
            "steps": len(results),
            "results": results,
            "success": all(r.get("success") for r in results),
        }


# Global orchestrator instance
orchestrator = AgentOrchestrator()
