#!/usr/bin/env python3
"""
Intelligent Error Fixer - Behebt Fehler basierend auf error_report.json
"""

import os
import re
import ast
import json
from pathlib import Path
from typing import Dict, List, Set
import subprocess


class IntelligentFixer:
    """Intelligenter Fehler-Behebierer mit Logik"""
    
    def __init__(self, project_root: str = ".", report_file: str = "error_report.json"):
        self.project_root = Path(project_root).resolve()
        self.report_file = report_file
        self.fixes_applied = 0
        self.errors_by_file = {}
        
    def load_report(self) -> Dict:
        """Lade Error-Report"""
        try:
            with open(self.report_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Report nicht gefunden: {self.report_file}")
            print("   Führe erst 'python3 error_analyzer.py --save' aus")
            return {}
    
    def organize_errors(self, report: Dict):
        """Organisiere Fehler nach Dateien"""
        for error_type in ['syntax_errors', 'import_errors', 'style_warnings', 'code_smells']:
            for error in report.get(error_type, []):
                file_path = error['file']
                if file_path not in self.errors_by_file:
                    self.errors_by_file[file_path] = {
                        'syntax': [],
                        'imports': [],
                        'style': [],
                        'smells': []
                    }
                
                if error_type == 'syntax_errors':
                    self.errors_by_file[file_path]['syntax'].append(error)
                elif error_type == 'import_errors':
                    self.errors_by_file[file_path]['imports'].append(error)
                elif error_type == 'style_warnings':
                    self.errors_by_file[file_path]['style'].append(error)
                elif error_type == 'code_smells':
                    self.errors_by_file[file_path]['smells'].append(error)
    
    def fix_trailing_whitespace(self, file_path: Path) -> int:
        """Entferne trailing whitespace"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                stripped = line.rstrip()
                if stripped != line.rstrip('\n'):
                    fixes += 1
                new_lines.append(stripped + '\n' if line.endswith('\n') else stripped)
            
            if fixes > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
        except Exception as e:
            print(f"  ⚠️  Fehler: {e}")
        
        return fixes
    
    def fix_tabs(self, file_path: Path) -> int:
        """Ersetze Tabs mit Spaces"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if '\t' in content:
                content = content.replace('\t', '    ')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixes = content.count('\t')
        except Exception as e:
            print(f"  ⚠️  Fehler: {e}")
        
        return fixes
    
    def fix_unused_imports(self, file_path: Path) -> int:
        """Entferne ungenutzte Imports mit autoflake"""
        try:
            result = subprocess.run(
                [
                    'python3', '-m', 'autoflake',
                    '--remove-all-unused-imports',
                    '--in-place',
                    str(file_path)
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            if b'fixed' in result.stderr.encode() or result.returncode == 0:
                return 1
        except Exception:
            pass
        return 0
    
    def fix_imports_order(self, file_path: Path) -> int:
        """Sortiere Imports mit isort"""
        try:
            result = subprocess.run(
                [
                    'python3', '-m', 'isort',
                    str(file_path),
                    '--profile', 'black',
                    '--line-length', '88'
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                return 1
        except Exception:
            pass
        return 0
    
    def fix_formatting(self, file_path: Path) -> int:
        """Formatiere mit Black"""
        try:
            result = subprocess.run(
                [
                    'python3', '-m', 'black',
                    str(file_path),
                    '--line-length', '88',
                    '--quiet'
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                return 1
        except Exception:
            pass
        return 0
    
    def fix_broad_exceptions(self, file_path: Path, errors: List[Dict]) -> int:
        """Füge 'as e' zu Exception hinzu"""
        fixes = 0
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Ersetze 'except Exception:' mit 'except Exception as e:'
            pattern = r'except\s+Exception\s*:'
            replacement = 'except Exception as e:'
            
            new_content, count = re.subn(pattern, replacement, content)
            if count > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                fixes = count
        except Exception as e:
            print(f"  ⚠️  Fehler: {e}")
        
        return fixes
    
    def fix_file(self, file_path: str, errors: Dict) -> int:
        """Behebe alle Fehler in einer Datei"""
        full_path = self.project_root / file_path
        total_fixes = 0
        
        print(f"\n📝 {file_path}")
        
        # Syntax-Fehler können nicht automatisch behoben werden
        if errors['syntax']:
            print(f"  ⚠️  {len(errors['syntax'])} Syntax-Fehler (manuell beheben)")
            for err in errors['syntax'][:3]:
                print(f"     Zeile {err['line']}: {err['message']}")
        
        # Style-Fixes
        if errors['style']:
            style_fixes = 0
            style_fixes += self.fix_trailing_whitespace(full_path)
            style_fixes += self.fix_tabs(full_path)
            if style_fixes > 0:
                print(f"  ✅ {style_fixes} Style-Probleme behoben")
                total_fixes += style_fixes
        
        # Import-Fixes
        if errors['imports']:
            import_fixes = 0
            import_fixes += self.fix_unused_imports(full_path)
            import_fixes += self.fix_imports_order(full_path)
            if import_fixes > 0:
                print(f"  ✅ {import_fixes} Import-Probleme behoben")
                total_fixes += import_fixes
        
        # Code-Smell-Fixes
        if errors['smells']:
            smell_fixes = self.fix_broad_exceptions(full_path, errors['smells'])
            if smell_fixes > 0:
                print(f"  ✅ {smell_fixes} Code-Smells behoben")
                total_fixes += smell_fixes
        
        # Finale Formatierung
        if total_fixes > 0:
            format_fix = self.fix_formatting(full_path)
            if format_fix > 0:
                print(f"  ✅ Code formatiert")
        
        return total_fixes
    
    def run(self):
        """Führe intelligente Fehlerbehebung aus"""
        print("🔧 Intelligent Error Fixer")
        print("="*70)
        
        # Lade Report
        report = self.load_report()
        if not report:
            return
        
        # Organisiere Fehler
        self.organize_errors(report)
        
        print(f"\n📊 {len(self.errors_by_file)} Dateien mit Problemen gefunden")
        print("\n🚀 Starte Behebung...\n")
        
        # Behebe Dateien
        for file_path, errors in self.errors_by_file.items():
            fixes = self.fix_file(file_path, errors)
            self.fixes_applied += fixes
        
        # Zusammenfassung
        print("\n" + "="*70)
        print(f"✨ {self.fixes_applied} Probleme behoben!")
        print("="*70)
        
        print("\n💡 Nächste Schritte:")
        print("   1. Führe 'python3 error_analyzer.py' erneut aus")
        print("   2. Prüfe verbleibende Syntax-Fehler manuell")
        print("   3. Teste das Projekt")


def main():
    """Hauptfunktion"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Intelligent Error Fixer')
    parser.add_argument('path', nargs='?', default='.', help='Projekt-Pfad')
    parser.add_argument('--report', default='error_report.json', help='Report-Datei')
    
    args = parser.parse_args()
    
    fixer = IntelligentFixer(args.path, args.report)
    fixer.run()


if __name__ == '__main__':
    main()
