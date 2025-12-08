# -------------------------------------------------------------
# VIBEAI – ARTIFACT MANAGER
# -------------------------------------------------------------
"""
Artifact Manager - Manages build artifacts and outputs

Capabilities:
- Store build artifacts
- Retrieve artifacts by build_id
- Package artifacts (zip, tar.gz)
- Generate download links
- Clean up old artifacts
"""

import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class ArtifactManager:
    """
    Manages build artifacts and outputs.

    Stores artifacts in organized directory structure:
    /build_artifacts/{build_id}/{artifact_files}
    """

    def __init__(self, base_path: str = "/tmp/vibeai_artifacts"):
        """
        Initialize Artifact Manager.

        Args:
            base_path: Base directory for storing artifacts
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def store_artifact(self, build_id: str, artifact_path: str, artifact_type: str = "apk") -> Dict:
        """
        Store a build artifact.

        Args:
            build_id: Unique build identifier
            artifact_path: Path to the artifact file
            artifact_type: Type of artifact (apk, web, zip, etc.)

        Returns:
            {
                "success": true,
                "artifact_id": "artifact-123",
                "path": "/path/to/artifact",
                "size_bytes": 12345,
                "type": "apk"
            }
        """
        if not os.path.exists(artifact_path):
            return {
                "success": False,
                "error": f"Artifact file not found: {artifact_path}",
            }

        # Create build directory
        build_dir = self.base_path / build_id
        build_dir.mkdir(parents=True, exist_ok=True)

        # Copy artifact to storage
        artifact_name = os.path.basename(artifact_path)
        dest_path = build_dir / artifact_name

        try:
            shutil.copy2(artifact_path, dest_path)

            file_size = os.path.getsize(dest_path)
            artifact_id = f"{build_id}_{artifact_name}"

            return {
                "success": True,
                "artifact_id": artifact_id,
                "path": str(dest_path),
                "size_bytes": file_size,
                "type": artifact_type,
                "stored_at": datetime.utcnow().isoformat(),
            }

        except Exception as e:  # pylint: disable=broad-except
            return {"success": False, "error": f"Failed to store artifact: {str(e)}"}

    def get_artifacts(self, build_id: str) -> List[Dict]:
        """
        Get all artifacts for a build.

        Args:
            build_id: Build identifier

        Returns:
            List of artifact dictionaries
        """
        build_dir = self.base_path / build_id

        if not build_dir.exists():
            return []

        artifacts = []

        try:
            for file_path in build_dir.iterdir():
                if file_path.is_file():
                    artifacts.append(
                        {
                            "artifact_id": f"{build_id}_{file_path.name}",
                            "name": file_path.name,
                            "path": str(file_path),
                            "size_bytes": file_path.stat().st_size,
                            "modified_at": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
                        }
                    )

        except Exception as e:  # pylint: disable=broad-except
            print(f"Error reading artifacts for {build_id}: {e}")

        return artifacts

    def get_artifact(self, build_id: str, artifact_name: str) -> Optional[Dict]:
        """
        Get specific artifact.

        Args:
            build_id: Build identifier
            artifact_name: Artifact filename

        Returns:
            Artifact info or None
        """
        artifact_path = self.base_path / build_id / artifact_name

        if not artifact_path.exists():
            return None

        return {
            "artifact_id": f"{build_id}_{artifact_name}",
            "name": artifact_name,
            "path": str(artifact_path),
            "size_bytes": artifact_path.stat().st_size,
            "modified_at": datetime.fromtimestamp(artifact_path.stat().st_mtime).isoformat(),
        }

    def delete_artifacts(self, build_id: str) -> Dict:
        """
        Delete all artifacts for a build.

        Args:
            build_id: Build identifier

        Returns:
            Success status
        """
        build_dir = self.base_path / build_id

        if not build_dir.exists():
            return {"success": True, "message": "No artifacts found"}

        try:
            shutil.rmtree(build_dir)
            return {
                "success": True,
                "message": f"Deleted artifacts for build {build_id}",
            }

        except Exception as e:  # pylint: disable=broad-except
            return {"success": False, "error": f"Failed to delete artifacts: {str(e)}"}

    def cleanup_old_artifacts(self, days: int = 7) -> Dict:
        """
        Clean up artifacts older than specified days.

        Args:
            days: Delete artifacts older than this many days

        Returns:
            Cleanup summary
        """
        from datetime import timedelta  # noqa: E402

        # pylint: disable=import-outside-toplevel

        cutoff_time = datetime.utcnow() - timedelta(days=days)
        deleted_count = 0

        try:
            for build_dir in self.base_path.iterdir():
                if not build_dir.is_dir():
                    continue

                # Check modification time
                mtime = datetime.fromtimestamp(build_dir.stat().st_mtime)

                if mtime < cutoff_time:
                    shutil.rmtree(build_dir)
                    deleted_count += 1

            return {
                "success": True,
                "deleted_builds": deleted_count,
                "cutoff_days": days,
            }

        except Exception as e:  # pylint: disable=broad-except
            return {
                "success": False,
                "error": f"Cleanup failed: {str(e)}",
                "deleted_builds": deleted_count,
            }

    def get_total_size(self) -> int:
        """
        Get total size of all artifacts in bytes.

        Returns:
            Total size in bytes
        """
        total_size = 0

        try:
            for build_dir in self.base_path.iterdir():
                if build_dir.is_dir():
                    for file_path in build_dir.rglob("*"):
                        if file_path.is_file():
                            total_size += file_path.stat().st_size
        except Exception as e:  # pylint: disable=broad-except
            print(f"Error calculating total size: {e}")

        return total_size

    def list_builds(self) -> List[Dict]:
        """
        List all builds with artifacts.

        Returns:
            List of build summaries
        """
        builds = []

        try:
            for build_dir in self.base_path.iterdir():
                if not build_dir.is_dir():
                    continue

                artifact_count = sum(1 for _ in build_dir.iterdir() if _.is_file())

                total_size = sum(f.stat().st_size for f in build_dir.iterdir() if f.is_file())

                builds.append(
                    {
                        "build_id": build_dir.name,
                        "artifact_count": artifact_count,
                        "total_size_bytes": total_size,
                        "modified_at": datetime.fromtimestamp(build_dir.stat().st_mtime).isoformat(),
                    }
                )

        except Exception as e:  # pylint: disable=broad-except
            print(f"Error listing builds: {e}")

        return builds


# Global instance
artifact_manager = ArtifactManager()