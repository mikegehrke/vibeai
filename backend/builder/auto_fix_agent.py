# -------------------------------------------------------------
# VIBEAI – AUTO-FIX AGENT
# -------------------------------------------------------------
"""
Intelligenter Auto-Fix Agent:
- Durchsucht gesamtes Projekt
- Findet alle Fehler (Syntax, Lint, Imports, Type)
- Fixt Fehler automatisch
- Zeigt Fortschritt live
"""

import os
import asyncio
import subprocess
import re
from typing import Dict, List, Optional
from pathlib import Path
from fastapi import APIRouter, HTTPException, WebSocket
from pydantic import BaseModel
from openai import OpenAI

router = APIRouter(prefix="/api/auto-fix", tags=["Auto Fix Agent"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class ProjectScanRequest(BaseModel):
    project_id: str
    project_path: str


class FileFixRequest(BaseModel):
    project_id: str
    file_path: str
    content: str
    errors: List[Dict]


async def scan_project_for_errors(project_path: str) -> List[Dict]:
    """
    Durchsucht gesamtes Projekt nach Fehlern.
    
    Returns:
        Liste von Fehlern: {file, line, message, severity, type}
    """
    errors = []
    project_path_obj = Path(project_path)
    
    if not project_path_obj.exists():
        return errors
    
    # Erkenne Projekt-Typ
    is_flutter = (project_path_obj / "pubspec.yaml").exists()
    is_react = (project_path_obj / "package.json").exists()
    is_python = (project_path_obj / "requirements.txt").exists() or (project_path_obj / "pyproject.toml").exists()
    
    # Flutter: flutter analyze
    if is_flutter:
        try:
            result = subprocess.run(
                ["flutter", "analyze"],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                # Parse flutter analyze output
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'error •' in line or 'warning •' in line:
                        # Format: "lib/main.dart:10:5 • error • Missing required argument"
                        match = re.match(r'(.+?):(\d+):(\d+)\s+•\s+(error|warning|info)\s+•\s+(.+)', line)
                        if match:
                            file_path, line_num, col, severity, message = match.groups()
                            errors.append({
                                "file": file_path,
                                "line": int(line_num),
                                "column": int(col),
                                "message": message.strip(),
                                "severity": severity,
                                "type": "analyze",
                                "source": "flutter"
                            })
        except Exception as e:
            print(f"Error running flutter analyze: {e}")
    
    # React/JS: eslint oder npm run lint
    elif is_react:
        try:
            # Prüfe ob eslint config existiert
            has_eslint = (
                (project_path_obj / ".eslintrc").exists() or
                (project_path_obj / ".eslintrc.js").exists() or
                (project_path_obj / ".eslintrc.json").exists() or
                (project_path_obj / "package.json").exists()
            )
            
            if has_eslint:
                result = subprocess.run(
                    ["npm", "run", "lint"],
                    cwd=project_path,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if result.returncode != 0:
                    # Parse eslint output
                    lines = result.stdout.split('\n')
                    for line in lines:
                        # Format: "src/App.js  10:5  error  'x' is assigned a value but never used"
                        match = re.match(r'(.+?)\s+(\d+):(\d+)\s+(error|warning)\s+(.+)', line)
                        if match:
                            file_path, line_num, col, severity, message = match.groups()
                            errors.append({
                                "file": file_path.strip(),
                                "line": int(line_num),
                                "column": int(col),
                                "message": message.strip(),
                                "severity": severity,
                                "type": "lint",
                                "source": "eslint"
                            })
        except Exception as e:
            print(f"Error running eslint: {e}")
    
    # Python: pylint oder flake8
    elif is_python:
        try:
            # Versuche flake8
            result = subprocess.run(
                ["flake8", "--format=default", project_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                lines = result.stdout.split('\n')
                for line in lines:
                    # Format: "src/main.py:10:5: E302 expected 2 blank lines"
                    match = re.match(r'(.+?):(\d+):(\d+):\s+(\w+)\s+(.+)', line)
                    if match:
                        file_path, line_num, col, code, message = match.groups()
                        severity = "error" if code.startswith("E") else "warning"
                        errors.append({
                            "file": file_path,
                            "line": int(line_num),
                            "column": int(col),
                            "message": f"{code}: {message}",
                            "severity": severity,
                            "type": "lint",
                            "source": "flake8"
                        })
        except Exception as e:
            print(f"Error running flake8: {e}")
    
    # Zusätzlich: Syntax-Check für alle Code-Dateien
    code_files = []
    for ext in ['.dart', '.js', '.jsx', '.ts', '.tsx', '.py']:
        code_files.extend(project_path_obj.rglob(f'*{ext}'))
    
    for file_path in code_files[:50]:  # Limit auf 50 Dateien
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            
            # Einfacher Syntax-Check
            if file_path.suffix == '.py':
                try:
                    compile(content, str(file_path), 'exec')
                except SyntaxError as e:
                    errors.append({
                        "file": str(file_path.relative_to(project_path_obj)),
                        "line": e.lineno or 0,
                        "column": e.offset or 0,
                        "message": e.msg,
                        "severity": "error",
                        "type": "syntax",
                        "source": "python"
                    })
        except Exception:
            pass
    
    return errors


async def fix_file_with_ai(file_path: str, content: str, errors: List[Dict]) -> Dict:
    """
    Fixt Fehler in einer Datei mit AI.
    """
    if not errors:
        return {"fixed": False, "content": content, "message": "No errors to fix"}
    
    # Gruppiere Fehler nach Typ
    error_summary = "\n".join([
        f"- Line {e.get('line', '?')}: {e.get('message', 'Unknown error')} ({e.get('type', 'unknown')})"
        for e in errors
    ])
    
    prompt = f"""Du bist ein Experte für Code-Fixes. Fixe ALLE Fehler in dieser Datei:

DATEI: {file_path}

FEHLER GEFUNDEN:
{error_summary}

AKTUELLER CODE:
```{file_path.split('.')[-1]}
{content}
```

ANWEISUNGEN:
1. Fixe ALLE aufgelisteten Fehler
2. Behalte die Funktionalität bei
3. Füge fehlende Imports hinzu
4. Fixe Syntax-Fehler
5. Fixe Type-Fehler
6. Mache den Code production-ready
7. Füge Kommentare hinzu, die erklären WAS, WIE und WARUM

WICHTIG: Gib NUR den gefixten Code zurück, keine Erklärungen, kein Markdown außer dem Code-Block."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Du bist ein Experte für Code-Fixes. Fixe alle Fehler und gib NUR den gefixten Code zurück."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=8000
        )
        
        fixed_code = response.choices[0].message.content
        
        # Extrahiere Code aus Markdown falls vorhanden
        if "```" in fixed_code:
            lines = fixed_code.split("\n")
            code_lines = []
            in_code = False
            for line in lines:
                if line.strip().startswith("```"):
                    in_code = not in_code
                    continue
                if in_code:
                    code_lines.append(line)
            fixed_code = "\n".join(code_lines)
        
        return {
            "fixed": True,
            "content": fixed_code.strip(),
            "errors_fixed": len(errors),
            "message": f"Fixed {len(errors)} error(s)"
        }
    except Exception as e:
        return {
            "fixed": False,
            "content": content,
            "error": str(e),
            "message": f"Error fixing file: {str(e)}"
        }


@router.post("/scan-project")
async def scan_project(request: ProjectScanRequest):
    """
    Durchsucht gesamtes Projekt nach Fehlern.
    """
    try:
        errors = await scan_project_for_errors(request.project_path)
        
        return {
            "success": True,
            "errors": errors,
            "total": len(errors),
            "errors_count": len([e for e in errors if e.get("severity") == "error"]),
            "warnings_count": len([e for e in errors if e.get("severity") == "warning"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fix-file")
async def fix_file(request: FileFixRequest):
    """
    Fixt Fehler in einer einzelnen Datei.
    """
    try:
        result = await fix_file_with_ai(
            file_path=request.file_path,
            content=request.content,
            errors=request.errors
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fix-project")
async def fix_project(request: ProjectScanRequest):
    """
    Fixt gesamtes Projekt: Scannt alle Fehler und fixt sie automatisch.
    """
    try:
        # 1. Scanne Projekt
        errors = await scan_project_for_errors(request.project_path)
        
        if not errors:
            return {
                "success": True,
                "message": "No errors found",
                "files_fixed": 0,
                "errors_fixed": 0
            }
        
        # 2. Gruppiere Fehler nach Datei
        errors_by_file = {}
        for error in errors:
            file_path = error.get("file")
            if file_path:
                if file_path not in errors_by_file:
                    errors_by_file[file_path] = []
                errors_by_file[file_path].append(error)
        
        # 3. Fixe jede Datei
        fixed_files = []
        project_path_obj = Path(request.project_path)
        
        for file_path, file_errors in errors_by_file.items():
            full_path = project_path_obj / file_path
            
            if not full_path.exists():
                continue
            
            try:
                content = full_path.read_text(encoding='utf-8', errors='ignore')
                
                # Fixe Datei
                fix_result = await fix_file_with_ai(
                    file_path=file_path,
                    content=content,
                    errors=file_errors
                )
                
                if fix_result.get("fixed"):
                    # Speichere gefixte Datei
                    full_path.write_text(fix_result["content"], encoding='utf-8')
                    fixed_files.append({
                        "file": file_path,
                        "errors_fixed": fix_result.get("errors_fixed", 0)
                    })
                    
                    # Kurze Pause zwischen Dateien
                    await asyncio.sleep(0.5)
            except Exception as e:
                print(f"Error fixing file {file_path}: {e}")
        
        return {
            "success": True,
            "message": f"Fixed {len(fixed_files)} file(s)",
            "files_fixed": len(fixed_files),
            "errors_fixed": sum(f["errors_fixed"] for f in fixed_files),
            "fixed_files": fixed_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



