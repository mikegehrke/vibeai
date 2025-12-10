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


@router.post("/build-project-live", response_model=BuildProjectResponse)
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
        
        # Nutze build_complete_app für VOLLSTÄNDIGE App mit 30-50+ Dateien
        # Importiere die Funktion direkt
        from builder.build_complete_app import build_complete_app, BuildCompleteAppRequest
        
        # Broadcast: Starte Generierung
        await broadcast_to_all({
            "event": "build.step",
            "step": "generating",
            "message": "🤖 AI generiert jetzt eine VOLLSTÄNDIGE App mit 30-50+ Dateien..."
        })
        
        # Erstelle Request für build_complete_app
        build_request = BuildCompleteAppRequest(
            app_name=request.project_name,
            platform=request.project_type,
            description=request.description,
            features=[]  # Kann später erweitert werden
        )
        
        # Rufe build_complete_app auf (gibt direkt Files zurück)
        try:
            build_result = await build_complete_app(build_request)
        except Exception as e:
            print(f"❌ build_complete_app error: {e}")
            raise Exception(f"Build failed: {str(e)}")
        
        if not build_result.get("success"):
            raise Exception(f"Build failed: {build_result.get('message', 'Unknown error')}")
        
        files = build_result.get("files", [])
        
        print(f"✅ Build complete: {len(files)} files generated")
        
        # Broadcast: Parsing abgeschlossen
        await broadcast_to_all({
            "event": "build.step",
            "step": "parsing",
            "message": f"✅ {len(files)} Dateien generiert! Sende jetzt live..."
        })
        
        # Sende jede Datei einzeln via WebSocket - LIVE Schritt für Schritt
        total_files = len(files)
        
        for idx, file in enumerate(files):
            # Broadcast: Datei wird erstellt
            await broadcast_to_all({
                "event": "file.created",
                "path": file.get("path"),
                "content": file.get("content"),
                "language": file.get("language", "text"),
                "progress": {
                    "current": idx + 1,
                    "total": total_files
                }
            })
            
            # Verzögerung für visuellen Effekt (User sieht live wie Dateien erstellt werden)
            await asyncio.sleep(0.15)  # 150ms zwischen Dateien für besseren visuellen Effekt
        
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
