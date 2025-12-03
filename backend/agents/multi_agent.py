# -------------------------------------------------------------
# VIBEAI – MULTI-AGENT APP BUILDER SYSTEM
# -------------------------------------------------------------
"""
Multi-Agent System für automatisierte App-Entwicklung

Agents:
- UI Agent: Erstellt UI-Strukturen aus Natural Language
- Code Agent: Generiert Flutter/React Code
- Preview Agent: Managed Live Preview & Hot Reload
- Build Agent: Startet Build-Prozess (APK/Web)
- Deploy Agent: Handled Artifacts & Downloads

Orchestrator:
- Routing zwischen Agents
- Task Management
- State Tracking
- Error Handling

Flow:
User Prompt → Orchestrator → Agents → Results
"""

from typing import Dict, List, Optional, Any
from enum import Enum
import asyncio
import json


# -------------------------------------------------------------
# AGENT TYPES
# -------------------------------------------------------------
class AgentType(str, Enum):
    UI = "ui_agent"
    CODE = "code_agent"
    PREVIEW = "preview_agent"
    BUILD = "build_agent"
    DEPLOY = "deploy_agent"
    ORCHESTRATOR = "orchestrator"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


# -------------------------------------------------------------
# BASE AGENT
# -------------------------------------------------------------
class BaseAgent:
    """
    Basis-Klasse für alle Agents.
    """

    def __init__(self, agent_type: AgentType):
        self.agent_type = agent_type
        self.capabilities: List[str] = []

    async def execute(self, task: Dict) -> Dict:
        """
        Execute task.
        
        Args:
            task: {
                "task_id": "123",
                "type": "create_ui",
                "params": {...}
            }
        
        Returns:
            {
                "success": True,
                "result": {...},
                "agent": "ui_agent"
            }
        """
        raise NotImplementedError("Subclasses must implement execute()")

    def can_handle(self, task_type: str) -> bool:
        """
        Check if agent can handle this task type.
        """
        return task_type in self.capabilities


