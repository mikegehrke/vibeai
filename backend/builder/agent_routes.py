"""
Backend-Routen für Agent-Integration
Verbindet LiveAgentChat mit V2, V3, V6 Agents
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import asyncio
from .agent_coordinator import agent_coordinator

router = APIRouter()


class AgentRequest(BaseModel):
    """Request für Agent-Operationen"""
    action: str  # analyze, fix, generate
    code: Optional[str] = None
    language: Optional[str] = None
    prompt: Optional[str] = None
    framework: Optional[str] = None
    project_id: Optional[str] = None


class AgentResponse(BaseModel):
    """Response von Agent"""
    success: bool
    data: Optional[Dict] = None
    error: Optional[str] = None
    agent_used: Optional[str] = None


@router.post("/agent/analyze", response_model=AgentResponse)
async def analyze_code(request: AgentRequest):
    """
    Analysiert Code mit Auto-Fix Agents
    Findet Fehler, gibt Vorschläge
    """
    try:
        if not request.code:
            raise HTTPException(status_code=400, detail="Code required")
        
        # Rufe Agent Coordinator auf
        result = await agent_coordinator.analyze_code(
            code=request.code,
            language=request.language or 'python'
        )
        
        return AgentResponse(
            success=True,
            data=result,
            agent_used='autofix_v3'
        )
        
    except Exception as e:
        return AgentResponse(
            success=False,
            error=str(e)
        )


@router.post("/agent/fix", response_model=AgentResponse)
async def fix_code(request: AgentRequest):
    """
    Behebt Code-Fehler mit Auto-Fix Agents
    """
    try:
        if not request.code:
            raise HTTPException(status_code=400, detail="Code required")
        
        # Analysiere zuerst
        analysis = await agent_coordinator.analyze_code(
            code=request.code,
            language=request.language or 'python'
        )
        
        # Fixe gefundene Issues
        fixed_code = await agent_coordinator.fix_code(
            code=request.code,
            language=request.language or 'python',
            issues=analysis.get('issues', [])
        )
        
        return AgentResponse(
            success=True,
            data={
                'original_code': request.code,
                'fixed_code': fixed_code,
                'issues_found': len(analysis.get('issues', [])),
                'issues': analysis.get('issues', [])
            },
            agent_used='autofix_v3'
        )
        
    except Exception as e:
        return AgentResponse(
            success=False,
            error=str(e)
        )


@router.post("/agent/generate", response_model=AgentResponse)
async def generate_code(request: AgentRequest):
    """
    Generiert Code mit Swarm Agent V6
    """
    try:
        if not request.prompt:
            raise HTTPException(status_code=400, detail="Prompt required")
        
        result = await agent_coordinator.generate_code(
            prompt=request.prompt,
            framework=request.framework or 'flutter',
            existing_code=request.code
        )
        
        if result.get('success'):
            return AgentResponse(
                success=True,
                data=result,
                agent_used='swarm_v6'
            )
        else:
            return AgentResponse(
                success=False,
                error=result.get('error', 'Code generation failed')
            )
        
    except Exception as e:
        return AgentResponse(
            success=False,
            error=str(e)
        )


@router.get("/agent/status")
async def get_agent_status():
    """
    Gibt Status aller verfügbaren Agents zurück
    """
    try:
        status = agent_coordinator.get_agent_status()
        
        return {
            'success': True,
            'agents': status,
            'total_agents': len(status),
            'available_agents': sum(1 for a in status.values() if a['available'])
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
