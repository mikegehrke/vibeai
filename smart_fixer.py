#!/usr/bin/env python3
"""
VibeAI Smart Fixer - Intelligente Fehlerkorrektur
Behebt Fehler sicher ohne Dateien zu beschädigen
"""

import os
import subprocess
from pathlib import Path


class SmartFixer:
    """Sichere Fehlerkorrektur"""

    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.ignore_dirs = {
            'node_modules', '__pycache__', '.git', 'venv',
            '.venv', 'build', 'dist', '.next', 'build_artifacts',
            'user_projects'
        }

    def scan_python_files(self):
        """Scanne Python-Dateien"""
        files = []
        for root, dirs, filenames in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            for filename in filenames:
                if filename.endswith('.py'):
                    files.append(Path(root) / filename)
        return files

    def fix_file_safe(self, file_path: Path) -> int:
        """Behebt Fehler sicher"""
        fixes = 0

        # 1. Autoflake - entfernt ungenutzte Imports
        try:
            result = subprocess.run(
                [
                    'python3', '-m', 'autoflake',
                    '--remove-all-unused-imports',
                    '--remove-unused-variables',
                    '--in-place',
                    str(file_path)
                ],
                capture_output=True,
                timeout=10
            )
            if b'fixed' in result.stderr.lower():
                fixes += 1
        except Exception:
            pass

        # 2. isort - sortiert Imports
        try:
            result = subprocess.run(
                [
                    'python3', '-m', 'isort',
                    str(file_path),
                    '--profile', 'black',
                    '--line-length', '88'
                ],
                capture_output=True,
                timeout=10
            )
            if result.returncode == 0:
                fixes += 1
        except Exception:
            pass

        # 3. Black - formatiert Code (mit Fehlerbehandlung)
        try:
            result = subprocess.run(
                [
                    'python3', '-m', 'black',
                    str(file_path),
                    '--line-length', '88',
                    '--skip-string-normalization'
                ],
                capture_output=True,
                timeout=10
            )
            if b'reformatted' in result.stderr.lower():
                fixes += 1
        except Exception:
            pass

        return fixes

    def run(self):
        """Führt sichere Korrektur aus"""
        print("🔧 VibeAI Smart Fixer")
        print(f"📂 {self.project_root}\n")

        files = self.scan_python_files()
        print(f"📁 {len(files)} Python-Dateien gefunden\n")

        total_fixes = 0
        errors = []

        for i, file_path in enumerate(files, 1):
            rel_path = file_path.relative_to(self.project_root)
            print(f"[{i}/{len(files)}] {rel_path}...", end=' ', flush=True)

            try:
                fixes = self.fix_file_safe(file_path)
                total_fixes += fixes
                if fixes > 0:
                    print(f"✅ {fixes}")
                else:
                    print("✓")
            except Exception as e:
                print(f"❌ {e}")
                errors.append((rel_path, str(e)))

        print("\n" + "=" * 60)
        print(f"✨ {total_fixes} Korrekturen durchgeführt")
        if errors:
            print(f"⚠️  {len(errors)} Fehler")
        print("=" * 60)

        if errors:
            print("\nFehler:")
            for path, error in errors[:10]:
                print(f"  - {path}: {error}")


def main():
    """Hauptfunktion"""
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "."
    fixer = SmartFixer(path)
    fixer.run()


if __name__ == '__main__':
    main()