# -------------------------------------------------------------
# UI AGENT
# -------------------------------------------------------------
class UIAgent(BaseAgent):
    """
    UI Agent - Erstellt UI-Strukturen aus Natural Language.
    
    Capabilities:
    - create_ui: Natural Language → UI Structure
    - suggest_components: AI-powered component suggestions
    - improve_ui: UI improvements based on feedback
    """

    def __init__(self):
        super().__init__(AgentType.UI)
        self.capabilities = [
            "create_ui",
            "suggest_components",
            "improve_ui",
            "validate_ui"
        ]

    async def execute(self, task: Dict) -> Dict:
        """
        Execute UI task.
        """
        task_type = task.get("type")
        params = task.get("params", {})

        if task_type == "create_ui":
            return await self._create_ui(params)
        elif task_type == "suggest_components":
            return await self._suggest_components(params)
        elif task_type == "improve_ui":
            return await self._improve_ui(params)
        elif task_type == "validate_ui":
            return await self._validate_ui(params)
        else:
            return {
                "success": False,
                "error": f"Unknown task type: {task_type}",
                "agent": self.agent_type
            }

    async def _create_ui(self, params: Dict) -> Dict:
        """
        Create UI from natural language prompt.
        
        Params:
            {
                "prompt": "Login screen with email and password",
                "framework": "flutter",
                "style": "material"
            }
        """
        from ai.ui_generator import ai_ui_generator

        prompt = params.get("prompt")
        framework = params.get("framework", "flutter")
        style = params.get("style", "material")

        try:
            result = await ai_ui_generator.generate_ui_from_prompt(
                prompt=prompt,
                framework=framework,
                style=style
            )

            return {
                "success": True,
                "result": result,
                "agent": self.agent_type,
                "action": "UI created from prompt"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _suggest_components(self, params: Dict) -> Dict:
        """Suggest components based on description."""
        from ai.ui_generator import ai_ui_generator

        description = params.get("description")
        existing = params.get("existing_components", [])

        try:
            suggestions = await ai_ui_generator.suggest_components(
                description=description,
                existing_components=existing
            )

            return {
                "success": True,
                "result": {"components": suggestions},
                "agent": self.agent_type,
                "action": "Component suggestions generated"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _improve_ui(self, params: Dict) -> Dict:
        """Improve existing UI."""
        from ai.ui_generator import ai_ui_generator

        screen = params.get("screen")
        improvement = params.get("improvement_request")

        try:
            result = await ai_ui_generator.improve_ui(
                screen=screen,
                improvement_request=improvement
            )

            return {
                "success": True,
                "result": result,
                "agent": self.agent_type,
                "action": "UI improved"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _validate_ui(self, params: Dict) -> Dict:
        """Validate UI structure."""
        screen = params.get("screen")

        # Basic validation
        errors = []
        warnings = []

        if not screen.get("name"):
            errors.append("Missing screen name")

        if not screen.get("components"):
            warnings.append("No components in screen")

        return {
            "success": True,
            "result": {
                "valid": len(errors) == 0,
                "errors": errors,
                "warnings": warnings
            },
            "agent": self.agent_type,
            "action": "UI validated"
        }


# -------------------------------------------------------------
# CODE AGENT
# -------------------------------------------------------------
class CodeAgent(BaseAgent):
    """
    Code Agent - Generiert Framework-spezifischen Code.
    
    Capabilities:
    - generate_flutter: UI → Flutter/Dart Code
    - generate_react: UI → React/JSX Code
    - generate_vue: UI → Vue Code
    - generate_html: UI → Static HTML
    - generate_app: Complete multi-screen app
    """

    def __init__(self):
        super().__init__(AgentType.CODE)
        self.capabilities = [
            "generate_flutter",
            "generate_react",
            "generate_vue",
            "generate_html",
            "generate_app",
            "format_code"
        ]

    async def execute(self, task: Dict) -> Dict:
        """
        Execute code generation task.
        """
        task_type = task.get("type")
        params = task.get("params", {})

        if task_type == "generate_flutter":
            return await self._generate_flutter(params)
        elif task_type == "generate_react":
            return await self._generate_react(params)
        elif task_type == "generate_vue":
            return await self._generate_vue(params)
        elif task_type == "generate_html":
            return await self._generate_html(params)
        elif task_type == "generate_app":
            return await self._generate_app(params)
        else:
            return {
                "success": False,
                "error": f"Unknown task type: {task_type}",
                "agent": self.agent_type
            }

    async def _generate_flutter(self, params: Dict) -> Dict:
        """Generate Flutter code."""
        from ai.code_generator.flutter_generator import flutter_generator
        from ai.code_generator.code_formatter import formatter

        screen = params.get("screen")

        try:
            code = flutter_generator.render_screen(screen)
            code = formatter.format_flutter(code)

            return {
                "success": True,
                "result": {
                    "code": code,
                    "language": "flutter",
                    "screen_name": screen.get("name")
                },
                "agent": self.agent_type,
                "action": "Flutter code generated"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _generate_react(self, params: Dict) -> Dict:
        """Generate React code."""
        from ai.code_generator.react_generator import react_generator
        from ai.code_generator.code_formatter import formatter

        screen = params.get("screen")

        try:
            code = react_generator.render_screen(screen)
            code = formatter.format_js(code)

            return {
                "success": True,
                "result": {
                    "code": code,
                    "language": "react",
                    "screen_name": screen.get("name")
                },
                "agent": self.agent_type,
                "action": "React code generated"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _generate_vue(self, params: Dict) -> Dict:
        """Generate Vue code."""
        # TODO: Implement VueGenerator
        return {
            "success": False,
            "error": "Vue generator not yet implemented",
            "agent": self.agent_type
        }

    async def _generate_html(self, params: Dict) -> Dict:
        """Generate static HTML."""
        from preview.preview_renderer import preview_renderer

        screen = params.get("screen")

        try:
            html = preview_renderer.render_screen_html(screen)

            return {
                "success": True,
                "result": {
                    "code": html,
                    "language": "html",
                    "screen_name": screen.get("name")
                },
                "agent": self.agent_type,
                "action": "HTML code generated"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _generate_app(self, params: Dict) -> Dict:
        """Generate complete multi-screen app."""
        from ai.code_generator.flutter_generator import flutter_generator
        from ai.code_generator.react_generator import react_generator

        app_structure = params.get("app_structure")
        framework = app_structure.get("framework", "flutter")

        try:
            if framework == "flutter":
                files = flutter_generator.render_app(app_structure)
            elif framework == "react":
                files = react_generator.render_app(app_structure)
            else:
                raise ValueError(f"Unsupported framework: {framework}")

            return {
                "success": True,
                "result": {
                    "files": files,
                    "framework": framework,
                    "file_count": len(files)
                },
                "agent": self.agent_type,
                "action": f"Complete {framework} app generated"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }


# -------------------------------------------------------------
# PREVIEW AGENT
# -------------------------------------------------------------
class PreviewAgent(BaseAgent):
    """
    Preview Agent - Managed Live Preview Servers.
    
    Capabilities:
    - start_flutter_preview: Start Flutter web server
    - start_react_preview: Start React dev server
    - stop_preview: Stop preview server
    - reload_preview: Trigger hot reload
    - get_preview_status: Get server status
    """

    def __init__(self):
        super().__init__(AgentType.PREVIEW)
        self.capabilities = [
            "start_flutter_preview",
            "start_react_preview",
            "stop_preview",
            "reload_preview",
            "get_preview_status"
        ]

    async def execute(self, task: Dict) -> Dict:
        """
        Execute preview task.
        """
        task_type = task.get("type")
        params = task.get("params", {})

        if task_type == "start_flutter_preview":
            return await self._start_flutter_preview(params)
        elif task_type == "start_react_preview":
            return await self._start_react_preview(params)
        elif task_type == "stop_preview":
            return await self._stop_preview(params)
        elif task_type == "reload_preview":
            return await self._reload_preview(params)
        elif task_type == "get_preview_status":
            return await self._get_status(params)
        else:
            return {
                "success": False,
                "error": f"Unknown task type: {task_type}",
                "agent": self.agent_type
            }

    async def _start_flutter_preview(self, params: Dict) -> Dict:
        """Start Flutter preview server."""
        from preview.flutter_preview import flutter_preview_manager

        project_path = params.get("project_path")
        port = params.get("port")

        try:
            result = await flutter_preview_manager.start_server(
                project_path=project_path,
                port=port
            )

            return {
                "success": True,
                "result": result,
                "agent": self.agent_type,
                "action": "Flutter preview started"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _start_react_preview(self, params: Dict) -> Dict:
        """Start React preview server."""
        from preview.react_preview import react_preview_manager

        project_path = params.get("project_path")
        port = params.get("port")

        try:
            result = await react_preview_manager.start_server(
                project_path=project_path,
                port=port
            )

            return {
                "success": True,
                "result": result,
                "agent": self.agent_type,
                "action": "React preview started"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _stop_preview(self, params: Dict) -> Dict:
        """Stop preview server."""
        from preview.flutter_preview import flutter_preview_manager
        from preview.react_preview import react_preview_manager

        server_id = params.get("server_id")

        try:
            # Determine server type
            if server_id.startswith("flutter_"):
                result = await flutter_preview_manager.stop_server(server_id)
            elif server_id.startswith("react_"):
                result = await react_preview_manager.stop_server(server_id)
            else:
                raise ValueError(f"Unknown server type: {server_id}")

            return {
                "success": True,
                "result": result,
                "agent": self.agent_type,
                "action": "Preview stopped"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _reload_preview(self, params: Dict) -> Dict:
        """Reload preview."""
        from preview.flutter_preview import flutter_preview_manager

        server_id = params.get("server_id")

        try:
            result = await flutter_preview_manager.trigger_hot_reload(server_id)

            return {
                "success": True,
                "result": result,
                "agent": self.agent_type,
                "action": "Preview reloaded"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }

    async def _get_status(self, params: Dict) -> Dict:
        """Get preview status."""
        from preview.flutter_preview import flutter_preview_manager
        from preview.react_preview import react_preview_manager

        server_id = params.get("server_id")

        try:
            if server_id.startswith("flutter_"):
                status = flutter_preview_manager.get_server_status(server_id)
            elif server_id.startswith("react_"):
                status = react_preview_manager.get_server_status(server_id)
            else:
                raise ValueError(f"Unknown server type: {server_id}")

            return {
                "success": True,
                "result": status,
                "agent": self.agent_type,
                "action": "Status retrieved"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.agent_type
            }


# -------------------------------------------------------------
# AGENT REGISTRY
# -------------------------------------------------------------
class AgentRegistry:
    """
    Registry für alle Agents.
    """

    def __init__(self):
        self.agents: Dict[AgentType, BaseAgent] = {}
        self._register_agents()

    def _register_agents(self):
        """Register all agents."""
        self.agents[AgentType.UI] = UIAgent()
        self.agents[AgentType.CODE] = CodeAgent()
        self.agents[AgentType.PREVIEW] = PreviewAgent()
        # Build and Deploy agents registered in build_deploy_agents.py

    def get_agent(self, agent_type: AgentType) -> Optional[BaseAgent]:
        """Get agent by type."""
        return self.agents.get(agent_type)

    def get_agent_for_task(self, task_type: str) -> Optional[BaseAgent]:
        """Find agent that can handle this task type."""
        for agent in self.agents.values():
            if agent.can_handle(task_type):
                return agent
        return None


# Global Registry
agent_registry = AgentRegistry()
