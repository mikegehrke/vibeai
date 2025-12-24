# -------------------------------------------------------------
# VIBEAI – TEAM AGENT ROUTES
# -------------------------------------------------------------
"""
API Routes für Team Agent Generator mit Live-Updates
Team Agent: Mehrere spezialisierte Agenten arbeiten parallel
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional
import asyncio

from builder.team_agent_generator import (
    TeamAgentGenerator,
    TeamAgentRequest,
    FileInfo
)

router = APIRouter(tags=["Team Agent"])

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
async def websocket_team_agent(websocket: WebSocket):
    """WebSocket für Live Team Agent Updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        await websocket.send_json({
            "event": "connected",
            "message": "✅ Team Agent WebSocket verbunden"
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
        print("❌ Team Agent WebSocket disconnected")


class TeamAgentGenerateRequest(BaseModel):
    project_id: str
    project_name: str
    platform: str = "flutter"
    description: str
    features: List[str] = []


@router.post("/generate", response_model=dict)
async def generate_with_team_agent(request: TeamAgentGenerateRequest):
    """
    🤖 Generiere Projekt mit Team Agent (MEHRERE AGENTEN PARALLEL)
    
    SOFORTIGE ANTWORT - Arbeit läuft im Hintergrund!
    """
    
    # SOFORTIGE ANTWORT (unter 1 Sekunde!)
    await broadcast_to_all({
        "event": "generation.started",
        "project_id": request.project_id,
        "project_name": request.project_name,
        "platform": request.platform,
        "agent_type": "team"
    })
    
    # SOFORTIGE BESTÄTIGUNG
    immediate_response = {
        "success": True,
        "message": "✅ Team Agent gestartet! Mehrere Agenten arbeiten parallel...",
        "project_id": request.project_id,
        "status": "working",
        "agent_type": "team"
    }
    
    # ⚡ Starte Generation im Hintergrund (NICHT warten!)
    asyncio.create_task(_run_team_generation_async(request))
    
    # SOFORT zurückgeben (<100ms)
    return immediate_response


async def _run_team_generation_async(request: TeamAgentGenerateRequest):
    """Führe Team Generation im Hintergrund aus - MEHRERE AGENTEN PARALLEL"""
    try:
        print(f"👥 Team Agent Request: project_id={request.project_id}, platform={request.platform}")
        
        # Prüfe OpenAI API Key
        import os
        if not os.getenv("OPENAI_API_KEY"):
            error_msg = "OPENAI_API_KEY nicht gesetzt! Team Agent kann nicht arbeiten."
            print(f"❌ {error_msg}")
            await broadcast_to_all({
                "event": "generation.error",
                "error": error_msg,
                "project_id": request.project_id,
                "details": "Bitte setze OPENAI_API_KEY in der .env Datei"
            })
            return
        
        print(f"✅ Creating TeamAgentGenerator...")
        generator = TeamAgentGenerator(api_base_url="http://localhost:8005")
        print(f"✅ TeamAgentGenerator created")
        
        # Create request
        agent_request = TeamAgentRequest(
            project_id=request.project_id,
            project_name=request.project_name,
            platform=request.platform,
            description=request.description,
            features=request.features
        )
        
        # Define callbacks for live updates (SAME as Smart Agent for consistency)
        async def on_file_created(file_info: FileInfo):
            """Callback wenn Datei erstellt wird - ZEILE FÜR ZEILE LIVE GENERIERUNG!"""
            print(f"📝 Broadcasting file.created: {file_info.path} (Agent: {file_info.agent})")
            
            content = file_info.content
            lines = content.split('\n')
            
            # ⚡ SCHRITT 1: Datei ankündigen - "Ich erstelle jetzt: lib/main.dart"
            await broadcast_to_all({
                "event": "file.announced",
                "path": file_info.path,
                "language": file_info.language,
                "step": file_info.step,
                "agent": file_info.agent,
                "message": f"👥 **{file_info.agent}** erstellt: `{file_info.path}`"
            })
            await asyncio.sleep(0.8)  # ⚡ LANGSAMER: Mehr Zeit damit User es sieht
            
            # ⚡ SCHRITT 2: Code ZEILE FÜR ZEILE schreiben (LIVE!) - SAME as Smart Agent
            current_content = ""
            
            for line_num, line in enumerate(lines, 1):
                # Füge Zeile hinzu
                current_content += line + '\n'
                
                # Sende Update für diese Zeile (für Editor)
                await broadcast_to_all({
                    "event": "code_written",
                    "path": file_info.path,
                    "content": current_content.rstrip('\n'),
                    "line": line_num,
                    "total_lines": len(lines),
                    "line_content": line,
                    "language": file_info.language,
                    "agent": file_info.agent,
                    "progress": (line_num / len(lines)) * 100
                })
                
                # ⚡ LANGSAMER & MENSCHLICHER: Wie ein echter Entwickler tippt
                line_length = len(line.strip())
                if line_length < 30:
                    delay = 0.4  # 400ms für kurze Zeilen
                elif line_length < 60:
                    delay = 0.6  # 600ms für mittlere Zeilen
                elif line_length < 100:
                    delay = 0.8  # 800ms für lange Zeilen
                else:
                    delay = 1.0  # 1000ms für sehr lange Zeilen
                
                # Zusätzliche Pause bei wichtigen Code-Stellen
                if any(keyword in line.strip() for keyword in ['class ', 'function ', 'def ', 'void ', 'Widget ', 'return ', 'if ', 'for ', 'while ']):
                    delay += 0.2  # Extra 200ms zum Nachdenken
                
                await asyncio.sleep(delay)
            
            # ⚡ SCHRITT 3: Datei komplett
            await broadcast_to_all({
                "event": "file.created",
                "path": file_info.path,
                "content": file_info.content,
                "language": file_info.language,
                "step": file_info.step,
                "agent": file_info.agent,
                "total_lines": len(lines),
                "progress": {
                    "current": file_info.step,
                    "total": 100
                }
            })
        
        async def on_step(message: str, step: int):
            """Callback für jeden Schritt"""
            await broadcast_to_all({
                "event": "generation.step",
                "message": message,
                "step": step,
                "project_id": request.project_id
            })
        
        async def on_error(error: str):
            """Callback bei Fehlern"""
            await broadcast_to_all({
                "event": "generation.error",
                "error": error,
                "project_id": request.project_id
            })
        
        # Generate project with live updates
        print(f"🚀 Starting team project generation...")
        try:
            result = await generator.generate_project_live(
                request=agent_request,
                on_file_created=on_file_created,
                on_step=on_step,
                on_error=on_error
            )
            print(f"✅ Team project generation completed: {result.get('total_files', 0)} files")
        except Exception as gen_error:
            print(f"❌ Error during team project generation: {gen_error}")
            import traceback
            traceback.print_exc()
            await on_error(str(gen_error))
            raise
        
        # Broadcast: Finished
        await broadcast_to_all({
            "event": "generation.finished",
            "project_id": request.project_id,
            "total_files": result["total_files"],
            "agents_used": result.get("agents_used", 0),
            "success": True,
            "agent_type": "team"
        })
        
        return {
            "success": True,
            "files": result["files"],
            "total_files": result["total_files"],
            "agents_used": result.get("agents_used", 0),
            "message": f"✅ Projekt erfolgreich generiert mit {result['total_files']} Dateien von {result.get('agents_used', 0)} Agenten!"
        }
        
    except Exception as e:
        # Log full error for debugging
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Team Agent generation error: {str(e)}")
        print(f"Traceback: {error_trace}")
        
        await broadcast_to_all({
            "event": "generation.error",
            "error": str(e),
            "project_id": request.project_id,
            "details": error_trace
        })


