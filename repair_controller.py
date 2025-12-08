#!/usr/bin/env python3
"""
🔧 INTERACTIVE REPAIR CONTROLLER 🔧
Arbeitet mit dir zusammen Fehler für Fehler zu beheben
"""

import json
import os
import subprocess
import sys
from pathlib import Path


class RepairController:
    """Interaktiver Fehler-Reparatur Controller"""
    
    def __init__(self, base_dir="backend"):
        self.base_dir = Path(base_dir)
        self.report_file = Path("error_report.json")
        self.errors = {}
        self.fixed_count = 0
        self.skipped_count = 0
        
    def load_errors(self):
        """Lade Fehler-Report"""
        if not self.report_file.exists():
            print("❌ error_report.json nicht gefunden!")
            print("💡 Führe zuerst aus: python3 error_analyzer.py backend --save")
            return False
        
        with open(self.report_file) as f:
            self.errors = json.load(f)
        
        total = sum(len(v) for v in self.errors.values() if isinstance(v, list))
        print(f"📊 Gefunden: {total} Fehler")
        print(f"   - Syntax: {len(self.errors.get('syntax_errors', []))}")
        print(f"   - Imports: {len(self.errors.get('import_errors', []))}")
        print(f"   - Style: {len(self.errors.get('style_warnings', []))}")
        print(f"   - Type: {len(self.errors.get('type_errors', []))}")
        print(f"   - Code Smells: {len(self.errors.get('code_smells', []))}")
        return True
    
    def auto_fix_imports(self):
        """Automatisch: Entferne unused imports"""
        import_errors = self.errors.get('import_errors', [])
        unused_imports = [e for e in import_errors if 'Unused import' in e.get('message', '')]
        
        if not unused_imports:
            print("✅ Keine unused imports gefunden")
            return
        
        print(f"\n🔧 Fixe {len(unused_imports)} unused imports...")
        
        files_to_fix = set()
        for error in unused_imports:
            file_path = self.base_dir / error['file']
            if file_path.exists():
                files_to_fix.add(file_path)
        
        for file_path in files_to_fix:
            try:
                subprocess.run([
                    "python3", "-m", "autoflake",
                    "--in-place",
                    "--remove-all-unused-imports",
                    str(file_path)
                ], check=False, capture_output=True)
                self.fixed_count += 1
                print(f"✅ {file_path.relative_to(self.base_dir)}")
            except Exception as e:
                print(f"⚠️  {file_path}: {e}")
    
    def auto_fix_style(self):
        """Automatisch: Formatiere mit black & isort"""
        style_warnings = self.errors.get('style_warnings', [])
        
        if not style_warnings:
            print("✅ Keine Style-Warnungen gefunden")
            return
        
        print(f"\n🎨 Formatiere {len(style_warnings)} Style-Probleme...")
        
        files_to_fix = set()
        for error in style_warnings:
            file_path = self.base_dir / error['file']
            if file_path.exists():
                files_to_fix.add(file_path)
        
        for file_path in sorted(files_to_fix):
            try:
                # isort
                subprocess.run([
                    "python3", "-m", "isort",
                    str(file_path)
                ], check=False, capture_output=True)
                
                # black
                subprocess.run([
                    "python3", "-m", "black",
                    "-l", "120",
                    str(file_path)
                ], check=False, capture_output=True)
                
                self.fixed_count += 1
                print(f"✅ {file_path.relative_to(self.base_dir)}")
            except Exception as e:
                print(f"⚠️  {file_path}: {e}")
    
    def show_syntax_errors(self):
        """Zeige Syntax-Fehler für manuelle Bearbeitung"""
        syntax_errors = self.errors.get('syntax_errors', [])
        
        if not syntax_errors:
            print("\n✅ Keine Syntax-Fehler!")
            return
        
        print(f"\n⚠️  {len(syntax_errors)} Syntax-Fehler (manuell beheben):")
        for error in syntax_errors:
            file_path = error['file']
            line = error.get('line', 0)
            message = error.get('message', '')
            print(f"\n📝 {file_path}:{line}")
            print(f"   {message}")
            
            # Zeige betroffenen Code
            full_path = self.base_dir / file_path
            if full_path.exists():
                try:
                    with open(full_path) as f:
                        lines = f.readlines()
                    if 0 < line <= len(lines):
                        print(f"   > {lines[line-1].rstrip()}")
                except:
                    pass
    
    def run(self):
        """Hauptfunktion"""
        print("=" * 70)
        print("🔧 INTERACTIVE REPAIR CONTROLLER")
        print("=" * 70)
        
        if not self.load_errors():
            return 1
        
        # Auto-Fixes
        print("\n" + "=" * 70)
        print("🤖 AUTOMATISCHE FIXES")
        print("=" * 70)
        
        self.auto_fix_imports()
        self.auto_fix_style()
        
        # Manuelle Fixes
        print("\n" + "=" * 70)
        print("👤 MANUELLE FIXES ERFORDERLICH")
        print("=" * 70)
        
        self.show_syntax_errors()
        
        # Zusammenfassung
        print("\n" + "=" * 70)
        print("📊 ZUSAMMENFASSUNG")
        print("=" * 70)
        print(f"✅ Automatisch behoben: {self.fixed_count}")
        print(f"⏭️  Übersprungen: {self.skipped_count}")
        print()
        print("💡 Nächste Schritte:")
        print("   1. Behebe manuelle Syntax-Fehler")
        print("   2. Führe aus: python3 error_analyzer.py backend --save")
        print("   3. Führe aus: python3 repair_controller.py (erneut)")
        
        return 0


if __name__ == "__main__":
    controller = RepairController()
    sys.exit(controller.run())
