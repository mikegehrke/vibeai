# -------------------------------------------------------------
# VIBEAI – PREVIEW RUNTIME
# -------------------------------------------------------------
"""
Preview Runtime System

Features:
- Live Compilation Engine
- File Watcher für Auto-Reload
- Hot Module Replacement (HMR)
- Error Detection & Reporting
- Compilation Cache
- Multi-Project Support

Verwendung:
    # File watcher starten
    await preview_runtime.watch_project(user, project_id, project_path)
    
    # File change triggern
    await preview_runtime.trigger_reload(user, file_path)
"""

import asyncio
import os
import time
from typing import Dict, Set, Optional, Any
from pathlib import Path
import hashlib


class PreviewRuntime:
    """
    Runtime System für Live Preview.
    
    Überwacht Dateien und triggert Auto-Reload
    bei Änderungen.
    """

    def __init__(self):
        # user → {project_id, watcher_task, file_hashes}
        self.active_watchers: Dict[str, Dict] = {}
        
        # Cache für Compilation Results
        self.compilation_cache: Dict[str, Dict] = {}

    # ---------------------------------------------------------
    # FILE WATCHER
    # ---------------------------------------------------------
    async def watch_project(
        self,
        user: str,
        project_id: str,
        project_path: str,
        extensions: Set[str] = None
    ):
        """
        Startet File Watcher für Projekt.
        
        Args:
            user: User-Email/ID
            project_id: Projekt-ID
            project_path: Pfad zum Projekt
            extensions: Dateitypen zum Überwachen (.js, .jsx, .dart, etc.)
        """
        # Standard Extensions
        if extensions is None:
            extensions = {
                ".js", ".jsx", ".ts", ".tsx",
                ".vue", ".dart", ".css", ".scss"
            }

        # Alten Watcher stoppen
        self.stop_watcher(user)

        # File Hashes initialisieren
        file_hashes = self._scan_files(project_path, extensions)

        # Watcher Task erstellen
        watcher_task = asyncio.create_task(
            self._watch_loop(user, project_path, file_hashes, extensions)
        )

        self.active_watchers[user] = {
            "project_id": project_id,
            "watcher_task": watcher_task,
            "file_hashes": file_hashes
        }

    async def _watch_loop(
        self,
        user: str,
        project_path: str,
        file_hashes: Dict[str, str],
        extensions: Set[str]
    ):
        """
        Watch Loop - prüft alle 2 Sekunden auf Änderungen.
        
        Args:
            user: User-Email/ID
            project_path: Projekt-Pfad
            file_hashes: Dictionary mit File-Hashes
            extensions: Dateitypen
        """
        try:
            while True:
                await asyncio.sleep(2)  # Check alle 2 Sekunden

                # Files scannen
                current_hashes = self._scan_files(project_path, extensions)

                # Änderungen finden
                changed_files = []

                for file_path, current_hash in current_hashes.items():
                    old_hash = file_hashes.get(file_path)

                    if old_hash != current_hash:
                        changed_files.append(file_path)
                        file_hashes[file_path] = current_hash

                # Neue Dateien
                new_files = set(current_hashes.keys()) - set(file_hashes.keys())
                changed_files.extend(new_files)

                # Gelöschte Dateien
                deleted_files = set(file_hashes.keys()) - set(current_hashes.keys())
                for file_path in deleted_files:
                    del file_hashes[file_path]
                    changed_files.append(file_path)

                # Reload triggern wenn Änderungen
                if changed_files:
                    await self.trigger_reload(user, changed_files)

        except asyncio.CancelledError:
            print(f"Watcher stopped for {user}")
        except Exception as e:
            print(f"Watcher error for {user}: {e}")

    def _scan_files(
        self,
        project_path: str,
        extensions: Set[str]
    ) -> Dict[str, str]:
        """
        Scannt alle Dateien und berechnet Hashes.
        
        Args:
            project_path: Projekt-Pfad
            extensions: Dateitypen
        
        Returns:
            {file_path: hash}
        """
        file_hashes = {}

        for root, dirs, files in os.walk(project_path):
            # Ignore node_modules, .git, build, etc.
            dirs[:] = [
                d for d in dirs
                if d not in ["node_modules", ".git", "build", "dist", ".next"]
            ]

            for file in files:
                file_path = os.path.join(root, file)
                ext = os.path.splitext(file)[1]

                if ext in extensions:
                    try:
                        with open(file_path, "rb") as f:
                            file_hash = hashlib.md5(f.read()).hexdigest()
                            file_hashes[file_path] = file_hash
                    except Exception:
                        pass

        return file_hashes

    # ---------------------------------------------------------
    # RELOAD TRIGGER
    # ---------------------------------------------------------
    async def trigger_reload(self, user: str, changed_files: list):
        """
        Triggert Reload Event bei Dateiänderungen.
        
        Args:
            user: User-Email/ID
            changed_files: Liste geänderter Dateien
        """
        # TODO: WebSocket Event senden wenn preview_ws verfügbar
        # from preview.preview_ws import preview_ws
        # await preview_ws.send_event(user, "reload", {
        #     "files": changed_files
        # })

        print(f"[RELOAD] {user}: {len(changed_files)} files changed")
        for file in changed_files[:5]:  # Nur erste 5 anzeigen
            print(f"  - {os.path.basename(file)}")

    # ---------------------------------------------------------
    # WATCHER STOPPEN
    # ---------------------------------------------------------
    def stop_watcher(self, user: str) -> bool:
        """
        Stoppt File Watcher für User.
        
        Args:
            user: User-Email/ID
        
        Returns:
            bool: True wenn Watcher gestoppt wurde
        """
        if user not in self.active_watchers:
            return False

        watcher = self.active_watchers[user]
        task = watcher["watcher_task"]

        # Task canceln
        task.cancel()

        del self.active_watchers[user]

        return True

    # ---------------------------------------------------------
    # COMPILATION CACHE
    # ---------------------------------------------------------
    def get_cached_compilation(
        self,
        file_path: str,
        file_hash: str
    ) -> Optional[Dict]:
        """
        Gibt gecachte Compilation zurück.
        
        Args:
            file_path: Datei-Pfad
            file_hash: Datei-Hash
        
        Returns:
            Cached result oder None
        """
        cache_key = f"{file_path}:{file_hash}"

        if cache_key in self.compilation_cache:
            cached = self.compilation_cache[cache_key]

            # Cache max 5 Minuten gültig
            if time.time() - cached["timestamp"] < 300:
                return cached["result"]

        return None

    def cache_compilation(
        self,
        file_path: str,
        file_hash: str,
        result: Dict
    ):
        """
        Cached Compilation Result.
        
        Args:
            file_path: Datei-Pfad
            file_hash: Datei-Hash
            result: Compilation Result
        """
        cache_key = f"{file_path}:{file_hash}"

        self.compilation_cache[cache_key] = {
            "result": result,
            "timestamp": time.time()
        }

    # ---------------------------------------------------------
    # ERROR DETECTION
    # ---------------------------------------------------------
    async def check_syntax_errors(
        self,
        project_path: str,
        file_type: str
    ) -> Optional[Dict]:
        """
        Prüft Syntax-Fehler in Projekt.
        
        Args:
            project_path: Projekt-Pfad
            file_type: "js", "dart", etc.
        
        Returns:
            Error-Info oder None
        """
        try:
            if file_type == "js" or file_type == "ts":
                # ESLint oder TypeScript Compiler
                process = await asyncio.create_subprocess_exec(
                    "npm", "run", "lint",
                    cwd=project_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await process.communicate()
                
                if process.returncode != 0:
                    return {
                        "type": "syntax_error",
                        "message": stderr.decode()
                    }

            elif file_type == "dart":
                # Flutter analyze
                process = await asyncio.create_subprocess_exec(
                    "flutter", "analyze",
                    cwd=project_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await process.communicate()
                
                if process.returncode != 0:
                    return {
                        "type": "syntax_error",
                        "message": stdout.decode()
                    }

        except Exception as e:
            print(f"Error checking syntax: {e}")

        return None

    # ---------------------------------------------------------
    # STATS
    # ---------------------------------------------------------
    def get_watcher_stats(self) -> Dict[str, Any]:
        """
        Statistiken über aktive Watchers.
        
        Returns:
            {
                "active_watchers": 3,
                "cache_size": 15,
                "users": [...]
            }
        """
        return {
            "active_watchers": len(self.active_watchers),
            "cache_size": len(self.compilation_cache),
            "users": list(self.active_watchers.keys())
        }


# Singleton Instance
preview_runtime = PreviewRuntime()
