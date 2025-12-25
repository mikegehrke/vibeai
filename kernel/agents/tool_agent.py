# kernel/agents/tool_agent.py
# ----------------------------
# ToolAgent v2 - System-Operationen (Kernel v1.2+, Phase 1D)
#
# AUFGABEN:
# - Terminal-Befehle (mit Output-Streaming)
# - Git-Operationen (clone, commit, push, diff, status)
# - Preview starten
# - Internet-Zugriff
# - Process-Monitoring
#
# REGEL:
# - Nur strukturierte Ergebnisse (Events)
# - Keine direkten System-Calls ohne Policy-Check
# - Alle Operationen event-based (kein Blackbox)
#
# NEU in v2 (Phase 1D):
# - Terminal output streaming (line by line)
# - Git operations erweitert
# - Process monitoring
# - Event-based progress tracking

import subprocess
import asyncio
import os
from typing import Dict, Any, List, Optional, AsyncGenerator
from kernel.events import (
    KernelEvent, 
    EVENT_TERMINAL, 
    EVENT_GIT, 
    EVENT_PREVIEW,
    EVENT_THOUGHT_INTERNAL,
    EVENT_DECISION
)


class ToolAgent:
    """
    ToolAgent v2 (Kernel v1.2+, Phase 1D) - System & Tools.
    
    CAPABILITY CONTRACT:
    can: [
        "terminal_exec", "terminal_stream",
        "git_clone", "git_commit", "git_push", "git_pull", "git_diff", "git_status",
        "preview_start", "process_monitor"
    ]
    cannot: ["delete_files", "system_shutdown"]
    
    NEU in v2:
    - terminal_stream: Line-by-line Output (async generator)
    - git_clone: Repository klonen
    - git_push: Push mit Credentials
    - git_diff: Changes anzeigen
    - process_monitor: Laufende Prozesse überwachen
    """
    
    def __init__(self, kernel):
        self.kernel = kernel
        self.capabilities = [
            "terminal_exec", "terminal_stream",
            "git_clone", "git_commit", "git_push", "git_pull", "git_diff", "git_status",
            "preview_start", "process_monitor"
        ]
        self.running_processes: Dict[str, subprocess.Popen] = {}
    
    async def terminal_stream(self, command: str, cwd: Optional[str] = None) -> AsyncGenerator[str, None]:
        """
        Führt Terminal-Befehl aus mit Line-by-Line Streaming.
        
        Args:
            command: Shell-Command
            cwd: Working Directory (optional)
            
        Yields:
            Jede Output-Zeile einzeln
            
        Example:
            async for line in agent.terminal_stream("npm install"):
                print(line)
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_TERMINAL,
            message=f"Terminal: {command}",
            data={"command": command, "cwd": cwd},
            scope="public"
        ))
        
        # Process starten
        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=cwd,
            text=True,
            bufsize=1
        )
        
        # Line-by-Line streamen
        try:
            for line in iter(process.stdout.readline, ''):
                if line:
                    yield line.rstrip()
                    
            # Warten auf Completion
            process.wait()
            
        finally:
            if process.poll() is None:
                process.terminate()
    
    async def run_terminal(self, command: str, cwd: Optional[str] = None) -> Dict[str, Any]:
        """
        Führt Terminal-Befehl aus (blocking, komplettes Ergebnis).
        
        Args:
            command: Shell-Command
            cwd: Working Directory (optional)
            
        Returns:
            Dict mit Output und Exit-Code
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_TERMINAL,
            message=f"Führe aus: {command}",
            data={"command": command, "cwd": cwd}
        ))
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=300  # 5 Minuten Timeout
            )
            
            return {
                "command": command,
                "output": result.stdout,
                "error": result.stderr,
                "exit_code": result.returncode,
                "success": result.returncode == 0
            }
            
        except subprocess.TimeoutExpired:
            return {
                "command": command,
                "output": "",
                "error": "Command timed out after 5 minutes",
                "exit_code": -1,
                "success": False
            }
    
    async def git_clone(self, repo_url: str, destination: str) -> Dict:
        """
        Klont Git-Repository.
        
        Args:
            repo_url: Git-URL (https oder ssh)
            destination: Ziel-Verzeichnis
            
        Returns:
            Dict mit Clone-Info
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_GIT,
            message=f"Git Clone: {repo_url} → {destination}",
            data={"repo_url": repo_url, "destination": destination}
        ))
        
        result = await self.run_terminal(f"git clone {repo_url} {destination}")
        
        return {
            "action": "clone",
            "repo_url": repo_url,
            "destination": destination,
            "success": result["success"],
            "output": result["output"]
        }
    
    async def git_status(self, repo_path: str) -> Dict:
        """
        Zeigt Git-Status.
        
        Args:
            repo_path: Pfad zum Repository
            
        Returns:
            Dict mit Status-Info
        """
        result = await self.run_terminal("git status --short", cwd=repo_path)
        
        return {
            "action": "status",
            "repo_path": repo_path,
            "changes": result["output"],
            "success": result["success"]
        }
    
    async def git_diff(self, repo_path: str, file: Optional[str] = None) -> Dict:
        """
        Zeigt Git-Diff.
        
        Args:
            repo_path: Pfad zum Repository
            file: Einzelne Datei (optional)
            
        Returns:
            Dict mit Diff-Info
        """
        cmd = f"git diff {file}" if file else "git diff"
        result = await self.run_terminal(cmd, cwd=repo_path)
        
        return {
            "action": "diff",
            "repo_path": repo_path,
            "file": file,
            "diff": result["output"],
            "success": result["success"]
        }
    
    
    async def git_commit(self, message: str, files: Optional[List[str]] = None, repo_path: str = ".") -> Dict:
        """
        Erstellt Git-Commit.
        
        Args:
            message: Commit-Message
            files: Dateien (optional, sonst alle staged)
            repo_path: Pfad zum Repository
            
        Returns:
            Dict mit Commit-Info
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_GIT,
            message=f"Git Commit: {message}",
            data={"message": message, "files": files}
        ))
        
        # Files stagen (falls angegeben)
        if files:
            for file in files:
                await self.run_terminal(f"git add {file}", cwd=repo_path)
        
        # Commit erstellen
        result = await self.run_terminal(f'git commit -m "{message}"', cwd=repo_path)
        
        # Hash auslesen
        hash_result = await self.run_terminal("git rev-parse HEAD", cwd=repo_path)
        commit_hash = hash_result["output"].strip() if hash_result["success"] else "unknown"
        
        return {
            "action": "commit",
            "message": message,
            "hash": commit_hash,
            "success": result["success"],
            "output": result["output"]
        }
    
    async def git_push(self, repo_path: str = ".", remote: str = "origin", branch: str = "main") -> Dict:
        """
        Pushed Commits zum Remote.
        
        Args:
            repo_path: Pfad zum Repository
            remote: Remote-Name (default: origin)
            branch: Branch-Name (default: main)
            
        Returns:
            Dict mit Push-Info
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_GIT,
            message=f"Git Push: {remote}/{branch}",
            data={"remote": remote, "branch": branch}
        ))
        
        result = await self.run_terminal(f"git push {remote} {branch}", cwd=repo_path)
        
        return {
            "action": "push",
            "remote": remote,
            "branch": branch,
            "success": result["success"],
            "output": result["output"]
        }
    
    async def git_pull(self, repo_path: str = ".", remote: str = "origin", branch: str = "main") -> Dict:
        """
        Pulled Changes vom Remote.
        
        Args:
            repo_path: Pfad zum Repository
            remote: Remote-Name (default: origin)
            branch: Branch-Name (default: main)
            
        Returns:
            Dict mit Pull-Info
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_GIT,
            message=f"Git Pull: {remote}/{branch}",
            data={"remote": remote, "branch": branch}
        ))
        
        result = await self.run_terminal(f"git pull {remote} {branch}", cwd=repo_path)
        
        return {
            "action": "pull",
            "remote": remote,
            "branch": branch,
            "success": result["success"],
            "output": result["output"]
        }
    
    async def process_monitor(self, process_name: str) -> Dict:
        """
        Überwacht laufenden Prozess.
        
        Args:
            process_name: Name/Pattern des Prozesses
            
        Returns:
            Dict mit Prozess-Info
        """
        # ps aux | grep pattern
        result = await self.run_terminal(f"ps aux | grep {process_name} | grep -v grep")
        
        processes = []
        if result["success"] and result["output"]:
            for line in result["output"].split("\n"):
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 11:
                        processes.append({
                            "user": parts[0],
                            "pid": parts[1],
                            "cpu": parts[2],
                            "mem": parts[3],
                            "command": " ".join(parts[10:])
                        })
        
        return {
            "action": "process_monitor",
            "process_name": process_name,
            "processes": processes,
            "count": len(processes)
        }
        """
        Startet Preview-Server.
        
        Args:
            project_path: Pfad zum Projekt
            port: Port-Nummer
            
        Returns:
            Dict mit Preview-Info
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_PREVIEW,
            message=f"Preview gestartet auf Port {port}",
            data={"path": project_path, "port": port}
        ))
        
        # TODO: Tatsächlichen Preview-Server starten
        return {
            "url": f"http://localhost:{port}",
    
    async def start_preview(self, project_path: str, port: int = 3000) -> Dict:
        """
        Startet Preview-Server.
        
        Args:
            project_path: Pfad zum Projekt
            port: Port-Nummer
            
        Returns:
            Dict mit Preview-Info
        """
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_PREVIEW,
            message=f"Preview gestartet auf Port {port}",
            data={"path": project_path, "port": port}
        ))
        
        # TODO: Tatsächlichen Preview-Server starten
        return {
            "url": f"http://localhost:{port}",
            "port": port,
            "project_path": project_path,
            "status": "running"
        }


# Singleton
_tool_agent = None

def get_tool_agent(kernel=None):
    """Singleton Factory für ToolAgent."""
    global _tool_agent
    if _tool_agent is None and kernel is not None:
        _tool_agent = ToolAgent(kernel)
    return _tool_agent
    
    def get_capabilities(self) -> list:
        """Gibt Liste der Capabilities zurück."""
        return self.capabilities
