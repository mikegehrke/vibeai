# -------------------------------------------------------------
# VIBEAI – CODE STUDIO PROJECT MANAGER
# -------------------------------------------------------------
import json
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, List

logger = logging.getLogger("project_manager")

# Basis-Verzeichnis für alle User-Projekte - use absolute path
# Get backend directory (codestudio is in backend/codestudio/)
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.getenv("PROJECTS_PATH", os.path.join(_backend_dir, "user_projects"))

# Convert to absolute path if relative
if not os.path.isabs(BASE_DIR):
    BASE_DIR = os.path.abspath(BASE_DIR)

# Stellt sicher, dass das Verzeichnis existiert
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR, exist_ok=True)
    logger.info(f"Created BASE_DIR: {BASE_DIR}")


class ProjectManager:
    """
    Verwaltet Code Studio Projekte:

    - Projekt-Erstellung mit Ordnerstruktur (src/, files/, logs/)
    - Projekt-Laden und Metadaten
    - User-Isolation (jeder sieht nur eigene Projekte)
    - Projektliste pro User
    - Persistenz über Server-Neustart
    """

    def __init__(self, base_path: str = BASE_DIR):
        self.base_path = base_path
        os.makedirs(base_path, exist_ok=True)

    def create_project(
        self,
        user_email: str,
        name: str,
        description: str = "",
        language: str = "python",
    ) -> Dict:
        """
        Erstellt ein neues Projekt mit Standard-Ordnerstruktur:
        - src/ (Quellcode)
        - files/ (Zusatzdateien)
        - logs/ (Execution Logs)
        """
        project_id = str(uuid.uuid4())

        # Create project directory
        project_path = self._get_project_path(user_email, project_id)
        os.makedirs(project_path, exist_ok=True)

        # Standard-Unterverzeichnisse erstellen
        os.makedirs(os.path.join(project_path, "src"), exist_ok=True)
        os.makedirs(os.path.join(project_path, "files"), exist_ok=True)
        os.makedirs(os.path.join(project_path, "logs"), exist_ok=True)

        # Project metadata
        metadata = {
            "id": project_id,
            "name": name,
            "description": description,
            "language": language,
            "owner": user_email,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "files": [],
        }

        # Save metadata
        self._save_metadata(user_email, project_id, metadata)

        logger.info("Created project %s for %s", project_id, user_email)

        return metadata

    def list_projects(self, user_email: str) -> List[Dict]:
        """
        Listet alle Projekte des Users.
        """
        sanitized = self._sanitize_email(user_email)
        user_path = os.path.join(self.base_path, sanitized)

        if not os.path.exists(user_path):
            return []

        projects = []

        for project_id in os.listdir(user_path):
            project_dir = os.path.join(user_path, project_id)

            if os.path.isdir(project_dir):
                try:
                    metadata = self._load_metadata(user_email, project_id)
                    projects.append(metadata)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    logger.warning("Failed to load project %s: %s", project_id, e)

        return projects

    def get_project(self, user_email: str, project_id: str) -> Dict:
        """
        Get project details.
        """
        return self._load_metadata(user_email, project_id)

    def delete_project(self, user_email: str, project_id: str):
        """
        Löscht Projekt und alle darin enthaltenen Dateien.
        """
        import shutil

        project_path = self._get_project_path(user_email, project_id)

        if os.path.exists(project_path):
            shutil.rmtree(project_path)
            logger.info("Deleted project %s for %s", project_id, user_email)
        else:
            raise FileNotFoundError(f"Project {project_id} not found")

    def _get_project_path(self, user_email: str, project_id: str) -> str:
        """
        Get project directory path.
        """
        sanitized_id = self._sanitize_project_id(project_id)
        return os.path.join(self.base_path, self._sanitize_email(user_email), sanitized_id)

    def _get_metadata_path(self, user_email: str, project_id: str) -> str:
        """
        Get metadata file path.
        """
        return os.path.join(self._get_project_path(user_email, project_id), "project.json")

    def _save_metadata(self, user_email: str, project_id: str, metadata: Dict):
        """
        Save project metadata.
        """
        metadata_path = self._get_metadata_path(user_email, project_id)

        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

    def _load_metadata(self, user_email: str, project_id: str) -> Dict:
        """
        Load project metadata.
        """
        metadata_path = self._get_metadata_path(user_email, project_id)

        if not os.path.exists(metadata_path):
            raise FileNotFoundError(f"Project {project_id} not found")

        with open(metadata_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _sanitize_email(self, email: str) -> str:
        """
        Sanitize email for use in filesystem.
        """
        return email.replace("@", "_at_").replace(".", "_")
    
    def _sanitize_project_id(self, project_id: str) -> str:
        """
        Sanitize project_id for use in filesystem.
        Removes/replaces invalid filesystem characters.
        """
        import re
        import unicodedata
        
        # Normalize unicode characters (NFD decomposition)
        sanitized = unicodedata.normalize('NFD', project_id)
        
        # Replace German umlauts with ASCII equivalents
        umlaut_map = {
            'ä': 'ae', 'ö': 'oe', 'ü': 'ue',
            'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
            'ß': 'ss'
        }
        for umlaut, replacement in umlaut_map.items():
            sanitized = sanitized.replace(umlaut, replacement)
        
        # Remove diacritics (accents) from remaining characters
        sanitized = ''.join(c for c in sanitized if unicodedata.category(c) != 'Mn')
        
        # Replace problematic characters
        invalid_chars = ['<', '>', ':', '"', '|', '?', '*', '\x00', '/', '\\']
        for char in invalid_chars:
            sanitized = sanitized.replace(char, '_')
        
        # Replace spaces with hyphens
        sanitized = sanitized.replace(' ', '-')
        
        # Remove leading/trailing dots, spaces, and hyphens
        sanitized = sanitized.strip('. -')
        
        # Remove multiple consecutive hyphens/underscores
        sanitized = re.sub(r'[-_]+', '-', sanitized)
        
        # Limit length to avoid filesystem issues
        if len(sanitized) > 200:
            sanitized = sanitized[:200]
        
        # Ensure it's not empty
        if not sanitized:
            sanitized = "project"
        
        return sanitized

    def get_project_path(self, user_email: str, project_id: str) -> str:
        """
        Get project directory path (public method).
        """
        return self._get_project_path(user_email, project_id)

    def save_files_to_project(self, user_email: str, project_id: str, files: List[Dict]) -> bool:
        """
        Speichert Dateien physisch im Projekt-Verzeichnis.
        
        Args:
            user_email: User-Email
            project_id: Projekt-ID
            files: Liste von Dateien mit 'path' und 'content'
            
        Returns:
            True wenn erfolgreich
        """
        project_path = self.get_project_path(user_email, project_id)
        
        # Erstelle Projekt-Verzeichnis falls nicht vorhanden
        os.makedirs(project_path, exist_ok=True)
        
        for file_info in files:
            file_path = file_info.get("path", "")
            content = file_info.get("content", "")
            
            if not file_path:
                continue
            
            # Normalisiere Pfad (entferne führendes /)
            if file_path.startswith("/"):
                file_path = file_path[1:]
            
            # Vollständiger Pfad
            full_path = os.path.join(project_path, file_path)
            
            # Erstelle Verzeichnisse falls nötig
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Speichere Datei
            try:
                with open(full_path, "w", encoding="utf-8") as f:
                    f.write(content)
                logger.info(f"Saved file: {full_path}")
            except Exception as e:
                logger.error(f"Error saving file {full_path}: {e}")
                return False
        
        return True


# ============================================================
# GLOBAL INSTANCE
# ============================================================

project_manager = ProjectManager()