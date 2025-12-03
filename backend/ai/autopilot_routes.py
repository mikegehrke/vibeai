# -------------------------------------------------------------
# VIBEAI – AUTOPILOT, MEMORY & OPTIMIZER API ROUTES
# -------------------------------------------------------------
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
# from auth import get_current_user_v2  # Requires User model from models.py
from ai.autopilot.autopilot_engine import autopilot_engine
from ai.memory.project_memory import project_memory
from ai.optimizer.project_optimizer import project_optimizer
# from ai.team.team_engine import team_engine  # Temporarily disabled

router = APIRouter(
    prefix="/autopilot",
    tags=["Autopilot & Memory & Optimizer"]
)


# ============================================================
# PYDANTIC MODELS
# ============================================================

class BuildFeatureRequest(BaseModel):
    project_id: str
    task: str
    auto_deploy: bool = False


class OptimizeProjectRequest(BaseModel):
    project_id: str


class MemorySetRequest(BaseModel):
    project_id: str
    key: str
    value: Any
    category: str = "preferences"


class MemoryGetRequest(BaseModel):
    project_id: str
    key: str
    category: str = "preferences"


class AnalyzeProjectRequest(BaseModel):
    project_id: str
    analysis_type: str = "full"  # full, code, structure, performance


class TeamCollaborationRequest(BaseModel):
    task: str
    team_members: Optional[List[str]] = None
    parallel: bool = True


class RefactoringSuggestionRequest(BaseModel):
    project_id: str


class FindDeadCodeRequest(BaseModel):
    project_id: str


# ============================================================
# BLOCK 41 – AUTOPILOT ENDPOINTS
# ============================================================

