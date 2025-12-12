# -------------------------------------------------------------
# VIBEAI – TERMINAL EXECUTION
# -------------------------------------------------------------
"""
Terminal Command Execution für Code Studio
"""

import os
import subprocess
from typing import Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/terminal", tags=["Terminal"])


class ExecuteCommandRequest(BaseModel):
    project_id: str
    command: str


def sanitize_project_id(project_id: str) -> str:
    """Sanitize project_id for filesystem use."""
    import re
    import unicodedata
    
    # Normalize unicode characters (NFD decomposition)
    sanitized = unicodedata.normalize('NFD', project_id)
    
    # Replace German umlauts with ASCII equivalents
    umlaut_map = {
        'ä': 'ae', 'ö': 'oe', 'ü': 'ue',
        'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
        'ß': 'ss'
    }
    for umlaut, replacement in umlaut_map.items():
        sanitized = sanitized.replace(umlaut, replacement)
    
    # Remove diacritics (accents) from remaining characters
    sanitized = ''.join(c for c in sanitized if unicodedata.category(c) != 'Mn')
    
    # Replace problematic characters
    invalid_chars = ['<', '>', ':', '"', '|', '?', '*', '\x00', '/', '\\']
    for char in invalid_chars:
        sanitized = sanitized.replace(char, '_')
    
    # Replace spaces with hyphens
    sanitized = sanitized.replace(' ', '-')
    
    # Remove leading/trailing dots, spaces, and hyphens
    sanitized = sanitized.strip('. -')
    
    # Remove multiple consecutive hyphens/underscores
    sanitized = re.sub(r'[-_]+', '-', sanitized)
    
    # Limit length to avoid filesystem issues
    if len(sanitized) > 200:
        sanitized = sanitized[:200]
    
    # Ensure it's not empty
    if not sanitized:
        sanitized = "project"
    
    return sanitized

def get_project_path(project_id: str) -> str:
    """Get project directory path."""
    from codestudio.project_manager import project_manager
    
    # CRITICAL: Sanitize project_id FIRST before using it anywhere
    safe_project_id = sanitize_project_id(project_id)
    print(f"🔍 Original project_id: {project_id}")
    print(f"🔍 Sanitized project_id: {safe_project_id}")
    
    # Try to get path from project manager first (using sanitized ID)
    try:
        project_path = project_manager.get_project_path("default_user", safe_project_id)
        # Convert to absolute path if relative
        if not os.path.isabs(project_path):
            project_path = os.path.abspath(project_path)
        if os.path.exists(project_path):
            print(f"✅ Found existing project path: {project_path}")
            return project_path
    except Exception as e:
        print(f"⚠️  Error getting project path from manager: {e}")
        import traceback
        traceback.print_exc()
    
    # Fallback to default path - use absolute path from project_manager
    try:
        base_path = project_manager.base_path
        if not os.path.isabs(base_path):
            base_path = os.path.abspath(base_path)
        print(f"🔍 Using base_path from manager: {base_path}")
    except Exception as e:
        print(f"⚠️  Error getting base_path from manager: {e}")
        # Ultimate fallback
        backend_dir = os.path.dirname(os.path.dirname(__file__))
        base_path = os.path.join(backend_dir, "user_projects")
        base_path = os.path.abspath(base_path)
        print(f"🔍 Using fallback base_path: {base_path}")
    
    # Ensure base_path and default_user directory exist
    default_user_path = os.path.join(base_path, "default_user")
    os.makedirs(default_user_path, exist_ok=True)
    
    project_path = os.path.join(default_user_path, safe_project_id)
    print(f"🔍 Final project_path: {project_path}")
    return project_path


