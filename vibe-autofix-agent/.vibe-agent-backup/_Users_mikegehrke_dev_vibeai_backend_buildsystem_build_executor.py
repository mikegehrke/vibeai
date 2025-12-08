# -------------------------------------------------------------
# VIBEAI – BUILD EXECUTOR (Live Build Engine + WebSockets)
# -------------------------------------------------------------
import asyncio
import os
import shutil

from admin.notifications.ws_build_events import ws_build_events
from buildsystem.build_manager import build_manager


# -------------------------------------------------------------
# UTILS: LOG WRITE + WS BROADCAST
# -------------------------------------------------------------
async def _log(user, build_id, text):
    """
    Dual logging: File + WebSocket
    """
    # Log in Datei speichern
    await build_manager.add_log(build_id, text)

    # Live an WebSockets senden
    await ws_build_events.broadcast(build_id, text)


# -------------------------------------------------------------
# UTILS: EXECUTE SECURE COMMAND
# -------------------------------------------------------------
async def _run_cmd(cmd, cwd, user, build_id):
    """
    Führt einen Build-Schritt sicher aus:
    - async
    - stdout live ins Log + WebSocket
    - stderr live ins Log + WebSocket
    - kein shell=True (SICHER)
    """

    process = await asyncio.create_subprocess_exec(
        *cmd, cwd=cwd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )

    # Live STDOUT
    while True:
        line = await process.stdout.readline()
        if not line:
            break
        decoded = line.decode(errors="ignore").rstrip()
        await _log(user, build_id, decoded)

    # Live STDERR
    stderr = await process.stderr.read()
    if stderr:
        for row in stderr.decode(errors="ignore").splitlines():
            await _log(user, build_id, f"[ERROR] {row}")

    await process.wait()
    return process.returncode


# -------------------------------------------------------------
# FLUTTER BUILDS
# -------------------------------------------------------------
async def _build_flutter(build_type, project_path, user, build_id):
    await _log(user, build_id, f"⚙️ Starting Flutter {build_type} build...")

    # Commands
    if build_type == "flutter_android":
        cmd = ["flutter", "build", "apk", "--release"]
        output_file = "app-release.apk"
        output_subpath = "build/app/outputs/flutter-apk"

    elif build_type == "flutter_web":
        cmd = ["flutter", "build", "web", "--release"]
        output_file = None  # Directory copy
        output_subpath = "build/web"

    elif build_type == "flutter_ios":
        cmd = ["flutter", "build", "ios", "--release", "--no-codesign"]
        output_file = None
        output_subpath = "build/ios"

    else:
        await _log(user, build_id, f"❌ Unknown Flutter build target: {build_type}")
        return 1

    # Run command
    rc = await _run_cmd(cmd, project_path, user, build_id)
    if rc != 0:
        return rc

    # Copy Final Output
    output_final = os.path.join("build_artifacts", user, build_id, "output")
    os.makedirs(output_final, exist_ok=True)

    if output_file:
        # Single file (APK)
        source = os.path.join(project_path, output_subpath, output_file)
        if os.path.exists(source):
            shutil.copy2(source, output_final)
            await _log(user, build_id, f"✅ Copied {output_file} to output/")
    else:
        # Directory (Web, iOS)
        source = os.path.join(project_path, output_subpath)
        if os.path.exists(source):
            shutil.copytree(source, output_final, dirs_exist_ok=True)
            await _log(user, build_id, "✅ Copied build output/")

    await _log(user, build_id, "✔ Flutter build completed")
    return 0


