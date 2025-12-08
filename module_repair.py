#!/usr/bin/env python3
"""
🔧 MODULE REPAIR SYSTEM
Repariert jedes Modul systematisch bis 0 Fehler erreicht sind
"""

import ast
import os
import sys
import traceback
from pathlib import Path
from typing import Dict, List, Tuple


class ModuleRepairer:
    """Repariert Python-Module systematisch"""
    
    def __init__(self, base_dir="backend"):
        self.base_dir = Path(base_dir)
        self.errors = []
        self.fixed_modules = []
        self.broken_modules = []
        
    def test_import(self, module_path: str) -> Tuple[bool, str]:
        """
        Teste ob ein Modul importierbar ist
        Returns: (success, error_message)
        """
        try:
            # Konvertiere Dateipfad zu Import-Pfad
            import_path = module_path.replace('/', '.').replace('.py', '')
            if import_path.startswith('.'):
                import_path = import_path[1:]
            
            __import__(import_path)
            return True, ""
        except Exception as e:
            error = str(e)
            # Extrahiere die wichtigste Fehler-Info
            if "cannot import name" in error:
                missing = error.split("cannot import name '")[1].split("'")[0]
                source = error.split("from '")[1].split("'")[0] if "from '" in error else "unknown"
                return False, f"Missing: {missing} from {source}"
            elif "No module named" in error:
                missing = error.split("No module named '")[1].split("'")[0]
                return False, f"Module not found: {missing}"
            else:
                return False, error[:100]
    
    def check_syntax(self, file_path: Path) -> Tuple[bool, str]:
        """Prüfe Syntax-Fehler"""
        try:
            with open(file_path, 'r') as f:
                ast.parse(f.read())
            return True, ""
        except SyntaxError as e:
            return False, f"Line {e.lineno}: {e.msg}"
        except Exception as e:
            return False, str(e)[:100]
    
    def find_missing_import(self, error_msg: str) -> Dict[str, str]:
        """Analysiere fehlenden Import"""
        info = {
            "type": "unknown",
            "missing": "",
            "source": ""
        }
        
        if "cannot import name" in error_msg:
            info["type"] = "missing_symbol"
            try:
                info["missing"] = error_msg.split("cannot import name '")[1].split("'")[0]
                if "from '" in error_msg:
                    info["source"] = error_msg.split("from '")[1].split("'")[0]
            except:
                pass
        elif "No module named" in error_msg:
            info["type"] = "missing_module"
            try:
                info["missing"] = error_msg.split("No module named '")[1].split("'")[0]
            except:
                pass
        
        return info
    
    def suggest_fix(self, file_path: str, error_msg: str) -> str:
        """Schlage Fix vor"""
        info = self.find_missing_import(error_msg)
        
        if info["type"] == "missing_symbol":
            return f"Add '{info['missing']}' to {info['source']}.py or create it"
        elif info["type"] == "missing_module":
            return f"Create module {info['missing']} or install package"
        else:
            return "Manual fix required"
    
    def scan_all_modules(self) -> List[Dict]:
        """Scanne alle Python-Module"""
        modules = []
        
        for py_file in self.base_dir.rglob("*.py"):
            if "__pycache__" in str(py_file):
                continue
            if py_file.name.startswith("test_"):
                continue
                
            rel_path = py_file.relative_to(self.base_dir)
            
            # Syntax-Check
            syntax_ok, syntax_error = self.check_syntax(py_file)
            
            # Import-Check
            import_ok, import_error = self.test_import(str(rel_path))
            
            status = "OK" if (syntax_ok and import_ok) else "BROKEN"
            
            modules.append({
                "path": str(rel_path),
                "full_path": str(py_file),
                "status": status,
                "syntax_ok": syntax_ok,
                "syntax_error": syntax_error,
                "import_ok": import_ok,
                "import_error": import_error,
                "fix_suggestion": self.suggest_fix(str(rel_path), import_error) if not import_ok else ""
            })
        
        return modules
    
    def generate_report(self, modules: List[Dict]) -> str:
        """Generiere Bericht"""
        ok_modules = [m for m in modules if m["status"] == "OK"]
        broken_modules = [m for m in modules if m["status"] == "BROKEN"]
        
        report = f"""
{'=' * 70}
🔍 MODULE REPAIR REPORT
{'=' * 70}

📊 STATISTIK:
   ✅ Funktionierende Module: {len(ok_modules)}
   ❌ Kaputte Module: {len(broken_modules)}
   📈 Gesamt: {len(modules)}
   🎯 Erfolgsrate: {len(ok_modules)/len(modules)*100:.1f}%

{'=' * 70}
❌ KAPUTTE MODULE (Top 20):
{'=' * 70}
"""
        
        for i, module in enumerate(broken_modules[:20], 1):
            report += f"\n{i}. {module['path']}\n"
            if not module['syntax_ok']:
                report += f"   ❌ Syntax: {module['syntax_error']}\n"
            if not module['import_ok']:
                report += f"   ❌ Import: {module['import_error']}\n"
                report += f"   💡 Fix: {module['fix_suggestion']}\n"
        
        report += f"\n{'=' * 70}\n"
        return report
    
    def save_detailed_report(self, modules: List[Dict], filename="module_errors.json"):
        """Speichere detaillierten Bericht"""
        import json
        
        broken = [m for m in modules if m["status"] == "BROKEN"]
        
        with open(filename, 'w') as f:
            json.dump({
                "total": len(modules),
                "ok": len(modules) - len(broken),
                "broken": len(broken),
                "modules": broken
            }, f, indent=2)
        
        print(f"💾 Detaillierter Bericht: {filename}")


def main():
    """Hauptfunktion"""
    print("🔧 MODULE REPAIR SYSTEM")
    print("=" * 70)
    
    os.chdir("/Users/mikegehrke/dev/vibeai")
    sys.path.insert(0, "/Users/mikegehrke/dev/vibeai/backend")
    
    repairer = ModuleRepairer()
    
    print("🔍 Scanne alle Module...")
    modules = repairer.scan_all_modules()
    
    print("\n📋 Generiere Bericht...")
    report = repairer.generate_report(modules)
    print(report)
    
    repairer.save_detailed_report(modules)
    
    print("\n💡 Nächste Schritte:")
    print("   1. Prüfe module_errors.json für Details")
    print("   2. Fixe Module eins nach dem anderen")
    print("   3. Führe dieses Script erneut aus")


if __name__ == "__main__":
    main()
