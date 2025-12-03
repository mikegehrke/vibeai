# -------------------------------------------------------------
# VIBEAI – PREVIEW MANAGER
# -------------------------------------------------------------
"""
Preview Manager für Live Preview System

Features:
- Web Preview (React, Next.js, Vue) mit npm run dev
- Flutter Web Preview mit flutter run -d web-server
- Process Management (Start/Stop/Restart)
- Port Management (automatische Zuweisung)
- Multi-User Support (jeder User eigener Preview)
- Live Log Streaming über WebSocket
- Auto-Reload Events

Verwendung:
    # Web Preview starten
    port = await preview_manager.start_web_preview(user, project_id)
    
    # Flutter Preview starten
    port = await preview_manager.start_flutter_preview(user, project_id)
    
    # Preview stoppen
    preview_manager.stop_preview(user)
"""

import asyncio
import subprocess
import random
import os
import signal
import time
from typing import Dict, Optional, Any

from preview.preview_ws import preview_ws


class PreviewManager:
    """
    Verwaltet Preview-Prozesse für Web und Flutter Apps.
    
    Features:
    - Process Lifecycle Management
    - Port Allocation
    - Log Streaming
    - Multi-User Isolation
    """

    def __init__(self):
        # user → {project_id, port, process, started_at, type}
        self.active_previews: Dict[str, Dict] = {}
        self.used_ports = set()

    # ---------------------------------------------------------
    # FREE PORT FINDER
    # ---------------------------------------------------------
    def find_free_port(self) -> int:
        """
        Findet freien Port für Preview Server.
        
        Returns:
            int: Freier Port zwischen 3001-3999
        """
        max_attempts = 100
        
        for _ in range(max_attempts):
            port = random.randint(3001, 3999)
            
            if port not in self.used_ports:
                self.used_ports.add(port)
                return port
        
        raise RuntimeError("No free ports available")

    def release_port(self, port: int):
        """Gibt Port wieder frei."""
        if port in self.used_ports:
            self.used_ports.remove(port)

    # ---------------------------------------------------------
    # PREVIEW STOPPEN
    # ---------------------------------------------------------
    def stop_preview(self, user: str) -> bool:
        """
        Stoppt aktiven Preview für einen User.
        
        Args:
            user: User-Email/ID
        
        Returns:
            bool: True wenn Preview gestoppt wurde
        """
        if user not in self.active_previews:
            return False

        preview = self.active_previews[user]
        process = preview["process"]
        port = preview["port"]
        
        try:
            # Graceful shutdown
            process.send_signal(signal.SIGTERM)
            
            # Warte max 2 Sekunden
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                # Force kill
                process.kill()
        except Exception as e:
            print(f"Error stopping preview for {user}: {e}")
        
        # Port freigeben
        self.release_port(port)
        
        del self.active_previews[user]
        
        return True

    # ---------------------------------------------------------
    # WEB PREVIEW STARTEN (React / Next.js / Vue)
    # ---------------------------------------------------------
    async def start_web_preview(
        self,
        user: str,
        project_id: str,
        project_path: str
    ) -> Dict[str, Any]:
        """
        Startet Web Preview mit npm run dev.
        
        Args:
            user: User-Email/ID
            project_id: Projekt-ID
            project_path: Pfad zum Projekt
        
        Returns:
            {
                "port": 3001,
                "url": "http://localhost:3001",
                "type": "web"
            }
        """
        # Alten Preview stoppen
        self.stop_preview(user)

        # Freien Port finden
        port = self.find_free_port()

        # package.json prüfen
        package_json = os.path.join(project_path, "package.json")
        if not os.path.exists(package_json):
            raise FileNotFoundError(
                "package.json not found. Not a valid Node.js project."
            )

        # npm run dev starten
        cmd = ["npm", "run", "dev", "--", f"--port={port}"]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        self.active_previews[user] = {
            "project_id": project_id,
            "port": port,
            "process": process,
            "started_at": time.time(),
            "type": "web"
        }

        # Log Streaming starten
        asyncio.create_task(self._pipe_preview_logs(user, port))

        return {
            "port": port,
            "url": f"http://localhost:{port}",
            "type": "web"
        }

    # ---------------------------------------------------------
    # FLUTTER PREVIEW STARTEN
    # ---------------------------------------------------------
    async def start_flutter_preview(
        self,
        user: str,
        project_id: str,
        project_path: str
    ) -> Dict[str, Any]:
        """
        Startet Flutter Web Preview.
        
        Args:
            user: User-Email/ID
            project_id: Projekt-ID
            project_path: Pfad zum Flutter Projekt
        
        Returns:
            {
                "port": 3002,
                "url": "http://localhost:3002",
                "type": "flutter"
            }
        """
        # Alten Preview stoppen
        self.stop_preview(user)

        # Freien Port finden
        port = self.find_free_port()

        # pubspec.yaml prüfen
        pubspec = os.path.join(project_path, "pubspec.yaml")
        if not os.path.exists(pubspec):
            raise FileNotFoundError(
                "pubspec.yaml not found. Not a valid Flutter project."
            )

        # Flutter Web Preview starten
        cmd = [
            "flutter", "run",
            "-d", "web-server",
            "--web-port", str(port),
            "--web-hostname", "0.0.0.0"
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        self.active_previews[user] = {
            "project_id": project_id,
            "port": port,
            "process": process,
            "started_at": time.time(),
            "type": "flutter"
        }

        # Log Streaming starten
        asyncio.create_task(self._pipe_preview_logs(user, port))

        return {
            "port": port,
            "url": f"http://localhost:{port}",
            "type": "flutter"
        }

    # ---------------------------------------------------------
    # LOG STREAMING → WebSocket
    # ---------------------------------------------------------
    async def _pipe_preview_logs(self, user: str, port: int):
        """
        Streamt Preview-Logs über WebSocket.
        
        Args:
            user: User-Email/ID
            port: Preview Port
        """
        if user not in self.active_previews:
            return

        preview = self.active_previews[user]
        process = preview["process"]

        try:
            # STDOUT lesen
            while True:
                line = await process.stdout.readline()
                
                if not line:
                    break

                decoded = line.decode(errors="ignore").rstrip()
                
                # WebSocket broadcast
                await preview_ws.broadcast(user, port, decoded)
                print(f"[PREVIEW {user}:{port}] {decoded}")

            # STDERR lesen
            errors = await process.stderr.read()
            if errors:
                for row in errors.decode(errors="ignore").splitlines():
                    error_msg = f"[ERROR] {row}"
                    await preview_ws.broadcast(user, port, error_msg)
                    print(f"[PREVIEW {user}:{port}] {error_msg}")

        except Exception as e:
            print(f"Error streaming logs for {user}:{port}: {e}")

    # ---------------------------------------------------------
    # PREVIEW STATUS
    # ---------------------------------------------------------
    def get_preview_status(self, user: str) -> Optional[Dict]:
        """
        Gibt Status des aktiven Previews zurück.
        
        Args:
            user: User-Email/ID
        
        Returns:
            Preview-Info oder None
        """
        if user not in self.active_previews:
            return None

        preview = self.active_previews[user]
        process = preview["process"]
        
        # Process Status prüfen
        is_running = process.returncode is None
        
        return {
            "project_id": preview["project_id"],
            "port": preview["port"],
            "url": f"http://localhost:{preview['port']}",
            "type": preview["type"],
            "started_at": preview["started_at"],
            "uptime": time.time() - preview["started_at"],
            "running": is_running
        }

    # ---------------------------------------------------------
    # ALLE PREVIEWS AUFLISTEN
    # ---------------------------------------------------------
    def list_active_previews(self) -> Dict[str, Dict]:
        """
        Liste aller aktiven Previews.
        
        Returns:
            {user: preview_info}
        """
        result = {}
        
        for user in list(self.active_previews.keys()):
            status = self.get_preview_status(user)
            if status and status["running"]:
                result[user] = status
            else:
                # Cleanup toter Prozesse
                self.stop_preview(user)
        
        return result

    # ---------------------------------------------------------
    # RESTART PREVIEW
    # ---------------------------------------------------------
    async def restart_preview(self, user: str) -> Optional[Dict]:
        """
        Startet Preview neu.
        
        Args:
            user: User-Email/ID
        
        Returns:
            Neue Preview-Info oder None
        """
        if user not in self.active_previews:
            return None

        preview = self.active_previews[user]
        project_id = preview["project_id"]
        preview_type = preview["type"]
        
        # Project Path aus project_manager holen
        # TODO: Import wenn project_manager verfügbar
        # project_path = project_manager.get_project_path(user, project_id)
        project_path = f"projects/{user}/{project_id}"

        # Stoppen
        self.stop_preview(user)

        # Neu starten
        if preview_type == "web":
            return await self.start_web_preview(user, project_id, project_path)
        elif preview_type == "flutter":
            return await self.start_flutter_preview(
                user, project_id, project_path
            )
        
        return None


# Singleton Instance
preview_manager = PreviewManager()
