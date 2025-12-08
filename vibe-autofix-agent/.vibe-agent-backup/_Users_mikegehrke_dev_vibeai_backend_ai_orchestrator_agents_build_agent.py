# -------------------------------------------------------------
# VIBEAI – BUILD AGENT
# -------------------------------------------------------------
"""
Build Agent - Manages build processes.

Capabilities:
- APK builds (Flutter Android)
- Web builds (Flutter/React/Vue)
- Desktop builds (Flutter Desktop)
- Auto-detect build type from prompt
- Integration with Build System
"""

from typing import Dict, Optional


class BuildAgent:
    """Agent for build management."""

    async def start_build(self, user_id: str, project_id: str, prompt: str) -> Dict:
        """
        Start build process.

        Auto-detects build type from prompt:
        - "apk" → Flutter APK build
        - "web" → Web build
        - "desktop" → Desktop build
        - Default → APK

        Args:
            user_id: User ID
            project_id: Project ID
            prompt: User prompt (used for build type detection)

        Returns:
            {
                "success": True,
                "build_id": "build_123",
                "status": "started",
                "build_type": "apk",
                "framework": "flutter"
            }
        """
        from ai.orchestrator.memory.project_context import project_context

        # Get project context
        ctx = project_context.load(user_id, project_id)
        framework = ctx.get("framework", "flutter")
        project_path = ctx.get("project_path")

        if not project_path:
            return {
                "success": False,
                "error": "No project path configured. Create project first.",
            }

        # Detect build type from prompt
        build_type = self._detect_build_type(prompt, framework)

        try:
            # Build configuration
            build_config = {
                "user_id": user_id,
                "project_id": project_id,
                "project_path": project_path,
                "framework": framework,
                "build_type": build_type,
                "build_mode": "release",
            }

            # Start build via build system
            result = await self._execute_build(build_config)

            if result.get("success"):
                # Update context with build info
                project_context.update(
                    user_id,
                    project_id,
                    {
                        "build_id": result.get("build_id"),
                        "last_build_type": build_type,
                        "last_build_status": result.get("status"),
                    },
                )

            return {
                "success": result.get("success", True),
                "build_id": result.get("build_id"),
                "status": result.get("status", "started"),
                "build_type": build_type,
                "framework": framework,
                "project_path": project_path,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "build_type": build_type,
                "framework": framework,
            }

    def _detect_build_type(self, prompt: str, framework: str) -> str:
        """
        Detect build type from user prompt.

        Detection logic:
        - "apk" / "android" → apk
        - "web" / "website" → web
        - "desktop" / "windows" / "mac" → desktop
        - Default → apk (Flutter) or web (React/Vue)
        """
        p = prompt.lower()

        # APK build
        if any(word in p for word in ["apk", "android", "mobile app"]):
            return "apk"

        # Web build
        if any(word in p for word in ["web", "website", "browser", "online"]):
            return "web"

        # Desktop build
        if any(word in p for word in ["desktop", "windows", "mac", "linux", "app", "application"]):
            return "desktop"

        # Default based on framework
        if framework == "flutter":
            return "apk"  # Flutter default: APK
        else:
            return "web"  # React/Vue default: Web

    async def _execute_build(self, config: Dict) -> Dict:
        """Execute build via build system."""
        framework = config.get("framework")
        build_type = config.get("build_type")
        project_path = config.get("project_path")

        # Import build system
        try:
            from buildsystem.build_manager import build_manager
        except ImportError:
            # Fallback: simulate build
            return await self._simulate_build(config)

        # Build configuration for build system
        build_system_config = {
            "platform": framework,
            "build_type": self._map_build_type(framework, build_type),
            "project_path": project_path,
            "build_mode": "release",
            "user_id": config.get("user_id"),
            "project_id": config.get("project_id"),
        }

        try:
            result = await build_manager.start_build(build_system_config)
            return {
                "success": True,
                "build_id": result.get("build_id"),
                "status": result.get("status", "started"),
            }
        except Exception as e:
            return {"success": False, "error": f"Build failed: {str(e)}"}

    def _map_build_type(self, framework: str, build_type: str) -> str:
        """Map build type to build system format."""
        mapping = {
            "flutter": {
                "apk": "flutter_apk",
                "web": "flutter_web",
                "desktop": "flutter_desktop",
            },
            "react": {
                "web": "react_web",
                "apk": "react_web",  # Fallback to web
                "desktop": "react_web",
            },
            "vue": {"web": "vue_web", "apk": "vue_web", "desktop": "vue_web"},
        }

        framework_mapping = mapping.get(framework, mapping["flutter"])
        return framework_mapping.get(build_type, "flutter_apk")

    async def _simulate_build(self, config: Dict) -> Dict:
        """Simulate build (fallback when build system not available)."""
        import uuid

        build_id = f"build_{uuid.uuid4().hex[:8]}"

        return {
            "success": True,
            "build_id": build_id,
            "status": "simulated",
            "note": "Build system not available, simulated build",
        }

    async def get_build_status(self, build_id: str) -> Dict:
        """
        Get build status.

        Returns:
            {
                "success": True,
                "build_id": "build_123",
                "status": "completed",
                "progress": 100,
                "logs": [...]
            }
        """
        try:
            from buildsystem.build_manager import build_manager

            status = build_manager.get_build_status(build_id)

            return {
                "success": True,
                "build_id": build_id,
                "status": status.get("status", "unknown"),
                "progress": status.get("progress", 0),
                "logs": status.get("logs", []),
            }

        except ImportError:
            return {"success": False, "error": "Build system not available"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def cancel_build(self, build_id: str) -> Dict:
        """Cancel running build."""
        try:
            from buildsystem.build_manager import build_manager

            await build_manager.cancel_build(build_id)

            return {"success": True, "build_id": build_id, "message": "Build cancelled"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_build_artifact(self, build_id: str) -> Optional[str]:
        """
        Get build artifact path.

        Returns:
            "/path/to/build/output.apk" or None
        """
        try:
            from buildsystem.artifact_manager import artifact_manager

            artifact = await artifact_manager.get_artifact(build_id)

            return artifact.get("path") if artifact else None

        except Exception:
            return None


# Global instance
build_agent = BuildAgent()
