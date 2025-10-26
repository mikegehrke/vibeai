# backend/generator.py
# KI-Code-Erzeugung mit OpenAI-API (oder lokalem Modell)

from openai import OpenAI
import os
from dotenv import load_dotenv

# Lade .env Datei
load_dotenv()

# Fallback für API Key wenn .env nicht funktioniert
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key.startswith("your-new"):
    api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

def generate_code(description: str, output_dir: str):
    """
    Ruft GPT-Modell auf, um komplette Projektstruktur zu generieren.
    Erstellt mehrere Dateien und Ordner basierend auf der Beschreibung.
    """
    prompt = f"""
    Create a complete project structure for: {description}

    Provide the response in the following JSON format:
    {{
        "project_name": "project-name",
        "files": [
            {{
                "path": "relative/path/to/file.ext",
                "content": "actual file content here"
            }},
            {{
                "path": "src/main.dart",
                "content": "flutter code here"
            }}
        ]
    }}

    Generate REAL, working code for each file. Include:
    - Main application files
    - Configuration files (pubspec.yaml, package.json, etc.)
    - Multiple source files if needed
    - Proper folder structure
    
    Make it a complete, runnable project.
    """
    
    # 🚀 PREMIUM MODEL SELECTION - Alle Top-Modelle verfügbar!
    # Priorität: Gpt-5 > O4-Mini > Gpt-5-mini > Gpt-4.1 > Fallbacks
    models_to_try = [
        "gpt-5",           # 🥇 BESTE Qualität für Code-Generation
        "o4-mini",         # 🥈 Schnelles Reasoning + Coding  
        "gpt-5-mini",      # 🥉 Ausgewogen: Qualität + Speed
        "gpt-4.1",         # 🏅 Verbesserte GPT-4 Version
        "o3",              # 🧠 Advanced Reasoning
        "gpt-5-nano",      # ⚡ Ultra-schnell
        "gpt-4o-mini",     # 🔄 Fallback 1
        "gpt-4",           # 🔄 Fallback 2
        "gpt-3.5-turbo-16k", # 🔄 Fallback 3
        "gpt-3.5-turbo"    # 🔄 Final Fallback
    ]
    response = None
    
    for model in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000
            )
            print(f"✅ Successfully using model: {model}")
            break
        except Exception as e:
            print(f"❌ Model {model} failed: {str(e)}")
            if model == models_to_try[-1]:  # Letzter Versuch
                raise e
            continue
    
    if not response:
        raise Exception("Alle Modelle fehlgeschlagen")
    
    import json
    import re
    
    try:
        # Extrahiere JSON aus der Antwort
        content = response.choices[0].message.content or ""
        
        # Finde JSON Block
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            project_data = json.loads(json_match.group())
        else:
            # Fallback: Erstelle einfache Struktur
            project_data = {
                "project_name": "generated-app",
                "files": [
                    {"path": "main.txt", "content": content}
                ]
            }
        
        # Erstelle Projektordner
        project_path = os.path.join(output_dir, project_data.get("project_name", "generated-app"))
        os.makedirs(project_path, exist_ok=True)
        
        created_files = []
        
        # Erstelle alle Dateien
        for file_info in project_data.get("files", []):
            file_path = os.path.join(project_path, file_info["path"])
            
            # Erstelle Ordner falls nötig
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Schreibe Datei
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(file_info["content"])
            
            created_files.append(file_path)
        
        return created_files
        
    except Exception as e:
        # Fallback bei Fehlern
        fallback_path = os.path.join(output_dir, "error_log.txt")
        with open(fallback_path, "w") as f:
            f.write(f"Fehler beim Parsen: {str(e)}\n\nOriginal Response:\n{response.choices[0].message.content}")
        return [fallback_path]