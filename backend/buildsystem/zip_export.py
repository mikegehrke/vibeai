# -------------------------------------------------------------
# VIBEAI – ZIP EXPORT (Build Artifact Packing)
# -------------------------------------------------------------
"""
ZIP Export System für Build Artifacts

Funktionen:
- Build-Ordner als ZIP packen
- Einzelne Dateien oder ganze Strukturen exportieren
- Perfekt für iOS/Android/Web/Electron Builds
- Saubere Temporär-Dateien Verwaltung

Verwendung:
    zip_path = create_zip_from_directory("/path/to/build", "/path/to/output.zip")
    zip_path = create_zip_from_files([file1, file2], "/path/to/output.zip")
"""

import os
import shutil
import tempfile
import zipfile
from typing import List


def create_zip_from_directory(source_dir: str, output_zip_path: str) -> str:
    """
    Zippt den kompletten Build-Output-Ordner.

    Args:
        source_dir: Quell-Verzeichnis mit Build-Artifacts
        output_zip_path: Ziel-Pfad für ZIP-Datei (mit .zip Extension)

    Returns:
        str: Pfad zur erstellten ZIP-Datei

    Raises:
        FileNotFoundError: Wenn source_dir nicht existiert
        PermissionError: Wenn keine Schreibrechte für output_zip_path
    """
    if not os.path.exists(source_dir):
        raise FileNotFoundError(f"Source directory not found: {source_dir}")

    if not os.path.isdir(source_dir):
        raise ValueError(f"Source path is not a directory: {source_dir}")

    # Ziel-Verzeichnis erstellen
    base_dir = os.path.dirname(output_zip_path)
    if base_dir:
        os.makedirs(base_dir, exist_ok=True)

    # ZIP erstellen (shutil macht saubere ZIP-Dateien)
    zip_base = output_zip_path.replace(".zip", "")
    shutil.make_archive(base_name=zip_base, format="zip", root_dir=source_dir)

    # Stelle sicher dass .zip Extension vorhanden ist
    final_path = f"{zip_base}.zip"

    return final_path


def create_zip_from_files(file_paths: List[str], output_zip_path: str, base_dir: str = None) -> str:
    """
    Erstellt ZIP aus einer Liste von Dateien.

    Args:
        file_paths: Liste von Datei-Pfaden zum Packen
        output_zip_path: Ziel-Pfad für ZIP-Datei
        base_dir: Optionaler Basis-Pfad für relative Pfade im ZIP

    Returns:
        str: Pfad zur erstellten ZIP-Datei
    """
    # Ziel-Verzeichnis erstellen
    base_output_dir = os.path.dirname(output_zip_path)
    if base_output_dir:
        os.makedirs(base_output_dir, exist_ok=True)

    # ZIP erstellen
    with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in file_paths:
            if not os.path.exists(file_path):
                print(f"Warning: File not found, skipping: {file_path}")
                continue

            # Berechne Pfad im ZIP
            if base_dir:
                arcname = os.path.relpath(file_path, base_dir)
            else:
                arcname = os.path.basename(file_path)

            zipf.write(file_path, arcname=arcname)

    return output_zip_path


def create_build_artifact_zip(build_id: str, artifacts_dir: str, output_dir: str = None) -> str:
    """
    Erstellt ZIP für Build-Artifacts mit Standard-Naming.

    Args:
        build_id: Eindeutige Build-ID
        artifacts_dir: Verzeichnis mit Build-Outputs
        output_dir: Optionales Ziel-Verzeichnis (default: artifacts_dir)

    Returns:
        str: Pfad zur erstellten ZIP-Datei
    """
    if output_dir is None:
        output_dir = artifacts_dir

    output_zip = os.path.join(output_dir, f"build_{build_id}.zip")

    return create_zip_from_directory(artifacts_dir, output_zip)


def create_temp_zip(source_dir: str) -> str:
    """
    Erstellt temporäre ZIP-Datei für Downloads.

    Args:
        source_dir: Quell-Verzeichnis zum Packen

    Returns:
        str: Pfad zur temporären ZIP-Datei

    Note:
        Caller ist verantwortlich für Cleanup der temp-Datei
    """
    temp_dir = tempfile.gettempdir()
    temp_zip = os.path.join(temp_dir, f"vibeai_build_{os.path.basename(source_dir)}.zip")

    return create_zip_from_directory(source_dir, temp_zip)


def get_zip_size(zip_path: str) -> int:
    """
    Gibt Größe der ZIP-Datei in Bytes zurück.

    Args:
        zip_path: Pfad zur ZIP-Datei

    Returns:
        int: Dateigröße in Bytes
    """
    if not os.path.exists(zip_path):
        return 0

    return os.path.getsize(zip_path)


def cleanup_temp_zip(zip_path: str) -> bool:
    """
    Löscht temporäre ZIP-Datei.

    Args:
        zip_path: Pfad zur ZIP-Datei

    Returns:
        bool: True wenn erfolgreich gelöscht
    """
    try:
        if os.path.exists(zip_path):
            os.remove(zip_path)
            return True
    except Exception as e:
        print(f"Error cleaning up zip: {e}")

    return False