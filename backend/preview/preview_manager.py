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
import os
import random
import signal
import socket
import subprocess
import time
from typing import Dict, Optional

import httpx

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
    async def start_web_preview(self, user: str, project_id: str, project_path: str) -> Dict[str, any]:
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
            raise FileNotFoundError("package.json not found. Not a valid Node.js project.")

        # npm run dev starten
        cmd = ["npm", "run", "dev", "--", f"--port={port}", "--host", "0.0.0.0"]

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
            "type": "web",
        }

        # Log Streaming starten
        asyncio.create_task(self._pipe_preview_logs(user, port))

        # Warte bis Server bereit ist (max 30 Sekunden)
        await self._wait_for_server_ready(port, max_wait=30)

        return {"port": port, "url": f"http://localhost:{port}", "type": "web"}

    # ---------------------------------------------------------
    # FLUTTER PREVIEW STARTEN
    # ---------------------------------------------------------
    async def start_flutter_preview(self, user: str, project_id: str, project_path: str) -> Dict[str, any]:
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

        # pubspec.yaml prüfen - falls nicht vorhanden, erstelle Flutter-Projekt
        pubspec = os.path.join(project_path, "pubspec.yaml")
        if not os.path.exists(pubspec):
            # Erstelle Flutter-Projekt-Struktur
            lib_path = os.path.join(project_path, "lib")
            os.makedirs(lib_path, exist_ok=True)
            
            # Erstelle pubspec.yaml
            pubspec_content = """name: vibeai_app
description: A VibeAI generated app
version: 1.0.0

environment:
  sdk: '>=2.17.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true
"""
            with open(pubspec, "w") as f:
                f.write(pubspec_content)
            
            # Erstelle main.dart falls nicht vorhanden
            main_dart = os.path.join(lib_path, "main.dart")
            if not os.path.exists(main_dart):
                main_content = """import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VibeAI App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('VibeAI App'),
      ),
      body: Center(
        child: Text('Welcome to VibeAI!'),
      ),
    );
  }
}
"""
                with open(main_dart, "w") as f:
                    f.write(main_content)

        # Prüfe ob Flutter Web-Support aktiviert ist, falls nicht aktivieren
        # Prüfe ob web-Verzeichnis existiert
        web_dir = os.path.join(project_path, "web")
        if not os.path.exists(web_dir):
            # Aktiviere Web-Support für Flutter-Projekt
            enable_web_cmd = ["flutter", "create", ".", "--platforms=web"]
            enable_process = await asyncio.create_subprocess_exec(
                *enable_web_cmd,
                cwd=project_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await enable_process.wait()
            if enable_process.returncode != 0:
                # Falls flutter create fehlschlägt, versuche manuell web-Verzeichnis zu erstellen
                os.makedirs(web_dir, exist_ok=True)
        
        # Flutter Web Preview starten - verwende web-server für iframe
        cmd = [
            "flutter",
            "run",
            "-d",
            "web-server",
            "--web-port",
            str(port),
            "--web-hostname",
            "0.0.0.0",
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
            "type": "flutter",
        }

        # Log Streaming starten
        asyncio.create_task(self._pipe_preview_logs(user, port))

        # ⚡ ERHÖHTES TIMEOUT: Flutter braucht oft mehr Zeit zum Kompilieren
        # Warte bis Server bereit ist (max 120 Sekunden für Flutter)
        server_ready = await self._wait_for_server_ready(port, max_wait=120)
        if not server_ready:
            # Server nicht bereit, aber Prozess läuft - gib trotzdem URL zurück
            # (Flutter kann im Hintergrund weiter kompilieren)
            print(f"⚠️  Flutter server not ready after 120s, but process is running. URL: http://localhost:{port}")

        # ⚡ WICHTIG: KEIN separater Browser wird geöffnet!
        # Der Browser-Tab wird automatisch im Editor geöffnet (Frontend macht das)
        # webbrowser.open() wurde entfernt, damit kein separates Fenster öffnet

        return {"port": port, "url": f"http://localhost:{port}", "type": "flutter"}

    # ---------------------------------------------------------
    # SERVER READINESS CHECK
    # ---------------------------------------------------------
    async def _wait_for_server_ready(self, port: int, max_wait: int = 30) -> bool:
        """
        Wartet bis der Preview-Server bereit ist.
        
        Args:
            port: Port des Servers
            max_wait: Maximale Wartezeit in Sekunden
            
        Returns:
            True wenn Server bereit, False wenn Timeout
        """
        url = f"http://localhost:{port}"
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            try:
                # Prüfe ob Port geöffnet ist
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result == 0:
                    # Port ist offen, prüfe HTTP-Response
                    try:
                        async with httpx.AsyncClient(timeout=2.0) as client:
                            response = await client.get(url)
                            if response.status_code < 500:  # 2xx, 3xx, 4xx sind OK (Server läuft)
                                print(f"✅ Preview server ready on {url}")
                                return True
                    except (httpx.RequestError, httpx.TimeoutException):
                        # Server startet noch, warte weiter
                        pass
                
                # Warte 500ms bevor nächster Versuch
                await asyncio.sleep(0.5)
                
            except Exception as e:
                print(f"⚠️  Error checking server readiness: {e}")
                await asyncio.sleep(0.5)
        
        print(f"⚠️  Preview server not ready after {max_wait}s on {url}")
        return False

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
            "running": is_running,
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
            return await self.start_flutter_preview(user, project_id, project_path)

        return None


# Singleton Instance
preview_manager = PreviewManager()