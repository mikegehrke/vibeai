# -------------------------------------------------------------
# VIBEAI – BUILD EXECUTOR (Multi-Platform Build Engine)
# -------------------------------------------------------------
import os
import asyncio
import shutil
import logging
from typing import Dict, Optional, Callable
from abc import ABC, abstractmethod

from buildsystem.build_manager import build_manager

# WebSocket Integration
try:
    from admin.notifications.ws_build_events import ws_build_events
    WS_ENABLED = True
except ImportError:
    WS_ENABLED = False
    ws_build_events = None

logger = logging.getLogger("build_executor")


class BuildExecutor(ABC):
    """
    Base class for platform-specific build executors.
    """
    
    @abstractmethod
    async def execute(
        self,
        build_id: str,
        project_path: str,
        config: Dict,
        log_callback: Optional[Callable] = None
    ) -> Dict:
        """Execute build"""
        pass
    
    async def _run_command(
        self,
        command: list,
        cwd: str,
        build_id: str,
        log_callback: Optional[Callable] = None
    ) -> int:
        """
        Run shell command asynchronously and stream output.
        
        Returns:
            Return code (0 = success)
        """
        process = await asyncio.create_subprocess_exec(
            *command,
            cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Stream stdout
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            
            decoded = line.decode(errors="ignore").rstrip()
            
            # Log to build manager
            await build_manager.add_log(build_id, decoded)
            
            # WebSocket live streaming
            if WS_ENABLED:
                await ws_build_events.broadcast(build_id, decoded)
            
            # Callback for WebSocket streaming
            if log_callback:
                await log_callback(decoded)
        
        # Get stderr
        stderr = await process.stderr.read()
        if stderr:
            for row in stderr.decode(errors="ignore").splitlines():
                error_line = f"[ERROR] {row}"
                await build_manager.add_log(build_id, error_line)
                
                # WebSocket error streaming
                if WS_ENABLED:
                    await ws_build_events.broadcast(build_id, error_line)
                
                if log_callback:
                    await log_callback(error_line)
        
        await process.wait()
        
        return process.returncode


class FlutterAndroidExecutor(BuildExecutor):
    """
    Build Flutter Android APK.
    """
    
    async def execute(
        self,
        build_id: str,
        project_path: str,
        config: Dict,
        log_callback: Optional[Callable] = None
    ) -> Dict:
        """
        Build Android APK.
        """
        await build_manager.add_log(
            build_id,
            "🔨 Starting Flutter Android build..."
        )
        
        # Run flutter build apk
        returncode = await self._run_command(
            ["flutter", "build", "apk", "--release"],
            cwd=project_path,
            build_id=build_id,
            log_callback=log_callback
        )
        
        if returncode != 0:
            raise RuntimeError("Flutter Android build failed")
        
        # Find APK
        apk_path = os.path.join(
            project_path,
            "build/app/outputs/flutter-apk/app-release.apk"
        )
        
        if os.path.exists(apk_path):
            apk_size = os.path.getsize(apk_path)
            
            # Copy APK to output directory
            build_path = build_manager._get_build_path(build_id)
            output_dir = os.path.join(build_path, "output")
            os.makedirs(output_dir, exist_ok=True)
            
            output_apk = os.path.join(output_dir, "app-release.apk")
            shutil.copy2(apk_path, output_apk)
            
            await build_manager.add_artifact(
                build_id,
                "apk",
                output_apk,
                apk_size
            )
            
            await build_manager.add_log(
                build_id,
                f"✅ APK built: {apk_size / 1024 / 1024:.2f} MB"
            )
        
        return {"apk_path": apk_path}


class FlutterIOSExecutor(BuildExecutor):
    """
    Build Flutter iOS IPA.
    """
    
    async def execute(
        self,
        build_id: str,
        project_path: str,
        config: Dict,
        log_callback: Optional[Callable] = None
    ) -> Dict:
        """
        Build iOS IPA.
        """
        await build_manager.add_log(
            build_id,
            "🔨 Starting Flutter iOS build..."
        )
        
        # Run flutter build ios
        returncode = await self._run_command(
            ["flutter", "build", "ios", "--release", "--no-codesign"],
            cwd=project_path,
            build_id=build_id,
            log_callback=log_callback
        )
        
        if returncode != 0:
            raise RuntimeError("Flutter iOS build failed")
        
        await build_manager.add_log(
            build_id,
            "✅ iOS build completed"
        )
        
        return {"status": "success"}


class FlutterWebExecutor(BuildExecutor):
    """
    Build Flutter Web.
    """
    
    async def execute(
        self,
        build_id: str,
        project_path: str,
        config: Dict,
        log_callback: Optional[Callable] = None
    ) -> Dict:
        """
        Build Flutter Web.
        """
        await build_manager.add_log(
            build_id,
            "🔨 Starting Flutter Web build..."
        )
        
        # Run flutter build web
        returncode = await self._run_command(
            ["flutter", "build", "web", "--release"],
            cwd=project_path,
            build_id=build_id,
            log_callback=log_callback
        )
        
        if returncode != 0:
            raise RuntimeError("Flutter Web build failed")
        
        # Copy web build to output
        web_build_path = os.path.join(project_path, "build/web")
        build_path = build_manager._get_build_path(build_id)
        output_dir = os.path.join(build_path, "output", "web")
        
        if os.path.exists(web_build_path):
            shutil.copytree(web_build_path, output_dir, dirs_exist_ok=True)
        
        await build_manager.add_log(
            build_id,
            f"✅ Web build completed: {output_dir}"
        )
        
        return {"web_path": output_dir}


class ReactWebExecutor(BuildExecutor):
    """
    Build React Web App.
    """
    
    async def execute(
        self,
        build_id: str,
        project_path: str,
        config: Dict,
        log_callback: Optional[Callable] = None
    ) -> Dict:
        """
        Build React production bundle.
        """
        await build_manager.add_log(
            build_id,
            "🔨 Installing dependencies..."
        )
        
        # npm install
        returncode = await self._run_command(
            ["npm", "install"],
            cwd=project_path,
            build_id=build_id,
            log_callback=log_callback
        )
        
        if returncode != 0:
            raise RuntimeError("npm install failed")
        
        await build_manager.add_log(
            build_id,
            "🔨 Building React app..."
        )
        
        # npm run build
        returncode = await self._run_command(
            ["npm", "run", "build"],
            cwd=project_path,
            build_id=build_id,
            log_callback=log_callback
        )
        
        if returncode != 0:
            raise RuntimeError("React build failed")
        
        # Copy build output
        build_output = os.path.join(project_path, "build")
        build_path = build_manager._get_build_path(build_id)
        output_dir = os.path.join(build_path, "output", "build")
        
        if os.path.exists(build_output):
            shutil.copytree(build_output, output_dir, dirs_exist_ok=True)
        
        await build_manager.add_log(
            build_id,
            f"✅ React build completed: {output_dir}"
        )
        
        return {"build_path": output_dir}


class NextJSWebExecutor(BuildExecutor):
    """
    Build Next.js Web App.
    """
    
    async def execute(
        self,
        build_id: str,
        project_path: str,
        config: Dict,
        log_callback: Optional[Callable] = None
    ) -> Dict:
        """
        Build Next.js production bundle.
        """
        await build_manager.add_log(
            build_id,
            "🔨 Installing dependencies..."
        )
        
        # npm install
        returncode = await self._run_command(
            ["npm", "install"],
            cwd=project_path,
            build_id=build_id,
            log_callback=log_callback
        )
        
        if returncode != 0:
            raise RuntimeError("npm install failed")
        
        await build_manager.add_log(
            build_id,
            "🔨 Building Next.js app..."
        )
        
        # npm run build
        returncode = await self._run_command(
            ["npm", "run", "build"],
            cwd=project_path,
            build_id=build_id,
            log_callback=log_callback
        )
        
        if returncode != 0:
            raise RuntimeError("Next.js build failed")
        
        await build_manager.add_log(
            build_id,
            "✅ Next.js build completed"
        )
        
        return {"status": "success"}


# ============================================================
# EXECUTOR REGISTRY
# ============================================================

executors = {
    "flutter_android": FlutterAndroidExecutor(),
    "flutter_ios": FlutterIOSExecutor(),
    "flutter_web": FlutterWebExecutor(),
    "react_web": ReactWebExecutor(),
    "nextjs_web": NextJSWebExecutor()
}


# ============================================================
# MAIN BUILD FUNCTION
# ============================================================

async def start_build(
    user: str,
    build_id: str,
    project_path: str,
    build_type: str,
    config: Optional[Dict] = None
):
    """
    Start a build process asynchronously.
    
    Args:
        user: User email
        build_id: Build ID
        project_path: Path to project
        build_type: Type of build (flutter_android, react_web, etc.)
        config: Optional build configuration
    """
    try:
        # Update status to RUNNING
        build_manager.update_build_status(
            user, build_id, "RUNNING"
        )
        
        await build_manager.add_log(
            build_id,
            f"🚀 Starting {build_type} build..."
        )
        
        # WebSocket: Build started
        if WS_ENABLED:
            await ws_build_events.broadcast_status(
                build_id, "RUNNING", progress=0
            )
        
        # Get executor
        executor = executors.get(build_type)
        if not executor:
            raise ValueError(f"Unknown build type: {build_type}")
        
        # Execute build
        result = await executor.execute(
            build_id=build_id,
            project_path=project_path,
            config=config or {},
            log_callback=lambda msg: build_manager.add_log(
                build_id, msg
            )
        )
        
        # Update status to SUCCESS
        build_manager.update_build_status(
            user, build_id, "SUCCESS"
        )
        
        await build_manager.add_log(
            build_id,
            "✅ Build completed successfully"
        )
        
        # WebSocket: Build complete
        if WS_ENABLED:
            artifacts = result.get("artifacts", [])
            await ws_build_events.broadcast_complete(
                build_id, success=True, artifacts=artifacts
            )
        
        return result
        
    except Exception as e:
        # Update status to FAILED
        build_manager.update_build_status(
            user, build_id, "FAILED"
        )
        
        await build_manager.add_log(
            build_id,
            f"❌ Build failed: {str(e)}"
        )
        
        # WebSocket: Build failed
        if WS_ENABLED:
            await ws_build_events.broadcast_error(
                build_id, str(e)
            )
            await ws_build_events.broadcast_complete(
                build_id, success=False
            )
        
        logger.error(f"Build {build_id} failed: {e}")
        raise
