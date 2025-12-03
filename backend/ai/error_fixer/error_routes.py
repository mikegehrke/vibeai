"""
Error Fixer API Routes
Endpoints für automatische Fehleranalyse und -behebung
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .error_fixer import ErrorFixer, Framework, ErrorType, ErrorSeverity

router = APIRouter(prefix="/error-fixer", tags=["Error Fixer"])

error_fixer = ErrorFixer()


class AnalyzeBuildLogRequest(BaseModel):
    """Request für Build-Log Analyse"""
    build_log: str
    framework: str
    base_path: Optional[str] = "."
    auto_fix: bool = False


class ParseErrorsRequest(BaseModel):
    """Request für Error Parsing"""
    log: str
    framework: str


class GenerateFixRequest(BaseModel):
    """Request für Fix-Generierung"""
    error_message: str
    error_type: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    framework: str
    file_content: Optional[str] = None


class ApplyFixRequest(BaseModel):
    """Request für Fix-Anwendung"""
    file_path: str
    line_number: int
    original_code: str
    fixed_code: str
    explanation: str


# Framework Mapping
framework_map = {
    'flutter': Framework.FLUTTER,
    'react': Framework.REACT,
    'react_native': Framework.REACT_NATIVE,
    'vue': Framework.VUE,
    'nextjs': Framework.NEXTJS,
    'python': Framework.PYTHON,
    'fastapi': Framework.FASTAPI,
    'django': Framework.DJANGO,
    'nodejs': Framework.NODEJS,
    'typescript': Framework.TYPESCRIPT,
    'javascript': Framework.JAVASCRIPT
}


@router.post("/analyze")
async def analyze_build_log(request: AnalyzeBuildLogRequest):
    """
    Analysiere Build-Log und generiere Fixes
    
    Returns:
        - total_errors: Anzahl gefundener Fehler
        - fixable_errors: Anzahl behebbare Fehler
        - errors: Liste aller Fehler
        - fixes: Liste generierter Fixes
        - applied_fixes: Anzahl angewendeter Fixes (wenn auto_fix=True)
    """
    try:
        framework = framework_map.get(request.framework.lower())
        if not framework:
            raise HTTPException(status_code=400, detail=f"Unknown framework: {request.framework}")
        
        if request.auto_fix:
            # Kompletter Workflow mit Auto-Fix
            result = error_fixer.analyze_and_fix(
                build_log=request.build_log,
                framework=framework,
                base_path=request.base_path
            )
        else:
            # Nur analysieren, nicht fixen
            errors = error_fixer.parse_build_log(request.build_log, framework)
            fixes = [error_fixer.generate_fix(error) for error in errors]
            fixes = [f for f in fixes if f is not None]
            
            result = {
                'total_errors': len(errors),
                'fixable_errors': len(fixes),
                'applied_fixes': 0,
                'failed_fixes': 0,
                'errors': [error_fixer._error_to_dict(e) for e in errors],
                'fixes': [error_fixer._fix_to_dict(f) for f in fixes],
                'success_rate': 0
            }
        
        return {
            'success': True,
            'framework': request.framework,
            'auto_fix_enabled': request.auto_fix,
            **result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/parse")
async def parse_errors(request: ParseErrorsRequest):
    """
    Parse Fehler aus Log ohne Fix-Generierung
    
    Returns:
        - errors: Liste geparster Fehler
    """
    try:
        framework = framework_map.get(request.framework.lower())
        if not framework:
            raise HTTPException(status_code=400, detail=f"Unknown framework: {request.framework}")
        
        errors = error_fixer.parse_build_log(request.log, framework)
        
        return {
            'success': True,
            'framework': request.framework,
            'error_count': len(errors),
            'errors': [error_fixer._error_to_dict(e) for e in errors]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@router.post("/generate-fix")
async def generate_fix(request: GenerateFixRequest):
    """
    Generiere Fix für einen spezifischen Fehler
    
    Returns:
        - fix: Generierter Code-Fix
    """
    try:
        framework = framework_map.get(request.framework.lower())
        if not framework:
            raise HTTPException(status_code=400, detail=f"Unknown framework: {request.framework}")
        
        # Error Type Mapping
        error_type_map = {
            'import_error': ErrorType.IMPORT_ERROR,
            'syntax_error': ErrorType.SYNTAX_ERROR,
            'type_error': ErrorType.TYPE_ERROR,
            'undefined_variable': ErrorType.UNDEFINED_VARIABLE,
            'undefined_function': ErrorType.UNDEFINED_FUNCTION,
            'missing_dependency': ErrorType.MISSING_DEPENDENCY
        }
        
        error_type = error_type_map.get(request.error_type.lower(), ErrorType.UNKNOWN)
        
        # Erstelle ParsedError
        from .error_fixer import ParsedError
        error = ParsedError(
            error_type=error_type,
            severity=ErrorSeverity.ERROR,
            message=request.error_message,
            file_path=request.file_path,
            line_number=request.line_number,
            column=None,
            framework=framework,
            stack_trace=[],
            context="",
            suggestion=""
        )
        
        fix = error_fixer.generate_fix(error, request.file_content)
        
        if fix:
            return {
                'success': True,
                'fix': error_fixer._fix_to_dict(fix)
            }
        else:
            return {
                'success': False,
                'message': 'Could not generate fix for this error type'
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fix generation failed: {str(e)}")


@router.post("/apply-fix")
async def apply_fix(request: ApplyFixRequest):
    """
    Wende einen Fix auf eine Datei an
    
    Returns:
        - success: True wenn erfolgreich
    """
    try:
        from .error_fixer import CodeFix
        
        fix = CodeFix(
            file_path=request.file_path,
            line_number=request.line_number,
            original_code=request.original_code,
            fixed_code=request.fixed_code,
            explanation=request.explanation,
            confidence=0.85
        )
        
        success = error_fixer.apply_fix(fix, request.file_path)
        
        return {
            'success': success,
            'file': request.file_path,
            'message': 'Fix applied successfully' if success else 'Failed to apply fix'
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply fix: {str(e)}")


@router.get("/error-types")
async def get_error_types():
    """
    Liste aller unterstützten Fehlertypen
    """
    return {
        'success': True,
        'error_types': [
            {
                'id': 'import_error',
                'name': 'Import Error',
                'description': 'Missing or incorrect import statements',
                'fixable': True
            },
            {
                'id': 'syntax_error',
                'name': 'Syntax Error',
                'description': 'Code syntax violations',
                'fixable': True
            },
            {
                'id': 'type_error',
                'name': 'Type Error',
                'description': 'Type mismatches and incompatibilities',
                'fixable': True
            },
            {
                'id': 'undefined_variable',
                'name': 'Undefined Variable',
                'description': 'Variables used before definition',
                'fixable': True
            },
            {
                'id': 'undefined_function',
                'name': 'Undefined Function',
                'description': 'Functions called but not defined',
                'fixable': True
            },
            {
                'id': 'missing_dependency',
                'name': 'Missing Dependency',
                'description': 'Required packages not installed',
                'fixable': True
            },
            {
                'id': 'widget_error',
                'name': 'Widget Error',
                'description': 'Flutter widget configuration issues',
                'fixable': False
            },
            {
                'id': 'api_error',
                'name': 'API Error',
                'description': 'API endpoint errors',
                'fixable': False
            },
            {
                'id': 'database_error',
                'name': 'Database Error',
                'description': 'Database schema or query errors',
                'fixable': False
            },
            {
                'id': 'build_error',
                'name': 'Build Error',
                'description': 'Build configuration errors',
                'fixable': False
            },
            {
                'id': 'runtime_error',
                'name': 'Runtime Error',
                'description': 'Errors occurring during execution',
                'fixable': False
            },
            {
                'id': 'gradle_error',
                'name': 'Gradle Error',
                'description': 'Android Gradle build errors',
                'fixable': False
            }
        ]
    }


@router.get("/frameworks")
async def get_frameworks():
    """
    Liste aller unterstützten Frameworks
    """
    return {
        'success': True,
        'frameworks': [
            {
                'id': 'flutter',
                'name': 'Flutter',
                'icon': '📱',
                'supported_errors': ['import_error', 'syntax_error', 'type_error', 'undefined_variable', 'widget_error']
            },
            {
                'id': 'react',
                'name': 'React',
                'icon': '⚛️',
                'supported_errors': ['import_error', 'syntax_error', 'undefined_variable', 'undefined_function']
            },
            {
                'id': 'react_native',
                'name': 'React Native',
                'icon': '📱',
                'supported_errors': ['import_error', 'syntax_error', 'undefined_variable']
            },
            {
                'id': 'python',
                'name': 'Python',
                'icon': '🐍',
                'supported_errors': ['import_error', 'syntax_error', 'type_error', 'undefined_variable', 'missing_dependency']
            },
            {
                'id': 'typescript',
                'name': 'TypeScript',
                'icon': '📘',
                'supported_errors': ['import_error', 'type_error', 'syntax_error']
            },
            {
                'id': 'javascript',
                'name': 'JavaScript',
                'icon': '📙',
                'supported_errors': ['import_error', 'syntax_error', 'undefined_variable']
            },
            {
                'id': 'vue',
                'name': 'Vue',
                'icon': '💚',
                'supported_errors': ['import_error', 'syntax_error', 'undefined_variable']
            },
            {
                'id': 'fastapi',
                'name': 'FastAPI',
                'icon': '⚡',
                'supported_errors': ['import_error', 'type_error', 'undefined_variable', 'api_error']
            }
        ]
    }


@router.get("/example-logs/{framework}")
async def get_example_log(framework: str):
    """
    Beispiel-Build-Logs für Testing
    """
    examples = {
        'flutter': """
