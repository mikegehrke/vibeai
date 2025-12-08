#!/usr/bin/env python3
"""
VibeAI Auto-Fixer Pro - Automatische Fehlerkorrektur mit Watch-Mode
Erkennt und behebt automatisch Fehler während der Entwicklung
"""

import os
import re
import ast
import time
import subprocess
from pathlib import Path
from typing import List
from dataclasses import dataclass
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


@dataclass
class CodeIssue:
    """Repräsentiert ein Code-Problem"""
    file_path: str
    line_number: int
    column: int
    severity: str
    message: str
    code: str
    fix_available: bool = False


class PythonFileHandler(FileSystemEventHandler):
    """Handler für Dateiänderungen"""

    def __init__(self, fixer):
        self.fixer = fixer
        self.last_modified = {}

    def on_modified(self, event):
        if event.is_directory:
            return

        if event.src_path.endswith('.py'):
            # Verhindere doppelte Verarbeitung
            now = time.time()
            if event.src_path in self.last_modified:
                if now - self.last_modified[event.src_path] < 1:
                    return

            self.last_modified[event.src_path] = now
            print(f"\n📝 Datei geändert: {event.src_path}")
            self.fixer.fix_file(Path(event.src_path))


class AutoFixer:
    """Hauptklasse für automatische Fehlerkorrektur"""

    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.issues: List[CodeIssue] = []
        self.fixed_count = 0
        self.python_files: List[Path] = []

        self.ignore_dirs = {
            'node_modules', '__pycache__', '.git', 'venv',
            '.venv', 'build', 'dist', '.next', 'build_artifacts'
        }

    def scan_python_files(self) -> List[Path]:
        """Scannt alle Python-Dateien im Projekt"""
        print("📁 Scanne Python-Dateien...")
        python_files = []

        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]

            for file in files:
                if file.endswith('.py'):
                    file_path = Path(root) / file
                    python_files.append(file_path)

        self.python_files = python_files
        print(f"✅ {len(python_files)} Python-Dateien gefunden")
        return python_files

    def check_syntax(self, file_path: Path) -> List[CodeIssue]:
        """Prüft Syntax-Fehler"""
        issues = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            ast.parse(content)
        except SyntaxError as e:
            issues.append(CodeIssue(
                file_path=str(file_path),
                line_number=e.lineno or 0,
                column=e.offset or 0,
                severity='error',
                message=f"Syntax-Fehler: {e.msg}",
                code='syntax-error',
                fix_available=False
            ))
        except Exception as e:
            issues.append(CodeIssue(
                file_path=str(file_path),
                line_number=0,
                column=0,
                severity='error',
                message=f"Fehler beim Parsen: {str(e)}",
                code='parse-error',
                fix_available=False
            ))
        return issues

    def fix_imports(self, file_path: Path) -> int:
        """Behebt Import-Probleme mit isort"""
        fixes = 0
        try:
            result = subprocess.run(
                ['isort', str(file_path), '--quiet'],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                fixes += 1
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        except Exception:
            pass
        return fixes

    def fix_indentation(self, file_path: Path) -> int:
        """Behebt Einrückungsprobleme"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            if '\t' in content:
                content = content.replace('\t', '    ')
                fixes += 1

            lines = content.split('\n')
            new_lines = []
            for line in lines:
                stripped = line.rstrip()
                if stripped != line:
                    fixes += 1
                new_lines.append(stripped)

            if fixes > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(new_lines))

        except Exception:
            pass

        return fixes

    def fix_unused_imports(self, file_path: Path) -> int:
        """Entfernt ungenutzte Imports"""
        fixes = 0
        try:
            result = subprocess.run(
                [
                    'autoflake',
                    '--remove-all-unused-imports',
                    '--in-place',
                    str(file_path)
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                fixes += 1
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        except Exception:
            pass
        return fixes

    def fix_formatting(self, file_path: Path) -> int:
        """Formatiert Code mit Black"""
        fixes = 0
        try:
            result = subprocess.run(
                ['black', '--quiet', '--line-length', '88', str(file_path)],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                fixes += 1
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        except Exception:
            pass
        return fixes

    def fix_common_issues(self, file_path: Path) -> int:
        """Behebt häufige Code-Probleme"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # Behebe doppelte Leerzeilen
            content = re.sub(r'\n\n\n+', '\n\n', content)

            # Behebe except Exception ohne Variable
            content = re.sub(
                r'except\s+Exception\s*:',
                'except Exception as e:',
                content
            )

            # Entferne trailing whitespace (falls noch vorhanden)
            lines = content.split('\n')
            lines = [line.rstrip() for line in lines]
            content = '\n'.join(lines)

            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixes += 1

        except Exception:
            pass

        return fixes

    def fix_file(self, file_path: Path) -> int:
        """Wendet alle Korrekturen auf eine Datei an"""
        total_fixes = 0

        syntax_issues = self.check_syntax(file_path)
        if syntax_issues:
            for issue in syntax_issues:
                print(f"❌ {file_path}:{issue.line_number} - {issue.message}")
            return 0

        total_fixes += self.fix_indentation(file_path)
        total_fixes += self.fix_common_issues(file_path)
        total_fixes += self.fix_unused_imports(file_path)
        total_fixes += self.fix_imports(file_path)
        total_fixes += self.fix_formatting(file_path)

        if total_fixes > 0:
            rel_path = file_path.relative_to(self.project_root)
            print(f"✅ {rel_path}: {total_fixes} Korrekturen")

        self.fixed_count += total_fixes
        return total_fixes

    def run(self, auto_fix: bool = True):
        """Führt die automatische Fehlerkorrektur aus"""
        print("🚀 VibeAI Auto-Fixer Pro gestartet")
        print(f"📂 Projekt: {self.project_root}")
        print()

        self.scan_python_files()

        if not self.python_files:
            print("⚠️  Keine Python-Dateien gefunden!")
            return

        print()
        print("🔧 Starte Korrektur...")
        print()

        for i, file_path in enumerate(self.python_files, 1):
            rel_path = file_path.relative_to(self.project_root)
            if auto_fix:
                self.fix_file(file_path)

        print()
        print("=" * 60)
        print(f"✨ {self.fixed_count} Korrekturen in {len(self.python_files)} Dateien")
        print("=" * 60)

    def watch(self):
        """Startet Watch-Mode für kontinuierliche Überwachung"""
        print("👀 Watch-Mode aktiviert - überwache Änderungen...")
        print("   Drücke Ctrl+C zum Beenden")
        print()

        event_handler = PythonFileHandler(self)
        observer = Observer()
        observer.schedule(event_handler, str(self.project_root), recursive=True)
        observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            print("\n👋 Watch-Mode beendet")

        observer.join()


def install_tools():
    """Installiert benötigte Tools"""
    print("📦 Installiere benötigte Tools...")
    tools = ['black', 'autoflake', 'isort', 'watchdog']

    for tool in tools:
        try:
            subprocess.run(
                ['pip', 'install', tool],
                capture_output=True,
                text=True,
                timeout=30
            )
            print(f"✅ {tool}")
        except Exception:
            print(f"❌ {tool} - Installation fehlgeschlagen")


def main():
    """Hauptfunktion"""
    import argparse

    parser = argparse.ArgumentParser(
        description='VibeAI Auto-Fixer Pro'
    )
    parser.add_argument(
        'path',
        nargs='?',
        default='.',
        help='Pfad zum Projekt'
    )
    parser.add_argument(
        '--watch',
        action='store_true',
        help='Watch-Mode: Überwache Dateien kontinuierlich'
    )
    parser.add_argument(
        '--install',
        action='store_true',
        help='Installiere benötigte Tools'
    )
    parser.add_argument(
        '--no-fix',
        action='store_true',
        help='Nur Analyse, keine Korrekturen'
    )

    args = parser.parse_args()

    if args.install:
        install_tools()
        return

    fixer = AutoFixer(args.path)

    if args.watch:
        fixer.run(auto_fix=not args.no_fix)
        fixer.watch()
    else:
        fixer.run(auto_fix=not args.no_fix)


if __name__ == '__main__':
    main()
