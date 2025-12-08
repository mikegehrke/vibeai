"""
LIVE PROJECT BUILDER ROUTE
Nutzt den MASTER COORDINATOR mit ALLEN Agents
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, Dict, List
import asyncio

# Import MASTER COORDINATOR (nutzt ALLE Agents!)
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from ai.master_coordinator import master_coordinator

router = APIRouter()


class BuildProjectRequest(BaseModel):
    project_name: str
    project_type: str  # flutter, nextjs, react-native
    description: str
    model: str = "gpt-4o"


class BuildProjectResponse(BaseModel):
    success: bool
    project_id: str
    files: List[Dict]
    total_files: int
    message: str


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


@router.websocket("/ws/builder")
async def websocket_builder(websocket: WebSocket):
    """
    WebSocket für Live Build Updates
    Frontend verbindet sich hier für Echtzeit-Updates
    """
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        await websocket.send_json({
            "event": "connected",
            "message": "✅ WebSocket verbunden - Bereit für Live-Updates"
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
        print("❌ WebSocket Client disconnected")


@router.post("/api/build-project-live", response_model=BuildProjectResponse)
async def build_project_live(request: BuildProjectRequest):
    """
    🔥 LIVE PROJECT BUILDER
    
    Nutzt die VORHANDENE builder_pipeline.py
    Sendet Live-Updates via WebSocket an alle Clients
    
    Steps:
    1. Projektstruktur generieren
    2. Config-Dateien erstellen  
    3. Für jede Datei:
       - Code generieren
       - Via WebSocket senden (file.created)
       - Im Response sammeln
    4. Projekt fertig!
    """
    
    project_id = f"{request.project_name}_{request.project_type}"
    
    try:
        # Broadcast: Start
        await broadcast_to_all({
            "event": "build.started",
            "project_id": project_id,
            "project_name": request.project_name,
            "project_type": request.project_type
        })
        
        # Nutze den MASTER COORDINATOR mit ALLEN Agents!
        result = await master_coordinator.build_complete_project(
            project_name=request.project_name,
            project_type=request.project_type,
            description=request.description,
            user_id="default_user",
            include_tests=True,
            websocket_callback=broadcast_to_all
        )
        
        files = result.get("files", []) + result.get("tests", [])
        
        # Sende jede Datei einzeln via WebSocket
        for idx, file in enumerate(files):
            await broadcast_to_all({
                "event": "file.created",
                "path": file.get("path"),
                "content": file.get("content"),
                "progress": {
                    "current": idx + 1,
                    "total": len(files)
                }
            })
            
            # Kleine Verzögerung damit Frontend es sieht
            await asyncio.sleep(0.1)
        
        # Broadcast: Finished
        await broadcast_to_all({
            "event": "build.finished",
            "project_id": project_id,
            "total_files": len(files),
            "success": True
        })
        
        return BuildProjectResponse(
            success=True,
            project_id=project_id,
            files=files,
            total_files=len(files),
            message=f"✅ {len(files)} Dateien erfolgreich generiert!"
        )
        
    except Exception as e:
        # Broadcast: Error
        await broadcast_to_all({
            "event": "build.error",
            "error": str(e),
            "project_id": project_id
        })
        
        return BuildProjectResponse(
            success=False,
            project_id=project_id,
            files=[],
            total_files=0,
            message=f"❌ Build Fehler: {str(e)}"
        )


@router.get("/api/builder-status")
async def get_builder_status():
    """Status des Live Builders"""
    return {
        "status": "running",
        "active_connections": len(active_connections),
        "pipeline_available": True,
        "websocket_url": "ws://localhost:8000/api/builder/ws/builder"
    }