[ERROR:flutter/lib/ui/ui_dart_state.cc] Unhandled Exception: NoSuchMethodError: The getter 'email' isn't defined for the class 'User'.
lib/screens/login_screen.dart:45:12: Error: The argument type 'String' can't be assigned to the parameter type 'int'.
lib/widgets/user_card.dart:23:5: Error: Undefined name 'userName'.
        """,
        'react': """
Module not found: Error: Can't resolve './components/Header' in '/src/pages'
  > 1 | import Header from './components/Header';
'userName' is not defined  no-undef
Failed to compile.
./src/App.js
  Line 23:18:  'handleClick' is not a function  no-undef
        """,
        'python': """
Traceback (most recent call last):
  File "app.py", line 5, in <module>
    from models import User
ModuleNotFoundError: No module named 'models'
  File "main.py", line 12, in get_user
    NameError: name 'user_id' is not defined
TypeError: unsupported operand type(s) for +: 'int' and 'str'
        """,
        'typescript': """
src/components/Header.tsx(12,5): error TS2304: Cannot find name 'userName'.
src/utils/api.ts(45,3): error TS2339: Property 'email' does not exist on type 'User'.
src/types/index.ts(8,14): error TS2322: Type 'string' is not assignable to type 'number'.
        """
    }
    
    return {
        'success': True,
        'framework': framework,
        'example_log': examples.get(framework, "No example available for this framework")
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        'success': True,
        'service': 'Error Fixer',
        'status': 'healthy',
        'supported_frameworks': len(framework_map),
        'supported_error_types': 12
    }
