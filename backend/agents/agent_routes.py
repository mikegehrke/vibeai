# -------------------------------------------------------------
# VIBEAI – MULTI-AGENT API ROUTES
# -------------------------------------------------------------
"""
REST API für Multi-Agent System

Endpoints:
- POST /agents/execute - Execute single task
- POST /agents/pipeline - Execute predefined pipeline
- POST /agents/prompt - Smart routing from natural language
- GET /agents/task/{task_id} - Get task status
- GET /agents/tasks - List all tasks
- GET /agents/health - Health check

Integration:
- Orchestrator manages task routing
- Agents execute specialized tasks
- Results flow between agents
"""

from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Optional
from agents.orchestrator import orchestrator, PipelineType
from agents.multi_agent import AgentType, TaskStatus

router = APIRouter(prefix="/agents", tags=["Multi-Agent System"])


# -------------------------------------------------------------
# TASK EXECUTION
# -------------------------------------------------------------
@router.post("/execute")
async def execute_task(request: Request) -> Dict:
    """
    Execute single agent task.
    
    Request Body:
    {
        "task_type": "create_ui",
        "params": {
            "prompt": "Login screen with email and password",
            "framework": "flutter",
            "style": "material"
        },
        "agent_type": "ui_agent"  // optional, auto-detect if not provided
    }
    
    Response:
    {
        "success": true,
        "task_id": "abc-123",
        "result": {...},
        "agent": "ui_agent",
        "duration": 2.5
    }
    """
    try:
        body = await request.json()
        
        task_type = body.get("task_type")
        params = body.get("params", {})
        agent_type = body.get("agent_type")
        
        if not task_type:
            raise HTTPException(status_code=400, detail="Missing 'task_type'")
        
        # Convert agent_type string to enum
        if agent_type:
            try:
                agent_type = AgentType(agent_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid agent_type: {agent_type}")
        
        # Execute
        result = await orchestrator.execute_task(
            task_type=task_type,
            params=params,
            agent_type=agent_type
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task execution failed: {str(e)}")


# -------------------------------------------------------------
# PIPELINE EXECUTION
# -------------------------------------------------------------
@router.post("/pipeline")
async def execute_pipeline(request: Request) -> Dict:
    """
    Execute predefined pipeline.
    
    Request Body:
    {
        "pipeline_type": "preview_screen",
        "params": {
            "prompt": "Login screen",
            "framework": "flutter",
            "style": "material",
            "project_path": "/path/to/project"
        }
    }
    
    Pipeline Types:
    - create_ui: UI Agent only
    - generate_screen: UI → Code
    - preview_screen: UI → Code → Preview
    - build_app: UI → Code → Preview → Build
    - full_cycle: UI → Code → Preview → Build → Deploy
    
    Response:
    {
        "success": true,
        "pipeline_id": "xyz-789",
        "pipeline_type": "preview_screen",
        "results": [
            {
                "success": true,
                "task_id": "task-1",
                "result": {...},
                "agent": "ui_agent"
            },
            {
                "success": true,
                "task_id": "task-2",
                "result": {...},
                "agent": "code_agent"
            },
            {
                "success": true,
                "task_id": "task-3",
                "result": {...},
                "agent": "preview_agent"
            }
        ],
        "duration": 8.5
    }
    """
    try:
        body = await request.json()
        
        pipeline_type = body.get("pipeline_type")
        params = body.get("params", {})
        
        if not pipeline_type:
            raise HTTPException(status_code=400, detail="Missing 'pipeline_type'")
        
        # Convert to enum
        try:
            pipeline_type = PipelineType(pipeline_type)
        except ValueError:
            valid_types = [pt.value for pt in PipelineType]
            raise HTTPException(
                status_code=400,
                detail=f"Invalid pipeline_type. Valid types: {valid_types}"
            )
        
        # Execute pipeline
        result = await orchestrator.execute_pipeline(
            pipeline_type=pipeline_type,
            params=params
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")


# -------------------------------------------------------------
# SMART ROUTING
# -------------------------------------------------------------
@router.post("/prompt")
async def route_prompt(request: Request) -> Dict:
    """
    Smart routing from natural language prompt.
    
    Request Body:
    {
        "prompt": "Create a login screen with email and password, then preview it in Flutter",
        "context": {
            "framework": "flutter",
            "style": "material",
            "project_path": "/path/to/project"
        }
    }
    
    Examples:
    - "Create login screen" → CREATE_UI pipeline
    - "Generate React code for profile page" → GENERATE_SCREEN pipeline
    - "Build Flutter app and preview" → PREVIEW_SCREEN pipeline
    - "Build APK for e-commerce app" → BUILD_APP pipeline
    
    Response:
    {
        "success": true,
        "pipeline_id": "xyz-789",
        "pipeline_type": "preview_screen",
        "results": [...],
        "duration": 8.5
    }
    """
    try:
        body = await request.json()
        
        prompt = body.get("prompt")
        context = body.get("context", {})
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Missing 'prompt'")
        
        # Route and execute
        result = await orchestrator.route_prompt(
            prompt=prompt,
            context=context
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prompt routing failed: {str(e)}")


# -------------------------------------------------------------
# STATUS & MONITORING
# -------------------------------------------------------------
@router.get("/task/{task_id}")
async def get_task_status(task_id: str) -> Dict:
    """
    Get task status.
    
    Response:
    {
        "task_id": "abc-123",
        "task_type": "create_ui",
        "status": "completed",
        "result": {...},
        "agent_type": "ui_agent",
        "created_at": "2024-12-02T10:30:00",
        "completed_at": "2024-12-02T10:30:02"
    }
    """
    task = orchestrator.get_task_status(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail=f"Task not found: {task_id}")
    
    return task


@router.get("/tasks")
async def list_tasks(status: Optional[str] = None) -> Dict:
    """
    List all tasks (optionally filtered by status).
    
    Query Params:
    - status: pending | in_progress | completed | failed
    
    Response:
    {
        "tasks": [
            {
                "task_id": "abc-123",
                "task_type": "create_ui",
                "status": "completed",
                ...
            },
            ...
        ],
        "count": 42
    }
    """
    # Convert status string to enum
    task_status = None
    if status:
        try:
            task_status = TaskStatus(status)
        except ValueError:
            valid_statuses = [s.value for s in TaskStatus]
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Valid statuses: {valid_statuses}"
            )
    
    tasks = orchestrator.list_tasks(status=task_status)
    
    return {
        "tasks": tasks,
        "count": len(tasks)
    }


# -------------------------------------------------------------
# EXAMPLES
# -------------------------------------------------------------
@router.get("/examples")
async def get_examples() -> Dict:
    """
    Get example requests for different use cases.
    
    Response:
    {
        "examples": [
            {
                "name": "Create UI",
                "endpoint": "/agents/execute",
                "body": {...}
            },
            ...
        ]
    }
    """
    return {
        "examples": [
            {
                "name": "Create UI from prompt",
                "endpoint": "/agents/execute",
                "method": "POST",
                "body": {
                    "task_type": "create_ui",
                    "params": {
                        "prompt": "Login screen with email and password",
                        "framework": "flutter",
                        "style": "material"
                    }
                }
            },
            {
                "name": "Generate Flutter code",
                "endpoint": "/agents/execute",
                "method": "POST",
                "body": {
                    "task_type": "generate_flutter",
                    "params": {
                        "screen": {
                            "name": "LoginScreen",
                            "components": []
                        }
                    },
                    "agent_type": "code_agent"
                }
            },
            {
                "name": "Preview screen pipeline",
                "endpoint": "/agents/pipeline",
                "method": "POST",
                "body": {
                    "pipeline_type": "preview_screen",
                    "params": {
                        "prompt": "Profile page with avatar and bio",
                        "framework": "react",
                        "project_path": "/path/to/project"
                    }
                }
            },
            {
                "name": "Smart prompt routing",
                "endpoint": "/agents/prompt",
                "method": "POST",
                "body": {
                    "prompt": "Create a Flutter login screen and preview it",
                    "context": {
                        "project_path": "/path/to/project"
                    }
                }
            }
        ]
    }


# -------------------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------------------
@router.get("/health")
async def agents_health_check() -> Dict:
    """
    Health check for multi-agent system.
    
    Response:
    {
        "status": "healthy",
        "agents": {
            "ui_agent": "available",
            "code_agent": "available",
            "preview_agent": "available"
        },
        "total_tasks": 42,
        "active_tasks": 3
    }
    """
    from agents.multi_agent import agent_registry
    
    # Check agent availability
    agents_status = {}
    for agent_type in AgentType:
        if agent_type == AgentType.ORCHESTRATOR:
            continue
        agent = agent_registry.get_agent(agent_type)
        agents_status[agent_type.value] = "available" if agent else "unavailable"
    
    # Count tasks
    all_tasks = orchestrator.list_tasks()
    active_tasks = orchestrator.list_tasks(status=TaskStatus.IN_PROGRESS)
    
    return {
        "status": "healthy",
        "agents": agents_status,
        "total_tasks": len(all_tasks),
        "active_tasks": len(active_tasks)
    }
