#!/usr/bin/env python3
"""
VibeAI Auto-Fixer - Automatische Fehlerkorrektur
Erkennt und behebt automatisch Fehler, Warnungen und Code-Style-Probleme
"""

import os
import re
import ast
import sys
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple, Set
from dataclasses import dataclass

@dataclass
class CodeIssue:
    """Repräsentiert ein Code-Problem"""
    file_path: str
    line_number: int
    column: int
    severity: str  # error, warning, info
    message: str
    code: str
    fix_available: bool = False

class AutoFixer:
    """Hauptklasse für automatische Fehlerkorrektur"""
    
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.issues: List[CodeIssue] = []
        self.fixed_count = 0
        self.python_files: List[Path] = []
        
        # Ignorierte Verzeichnisse
        self.ignore_dirs = {
            'node_modules', '__pycache__', '.git', 'venv', 
            '.venv', 'build', 'dist', '.next', 'build_artifacts'
        }
        
    def scan_python_files(self) -> List[Path]:
        """Scannt alle Python-Dateien im Projekt"""
        print("📁 Scanne Python-Dateien...")
        python_files = []
        
        for root, dirs, files in os.walk(self.project_root):
            # Ignoriere bestimmte Verzeichnisse
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
        """Behebt Import-Probleme"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            imports_section = []
            in_imports = False
            
            for i, line in enumerate(lines):
                stripped = line.strip()
                
                # Import-Zeilen sammeln
                if stripped.startswith('import ') or stripped.startswith('from '):
                    in_imports = True
                    imports_section.append(line)
                    continue
                elif in_imports and stripped == '':
                    # Leere Zeile nach Imports
                    in_imports = False
                    # Sortiere und dedupliziere Imports
                    if imports_section:
                        unique_imports = list(dict.fromkeys(imports_section))
                        # Sortiere: erst 'from', dann 'import'
                        from_imports = sorted([x for x in unique_imports if x.strip().startswith('from')])
                        direct_imports = sorted([x for x in unique_imports if x.strip().startswith('import')])
                        new_lines.extend(from_imports)
                        new_lines.extend(direct_imports)
                        new_lines.append('\n')
                        imports_section = []
                        fixes += 1
                    continue
                elif in_imports and not (stripped.startswith('import ') or stripped.startswith('from ')):
                    # Ende der Import-Section
                    in_imports = False
                    if imports_section:
                        unique_imports = list(dict.fromkeys(imports_section))
                        from_imports = sorted([x for x in unique_imports if x.strip().startswith('from')])
                        direct_imports = sorted([x for x in unique_imports if x.strip().startswith('import')])
                        new_lines.extend(from_imports)
                        new_lines.extend(direct_imports)
                        new_lines.append('\n')
                        imports_section = []
                        fixes += 1
                
                new_lines.append(line)
            
            # Schreibe zurück wenn Änderungen vorgenommen wurden
            if fixes > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                    
        except Exception as e:
            print(f"⚠️  Fehler beim Fixen von Imports in {file_path}: {e}")
        
        return fixes
    
    def fix_indentation(self, file_path: Path) -> int:
        """Behebt Einrückungsprobleme"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Ersetze Tabs durch 4 Leerzeichen
            if '\t' in content:
                content = content.replace('\t', '    ')
                fixes += 1
            
            # Entferne trailing whitespace
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
                    
        except Exception as e:
            print(f"⚠️  Fehler beim Fixen von Einrückungen in {file_path}: {e}")
        
        return fixes
    
    def fix_line_length(self, file_path: Path, max_length: int = 88) -> int:
        """Behebt zu lange Zeilen (wo möglich)"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            for i, line in enumerate(lines):
                if len(line.rstrip()) > max_length:
                    # Versuche Import-Zeilen zu splitten
                    if 'import ' in line:
                        # Versuche Multi-Import zu splitten
                        if ',' in line and 'from ' in line:
                            match = re.match(r'from\s+(\S+)\s+import\s+(.+)', line.strip())
                            if match:
                                module = match.group(1)
                                items = [item.strip() for item in match.group(2).split(',')]
                                if len(items) > 1:
                                    indent = len(line) - len(line.lstrip())
                                    new_lines.append(' ' * indent + f'from {module} import (\n')
                                    for item in items:
                                        new_lines.append(' ' * (indent + 4) + f'{item},\n')
                                    new_lines.append(' ' * indent + ')\n')
                                    fixes += 1
                                    continue
                
                new_lines.append(line)
            
            if fixes > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                    
        except Exception as e:
            print(f"⚠️  Fehler beim Fixen von Zeilenlängen in {file_path}: {e}")
        
        return fixes
    
    def fix_unused_imports(self, file_path: Path) -> int:
        """Entfernt ungenutzte Imports"""
        fixes = 0
        try:
            # Verwende autoflake wenn verfügbar
            result = subprocess.run(
                ['autoflake', '--remove-all-unused-imports', '--in-place', str(file_path)],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                fixes += 1
        except FileNotFoundError:
            # autoflake nicht installiert
            pass
        except Exception as e:
            print(f"⚠️  Fehler beim Entfernen ungenutzter Imports in {file_path}: {e}")
        
        return fixes
    
    def fix_formatting(self, file_path: Path) -> int:
        """Formatiert Code mit Black"""
        fixes = 0
        try:
            result = subprocess.run(
                ['black', '--quiet', str(file_path)],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                fixes += 1
        except FileNotFoundError:
            # Black nicht installiert
            pass
        except Exception as e:
            print(f"⚠️  Fehler beim Formatieren mit Black in {file_path}: {e}")
        
        return fixes
    
    def fix_common_issues(self, file_path: Path) -> int:
        """Behebt häufige Code-Probleme"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Behebe doppelte Leerzeilen (mehr als 2)
            content = re.sub(r'\n\n\n+', '\n\n', content)
            
            # Behebe fehlende Leerzeilen vor Klassendefinitionen
            content = re.sub(r'([^\n])\n(class\s+\w+)', r'\1\n\n\2', content)
            
            # Behebe fehlende Leerzeilen vor Funktionsdefinitionen (auf Modulebene)
            content = re.sub(r'^([^\n])\n(def\s+\w+)', r'\1\n\n\2', content, flags=re.MULTILINE)
            
            # Behebe except Exception (zu generell) -> except Exception as e
            content = re.sub(
                r'except\s+Exception\s*:',
                'except Exception as e:',
                content
            )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixes += 1
                
        except Exception as e:
            print(f"⚠️  Fehler beim Fixen häufiger Probleme in {file_path}: {e}")
        
        return fixes
    
    def add_missing_docstrings(self, file_path: Path) -> int:
        """Fügt fehlende Docstrings hinzu"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse AST
            tree = ast.parse(content)
            
            lines = content.split('\n')
            insertions = []  # (line_number, docstring)
            
            for node in ast.walk(tree):
                # Prüfe Funktionen und Klassen
                if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.AsyncFunctionDef)):
                    # Prüfe ob Docstring fehlt
                    has_docstring = (
                        node.body and 
                        isinstance(node.body[0], ast.Expr) and 
                        isinstance(node.body[0].value, ast.Constant) and
                        isinstance(node.body[0].value.value, str)
                    )
                    
                    if not has_docstring and node.lineno > 0:
                        # Finde Einrückung
                        def_line = lines[node.lineno - 1]
                        indent = len(def_line) - len(def_line.lstrip())
                        
                        # Erstelle Docstring
                        if isinstance(node, ast.ClassDef):
                            docstring = f'{" " * (indent + 4)}"""TODO: Add class docstring"""'
                        else:
                            docstring = f'{" " * (indent + 4)}"""TODO: Add function docstring"""'
                        
                        insertions.append((node.lineno, docstring))
            
            # Füge Docstrings ein (von hinten nach vorne)
            for line_num, docstring in sorted(insertions, reverse=True):
                lines.insert(line_num, docstring)
                fixes += 1
            
            if fixes > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(lines))
                    
        except Exception as e:
            print(f"⚠️  Fehler beim Hinzufügen von Docstrings in {file_path}: {e}")
        
        return fixes
    
    def fix_file(self, file_path: Path) -> int:
        """Wendet alle Korrekturen auf eine Datei an"""
        total_fixes = 0
        
        # Syntax-Check
        syntax_issues = self.check_syntax(file_path)
        if syntax_issues:
            for issue in syntax_issues:
                print(f"❌ Syntax-Fehler in {file_path}:{issue.line_number} - {issue.message}")
            return 0
        
        # Wende Korrekturen an
        total_fixes += self.fix_indentation(file_path)
        total_fixes += self.fix_imports(file_path)
        total_fixes += self.fix_line_length(file_path)
        total_fixes += self.fix_common_issues(file_path)
        total_fixes += self.fix_unused_imports(file_path)
        total_fixes += self.fix_formatting(file_path)
        
        return total_fixes
    
    def run(self, auto_fix: bool = True):
        """Führt die automatische Fehlerkorrektur aus"""
        print("🚀 VibeAI Auto-Fixer gestartet")
        print(f"📂 Projekt-Root: {self.project_root}")
        print()
        
        # Scanne Dateien
        self.scan_python_files()
        
        if not self.python_files:
            print("⚠️  Keine Python-Dateien gefunden!")
            return
        
        print()
        print("🔧 Starte automatische Korrektur...")
        print()
        
        # Fixe jede Datei
        for i, file_path in enumerate(self.python_files, 1):
            rel_path = file_path.relative_to(self.project_root)
            print(f"[{i}/{len(self.python_files)}] {rel_path}...", end=' ')
            
            if auto_fix:
                fixes = self.fix_file(file_path)
                self.fixed_count += fixes
                if fixes > 0:
                    print(f"✅ {fixes} Korrekturen")
                else:
                    print("✓")
            else:
                print("⏭️  Übersprungen (auto_fix=False)")
        
        print()
        print("=" * 60)
        print(f"✨ Fertig! {self.fixed_count} Korrekturen in {len(self.python_files)} Dateien")
        print("=" * 60)
        
        # Installationshinweise
        print()
        print("💡 Für optimale Ergebnisse installiere:")
        print("   pip install black autoflake isort pylint")

def main():
    """Hauptfunktion"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='VibeAI Auto-Fixer - Automatische Fehlerkorrektur'
    )
    parser.add_argument(
        'path',
        nargs='?',
        default='.',
        help='Pfad zum Projekt (Standard: aktuelles Verzeichnis)'
    )
    parser.add_argument(
        '--no-fix',
        action='store_true',
        help='Nur Analyse, keine Korrekturen'
    )
    
    args = parser.parse_args()
    
    fixer = AutoFixer(args.path)
    fixer.run(auto_fix=not args.no_fix)

if __name__ == '__main__':
    main()
