# -------------------------------------------------------------
# VIBEAI – ORCHESTRATOR - Multi-Agent Task Manager
# -------------------------------------------------------------
"""
Orchestrator für Multi-Agent System

Managed:
- Task Routing zwischen Agents
- Pipeline Execution (UI → Code → Preview → Build)
- State Management
- Error Handling
- Result Aggregation

Example Pipelines:
1. Simple: "Create login screen" → UI Agent → Code Agent
2. Full: "Build app" → UI → Code → Preview → Build → Deploy
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from agents.multi_agent import AgentType, TaskStatus, agent_registry


# -------------------------------------------------------------
# PIPELINE TYPES
# -------------------------------------------------------------
class PipelineType(str, Enum):
    """Vordefinierte Pipelines."""

    # UI Only
    CREATE_UI = "create_ui"

    # UI + Code
    GENERATE_SCREEN = "generate_screen"

    # UI + Code + Preview
    PREVIEW_SCREEN = "preview_screen"

    # UI + Code + Preview + Build
    BUILD_APP = "build_app"

    # Complete: UI + Code + Preview + Build + Deploy
    FULL_CYCLE = "full_cycle"


# -------------------------------------------------------------
# TASK MANAGER
# -------------------------------------------------------------
class Task:
    """
    Task representation.
    """

    def __init__(self, task_id: str, task_type: str, params: Dict, agent_type: AgentType):
        self.task_id = task_id
        self.task_type = task_type
        self.params = params
        self.agent_type = agent_type
        self.status = TaskStatus.PENDING
        self.result: Optional[Dict] = None
        self.error: Optional[str] = None
        self.created_at = datetime.now()
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None

    def to_dict(self) -> Dict:
        """Convert to dict."""
        return {
            "task_id": self.task_id,
            "task_type": self.task_type,
            "params": self.params,
            "agent_type": self.agent_type,
            "status": self.status,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": (self.completed_at.isoformat() if self.completed_at else None),
        }


# -------------------------------------------------------------
# ORCHESTRATOR
# -------------------------------------------------------------
class Orchestrator:
    """
    Orchestrator für Multi-Agent System.

    Koordiniert Tasks zwischen verschiedenen Agents.
    """

    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.pipelines: Dict[str, List[Task]] = {}

    # ---------------------------------------------------------
    # SINGLE TASK EXECUTION
    # ---------------------------------------------------------
    async def execute_task(self, task_type: str, params: Dict, agent_type: Optional[AgentType] = None) -> Dict:
        """
        Execute single task.

        Args:
            task_type: Type of task (e.g., "create_ui")
            params: Task parameters
            agent_type: Optional specific agent (auto-detect if None)

        Returns:
            {
                "success": True,
                "task_id": "123",
                "result": {...},
                "agent": "ui_agent"
            }
        """
        # Create task
        task_id = str(uuid.uuid4())

        # Auto-detect agent if not specified
        if agent_type is None:
            agent = agent_registry.get_agent_for_task(task_type)
            if not agent:
                return {
                    "success": False,
                    "error": f"No agent found for task type: {task_type}",
                }
            agent_type = agent.agent_type
        else:
            agent = agent_registry.get_agent(agent_type)
            if not agent:
                return {"success": False, "error": f"Agent not found: {agent_type}"}

        # Create task object
        task = Task(task_id=task_id, task_type=task_type, params=params, agent_type=agent_type)

        self.tasks[task_id] = task

        # Execute
        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.now()

        try:
            # Execute via agent
            agent_result = await agent.execute({"task_id": task_id, "type": task_type, "params": params})

            if agent_result.get("success"):
                task.status = TaskStatus.COMPLETED
                task.result = agent_result.get("result")
            else:
                task.status = TaskStatus.FAILED
                task.error = agent_result.get("error")

            task.completed_at = datetime.now()

            return {
                "success": agent_result.get("success"),
                "task_id": task_id,
                "result": task.result,
                "error": task.error,
                "agent": agent_type,
                "duration": (task.completed_at - task.started_at).total_seconds(),
            }

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.completed_at = datetime.now()

            return {
                "success": False,
                "task_id": task_id,
                "error": str(e),
                "agent": agent_type,
            }

    # ---------------------------------------------------------
    # PIPELINE EXECUTION
    # ---------------------------------------------------------
    async def execute_pipeline(self, pipeline_type: PipelineType, params: Dict) -> Dict:
        """
        Execute predefined pipeline.

        Args:
            pipeline_type: Pipeline to execute
            params: Initial parameters

        Returns:
            {
                "success": True,
                "pipeline_id": "abc",
                "results": [...],
                "duration": 5.2
            }
        """
        pipeline_id = str(uuid.uuid4())
        start_time = datetime.now()

        # Define pipeline steps
        if pipeline_type == PipelineType.CREATE_UI:
            steps = [{"agent": AgentType.UI, "task": "create_ui", "params": params}]

        elif pipeline_type == PipelineType.GENERATE_SCREEN:
            steps = [
                {"agent": AgentType.UI, "task": "create_ui", "params": params},
                {
                    "agent": AgentType.CODE,
                    "task": f"generate_{params.get('framework', 'flutter')}",
                    "params": None,
                },
            ]

        elif pipeline_type == PipelineType.PREVIEW_SCREEN:
            steps = [
                {"agent": AgentType.UI, "task": "create_ui", "params": params},
                {
                    "agent": AgentType.CODE,
                    "task": f"generate_{params.get('framework', 'flutter')}",
                    "params": None,
                },
                {
                    "agent": AgentType.PREVIEW,
                    "task": f"start_{params.get('framework', 'flutter')}_preview",
                    "params": None,
                },
            ]

        elif pipeline_type == PipelineType.BUILD_APP:
            steps = [
                {"agent": AgentType.UI, "task": "create_ui", "params": params},
                {"agent": AgentType.CODE, "task": "generate_app", "params": None},
                {
                    "agent": AgentType.PREVIEW,
                    "task": f"start_{params.get('framework', 'flutter')}_preview",
                    "params": None,
                },
                {
                    "agent": AgentType.BUILD,
                    "task": f"build_{params.get('framework', 'flutter')}_apk",
                    "params": None,
                },
            ]

        elif pipeline_type == PipelineType.FULL_CYCLE:
            steps = [
                {"agent": AgentType.UI, "task": "create_ui", "params": params},
                {"agent": AgentType.CODE, "task": "generate_app", "params": None},
                {
                    "agent": AgentType.PREVIEW,
                    "task": f"start_{params.get('framework', 'flutter')}_preview",
                    "params": None,
                },
                {
                    "agent": AgentType.BUILD,
                    "task": f"build_{params.get('framework', 'flutter')}_apk",
                    "params": None,
                },
                {
                    "agent": AgentType.DEPLOY,
                    "task": "generate_download_link",
                    "params": None,
                },
            ]

        else:
            return {
                "success": False,
                "error": f"Unknown pipeline type: {pipeline_type}",
            }

        # Execute steps sequentially
        results = []
        previous_result = None

        for step in steps:
            # Use params from step or previous result
            step_params = step["params"]
            if step_params is None and previous_result:
                # Pass previous result as params
                step_params = (
                    {"screen": previous_result.get("screen")} if "screen" in previous_result else previous_result
                )

            # Execute step
            result = await self.execute_task(task_type=step["task"], params=step_params, agent_type=step["agent"])

            results.append(result)

            # Stop on failure
            if not result.get("success"):
                return {
                    "success": False,
                    "pipeline_id": pipeline_id,
                    "pipeline_type": pipeline_type,
                    "results": results,
                    "error": f"Pipeline failed at step {len(results)}: {result.get('error')}",
                    "duration": (datetime.now() - start_time).total_seconds(),
                }

            # Store result for next step
            previous_result = result.get("result")

        # Pipeline complete
        return {
            "success": True,
            "pipeline_id": pipeline_id,
            "pipeline_type": pipeline_type,
            "results": results,
            "duration": (datetime.now() - start_time).total_seconds(),
        }

    # ---------------------------------------------------------
    # SMART ROUTING
    # ---------------------------------------------------------
    async def route_prompt(self, prompt: str, context: Optional[Dict] = None) -> Dict:
        """
        Smart routing based on natural language prompt.

        Analyzes prompt and determines:
        - Which pipeline to use
        - Which agents to invoke
        - What parameters to extract

        Args:
            prompt: Natural language prompt
            context: Optional context (framework, style, etc.)

        Returns:
            Pipeline execution result
        """
        # Simple keyword-based routing (can be enhanced with AI)
        prompt_lower = prompt.lower()

        # Determine framework
        if "flutter" in prompt_lower:
            framework = "flutter"
        elif "react" in prompt_lower:
            framework = "react"
        else:
            framework = context.get("framework", "flutter") if context else "flutter"

        # Determine pipeline type
        if "build" in prompt_lower and "apk" in prompt_lower:
            pipeline_type = PipelineType.BUILD_APP
        elif "preview" in prompt_lower or "show" in prompt_lower:
            pipeline_type = PipelineType.PREVIEW_SCREEN
        elif "code" in prompt_lower or "generate" in prompt_lower:
            pipeline_type = PipelineType.GENERATE_SCREEN
        else:
            pipeline_type = PipelineType.CREATE_UI

        # Extract params
        params = {
            "prompt": prompt,
            "framework": framework,
            "style": context.get("style", "material") if context else "material",
        }

        # Execute pipeline
        return await self.execute_pipeline(pipeline_type, params)

    # ---------------------------------------------------------
    # STATUS & MONITORING
    # ---------------------------------------------------------
    def get_task_status(self, task_id: str) -> Optional[Dict]:
        """Get task status."""
        task = self.tasks.get(task_id)
        if task:
            return task.to_dict()
        return None

    def list_tasks(self, status: Optional[TaskStatus] = None) -> List[Dict]:
        """List all tasks (optionally filtered by status)."""
        tasks = []
        for task in self.tasks.values():
            if status is None or task.status == status:
                tasks.append(task.to_dict())
        return tasks


# Global Orchestrator
orchestrator = Orchestrator()