# -------------------------------------------------------------
# WEB BUILD (React / Next.js / Vue)
# -------------------------------------------------------------
async def _build_web(project_path, user, build_id):
    await _log(user, build_id, "⚙️ Running npm install...")

    rc = await _run_cmd(["npm", "install"], project_path, user, build_id)
    if rc != 0:
        await _log(user, build_id, "❌ npm install failed")
        return rc

    await _log(user, build_id, "⚙️ Running npm run build...")
    rc = await _run_cmd(["npm", "run", "build"], project_path, user, build_id)
    if rc != 0:
        await _log(user, build_id, "❌ npm build failed")
        return rc

    # Output detection
    build_output = os.path.join(project_path, "build")
    if not os.path.exists(build_output):
        build_output = os.path.join(project_path, ".next")
    if not os.path.exists(build_output):
        build_output = os.path.join(project_path, "dist")

    if not os.path.exists(build_output):
        await _log(user, build_id, "⚠️ No build output found (build/.next/dist)")
        return 1

    output_final = os.path.join("build_artifacts", user, build_id, "output")
    shutil.copytree(build_output, output_final, dirs_exist_ok=True)

    await _log(user, build_id, "✔ Web build exported successfully")
    return 0


# -------------------------------------------------------------
# ELECTRON BUILD
# -------------------------------------------------------------
async def _build_electron(project_path, user, build_id):
    await _log(user, build_id, "⚙️ Starting Electron build")

    # NPM install
    rc = await _run_cmd(["npm", "install"], project_path, user, build_id)
    if rc != 0:
        return rc

    # Build
    rc = await _run_cmd(["npm", "run", "dist"], project_path, user, build_id)
    if rc != 0:
        return rc

    dist_path = os.path.join(project_path, "dist")
    if not os.path.exists(dist_path):
        await _log(user, build_id, "❌ No dist/ folder found")
        return 1

    output_final = os.path.join("build_artifacts", user, build_id, "output")
    shutil.copytree(dist_path, output_final, dirs_exist_ok=True)

    await _log(user, build_id, "✔ Electron build ready")
    return 0


# -------------------------------------------------------------
# MAIN BUILD DISPATCHER
# -------------------------------------------------------------
async def start_build(user, build_id, project_path, build_type):
    """
    Der zentrale Build-Dispatcher, der:
    - Status updated
    - Build-Schritte ausführt
    - Fehler abfängt
    - Ergebnisse speichert
    - Live Events pusht
    """

    build_manager.update_build_status(user, build_id, "RUNNING")
    await _log(user, build_id, f"🚀 Build started: {build_type}")

    # WebSocket: Build started
    await ws_build_events.broadcast_status(build_id, "RUNNING", progress=0)

    try:
        # --- Flutter ---
        if build_type in ("flutter_android", "flutter_web", "flutter_ios"):
            rc = await _build_flutter(build_type, project_path, user, build_id)

        # --- Web (React/Next/Vue) ---
        elif build_type in ("react_web", "nextjs_web"):
            rc = await _build_web(project_path, user, build_id)

        # --- Electron ---
        elif build_type == "electron_desktop":
            rc = await _build_electron(project_path, user, build_id)

        else:
            await _log(user, build_id, f"❌ Unknown build type: {build_type}")
            build_manager.update_build_status(user, build_id, "FAILED")
            await ws_build_events.broadcast_error(build_id, f"Unknown build type: {build_type}")
            return

        # Finish
        if rc == 0:
            await _log(user, build_id, "🎉 Build finished successfully!")
            build_manager.update_build_status(user, build_id, "SUCCESS")

            # Get artifacts
            output_path = os.path.join("build_artifacts", user, build_id, "output")
            artifacts = []
            if os.path.exists(output_path):
                for root, _, files in os.walk(output_path):
                    for f in files:
                        rel = os.path.relpath(os.path.join(root, f), output_path)
                        artifacts.append(rel)

            # WebSocket: Success
            await ws_build_events.broadcast_complete(build_id, success=True, artifacts=artifacts)

        else:
            await _log(user, build_id, f"❌ Build failed with code {rc}")
            build_manager.update_build_status(user, build_id, "FAILED")

            # WebSocket: Failed
            await ws_build_events.broadcast_complete(build_id, success=False)

    except Exception as e:
        await _log(user, build_id, f"❌ Exception: {str(e)}")
        build_manager.update_build_status(user, build_id, "FAILED")

        # WebSocket: Error
        await ws_build_events.broadcast_error(build_id, str(e))
        await ws_build_events.broadcast_complete(build_id, success=False)
