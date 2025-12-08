#!/usr/bin/env python3
"""
Error Analyzer - Listet alle Fehler, Warnungen und Code-Probleme auf
"""

import os
import ast
import subprocess
from pathlib import Path
from typing import List, Dict, Set
from dataclasses import dataclass, field
import json


@dataclass
class Issue:
    """Repräsentiert ein Code-Problem"""
    file: str
    line: int
    column: int
    severity: str  # error, warning, info
    code: str
    message: str
    rule: str = ""


@dataclass
class AnalysisReport:
    """Gesamtbericht der Analyse"""
    syntax_errors: List[Issue] = field(default_factory=list)
    import_errors: List[Issue] = field(default_factory=list)
    style_warnings: List[Issue] = field(default_factory=list)
    type_errors: List[Issue] = field(default_factory=list)
    code_smells: List[Issue] = field(default_factory=list)
    
    @property
    def total_issues(self) -> int:
        return (len(self.syntax_errors) + len(self.import_errors) + 
                len(self.style_warnings) + len(self.type_errors) + 
                len(self.code_smells))
    
    def print_summary(self):
        """Drucke Zusammenfassung"""
        print("\n" + "="*70)
        print("📊 FEHLER-ANALYSE BERICHT")
        print("="*70)
        print(f"❌ Syntax-Fehler:        {len(self.syntax_errors)}")
        print(f"📦 Import-Probleme:      {len(self.import_errors)}")
        print(f"⚠️  Style-Warnungen:      {len(self.style_warnings)}")
        print(f"🔍 Type-Fehler:          {len(self.type_errors)}")
        print(f"💡 Code-Smells:          {len(self.code_smells)}")
        print(f"📈 GESAMT:               {self.total_issues}")
        print("="*70)


