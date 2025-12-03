# -------------------------------------------------------------
# VIBEAI – BUILD MANAGER (CI/CD Orchestrator)
# -------------------------------------------------------------
import os
import uuid
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

logger = logging.getLogger("build_manager")


class BuildStatus(str, Enum):
    """Build status states"""
    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class BuildType(str, Enum):
    """Supported build types"""
    FLUTTER_ANDROID = "flutter_android"
    FLUTTER_IOS = "flutter_ios"
    FLUTTER_WEB = "flutter_web"
    REACT_WEB = "react_web"
    NEXTJS_WEB = "nextjs_web"
    NODE_BACKEND = "node_backend"
    ELECTRON_DESKTOP = "electron_desktop"
    ZIP_EXPORT = "zip_export"


class BuildManager:
    """
    Orchestrates build processes.
    
    Features:
    - Multi-platform builds (Flutter, React, Node, Electron)
    - Build queue management
    - Status tracking & WebSocket updates
    - Build logs streaming
    - Artifact storage
    - Parallel build support
    """
    
    def __init__(self, builds_dir: str = "./build_artifacts"):
        self.builds_dir = builds_dir
        self.active_builds: Dict[str, Dict] = {}
        self.build_queue: List[str] = []
        
        # Create builds directory
        os.makedirs(builds_dir, exist_ok=True)
    
    async def create_build(
        self,
        user_email: str,
        project_id: str,
        build_type: BuildType,
        config: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Create new build job.
        
        Args:
            user_email: User email
            project_id: Project ID
            build_type: Type of build
            config: Build configuration
        
        Returns:
            Build metadata
        """
        build_id = str(uuid.uuid4())
        
        # Build metadata
        build_meta = {
            "id": build_id,
            "user": user_email,
            "project_id": project_id,
            "type": build_type.value,
            "status": BuildStatus.QUEUED.value,
            "config": config or {},
            "created_at": datetime.utcnow().isoformat(),
            "started_at": None,
            "completed_at": None,
            "logs": [],
            "artifacts": [],
            "error": None
        }
        
        # Create build directory
        build_path = self._get_build_path(build_id)
        os.makedirs(build_path, exist_ok=True)
        
        # Create subdirectories (wie dein Vorschlag)
        os.makedirs(os.path.join(build_path, "logs"), exist_ok=True)
        os.makedirs(os.path.join(build_path, "output"), exist_ok=True)
        
        # Save metadata
        self._save_metadata(build_id, build_meta)
        
        # Add to queue
        self.build_queue.append(build_id)
        self.active_builds[build_id] = build_meta
        
        logger.info(
            "Created build %s for user %s", build_id, user_email
        )
        
        return build_meta
    
    async def start_build(self, build_id: str) -> Dict[str, Any]:
        """
        Start build execution.
        """
        if build_id not in self.active_builds:
            raise ValueError(f"Build {build_id} not found")
        
        build = self.active_builds[build_id]
        
        # Update status
        build["status"] = BuildStatus.RUNNING.value
        build["started_at"] = datetime.utcnow().isoformat()
        
        self._save_metadata(build_id, build)
        
        logger.info("Started build %s", build_id)
        
        return build
    
    async def update_build_status(
        self,
        build_id: str,
        status: BuildStatus,
        error: Optional[str] = None
    ):
        """
        Update build status.
        """
        if build_id not in self.active_builds:
            return
        
        build = self.active_builds[build_id]
        build["status"] = status.value
        
        if status in [BuildStatus.SUCCESS, BuildStatus.FAILED]:
            build["completed_at"] = datetime.utcnow().isoformat()
        
        if error:
            build["error"] = error
        
        self._save_metadata(build_id, build)
        
        logger.info("Build %s status: %s", build_id, status.value)
    
    async def add_log(self, build_id: str, message: str):
        """
        Add log entry to build.
        
        Logs werden sowohl in Metadata als auch in log-Datei gespeichert.
        """
        if build_id not in self.active_builds:
            return
        
        build = self.active_builds[build_id]
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "message": message
        }
        
        build["logs"].append(log_entry)
        self._save_metadata(build_id, build)
        
        # Auch in log-Datei schreiben (wie dein Vorschlag)
        build_path = self._get_build_path(build_id)
        log_file = os.path.join(build_path, "logs", "build.log")
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"[{log_entry['timestamp']}] {message}\n")
    
    async def add_artifact(
        self,
        build_id: str,
        artifact_type: str,
        file_path: str,
        size: int
    ):
        """
        Register build artifact.
        """
        if build_id not in self.active_builds:
            return
        
        build = self.active_builds[build_id]
        
        artifact = {
            "type": artifact_type,
            "path": file_path,
            "size": size,
            "created_at": datetime.utcnow().isoformat()
        }
        
        build["artifacts"].append(artifact)
        self._save_metadata(build_id, build)
    
    def get_build(self, build_id: str) -> Optional[Dict]:
        """
        Get build by ID.
        """
        if build_id in self.active_builds:
            return self.active_builds[build_id]
        
        # Try loading from disk
        return self._load_metadata(build_id)
    
    def list_builds(
        self,
        user_email: str,
        limit: int = 50
    ) -> List[Dict]:
        """
        List user builds.
        """
        user_builds = [
            b for b in self.active_builds.values()
            if b["user"] == user_email
        ]
        
        # Sort by created_at descending
        user_builds.sort(
            key=lambda x: x["created_at"],
            reverse=True
        )
        
        return user_builds[:limit]
    
    def _get_build_path(self, build_id: str) -> str:
        """Get build directory path"""
        return os.path.join(self.builds_dir, build_id)
    
    def _get_metadata_path(self, build_id: str) -> str:
        """Get metadata file path"""
        return os.path.join(
            self._get_build_path(build_id),
            "build.json"
        )
    
    def _save_metadata(self, build_id: str, metadata: Dict):
        """Save build metadata"""
        metadata_path = self._get_metadata_path(build_id)
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
    
    def _load_metadata(self, build_id: str) -> Optional[Dict]:
        """Load build metadata"""
        metadata_path = self._get_metadata_path(build_id)
        
        if not os.path.exists(metadata_path):
            return None
        
        with open(metadata_path, 'r', encoding='utf-8') as f:
            return json.load(f)


# ============================================================
# GLOBAL INSTANCE
# ============================================================

build_manager = BuildManager()
