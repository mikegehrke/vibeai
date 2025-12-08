# -------------------------------------------------------------
# VIBEAI – REACT LIVE PREVIEW MANAGER
# -------------------------------------------------------------
"""
React Live Preview System

Startet Vite/npm Dev Server für Live Preview.

Flow:
1. KI erzeugt UI → React Code
2. Code wird in Projekt geschrieben
3. npm run dev -- --port=PORT startet
4. WebSocket sendet Live Logs (HMR)
5. IFRAME zeigt http://localhost:PORT

Features:
- Auto-start Vite dev server
- Hot Module Replacement (HMR)
- Live logs via WebSocket
- Port management
- Process lifecycle
"""

import asyncio
import os
from typing import Dict, Optional

import psutil


class ReactPreviewManager:
    """
    Managed Vite/React Dev Server für Live Preview.
    """

    def __init__(self):
        self.active_servers: Dict[str, Dict] = {}
        self.base_port = 5173
        self.max_servers = 10

    # ---------------------------------------------------------
    # SERVER LIFECYCLE
    # ---------------------------------------------------------
    async def start_server(self, project_path: str, port: Optional[int] = None) -> Dict:
        """
        Startet React/Vite Dev Server.

        Args:
            project_path: Pfad zum React-Projekt
            port: Optional custom port

        Returns:
            {
                "server_id": "react_5173",
                "port": 5173,
                "url": "http://localhost:5173",
                "status": "starting",
                "project_path": "/path/to/project"
            }
        """
        # Validate project
        if not os.path.exists(project_path):
            raise FileNotFoundError(f"Project not found: {project_path}")

        package_file = os.path.join(project_path, "package.json")
        if not os.path.exists(package_file):
            raise ValueError(f"Not a Node.js project: {project_path}")

        # Get available port
        if port is None:
            port = self._get_available_port()

        server_id = f"react_{port}"

        # Check if already running
        if server_id in self.active_servers:
            return self.active_servers[server_id]

        # Start Vite dev server
        try:
            # Run: npm run dev -- --port=PORT --host=0.0.0.0
            process = await asyncio.create_subprocess_exec(
                "npm",
                "run",
                "dev",
                "--",
                f"--port={port}",
                "--host=0.0.0.0",
                cwd=project_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            server_info = {
                "server_id": server_id,
                "port": port,
                "url": f"http://localhost:{port}",
                "status": "starting",
                "project_path": project_path,
                "process": process,
                "pid": process.pid,
                "logs": [],
            }

            self.active_servers[server_id] = server_info

            # Start log monitoring in background
            asyncio.create_task(self._monitor_logs(server_id, process))

            return {
                "server_id": server_id,
                "port": port,
                "url": f"http://localhost:{port}",
                "status": "starting",
                "project_path": project_path,
            }

        except Exception as e:
            raise RuntimeError(f"Failed to start React server: {str(e)}")

    async def stop_server(self, server_id: str) -> Dict:
        """
        Stoppt React Dev Server.

        Args:
            server_id: Server ID

        Returns:
            {"success": True, "message": "Server stopped"}
        """
        if server_id not in self.active_servers:
            raise ValueError(f"Server not found: {server_id}")

        server = self.active_servers[server_id]
        process = server.get("process")

        if process:
            try:
                # Send SIGTERM
                process.terminate()

                # Wait for graceful shutdown
                try:
                    await asyncio.wait_for(process.wait(), timeout=5.0)
                except asyncio.TimeoutError:
                    # Force kill
                    process.kill()
                    await process.wait()

                # Cleanup
                del self.active_servers[server_id]

                return {"success": True, "message": f"Server {server_id} stopped"}

            except Exception as e:
                return {"success": False, "error": f"Failed to stop server: {str(e)}"}

        return {"success": False, "error": "No process found"}

    async def restart_server(self, server_id: str) -> Dict:
        """
        Restart React server.

        Vite HMR erfolgt automatisch, aber bei package.json
        Änderungen kann Restart nötig sein.
        """
        if server_id not in self.active_servers:
            raise ValueError(f"Server not found: {server_id}")

        server = self.active_servers[server_id]
        project_path = server["project_path"]
        port = server["port"]

        # Stop
        await self.stop_server(server_id)

        # Wait a bit
        await asyncio.sleep(1)

        # Start again
        return await self.start_server(project_path, port)

    # ---------------------------------------------------------
    # STATUS & MONITORING
    # ---------------------------------------------------------
    def get_server_status(self, server_id: str) -> Dict:
        """
        Get server status.

        Returns:
            {
                "server_id": "react_5173",
                "status": "running",
                "port": 5173,
                "url": "http://localhost:5173",
                "recent_logs": [...]
            }
        """
        if server_id not in self.active_servers:
            return {"server_id": server_id, "status": "not_found"}

        server = self.active_servers[server_id]
        process = server.get("process")

        # Check if process is still running
        if process and process.returncode is None:
            status = "running"
        else:
            status = "stopped"

        return {
            "server_id": server_id,
            "status": status,
            "port": server["port"],
            "url": server["url"],
            "project_path": server["project_path"],
            "recent_logs": server["logs"][-50:],  # Last 50 log lines
        }

    def list_servers(self) -> Dict:
        """
        List all active servers.

        Returns:
            {
                "servers": [
                    {"server_id": "react_5173", "status": "running", ...},
                    ...
                ],
                "count": 2
            }
        """
        servers = []
        for server_id in self.active_servers:
            servers.append(self.get_server_status(server_id))

        return {"servers": servers, "count": len(servers)}

    # ---------------------------------------------------------
    # HELPER FUNCTIONS
    # ---------------------------------------------------------
    def _get_available_port(self) -> int:
        """Find available port starting from base_port."""
        port = self.base_port

        while port < self.base_port + 100:
            if not self._is_port_in_use(port):
                return port
            port += 1

        raise RuntimeError("No available ports found")

    def _is_port_in_use(self, port: int) -> bool:
        """Check if port is in use."""
        # Check active servers
        for server in self.active_servers.values():
            if server["port"] == port:
                return True

        # Check system
        for conn in psutil.net_connections():
            if conn.laddr.port == port:
                return True

        return False

    async def _monitor_logs(self, server_id: str, process):
        """
        Monitor Vite logs in background.

        Reads stdout/stderr and stores in server logs.
        Detects HMR events.
        """
        server = self.active_servers.get(server_id)
        if not server:
            return

        try:
            while True:
                # Read stdout
                line = await process.stdout.readline()
                if not line:
                    break

                log_line = line.decode().strip()

                # Store log
                server["logs"].append(
                    {
                        "timestamp": asyncio.get_event_loop().time(),
                        "message": log_line,
                        "type": "stdout",
                    }
                )

                # Keep only last 1000 lines
                if len(server["logs"]) > 1000:
                    server["logs"] = server["logs"][-1000:]

                # Detect events
                if "Local:" in log_line or "http://localhost:" in log_line:
                    server["status"] = "running"

                if "hmr update" in log_line.lower() or "page reload" in log_line.lower():
                    server["logs"].append(
                        {
                            "timestamp": asyncio.get_event_loop().time(),
                            "message": "⚡ HMR Update",
                            "type": "event",
                        }
                    )

        except Exception as e:
            server["logs"].append(
                {
                    "timestamp": asyncio.get_event_loop().time(),
                    "message": f"Error monitoring logs: {str(e)}",
                    "type": "error",
                }
            )


# Global Instance
react_preview_manager = ReactPreviewManager()
