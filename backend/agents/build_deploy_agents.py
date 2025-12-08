# -------------------------------------------------------------
# VIBEAI – BUILD AGENT - APK/Web Build Integration
# -------------------------------------------------------------
"""
Build Agent - Integriert Build System in Multi-Agent Pipeline

Capabilities:
- build_flutter_apk: Flutter APK build
- build_flutter_web: Flutter web build
- build_react_web: React production build
- build_electron: Electron desktop app
- monitor_build: Live build monitoring

Integration:
- Uses existing BuildSystem
- WebSocket logs
- Progress tracking
- Artifact management
"""

from typing import Dict

from agents.multi_agent import AgentType, BaseAgent


class BuildAgent(BaseAgent):
    """
    Build Agent - Managed App Building.

    Integrates with existing BuildSystem for:
    - Flutter APK builds
    - Flutter Web builds
    - React Web builds
    - Electron builds
    """

    def __init__(self):
        super().__init__(AgentType.BUILD)
        self.capabilities = [
            "build_flutter_apk",
            "build_flutter_web",
            "build_react_web",
            "build_electron",
            "monitor_build",
            "cancel_build",
            "get_build_status",
        ]

    async def execute(self, task: Dict) -> Dict:
        """
        Execute build task.
        """
        task_type = task.get("type")
        params = task.get("params", {})

        if task_type == "build_flutter_apk":
            return await self._build_flutter_apk(params)
        elif task_type == "build_flutter_web":
            return await self._build_flutter_web(params)
        elif task_type == "build_react_web":
            return await self._build_react_web(params)
        elif task_type == "build_electron":
            return await self._build_electron(params)
        elif task_type == "monitor_build":
            return await self._monitor_build(params)
        elif task_type == "get_build_status":
            return await self._get_build_status(params)
        else:
            return {
                "success": False,
                "error": f"Unknown task type: {task_type}",
                "agent": self.agent_type,
            }

    async def _build_flutter_apk(self, params: Dict) -> Dict:
        """
        Build Flutter APK.

        Params:
            {
                "project_path": "/path/to/flutter/project",
                "build_mode": "release",  // debug, profile, release
                "output_name": "app.apk"
            }
        """
        from buildsystem.build_manager import build_manager

        project_path = params.get("project_path")
        build_mode = params.get("build_mode", "release")
        output_name = params.get("output_name", "app.apk")

        if not project_path:
            return {
                "success": False,
                "error": "Missing project_path",
                "agent": self.agent_type,
            }

        try:
            # Start build via BuildManager
            build_config = {
                "platform": "flutter",
                "build_type": "apk",
                "project_path": project_path,
                "output_name": output_name,
                "build_mode": build_mode,
            }

            build_result = await build_manager.start_build(build_config)

            return {
                "success": True,
                "result": {
                    "build_id": build_result.get("build_id"),
                    "status": build_result.get("status"),
                    "platform": "flutter",
                    "build_type": "apk",
                    "build_mode": build_mode,
                    "message": "Build started successfully",
                },
                "agent": self.agent_type,
                "action": "Flutter APK build started",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}

    async def _build_flutter_web(self, params: Dict) -> Dict:
        """Build Flutter Web."""
        from buildsystem.build_manager import build_manager

        project_path = params.get("project_path")

        try:
            build_config = {
                "platform": "flutter",
                "build_type": "web",
                "project_path": project_path,
            }

            build_result = await build_manager.start_build(build_config)

            return {
                "success": True,
                "result": {
                    "build_id": build_result.get("build_id"),
                    "status": build_result.get("status"),
                    "platform": "flutter",
                    "build_type": "web",
                },
                "agent": self.agent_type,
                "action": "Flutter Web build started",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}

    async def _build_react_web(self, params: Dict) -> Dict:
        """Build React Web."""
        from buildsystem.build_manager import build_manager

        project_path = params.get("project_path")

        try:
            build_config = {
                "platform": "react",
                "build_type": "web",
                "project_path": project_path,
            }

            build_result = await build_manager.start_build(build_config)

            return {
                "success": True,
                "result": {
                    "build_id": build_result.get("build_id"),
                    "status": build_result.get("status"),
                    "platform": "react",
                    "build_type": "web",
                },
                "agent": self.agent_type,
                "action": "React Web build started",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}

    async def _build_electron(self, params: Dict) -> Dict:
        """Build Electron app."""
        from buildsystem.build_manager import build_manager

        project_path = params.get("project_path")

        try:
            build_config = {
                "platform": "electron",
                "build_type": "desktop",
                "project_path": project_path,
            }

            build_result = await build_manager.start_build(build_config)

            return {
                "success": True,
                "result": {
                    "build_id": build_result.get("build_id"),
                    "status": build_result.get("status"),
                    "platform": "electron",
                    "build_type": "desktop",
                },
                "agent": self.agent_type,
                "action": "Electron build started",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}

    async def _monitor_build(self, params: Dict) -> Dict:
        """
        Monitor build progress.

        Returns current status and logs.
        """
        from buildsystem.build_manager import build_manager

        build_id = params.get("build_id")

        if not build_id:
            return {
                "success": False,
                "error": "Missing build_id",
                "agent": self.agent_type,
            }

        try:
            status = build_manager.get_build_status(build_id)

            return {
                "success": True,
                "result": status,
                "agent": self.agent_type,
                "action": "Build status retrieved",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}

    async def _get_build_status(self, params: Dict) -> Dict:
        """Get build status."""
        return await self._monitor_build(params)


