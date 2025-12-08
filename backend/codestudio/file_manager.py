# -------------------------------------------------------------
# VIBEAI – FILE MANAGER (Code Studio File Operations)
# -------------------------------------------------------------
import logging
import os
from datetime import datetime
from typing import Dict, List

from codestudio.project_manager import project_manager

logger = logging.getLogger("file_manager")


class FileManager:
    """
    Manage files within Code Studio projects.

    Features:
    - Create/read/update/delete files
    - List project files
    - File metadata tracking
    """

    def create_file(self, user_email: str, project_id: str, filename: str, content: str = "") -> Dict:
        """
        Erstellt neue Datei im Projekt (im files/ Ordner).
        """
        # Get project path
        project_path = project_manager._get_project_path(user_email, project_id)

        # Check if project exists
        if not os.path.exists(project_path):
            raise FileNotFoundError("Project does not exist")

        # Datei im files/ Ordner speichern
        file_path = os.path.join(project_path, "files", filename)

        # Check if file exists
        if os.path.exists(file_path):
            raise FileExistsError(f"File '{filename}' already exists")

        # Sicherstellen, dass das Zielverzeichnis existiert
        dir_path = os.path.dirname(file_path)
        if dir_path and dir_path != os.path.join(project_path, "files"):
            os.makedirs(dir_path, exist_ok=True)

        # Write file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

        # Update project metadata
        metadata = project_manager._load_metadata(user_email, project_id)
        metadata["files"].append(
            {
                "name": filename,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "size": len(content),
            }
        )
        metadata["updated_at"] = datetime.utcnow().isoformat()
        project_manager._save_metadata(user_email, project_id, metadata)

        logger.info("Created file %s in project %s", filename, project_id)

        return {
            "filename": filename,
            "size": len(content),
            "created_at": datetime.utcnow().isoformat(),
        }

    def read_file(self, user_email: str, project_id: str, filename: str) -> str:
        """
        Liest Dateiinhalt aus dem files/ Ordner.
        """
        project_path = project_manager._get_project_path(user_email, project_id)

        if not os.path.exists(project_path):
            raise FileNotFoundError("Project does not exist")

        file_path = os.path.join(project_path, "files", filename)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File '{filename}' not found")

        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def update_file(self, user_email: str, project_id: str, filename: str, content: str) -> Dict:
        """
        Aktualisiert Dateiinhalt im files/ Ordner.
        """
        project_path = project_manager._get_project_path(user_email, project_id)
        file_path = os.path.join(project_path, "files", filename)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File '{filename}' not found")

        # Write updated content
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

        # Update metadata
        metadata = project_manager._load_metadata(user_email, project_id)
        for file_meta in metadata["files"]:
            if file_meta["name"] == filename:
                file_meta["updated_at"] = datetime.utcnow().isoformat()
                file_meta["size"] = len(content)
                break
        metadata["updated_at"] = datetime.utcnow().isoformat()
        project_manager._save_metadata(user_email, project_id, metadata)

        logger.info("Updated file %s in project %s", filename, project_id)

        return {
            "filename": filename,
            "size": len(content),
            "updated_at": datetime.utcnow().isoformat(),
        }

    def delete_file(self, user_email: str, project_id: str, filename: str):
        """
        Löscht Datei aus dem files/ Ordner.
        """
        project_path = project_manager._get_project_path(user_email, project_id)
        file_path = os.path.join(project_path, "files", filename)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File '{filename}' not found")

        # Delete file
        os.remove(file_path)

        # Update metadata
        metadata = project_manager._load_metadata(user_email, project_id)
        metadata["files"] = [f for f in metadata["files"] if f["name"] != filename]
        metadata["updated_at"] = datetime.utcnow().isoformat()
        project_manager._save_metadata(user_email, project_id, metadata)

        logger.info("Deleted file %s from project %s", filename, project_id)

    def list_files(self, user_email: str, project_id: str) -> List[str]:
        """
        Listet alle Dateien im files/ Ordner.
        """
        project_path = project_manager._get_project_path(user_email, project_id)
        files_dir = os.path.join(project_path, "files")

        if not os.path.exists(files_dir):
            return []

        return os.listdir(files_dir)


# ============================================================
# GLOBAL INSTANCE
# ============================================================

file_manager = FileManager()