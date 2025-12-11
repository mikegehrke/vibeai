# -------------------------------------------------------------
# VIBEAI – AUTO-FIX DURING BUILD
# -------------------------------------------------------------
"""
Automatisches Fixen während App-Build:
- Fehler erkennen
- Automatisch beheben
- Code optimieren
- Imports korrigieren
"""

import os
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI

router = APIRouter(prefix="/api/builder", tags=["App Builder"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AutoFixRequest(BaseModel):
    project_id: str
    file_path: str
    content: str
    errors: List[str] = []


async def auto_fix_code(file_path: str, content: str, errors: List[str]) -> Dict:
    """
    Automatisch Code-Fehler beheben.
    """
    if not errors:
        return {"fixed": False, "content": content}
    
    error_summary = "\n".join([f"- {e}" for e in errors])
    
    prompt = f"""Fix ALL errors in this code file:

FILE: {file_path}

ERRORS FOUND:
{error_summary}

CODE:
```{file_path.split('.')[-1]}
{content}
```

INSTRUCTIONS:
1. Fix ALL errors listed above
2. Keep the same functionality
3. Add missing imports
4. Fix syntax errors
5. Fix type errors
6. Make code production-ready

Return ONLY the fixed code, no explanations:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert code fixer. Fix all errors and return ONLY the fixed code."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=8000
        )
        
        fixed_code = response.choices[0].message.content
        
        # Extract code from markdown if needed
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
            "content": fixed_code,
            "errors_fixed": len(errors)
        }
    except Exception as e:
        return {
            "fixed": False,
            "content": content,
            "error": str(e)
        }


@router.post("/auto-fix")
async def auto_fix(request: AutoFixRequest):
    """Auto-fix code errors."""
    result = await auto_fix_code(
        file_path=request.file_path,
        content=request.content,
        errors=request.errors
    )
    
    return result







