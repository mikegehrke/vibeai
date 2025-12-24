# -------------------------------------------------------------
# VIBEAI SUPER AGENT - API ROUTES
# -------------------------------------------------------------
"""
API Routes for the VibeAI Super Agent.

Provides REST and WebSocket endpoints for agent operations.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional
import asyncio

from vibeai.agent.core.super_agent import SuperAgent

router = APIRouter(prefix="/api/vibeai-agent", tags=["VibeAI Super Agent"])

# WebSocket Connections
active_connections: List[WebSocket] = []


async def broadcast_to_all(message: dict):
    """Send message to all connected WebSocket clients."""
    dead_connections = []
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except:
            dead_connections.append(connection)
    
    # Remove dead connections
    for conn in dead_connections:
        if conn in active_connections:
            active_connections.remove(conn)


class GenerateProjectRequest(BaseModel):
    """Request to generate a project."""
    project_id: str
    project_name: str
    platform: str  # flutter, react, nextjs, etc.
    description: str
    features: List[str] = []


@router.post("/generate")
async def generate_project(request: GenerateProjectRequest):
    """
    Generate project with live streaming via WebSocket.
    
    Returns immediately, events are sent via WebSocket.
    """
    # Broadcast start
    await broadcast_to_all({
        "event": "generation.started",
        "project_id": request.project_id,
        "project_name": request.project_name,
        "platform": request.platform
    })
    
    # Create agent
    async def on_event(event: dict):
        """Event handler that broadcasts to WebSocket."""
        await broadcast_to_all(event)
    
    agent = SuperAgent(request.project_id, on_event)
    
    # Start generation in background
    asyncio.create_task(_run_generation(agent, request))
    
    return {
        "success": True,
        "message": "Generation started",
        "project_id": request.project_id
    }


async def _run_generation(agent: SuperAgent, request: GenerateProjectRequest):
    """Run generation and broadcast events."""
    try:
        async for event in agent.generate_project(
            request.project_name,
            request.platform,
            request.description,
            request.features
        ):
            await broadcast_to_all(event)
        
        await broadcast_to_all({
            "event": "generation.complete",
            "project_id": request.project_id
        })
    except Exception as e:
        await broadcast_to_all({
            "event": "generation.error",
            "project_id": request.project_id,
            "error": str(e)
        })


@router.websocket("/ws")
async def websocket_agent(websocket: WebSocket):
    """WebSocket for live agent updates."""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        await websocket.send_json({
            "event": "connected",
            "message": "✅ VibeAI Super Agent WebSocket verbunden"
        })
        
        while True:
            # Keep connection alive
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)