# -------------------------------------------------------------
# DEPLOY AGENT - Artifact Management & Downloads
# -------------------------------------------------------------
class DeployAgent(BaseAgent):
    """
    Deploy Agent - Managed Artifacts & Downloads.

    Capabilities:
    - package_artifact: Create downloadable package
    - generate_download_link: Generate download URL
    - upload_to_storage: Upload to cloud storage
    - get_artifact_info: Get artifact metadata
    """

    def __init__(self):
        super().__init__(AgentType.DEPLOY)
        self.capabilities = [
            "package_artifact",
            "generate_download_link",
            "upload_to_storage",
            "get_artifact_info",
            "cleanup_artifact",
        ]

    async def execute(self, task: Dict) -> Dict:
        """
        Execute deploy task.
        """
        task_type = task.get("type")
        params = task.get("params", {})

        if task_type == "package_artifact":
            return await self._package_artifact(params)
        elif task_type == "generate_download_link":
            return await self._generate_download_link(params)
        elif task_type == "upload_to_storage":
            return await self._upload_to_storage(params)
        elif task_type == "get_artifact_info":
            return await self._get_artifact_info(params)
        else:
            return {
                "success": False,
                "error": f"Unknown task type: {task_type}",
                "agent": self.agent_type,
            }

    async def _package_artifact(self, params: Dict) -> Dict:
        """
        Package build artifacts into downloadable format.

        Params:
            {
                "build_id": "build-123",
                "format": "zip"  // zip, tar.gz
            }
        """
        import os
        import zipfile

        build_id = params.get("build_id")
        format_type = params.get("format", "zip")

        try:
            # Get artifact path from build system
            from buildsystem.artifact_manager import artifact_manager

            artifacts = artifact_manager.get_artifacts(build_id)

            if not artifacts:
                return {
                    "success": False,
                    "error": f"No artifacts found for build {build_id}",
                    "agent": self.agent_type,
                }

            # Create package
            package_path = f"/tmp/vibeai_artifacts_{build_id}.{format_type}"

            if format_type == "zip":
                with zipfile.ZipFile(package_path, "w") as zipf:
                    for artifact in artifacts:
                        artifact_path = artifact.get("path")
                        if os.path.exists(artifact_path):
                            zipf.write(artifact_path, os.path.basename(artifact_path))

            return {
                "success": True,
                "result": {
                    "package_path": package_path,
                    "format": format_type,
                    "size_bytes": os.path.getsize(package_path),
                    "artifact_count": len(artifacts),
                },
                "agent": self.agent_type,
                "action": "Artifacts packaged successfully",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}

    async def _generate_download_link(self, params: Dict) -> Dict:
        """
        Generate download link for artifact.

        Params:
            {
                "build_id": "build-123"
            }
        """
        build_id = params.get("build_id")

        try:
            # Generate download URL
            download_url = f"http://localhost:8000/build/{build_id}/download"

            return {
                "success": True,
                "result": {
                    "download_url": download_url,
                    "build_id": build_id,
                    "expires_in": "24h",
                },
                "agent": self.agent_type,
                "action": "Download link generated",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}

    async def _upload_to_storage(self, params: Dict) -> Dict:
        """Upload to cloud storage (placeholder for future implementation)."""
        return {
            "success": False,
            "error": "Cloud storage not yet implemented",
            "agent": self.agent_type,
        }

    async def _get_artifact_info(self, params: Dict) -> Dict:
        """Get artifact metadata."""
        from buildsystem.artifact_manager import artifact_manager

        build_id = params.get("build_id")

        try:
            artifacts = artifact_manager.get_artifacts(build_id)

            return {
                "success": True,
                "result": {"artifacts": artifacts, "count": len(artifacts)},
                "agent": self.agent_type,
                "action": "Artifact info retrieved",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": self.agent_type}


# Register agents
def register_build_deploy_agents():
    """Register Build and Deploy agents in registry."""
    from agents.multi_agent import agent_registry

    agent_registry.agents[AgentType.BUILD] = BuildAgent()
    agent_registry.agents[AgentType.DEPLOY] = DeployAgent()


# Auto-register on import
register_build_deploy_agents()