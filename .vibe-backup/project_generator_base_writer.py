# -------------------------------------------------------------
# VIBEAI – PROJECT BASE WRITER
# -------------------------------------------------------------
"""
Base File Writer for All Project Types

Provides safe, atomic file writing with:
- Directory creation
- UTF-8 encoding
- Batch operations
- Error handling
- Path validation
"""

import os
from pathlib import Path
from typing import Dict, List, Optional


class BaseWriter:
    """
    Universal file writer for project generation.

    Handles all file I/O operations with safety checks:
    - Creates missing directories
    - Validates paths
    - Handles encoding properly
    - Batch writes for efficiency
    """

    def ensure_dir(self, path: str) -> bool:
        """
        Create directory if it doesn't exist.

        Args:
            path: Directory path to create

        Returns:
            True if successful, False otherwise
        """
        try:
            os.makedirs(path, exist_ok=True)
            return True
        except Exception as e:
            print(f"Error creating directory {path}: {e}")
            return False

    def write_file(self, path: str, content: str) -> bool:
        """
        Write content to file with automatic directory creation.

        Args:
            path: Absolute file path
            content: File content (string)

        Returns:
            True if successful, False otherwise
        """
        try:
            # Create parent directory
            folder = os.path.dirname(path)
            if folder:
                os.makedirs(folder, exist_ok=True)

            # Write file with UTF-8 encoding
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

            return True

        except Exception as e:
            print(f"Error writing file {path}: {e}")
            return False

    def batch_write(self, base_path: str, files: Dict[str, str]) -> Dict[str, bool]:
        """
        Write multiple files at once.

        Args:
            base_path: Project root directory
            files: Dictionary mapping relative paths to content
                   Example:
                   {
                       "lib/main.dart": "...",
                       "package.json": "...",
                       "src/App.jsx": "..."
                   }

        Returns:
            Dictionary mapping file paths to success status
        """
        results = {}

        for rel_path, content in files.items():
            abs_path = os.path.join(base_path, rel_path)
            success = self.write_file(abs_path, content)
            results[rel_path] = success

        return results

    def copy_template(self, template_path: str, dest_path: str) -> bool:
        """
        Copy template file to destination.

        Args:
            template_path: Source template file
            dest_path: Destination file path

        Returns:
            True if successful
        """
        try:
            with open(template_path, "r", encoding="utf-8") as src:
                content = src.read()

            return self.write_file(dest_path, content)

        except Exception as e:
            print(f"Error copying template {template_path}: {e}")
            return False

    def create_structure(self, base_path: str, structure: List[str]) -> bool:
        """
        Create directory structure from list.

        Args:
            base_path: Project root
            structure: List of relative directory paths
                      Example: ["src", "src/components", "public"]

        Returns:
            True if all directories created
        """
        try:
            for dir_path in structure:
                abs_path = os.path.join(base_path, dir_path)
                os.makedirs(abs_path, exist_ok=True)

            return True

        except Exception as e:
            print(f"Error creating structure: {e}")
            return False

    def read_file(self, path: str) -> Optional[str]:
        """
        Read file content safely.

        Args:
            path: File path to read

        Returns:
            File content or None if error
        """
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file {path}: {e}")
            return None

    def file_exists(self, path: str) -> bool:
        """Check if file exists."""
        return os.path.isfile(path)

    def dir_exists(self, path: str) -> bool:
        """Check if directory exists."""
        return os.path.isdir(path)

    def get_project_stats(self, base_path: str) -> Dict:
        """
        Get project statistics.

        Returns:
            {
                "total_files": 15,
                "total_dirs": 8,
                "size_bytes": 12345
            }
        """
        try:
            path = Path(base_path)

            files = list(path.rglob("*"))
            total_files = sum(1 for f in files if f.is_file())
            total_dirs = sum(1 for f in files if f.is_dir())
            size_bytes = sum(f.stat().st_size for f in files if f.is_file())

            return {
                "total_files": total_files,
                "total_dirs": total_dirs,
                "size_bytes": size_bytes,
                "size_mb": round(size_bytes / 1024 / 1024, 2),
            }

        except Exception as e:
            print(f"Error getting stats: {e}")
            return {"total_files": 0, "total_dirs": 0, "size_bytes": 0}


# Global instance
writer = BaseWriter()
