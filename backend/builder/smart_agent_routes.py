# -------------------------------------------------------------
# VIBEAI – SMART AGENT ROUTES
# -------------------------------------------------------------
"""
API Routes für Smart Agent Generator mit Live-Updates
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional
import asyncio

from builder.smart_agent_generator import (
    SmartAgentGenerator,
    SmartAgentRequest,
    FileInfo
)

router = APIRouter(tags=["Smart Agent"])

# WebSocket Connections
active_connections: List[WebSocket] = []


async def broadcast_to_all(message: dict):
    """Sendet Message an alle verbundenen WebSocket Clients"""
    dead_connections = []
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except:
            dead_connections.append(connection)
    
    # Remove dead connections
    for conn in dead_connections:
        active_connections.remove(conn)


@router.websocket("/ws")
async def websocket_smart_agent(websocket: WebSocket):
    """WebSocket für Live Smart Agent Updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        await websocket.send_json({
            "event": "connected",
            "message": "✅ Smart Agent WebSocket verbunden"
        })
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Echo back
            await websocket.send_json({
                "event": "echo",
                "data": data
            })
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print("❌ Smart Agent WebSocket disconnected")


class SmartAgentGenerateRequest(BaseModel):
    project_id: str
    project_name: str
    platform: str = "flutter"
    description: str
    features: List[str] = []


@router.post("/generate", response_model=dict)
async def generate_with_smart_agent(request: SmartAgentGenerateRequest):
    """
    🤖 Generiere Projekt mit Smart Agent (LIVE, Schritt für Schritt)
    """
    
    try:
        # Broadcast: Start
        await broadcast_to_all({
            "event": "generation.started",
            "project_id": request.project_id,
            "project_name": request.project_name,
            "platform": request.platform
        })
        
        generator = SmartAgentGenerator()
        
        # Create request
        agent_request = SmartAgentRequest(
            project_id=request.project_id,
            project_name=request.project_name,
            platform=request.platform,
            description=request.description,
            features=request.features
        )
        
        # Define callbacks for live updates
        async def on_file_created(file_info: FileInfo):
            """Callback wenn Datei erstellt wird"""
            await broadcast_to_all({
                "event": "file.created",
                "path": file_info.path,
                "content": file_info.content,
                "language": file_info.language,
                "step": file_info.step
            })
        
        async def on_step(message: str, step: int):
            """Callback für jeden Schritt"""
            await broadcast_to_all({
                "event": "generation.step",
                "message": message,
                "step": step
            })
        
        async def on_error(error: str):
            """Callback bei Fehlern"""
            await broadcast_to_all({
                "event": "generation.error",
                "error": error
            })
        
        # Generate project with live updates
        result = await generator.generate_project_live(
            request=agent_request,
            on_file_created=on_file_created,
            on_step=on_step,
            on_error=on_error
        )
        
        # Broadcast: Finished
        await broadcast_to_all({
            "event": "generation.finished",
            "project_id": request.project_id,
            "total_files": result["total_files"],
            "success": True
        })
        
        return {
            "success": True,
            "files": result["files"],
            "total_files": result["total_files"],
            "message": f"✅ Projekt erfolgreich generiert mit {result['total_files']} Dateien!"
        }
        
    except Exception as e:
        # Broadcast: Error
        await broadcast_to_all({
            "event": "generation.error",
            "error": str(e),
            "project_id": request.project_id
        })
        
        return {
            "success": False,
            "error": str(e),
            "message": f"❌ Fehler: {str(e)}"
        }