@router.post("/execute")
async def execute_command(request: ExecuteCommandRequest):
    """Execute terminal command."""
    from codestudio.project_manager import project_manager
    
    project_path = get_project_path(request.project_id)
    
    # Debug: Print path information
    print(f"🔍 Project ID: {request.project_id}")
    print(f"🔍 Project Path: {project_path}")
    print(f"🔍 Path exists: {os.path.exists(project_path)}")
    print(f"🔍 Parent dir: {os.path.dirname(project_path)}")
    print(f"🔍 Parent exists: {os.path.exists(os.path.dirname(project_path))}")
    
    # Create project directory if it doesn't exist
    if not os.path.exists(project_path):
        try:
            # Ensure parent directories exist
            parent_dir = os.path.dirname(project_path)
            print(f"🔍 Creating parent directory: {parent_dir}")
            os.makedirs(parent_dir, exist_ok=True)
            
            # Sanitize project_id for project_manager
            safe_project_id = sanitize_project_id(request.project_id)
            print(f"🔍 Sanitized project ID: {safe_project_id}")
            
            # Try to create project via project_manager
            try:
                project_manager.create_project("default_user", safe_project_id, {
                    "name": request.project_id,  # Keep original name in metadata
                    "type": "unknown"
                })
                project_path = get_project_path(request.project_id)
                print(f"✅ Project created via manager: {project_path}")
            except Exception as e:
                print(f"⚠️  Project manager create failed: {e}, creating manually")
                import traceback
                traceback.print_exc()
                # If project_manager fails, create directory manually
                try:
                    print(f"🔍 Creating directory manually: {project_path}")
                    os.makedirs(project_path, exist_ok=True)
                    print(f"✅ Created project directory: {project_path}")
                except Exception as create_error:
                    error_msg = f"Could not create project directory: {project_path}\nError: {str(create_error)}\nParent: {parent_dir}\nParent exists: {os.path.exists(parent_dir)}"
                    print(f"❌ {error_msg}")
                    import traceback
                    traceback.print_exc()
                    return {
                        "success": False,
                        "output": error_msg,
                        "returncode": -1
                    }
        except Exception as e:
            error_msg = f"Could not create project directory: {project_path}\nError: {str(e)}"
            print(f"❌ {error_msg}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "output": error_msg,
                "returncode": -1
            }
    
    # CRITICAL: Ensure project directory exists before executing any command
    if not os.path.exists(project_path):
        # Final attempt: create directory directly
        try:
            print(f"🔍 Final attempt: Creating directory: {project_path}")
            parent_dir = os.path.dirname(project_path)
            # Ensure parent exists
            os.makedirs(parent_dir, exist_ok=True)
            # Create project directory
            os.makedirs(project_path, exist_ok=True)
            print(f"✅ Successfully created project directory: {project_path}")
        except Exception as final_error:
            error_msg = f"Error: Could not create project directory: {project_path}\nError: {str(final_error)}\nParent: {parent_dir}\nParent exists: {os.path.exists(parent_dir)}"
            print(f"❌ {error_msg}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "output": error_msg,
                "returncode": -1
            }
    
    # Check if it's a Flutter project (has pubspec.yaml or lib/main.dart)
    pubspec_path = os.path.join(project_path, "pubspec.yaml")
    main_dart_path = os.path.join(project_path, "lib", "main.dart")
    
    # If Flutter project structure detected, ensure it's initialized
    if os.path.exists(pubspec_path) or os.path.exists(main_dart_path):
        # Flutter project exists, ensure lib and test directories exist
        lib_path = os.path.join(project_path, "lib")
        os.makedirs(lib_path, exist_ok=True)
        
        # Ensure test directory exists (especially before flutter test)
        test_dir = os.path.join(project_path, "test")
        if not os.path.exists(test_dir):
            print(f"Creating test directory: {test_dir}")
            os.makedirs(test_dir, exist_ok=True)
            # Create a basic widget_test.dart if it doesn't exist
            widget_test_path = os.path.join(test_dir, "widget_test.dart")
            if not os.path.exists(widget_test_path):
                basic_test_content = """import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Center(child: Text('Test')),
      ),
    ));

    // Verify that our text is displayed
    expect(find.text('Test'), findsOneWidget);
  });
}
"""
                try:
                    with open(widget_test_path, 'w', encoding='utf-8') as f:
                        f.write(basic_test_content)
                    print(f"✅ Created basic widget_test.dart")
                except Exception as e:
                    print(f"⚠️  Could not create widget_test.dart: {e}")
        
        # Special handling for flutter test command
        if "flutter" in request.command.lower() and "test" in request.command.lower():
            # Double-check test directory exists
            if not os.path.exists(test_dir):
                os.makedirs(test_dir, exist_ok=True)
                print(f"✅ Created test directory for flutter test")
    elif "flutter" in request.command.lower():
        # Flutter command but no project - create basic structure
        lib_path = os.path.join(project_path, "lib")
        os.makedirs(lib_path, exist_ok=True)
        if not os.path.exists(pubspec_path):
            # Create basic pubspec.yaml
            pubspec_content = """name: vibeai_app
description: A VibeAI generated app
version: 1.0.0

environment:
  sdk: '>=2.17.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true
"""
            try:
                with open(pubspec_path, "w") as f:
                    f.write(pubspec_content)
                print(f"✅ Created pubspec.yaml: {pubspec_path}")
            except Exception as e:
                print(f"⚠️  Could not create pubspec.yaml: {e}")
        
        if not os.path.exists(main_dart_path):
            # Create basic main.dart
            main_content = """import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VibeAI App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('VibeAI App'),
      ),
      body: Center(
        child: Text('Welcome to VibeAI!'),
      ),
    );
  }
}
"""
            try:
                with open(main_dart_path, "w") as f:
                    f.write(main_content)
                print(f"✅ Created main.dart: {main_dart_path}")
            except Exception as e:
                print(f"⚠️  Could not create main.dart: {e}")
    
    try:
        # Security: Only allow safe commands
        dangerous_commands = ['rm -rf', 'format', 'del /f', 'shutdown', 'reboot']
        command_lower = request.command.lower()
        
        if any(dangerous in command_lower for dangerous in dangerous_commands):
            raise HTTPException(status_code=400, detail="Dangerous command not allowed")
        
        # Spezialbehandlung für Flutter-Befehle
        if command_lower.startswith('flutter run') or command_lower.startswith('flutter pub get') or command_lower.startswith('flutter pub add'):
            # Prüfe ob Flutter-Projekt Web/macOS-Support hat
            pubspec_path = os.path.join(project_path, "pubspec.yaml")
            if os.path.exists(pubspec_path):
                # Prüfe ob web-Verzeichnis existiert
                web_dir = os.path.join(project_path, "web")
                if not os.path.exists(web_dir) and command_lower.startswith('flutter run'):
                    # Aktiviere Web-Support automatisch
                    enable_web = subprocess.run(
                        ["flutter", "create", ".", "--platforms=web"],
                        cwd=project_path,
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    if enable_web.returncode == 0:
                        output = enable_web.stdout + "\n" + "✅ Flutter Web-Support aktiviert\n"
            
            # ⚡ WICHTIG: Für flutter run, verwende -d web-server um Browser-Auto-Open zu verhindern
            # Aber nur wenn der Benutzer nicht bereits ein Device angegeben hat
            if command_lower.startswith('flutter run') and '-d' not in command_lower and '--device-id' not in command_lower:
                # Füge -d web-server hinzu, damit Browser nicht automatisch öffnet
                # Der Benutzer kann immer noch -d chrome oder -d edge verwenden, wenn gewünscht
                original_command = request.command
                request.command = request.command.replace('flutter run', 'flutter run -d web-server', 1)
                print(f"🔧 Modified flutter run command: {request.command} (to prevent auto-browser-open)")
                    else:
                        output = enable_web.stderr + "\n" + "⚠️  Web-Support konnte nicht aktiviert werden, versuche trotzdem zu starten...\n"
                else:
                    output = ""
                
                # ⚡ WICHTIG: Prüfe auf Dependency-Konflikte und fixe sie automatisch
                # Versuche zuerst flutter pub get, um Fehler zu sehen
                test_get = subprocess.run(
                    ["flutter", "pub", "get"],
                    cwd=project_path,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                # Prüfe auf intl-Versionskonflikte
                if "intl" in test_get.stderr and "version solving failed" in test_get.stderr:
                    print("🔧 Dependency-Konflikt erkannt: intl-Version")
                    
                    # Lese pubspec.yaml
                    try:
                        with open(pubspec_path, 'r', encoding='utf-8') as f:
                            pubspec_content = f.read()
                        
                        # Prüfe ob intl: ^0.18.0 vorhanden ist
                        if 'intl: ^0.18.0' in pubspec_content or 'intl: 0.18.0' in pubspec_content:
                            # Fixe intl-Version auf ^0.20.2
                            fixed_content = pubspec_content.replace('intl: ^0.18.0', 'intl: ^0.20.2')
                            fixed_content = fixed_content.replace('intl: 0.18.0', 'intl: ^0.20.2')
                            
                            # Speichere gefixte pubspec.yaml
                            with open(pubspec_path, 'w', encoding='utf-8') as f:
                                f.write(fixed_content)
                            
                            print("✅ intl-Version auf ^0.20.2 aktualisiert")
                            output += "\n✅ Dependency-Konflikt automatisch behoben: intl auf ^0.20.2 aktualisiert\n"
                            
                            # Versuche erneut flutter pub get
                            retry_get = subprocess.run(
                                ["flutter", "pub", "get"],
                                cwd=project_path,
                                capture_output=True,
                                text=True,
                                timeout=30
                            )
                            if retry_get.returncode == 0:
                                output += "✅ Dependencies erfolgreich installiert\n"
                            else:
                                output += f"⚠️  Warnung: {retry_get.stderr}\n"
                    except Exception as e:
                        print(f"⚠️  Fehler beim Fixen der pubspec.yaml: {e}")
                        output += f"\n⚠️  Konnte Dependency-Konflikt nicht automatisch beheben: {e}\n"
            else:
                output = ""
        else:
            output = ""
        
        # Execute command
        result = subprocess.run(
            request.command,
            shell=True,
            cwd=project_path,
            capture_output=True,
            text=True,
            timeout=600 if 'flutter run' in request.command else 180  # ⚡ Flutter run braucht oft 5-10 Minuten!
        )
        
        # Kombiniere Output
        if output:
            result_output = output + result.stdout + result.stderr
        else:
            result_output = result.stdout + result.stderr
        
        if not result_output.strip():
            result_output = f"Command executed successfully (exit code: {result.returncode})"
        
        return {
            "success": result.returncode == 0,
            "output": result_output,
            "returncode": result.returncode
        }
        
    except subprocess.TimeoutExpired:
        timeout_seconds = 600 if 'flutter run' in request.command else 180
        return {
            "success": False,
            "output": f"Command timed out after {timeout_seconds} seconds. Flutter compilation can take 5-10 minutes for the first build. Try running 'flutter run' again or check if the app is already running.",
            "returncode": -1
        }
    except Exception as e:
        return {
            "success": False,
            "output": f"Error: {str(e)}",
            "returncode": -1
        }

