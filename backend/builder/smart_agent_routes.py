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

# Track running generations to prevent duplicates
running_generations: dict[str, bool] = {}


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


def check_project_exists(project_id: str) -> tuple[bool, int]:
    """
    Prüft ob Projekt bereits existiert und wie viele Dateien es hat.
    Returns: (exists, file_count)
    """
    import os
    from codestudio.terminal_routes import get_project_path
    
    try:
        project_path = get_project_path(project_id)
        if not os.path.exists(project_path):
            return (False, 0)
        
        # Zähle Dateien im Projekt
        file_count = 0
        exclude_dirs = {".git", "node_modules", "__pycache__", ".next", "build", "dist", ".vscode", ".idea", "venv", ".metadata", ".dart_tool"}
        exclude_extensions = {".pyc", ".log", ".DS_Store"}
        
        for root, dirs, filenames in os.walk(project_path):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for filename in filenames:
                if filename.startswith(".") or any(filename.endswith(ext) for ext in exclude_extensions):
                    continue
                file_count += 1
        
        return (True, file_count)
    except Exception as e:
        print(f"⚠️  Error checking project existence: {e}")
        return (False, 0)


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


@router.post("/stop/{project_id}", response_model=dict)
async def stop_generation(project_id: str):
    """
    🛑 Stoppe laufende Generation für ein Projekt
    """
    if not running_generations.get(project_id, False):
        return {
            "success": False,
            "message": "⚠️ Keine laufende Generation für dieses Projekt gefunden.",
            "project_id": project_id
        }
    
    # Markiere als gestoppt
    running_generations[project_id] = False
    
    await broadcast_to_all({
        "event": "generation.stopped",
        "project_id": project_id,
        "message": "🛑 Generation gestoppt."
    })
    
    return {
        "success": True,
        "message": "✅ Generation gestoppt.",
        "project_id": project_id
    }


@router.get("/status/{project_id}", response_model=dict)
async def get_generation_status(project_id: str):
    """
    📊 Prüfe Status der Generation für ein Projekt
    """
    is_running = running_generations.get(project_id, False)
    project_exists, file_count = check_project_exists(project_id)
    
    return {
        "project_id": project_id,
        "is_running": is_running,
        "project_exists": project_exists,
        "file_count": file_count,
        "status": "complete" if project_exists and file_count > 5 else ("running" if is_running else "not_started")
    }


@router.post("/generate", response_model=dict)
async def generate_with_smart_agent(request: SmartAgentGenerateRequest):
    """
    🤖 Generiere Projekt mit Smart Agent (LIVE, Schritt für Schritt)
    
    SOFORTIGE ANTWORT - Arbeit läuft im Hintergrund!
    """
    
    # ⚡ PRÜFUNG 1: Ist bereits eine Generation für dieses Projekt am Laufen?
    if running_generations.get(request.project_id, False):
        await broadcast_to_all({
            "event": "generation.already_running",
            "project_id": request.project_id,
            "message": "⚠️ Smart Agent arbeitet bereits an diesem Projekt. Bitte warten..."
        })
        return {
            "success": False,
            "message": "⚠️ Smart Agent arbeitet bereits an diesem Projekt. Bitte warten...",
            "project_id": request.project_id,
            "status": "already_running"
        }
    
    # ⚡ PRÜFUNG 2: Existiert das Projekt bereits mit Dateien?
    project_exists, file_count = check_project_exists(request.project_id)
    if project_exists and file_count > 5:  # Mindestens 5 Dateien = Projekt ist fertig
        await broadcast_to_all({
            "event": "generation.already_complete",
            "project_id": request.project_id,
            "file_count": file_count,
            "message": f"✅ Projekt bereits fertig! {file_count} Dateien gefunden. Keine neue Generation nötig."
        })
        return {
            "success": True,
            "message": f"✅ Projekt bereits fertig! {file_count} Dateien gefunden. Keine neue Generation nötig.",
            "project_id": request.project_id,
            "status": "already_complete",
            "file_count": file_count
        }
    
    # ⚡ Markiere Generation als laufend
    running_generations[request.project_id] = True
    
    # SOFORTIGE ANTWORT (unter 1 Sekunde!)
    await broadcast_to_all({
        "event": "generation.started",
        "project_id": request.project_id,
        "project_name": request.project_name,
        "platform": request.platform
    })
    
    # SOFORTIGE BESTÄTIGUNG
    immediate_response = {
        "success": True,
        "message": "✅ Smart Agent gestartet! Ich beginne sofort...",
        "project_id": request.project_id,
        "status": "working"
    }
    
    # ⚡ Starte Generation im Hintergrund (NICHT warten!)
    # WICHTIG: Task wird gestartet, aber nicht gewartet!
    asyncio.create_task(_run_generation_async(request))
    
    # SOFORT zurückgeben (<100ms)
    return immediate_response