class ErrorAnalyzer:
    """Analysiert alle Fehler im Projekt"""
    
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.report = AnalysisReport()
        self.ignore_dirs = {
            'node_modules', '__pycache__', '.git', 'venv',
            '.venv', 'build', 'dist', '.next', 'build_artifacts'
        }
    
    def scan_files(self) -> List[Path]:
        """Scanne alle Python-Dateien"""
        files = []
        for root, dirs, filenames in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            for filename in filenames:
                if filename.endswith('.py'):
                    files.append(Path(root) / filename)
        return files
    
    def check_syntax(self, file_path: Path):
        """Prüfe Syntax-Fehler"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            ast.parse(content)
        except SyntaxError as e:
            self.report.syntax_errors.append(Issue(
                file=str(file_path.relative_to(self.project_root)),
                line=e.lineno or 0,
                column=e.offset or 0,
                severity='error',
                code='E001',
                message=e.msg or "Syntax error",
                rule='syntax'
            ))
        except Exception as e:
            self.report.syntax_errors.append(Issue(
                file=str(file_path.relative_to(self.project_root)),
                line=0,
                column=0,
                severity='error',
                code='E002',
                message=f"Parse error: {str(e)}",
                rule='parse'
            ))
    
    def check_imports(self, file_path: Path):
        """Prüfe Import-Probleme"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                tree = ast.parse(f.read())
            
            imports = set()
            used_names = set()
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        name = alias.asname if alias.asname else alias.name
                        imports.add(name)
                elif isinstance(node, ast.ImportFrom):
                    for alias in node.names:
                        name = alias.asname if alias.asname else alias.name
                        imports.add(name)
                elif isinstance(node, ast.Name):
                    used_names.add(node.id)
            
            # Finde ungenutzte Imports
            unused = imports - used_names
            for name in unused:
                self.report.import_errors.append(Issue(
                    file=str(file_path.relative_to(self.project_root)),
                    line=0,
                    column=0,
                    severity='warning',
                    code='W001',
                    message=f"Unused import: {name}",
                    rule='unused-import'
                ))
        except Exception:
            pass
    
    def check_style(self, file_path: Path):
        """Prüfe Code-Style Probleme"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines, 1):
                # Trailing whitespace
                if line.rstrip() != line.rstrip('\n'):
                    self.report.style_warnings.append(Issue(
                        file=str(file_path.relative_to(self.project_root)),
                        line=i,
                        column=len(line.rstrip()),
                        severity='info',
                        code='S001',
                        message="Trailing whitespace",
                        rule='trailing-whitespace'
                    ))
                
                # Tabs statt Spaces
                if '\t' in line:
                    self.report.style_warnings.append(Issue(
                        file=str(file_path.relative_to(self.project_root)),
                        line=i,
                        column=line.index('\t'),
                        severity='warning',
                        code='S002',
                        message="Tab character found (use spaces)",
                        rule='no-tabs'
                    ))
                
                # Zeile zu lang
                if len(line.rstrip()) > 88:
                    self.report.style_warnings.append(Issue(
                        file=str(file_path.relative_to(self.project_root)),
                        line=i,
                        column=88,
                        severity='info',
                        code='S003',
                        message=f"Line too long ({len(line.rstrip())} > 88)",
                        rule='line-too-long'
                    ))
        except Exception:
            pass
    
    def check_code_smells(self, file_path: Path):
        """Prüfe Code-Smells"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                tree = ast.parse(content)
                lines = content.split('\n')
            
            for node in ast.walk(tree):
                # Zu generelle Exception
                if isinstance(node, ast.ExceptHandler):
                    if node.type and isinstance(node.type, ast.Name):
                        if node.type.id == 'Exception':
                            self.report.code_smells.append(Issue(
                                file=str(file_path.relative_to(self.project_root)),
                                line=node.lineno,
                                column=node.col_offset,
                                severity='info',
                                code='C001',
                                message="Catching too general exception 'Exception'",
                                rule='broad-exception'
                            ))
                
                # Fehlende Docstrings
                if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                    has_docstring = (
                        node.body and 
                        isinstance(node.body[0], ast.Expr) and 
                        isinstance(node.body[0].value, ast.Constant) and
                        isinstance(node.body[0].value.value, str)
                    )
                    if not has_docstring and not node.name.startswith('_'):
                        self.report.code_smells.append(Issue(
                            file=str(file_path.relative_to(self.project_root)),
                            line=node.lineno,
                            column=node.col_offset,
                            severity='info',
                            code='C002',
                            message=f"Missing docstring for {node.__class__.__name__} '{node.name}'",
                            rule='missing-docstring'
                        ))
        except Exception:
            pass
    
    def analyze(self):
        """Führe vollständige Analyse durch"""
        print("🔍 Starte Fehler-Analyse...")
        files = self.scan_files()
        print(f"📁 {len(files)} Python-Dateien gefunden\n")
        
        for i, file_path in enumerate(files, 1):
            rel_path = file_path.relative_to(self.project_root)
            print(f"[{i}/{len(files)}] {rel_path}", end='\r')
            
            self.check_syntax(file_path)
            self.check_imports(file_path)
            self.check_style(file_path)
            self.check_code_smells(file_path)
        
        print("\n")
        self.report.print_summary()
        
        return self.report
    
    def save_report(self, filename: str = "error_report.json"):
        """Speichere Bericht als JSON"""
        data = {
            'syntax_errors': [
                {
                    'file': e.file,
                    'line': e.line,
                    'column': e.column,
                    'code': e.code,
                    'message': e.message,
                    'rule': e.rule
                } for e in self.report.syntax_errors
            ],
            'import_errors': [
                {
                    'file': e.file,
                    'line': e.line,
                    'code': e.code,
                    'message': e.message,
                    'rule': e.rule
                } for e in self.report.import_errors
            ],
            'style_warnings': [
                {
                    'file': e.file,
                    'line': e.line,
                    'column': e.column,
                    'code': e.code,
                    'message': e.message,
                    'rule': e.rule
                } for e in self.report.style_warnings
            ],
            'code_smells': [
                {
                    'file': e.file,
                    'line': e.line,
                    'code': e.code,
                    'message': e.message,
                    'rule': e.rule
                } for e in self.report.code_smells
            ]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f"\n💾 Bericht gespeichert: {filename}")
    
    def print_details(self, max_per_type: int = 10):
        """Drucke Details der Fehler"""
        print("\n" + "="*70)
        print("❌ SYNTAX-FEHLER (Top {})".format(min(max_per_type, len(self.report.syntax_errors))))
        print("="*70)
        for issue in self.report.syntax_errors[:max_per_type]:
            print(f"  {issue.file}:{issue.line} - {issue.message}")
        
        if self.report.import_errors:
            print("\n" + "="*70)
            print("📦 IMPORT-PROBLEME (Top {})".format(min(max_per_type, len(self.report.import_errors))))
            print("="*70)
            for issue in self.report.import_errors[:max_per_type]:
                print(f"  {issue.file} - {issue.message}")
        
        if self.report.style_warnings:
            print("\n" + "="*70)
            print("⚠️  STYLE-WARNUNGEN (Top {})".format(min(max_per_type, len(self.report.style_warnings))))
            print("="*70)
            for issue in self.report.style_warnings[:max_per_type]:
                print(f"  {issue.file}:{issue.line} - {issue.message}")


def main():
    """Hauptfunktion"""
    import argparse
    
    parser = argparse.ArgumentParser(description='VibeAI Error Analyzer')
    parser.add_argument('path', nargs='?', default='.', help='Projekt-Pfad')
    parser.add_argument('--save', action='store_true', help='Speichere Report als JSON')
    parser.add_argument('--details', action='store_true', help='Zeige Details')
    
    args = parser.parse_args()
    
    analyzer = ErrorAnalyzer(args.path)
    report = analyzer.analyze()
    
    if args.details:
        analyzer.print_details()
    
    if args.save:
        analyzer.save_report()


if __name__ == '__main__':
    main()