@router.post("/build-feature")
async def build_feature(
    request: BuildFeatureRequest,
    user=Depends(get_current_user_v2)
):
    """
    Multi-Agent Autopilot builds complete feature.
    
    Team:
    - Lead Developer (Architecture)
    - Code Reviewer (Quality)
    - UI/UX Designer (Design)
    - Tester (Tests)
    - Error Fixer (AutoFix)
    
    Example:
        POST /autopilot/build-feature
        {
            "project_id": "my-app",
            "task": "Add user authentication with email/password",
            "auto_deploy": false
        }
    """
    try:
        result = await autopilot_engine.build_feature(
            user_id=user.id,
            project_id=request.project_id,
            task=request.task,
            auto_deploy=request.auto_deploy
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Autopilot failed: {str(e)}")


@router.post("/optimize-project")
async def optimize_project(
    request: OptimizeProjectRequest,
    user=Depends(get_current_user_v2)
):
    """
    Autopilot optimizes entire project.
    
    Team: Performance Optimizer + Code Reviewer
    
    Example:
        POST /autopilot/optimize-project
        {
            "project_id": "my-app"
        }
    """
    try:
        result = await autopilot_engine.optimize_project(
            user_id=user.id,
            project_id=request.project_id
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Optimization failed: {str(e)}")


# ============================================================
# BLOCK 41 – TEAM COLLABORATION ENDPOINTS
# ============================================================

@router.post("/team/collaborate")
async def team_collaborate(
    request: TeamCollaborationRequest,
    user=Depends(get_current_user_v2)
):
    """
    Multi-Agent team collaboration.
    
    Example:
        POST /autopilot/team/collaborate
        {
            "task": "Design REST API for user management",
            "team_members": ["lead_developer", "db_architect", "code_reviewer"],
            "parallel": true
        }
    """
    try:
        result = await team_engine.collaborate(
            task=request.task,
            team_members=request.team_members,
            parallel=request.parallel
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Team collaboration failed: {str(e)}")


@router.get("/team/info")
async def team_info(user=Depends(get_current_user_v2)):
    """
    Get team information (available roles, default team).
    
    Example:
        GET /autopilot/team/info
    """
    return team_engine.get_team_info()


@router.post("/team/review-code")
async def team_review_code(
    code: str,
    language: str = "python",
    user=Depends(get_current_user_v2)
):
    """
    Team code review (Lead + Reviewer + Tester).
    
    Example:
        POST /autopilot/team/review-code?language=python
        Body: "def foo():\n  pass"
    """
    try:
        result = await team_engine.review_code(
            code=code,
            language=language
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Code review failed: {str(e)}")


@router.post("/team/design-feature")
async def team_design_feature(
    feature_description: str,
    user=Depends(get_current_user_v2)
):
    """
    Team feature design (Lead + Designer + DB Architect).
    
    Example:
        POST /autopilot/team/design-feature
        Body: "Build chat system with real-time messages"
    """
    try:
        result = await team_engine.design_feature(
            feature_description=feature_description
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Feature design failed: {str(e)}")


# ============================================================
# BLOCK 42 – MEMORY ENDPOINTS
# ============================================================

@router.post("/memory/remember")
async def memory_remember(
    request: MemorySetRequest,
    user=Depends(get_current_user_v2)
):
    """
    Remember something about the project.
    
    Example:
        POST /autopilot/memory/remember
        {
            "project_id": "my-app",
            "key": "state_management",
            "value": "riverpod",
            "category": "preferences"
        }
    """
    try:
        project_memory.remember(
            project_id=request.project_id,
            key=request.key,
            value=request.value,
            category=request.category
        )
        
        return {
            "success": True,
            "project_id": request.project_id,
            "key": request.key,
            "category": request.category
        }
    
    except Exception as e:
        raise HTTPException(500, f"Memory save failed: {str(e)}")


@router.post("/memory/recall")
async def memory_recall(
    request: MemoryGetRequest,
    user=Depends(get_current_user_v2)
):
    """
    Recall something about the project.
    
    Example:
        POST /autopilot/memory/recall
        {
            "project_id": "my-app",
            "key": "state_management",
            "category": "preferences"
        }
    """
    try:
        value = project_memory.recall(
            project_id=request.project_id,
            key=request.key,
            category=request.category
        )
        
        return {
            "success": True,
            "project_id": request.project_id,
            "key": request.key,
            "value": value
        }
    
    except Exception as e:
        raise HTTPException(500, f"Memory recall failed: {str(e)}")


@router.get("/memory/all/{project_id}")
async def memory_get_all(
    project_id: str,
    user=Depends(get_current_user_v2)
):
    """
    Get all memories for a project.
    
    Example:
        GET /autopilot/memory/all/my-app
    """
    try:
        memories = project_memory.get_all_memories(project_id)
        
        return {
            "success": True,
            "project_id": project_id,
            "memories": memories
        }
    
    except Exception as e:
        raise HTTPException(500, f"Get memories failed: {str(e)}")


@router.get("/memory/context/{project_id}")
async def memory_get_context(
    project_id: str,
    user=Depends(get_current_user_v2)
):
    """
    Get formatted memory context for AI prompts.
    
    Example:
        GET /autopilot/memory/context/my-app
    """
    try:
        context = project_memory.get_context_for_ai(project_id)
        
        return {
            "success": True,
            "project_id": project_id,
            "context": context
        }
    
    except Exception as e:
        raise HTTPException(500, f"Get context failed: {str(e)}")


@router.delete("/memory/{project_id}")
async def memory_clear(
    project_id: str,
    user=Depends(get_current_user_v2)
):
    """
    Clear all memories for a project.
    
    Example:
        DELETE /autopilot/memory/my-app
    """
    try:
        project_memory.clear_project_memory(project_id)
        
        return {
            "success": True,
            "project_id": project_id,
            "message": "Memory cleared"
        }
    
    except Exception as e:
        raise HTTPException(500, f"Clear memory failed: {str(e)}")


# ============================================================
# BLOCK 43 – OPTIMIZER ENDPOINTS
# ============================================================

@router.post("/optimizer/analyze")
async def optimizer_analyze(
    request: AnalyzeProjectRequest,
    user=Depends(get_current_user_v2)
):
    """
    Analyze project for optimization opportunities.
    
    Analysis Types:
    - "full" (complete analysis)
    - "code" (code quality only)
    - "structure" (architecture only)
    - "performance" (performance only)
    
    Example:
        POST /autopilot/optimizer/analyze
        {
            "project_id": "my-app",
            "analysis_type": "full"
        }
    """
    try:
        result = await project_optimizer.analyze(
            user_id=user.id,
            project_id=request.project_id,
            analysis_type=request.analysis_type
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@router.post("/optimizer/refactoring")
async def optimizer_suggest_refactoring(
    request: RefactoringSuggestionRequest,
    user=Depends(get_current_user_v2)
):
    """
    Suggest complete project refactoring.
    
    Example:
        POST /autopilot/optimizer/refactoring
        {
            "project_id": "my-app"
        }
    """
    try:
        result = await project_optimizer.suggest_refactoring(
            user_id=user.id,
            project_id=request.project_id
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Refactoring suggestion failed: {str(e)}")


@router.post("/optimizer/dead-code")
async def optimizer_find_dead_code(
    request: FindDeadCodeRequest,
    user=Depends(get_current_user_v2)
):
    """
    Find unused code in project.
    
    Example:
        POST /autopilot/optimizer/dead-code
        {
            "project_id": "my-app"
        }
    """
    try:
        result = await project_optimizer.find_dead_code(
            user_id=user.id,
            project_id=request.project_id
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Dead code detection failed: {str(e)}")


@router.post("/optimizer/performance")
async def optimizer_performance(
    request: AnalyzeProjectRequest,
    user=Depends(get_current_user_v2)
):
    """
    Find performance bottlenecks.
    
    Example:
        POST /autopilot/optimizer/performance
        {
            "project_id": "my-app"
        }
    """
    try:
        result = await project_optimizer.optimize_performance(
            user_id=user.id,
            project_id=request.project_id
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(500, f"Performance optimization failed: {str(e)}")


# ============================================================
# SYSTEM STATS
# ============================================================

@router.get("/stats")
async def autopilot_stats(user=Depends(get_current_user_v2)):
    """
    Get autopilot system statistics.
    
    Example:
        GET /autopilot/stats
    """
    try:
        team_info = team_engine.get_team_info()
        all_projects = project_memory.list_all_projects()
        
        return {
            "team": {
                "available_agents": len(team_info["available_roles"]),
                "default_team_size": len(team_info["default_team"]),
                "roles": team_info["available_roles"]
            },
            "memory": {
                "projects_with_memory": len(all_projects),
                "total_projects": len(all_projects)
            },
            "optimizer": {
                "analysis_types": ["full", "code", "structure", "performance"],
                "available": True
            }
        }
    
    except Exception as e:
        raise HTTPException(500, f"Stats failed: {str(e)}")