async def _run_generation_async(request: SmartAgentGenerateRequest):
    """Führe Generation im Hintergrund aus - SOFORTIGE ARBEIT"""
    try:
        print(f"🚀 Smart Agent Request: project_id={request.project_id}, platform={request.platform}")
        
        # Prüfe OpenAI API Key
        import os
        if not os.getenv("OPENAI_API_KEY"):
            error_msg = "OPENAI_API_KEY nicht gesetzt! Smart Agent kann nicht arbeiten."
            print(f"❌ {error_msg}")
            await broadcast_to_all({
                "event": "generation.error",
                "error": error_msg,
                "project_id": request.project_id,
                "details": "Bitte setze OPENAI_API_KEY in der .env Datei"
            })
            return
        
        print(f"✅ Creating SmartAgentGenerator...")
        generator = SmartAgentGenerator(api_base_url="http://localhost:8005")
        print(f"✅ SmartAgentGenerator created")
        
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
            """Callback wenn Datei erstellt wird - ZEILE FÜR ZEILE LIVE GENERIERUNG!"""
            print(f"📝 Broadcasting file.created: {file_info.path} ({len(file_info.content)} chars)")
            
            content = file_info.content
            lines = content.split('\n')
            
            # ⚡ SCHRITT 1: Datei ankündigen - "Ich erstelle jetzt: lib/main.dart"
            await broadcast_to_all({
                "event": "file.announced",
                "path": file_info.path,
                "language": file_info.language,
                "step": file_info.step,
                "message": f"📝 Erstelle jetzt: `{file_info.path}`"
            })
            await asyncio.sleep(1.5)  # ⚡ LERN-PAUSE: Mehr Zeit zum Lesen und Verstehen
            
            # ⚡ SCHRITT 2: Zeige Imports/Abhängigkeiten ZUERST mit Erklärung
            imports = []
            current_section = []
            in_imports = False
            
            for line in lines:
                stripped = line.strip()
                # Erkenne Import-Sektionen
                if any(keyword in stripped for keyword in ['import ', 'from ', 'package:', 'using ', '#include']):
                    imports.append(line)
                    in_imports = True
                elif in_imports and (stripped == '' or stripped.startswith('//') or stripped.startswith('/*')):
                    # Leerzeile oder Kommentar nach Imports
                    imports.append(line)
                elif in_imports and stripped and not stripped.startswith('//'):
                    # Ende der Import-Sektion
                    break
            
            if imports:
                imports_text = '\n'.join(imports)
                # Extrahiere Import-Namen für Erklärung
                import_names = []
                for imp in imports:
                    if 'import' in imp or 'from' in imp:
                        # Extrahiere Paket/Modul-Namen
                        if 'package:' in imp:
                            pkg = imp.split('package:')[1].split(';')[0].strip()
                            import_names.append(pkg)
                        elif 'from' in imp:
                            pkg = imp.split('from')[1].split('import')[0].strip()
                            import_names.append(pkg)
                        elif 'import' in imp:
                            pkg = imp.split('import')[1].split(';')[0].split('as')[0].strip()
                            import_names.append(pkg)
                
                folder_path = '/'.join(file_info.path.split('/')[:-1]) if '/' in file_info.path else ''
                explanation = f"📦 **Imports/Abhängigkeiten für:** `{file_info.path}`\n\n"
                explanation += f"📁 **Ordner:** `{folder_path or 'root'}`\n\n"
                explanation += f"🔧 **Was wird importiert:**\n"
                for imp_name in import_names[:5]:  # Erste 5 Imports
                    explanation += f"- `{imp_name}`\n"
                if len(import_names) > 5:
                    explanation += f"- ... und {len(import_names) - 5} weitere\n"
                explanation += f"\n💡 **Warum:** Diese Pakete werden benötigt für die Funktionalität dieser Datei.\n\n"
                explanation += f"```{file_info.language}\n{imports_text}\n```"
                
                await broadcast_to_all({
                    "event": "code_section",
                    "path": file_info.path,
                    "section": "imports",
                    "content": imports_text,
                    "message": explanation
                })
                await asyncio.sleep(1.8)  # ⚡ LERN-PAUSE: Mehr Zeit zum Lesen und Verstehen
            
            # ⚡ SCHRITT 3: Zeige Datei-Struktur (Klassen, Funktionen, etc.) mit Erklärung
            structure_lines = []
            structure_info = []  # Speichere Info über jedes Struktur-Element
            for line_num, line in enumerate(lines, 1):
                stripped = line.strip()
                # Erkenne wichtige Struktur-Elemente
                if any(keyword in stripped for keyword in ['class ', 'function ', 'def ', 'void ', 'Widget ', 'const ', 'final ']):
                    if '{' in stripped or '(' in stripped:
                        structure_lines.append(line)
                        # Extrahiere Namen
                        if 'class ' in stripped:
                            class_name = stripped.split('class ')[1].split(' ')[0].split('{')[0].split('(')[0].strip()
                            structure_info.append({"type": "class", "name": class_name, "line": line_num})
                        elif 'function ' in stripped or 'def ' in stripped:
                            func_name = stripped.split('function ')[1].split('(')[0].split(' ')[0].strip() if 'function ' in stripped else stripped.split('def ')[1].split('(')[0].strip()
                            structure_info.append({"type": "function", "name": func_name, "line": line_num})
            
            if structure_lines:
                structure_preview = '\n'.join(structure_lines[:5])  # Erste 5 Struktur-Elemente
                folder_path = '/'.join(file_info.path.split('/')[:-1]) if '/' in file_info.path else ''
                explanation = f"🏗️ **Datei-Struktur:** `{file_info.path}`\n\n"
                explanation += f"📁 **Ordner:** `{folder_path or 'root'}`\n\n"
                explanation += f"🔧 **Was enthält diese Datei:**\n"
                for info in structure_info[:5]:
                    icon = "📦" if info["type"] == "class" else "⚙️"
                    explanation += f"{icon} **{info['type'].title()}:** `{info['name']}` (Zeile {info['line']})\n"
                if len(structure_info) > 5:
                    explanation += f"- ... und {len(structure_info) - 5} weitere Elemente\n"
                explanation += f"\n💡 **Wie funktioniert es:** Diese Struktur-Elemente bilden die Grundlage für die Funktionalität dieser Datei.\n\n"
                explanation += f"```{file_info.language}\n{structure_preview}\n...\n```"
                
                await broadcast_to_all({
                    "event": "code_section",
                    "path": file_info.path,
                    "section": "structure",
                    "content": structure_preview,
                    "message": explanation
                })
                await asyncio.sleep(1.8)  # ⚡ LERN-PAUSE: Mehr Zeit zum Lesen und Verstehen
            
            # ⚡ SCHRITT 4: Code ZEILE FÜR ZEILE schreiben (LIVE!) mit Erklärungen
            current_content = ""
            last_explanation_line = 0
            explanation_interval = 10  # Erkläre alle 10 Zeilen
            
            for line_num, line in enumerate(lines, 1):
                # Füge Zeile hinzu
                current_content += line + '\n'
                
                # ⚡ Erkläre Code-Stücke periodisch im Chat
                if line_num - last_explanation_line >= explanation_interval or line_num == len(lines):
                    # Extrahiere relevante Code-Stücke (letzte 5-10 Zeilen)
                    recent_lines = lines[max(0, line_num - 10):line_num]
                    recent_code = '\n'.join(recent_lines)
                    
                    # Erkenne wichtige Code-Stellen (Funktionen, Klassen, Logik)
                    stripped_line = line.strip()
                    is_important = any(keyword in stripped_line for keyword in [
                        'class ', 'function ', 'def ', 'void ', 'Widget ', 'return ', 
                        'if ', 'for ', 'while ', 'try ', 'catch ', '@override', 'async '
                    ])
                    
                    if is_important or line_num - last_explanation_line >= explanation_interval:
                        folder_path = '/'.join(file_info.path.split('/')[:-1]) if '/' in file_info.path else ''
                        explanation = f"✏️ **Schreibe Code in:** `{file_info.path}`\n\n"
                        explanation += f"📁 **Ordner:** `{folder_path or 'root'}`\n"
                        explanation += f"📍 **Zeile:** {line_num}/{len(lines)}\n\n"
                        
                        # Erkläre was gerade geschrieben wird
                        if 'class ' in stripped_line:
                            class_name = stripped_line.split('class ')[1].split(' ')[0].split('{')[0].strip()
                            explanation += f"📦 **Erstelle Klasse:** `{class_name}`\n"
                            explanation += f"💡 **Was:** Diese Klasse definiert die Struktur und das Verhalten für {class_name}.\n"
                            explanation += f"🔧 **Wie:** Die Klasse wird mit Properties und Methoden definiert.\n"
                        elif 'function ' in stripped_line or 'def ' in stripped_line:
                            func_name = stripped_line.split('function ')[1].split('(')[0].strip() if 'function ' in stripped_line else stripped_line.split('def ')[1].split('(')[0].strip()
                            explanation += f"⚙️ **Erstelle Funktion:** `{func_name}`\n"
                            explanation += f"💡 **Was:** Diese Funktion führt eine spezifische Aufgabe aus.\n"
                            explanation += f"🔧 **Wie:** Die Funktion wird mit Parametern und Logik implementiert.\n"
                        elif 'return ' in stripped_line:
                            explanation += f"↩️ **Rückgabewert:** Die Funktion gibt einen Wert zurück.\n"
                        elif 'if ' in stripped_line or 'for ' in stripped_line or 'while ' in stripped_line:
                            explanation += f"🔀 **Kontrollstruktur:** Bedingte Logik oder Schleife.\n"
                        else:
                            explanation += f"💡 **Code-Logik:** Implementiere Funktionalität.\n"
                        
                        explanation += f"\n```{file_info.language}\n{recent_code}\n```"
                        
                        await broadcast_to_all({
                            "event": "code_explanation",
                            "path": file_info.path,
                            "line": line_num,
                            "message": explanation
                        })
                        last_explanation_line = line_num
                        await asyncio.sleep(1.2)  # ⚡ LERN-PAUSE: Mehr Zeit für Erklärung und Verstehen
                
                # Sende Update für diese Zeile (für Editor)
                await broadcast_to_all({
                    "event": "code_written",
                    "path": file_info.path,
                    "content": current_content.rstrip('\n'),  # Ohne letztes \n
                    "line": line_num,
                    "total_lines": len(lines),
                    "line_content": line,
                    "language": file_info.language,
                    "progress": (line_num / len(lines)) * 100
                })
                
                # ⚡ LERN-GESCHWINDIGKEIT: Langsam genug zum Lernen und Verstehen
                # Kurze Zeilen: 500-600ms, Mittlere: 600-800ms, Lange: 800-1000ms
                line_length = len(line.strip())
                if line_length < 30:
                    delay = 0.5  # 500ms für kurze Zeilen (LERN-TEMPO)
                elif line_length < 60:
                    delay = 0.6  # 600ms für mittlere Zeilen
                elif line_length < 100:
                    delay = 0.8  # 800ms für lange Zeilen
                else:
                    delay = 1.0  # 1000ms für sehr lange Zeilen
                
                # Zusätzliche Pause bei wichtigen Code-Stellen (Klassen, Funktionen) - LERN-PAUSE
                if any(keyword in line.strip() for keyword in ['class ', 'function ', 'def ', 'void ', 'Widget ', 'return ', 'if ', 'for ', 'while ']):
                    delay += 0.4  # Extra 400ms zum Nachdenken und Verstehen
                
                await asyncio.sleep(delay)
            
            # ⚡ SCHRITT 5: Datei komplett
            await broadcast_to_all({
                "event": "file.created",
                "path": file_info.path,
                "content": file_info.content,
                "language": file_info.language,
                "step": file_info.step,
                "total_lines": len(lines),
                "progress": {
                    "current": file_info.step,
                    "total": 100
                }
            })
            await asyncio.sleep(0.2)
        
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
        
        # Calculate total files estimate for progress
        total_files_estimate = 20  # Will be updated as we go
        
        # Track file count for progress updates
        file_count = [0]  # Use list to allow modification in nested function
        
        async def on_file_created_with_progress(file_info: FileInfo):
            """Enhanced callback with progress tracking"""
            file_count[0] += 1
            await on_file_created(file_info)
            # Also send progress update
            await broadcast_to_all({
                "event": "generation.progress",
                "current": file_count[0],
                "total": total_files_estimate,
                "file": file_info.path
            })
        
        # Generate project with live updates
        print(f"🚀 Starting project generation...")
        try:
            result = await generator.generate_project_live(
                request=agent_request,
                on_file_created=on_file_created_with_progress,
                on_step=on_step,
                on_error=on_error
            )
            print(f"✅ Project generation completed: {result.get('total_files', 0)} files")
        except Exception as gen_error:
            print(f"❌ Error during project generation: {gen_error}")
            import traceback
            traceback.print_exc()
            # Call on_error callback
            await on_error(str(gen_error))
            raise  # Re-raise to be caught by outer try/except
        
        # Update total files estimate
        total_files_estimate = result.get("total_files", file_count[0])
        
        # Broadcast: Finished
        await broadcast_to_all({
            "event": "generation.finished",
            "project_id": request.project_id,
            "total_files": result["total_files"],
            "success": True,
            "message": f"✅ Projekt erfolgreich generiert mit {result['total_files']} Dateien!"
        })
        
        # ⚡ WICHTIG: Markiere Generation als beendet
        running_generations[request.project_id] = False
        
        return {
            "success": True,
            "files": result["files"],
            "total_files": result["total_files"],
            "message": f"✅ Projekt erfolgreich generiert mit {result['total_files']} Dateien!"
        }
        
    except Exception as e:
        # Log full error for debugging
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Smart Agent Error: {str(e)}")
        print(f"❌ Traceback:\n{error_trace}")
        
        # ⚡ WICHTIG: Markiere Generation als beendet (auch bei Fehler!)
        running_generations[request.project_id] = False
        
        # Broadcast: Error
        await broadcast_to_all({
            "event": "generation.error",
            "error": str(e),
            "project_id": request.project_id,
            "details": error_trace[:500]  # First 500 chars of traceback
        })
        
        return {
            "success": False,
            "error": str(e),
            "message": f"❌ Fehler beim Starten des Smart Agent: {str(e)}",
            "details": error_trace[:500]
        }

