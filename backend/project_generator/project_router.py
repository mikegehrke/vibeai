"""
Clean Project Router without lint errors
"""
from typing import Dict, List, Optional
import os
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

# Setup logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()


def get_project_path_from_id(project_id: str) -> Path:
    """Get project path from project_id"""
    # Try to get from project_manager first
    try:
        from codestudio.project_manager import project_manager
        project_path = project_manager.get_project_path("default_user", project_id)
        if os.path.exists(project_path):
            return Path(project_path)
    except:
        pass
    
    # Fallback: check user_projects directory
    user_projects_path = Path("user_projects/default_user") / project_id
    if user_projects_path.exists():
        return user_projects_path
    
    # Another fallback: check backend/user_projects
    backend_user_projects = Path("backend/user_projects/default_user") / project_id
    if backend_user_projects.exists():
        return backend_user_projects
    
    # Last fallback: projects directory
    return Path("projects") / project_id


@router.get("/{project_id}/files")
async def get_project_files(project_id: str):
    """
    Get all files from a project with their content.
    This endpoint loads files from the project directory on disk.
    """
    try:
        project_path = get_project_path_from_id(project_id)
        
        if not project_path.exists():
            return []
        
        files = []
        exclude_dirs = {".git", "node_modules", "__pycache__", ".next", "build", "dist", ".vscode", ".idea", "venv", ".metadata"}
        exclude_extensions = {".pyc", ".log", ".DS_Store"}
        
        for root, dirs, filenames in os.walk(project_path):
            # Remove excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for filename in filenames:
                # Skip hidden files and excluded extensions
                if filename.startswith(".") or any(filename.endswith(ext) for ext in exclude_extensions):
                    continue
                
                file_path = Path(root) / filename
                rel_path = file_path.relative_to(project_path)
                
                try:
                    # Read file content
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    # Determine language from extension
                    ext = file_path.suffix.lower()
                    language_map = {
                        ".dart": "dart",
                        ".js": "javascript",
                        ".jsx": "javascript",
                        ".ts": "typescript",
                        ".tsx": "typescript",
                        ".py": "python",
                        ".java": "java",
                        ".kt": "kotlin",
                        ".swift": "swift",
                        ".go": "go",
                        ".rs": "rust",
                        ".html": "html",
                        ".css": "css",
                        ".json": "json",
                        ".yaml": "yaml",
                        ".yml": "yaml",
                        ".md": "markdown",
                        ".xml": "xml",
                        ".sh": "shell",
                        ".sql": "sql",
                    }
                    language = language_map.get(ext, "text")
                    
                    files.append({
                        "name": filename,
                        "path": str(rel_path).replace("\\", "/"),  # Normalize path separators
                        "content": content,
                        "language": language,
                        "size": len(content),
                        "lastModified": os.path.getmtime(file_path)
                    })
                except UnicodeDecodeError:
                    # Skip binary files
                    continue
                except Exception as e:
                    logger.warning(f"Error reading file {rel_path}: {e}")
                    continue
        
        # Sort files by path
        files.sort(key=lambda x: x["path"])
        
        return files
        
    except Exception as e:
        logger.error(f"Error loading project files: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error loading project files: {str(e)}"
        )


class ProjectRequest(BaseModel):
    framework: str = Field(
        ...,
        description="Framework: flutter, react, nextjs, node"
    )
    project_name: str
    description: str = Field(
        "A new project",
        description="Project description"
    )
    options: Optional[Dict] = Field(
        default_factory=dict,
        description="Framework-specific options"
    )
    user_id: Optional[str] = Field(
        None,
        description="User ID for multi-tenant support"
    )


class ProjectResponse(BaseModel):
    success: bool
    message: str
    project_id: str
    path: str
    files_created: int
    size_bytes: int


@router.post("/create", response_model=ProjectResponse)
async def create_project(request: ProjectRequest):
    """Create a new project with the specified framework"""
    
    try:
        # Validate framework - unterstütze ALLE Frameworks
        supported_frameworks = [
            "flutter", "react", "nextjs", "node", "react-native", 
            "ios-swift", "android-kotlin", "vue", "angular", "svelte",
            "python-flask", "python-django", "fastapi", "express",
            "spring-boot", "laravel", "rails", "dotnet", "go-gin",
            "rust-actix", "php-symfony", "unity", "unreal", "godot"
        ]
        
        # Falls Framework nicht in Liste, verwende 'react' als Fallback
        if request.framework not in supported_frameworks:
            logger.warning(f"Framework {request.framework} not explicitly supported, using 'react' as fallback")
            request.framework = "react"
        
        # Create project directory
        project_path = Path(f"projects/{request.project_name}")
        project_path.mkdir(parents=True, exist_ok=True)
        
        # Generate based on framework
        if request.framework in ["react", "react-native"]:
            files_created = create_react_project(project_path, request)
        elif request.framework in ["nextjs"]:
            files_created = create_nextjs_project(project_path, request)
        elif request.framework in ["flutter"]:
            files_created = create_flutter_project(project_path, request)
        elif request.framework in ["node", "express"]:
            files_created = create_node_project(project_path, request)
        elif request.framework in ["vue"]:
            files_created = create_vue_project(project_path, request)
        elif request.framework in ["angular"]:
            files_created = create_angular_project(project_path, request)
        elif request.framework in ["python-flask", "fastapi", "python-django"]:
            files_created = create_python_project(project_path, request)
        elif request.framework in ["ios-swift"]:
            files_created = create_ios_project(project_path, request)
        elif request.framework in ["android-kotlin"]:
            files_created = create_android_project(project_path, request)
        else:
            # Fallback: universal project structure
            files_created = create_universal_project(project_path, request)
        
        # Calculate size
        total_size = calculate_directory_size(str(project_path))
        
        return ProjectResponse(
            success=True,
            message=f"{request.framework.title()} project created successfully",
            project_id=request.project_name,
            path=str(project_path),
            files_created=files_created,
            size_bytes=total_size
        )
        
    except Exception as e:
        logger.error(f"Project creation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Project creation failed: {str(e)}"
        )


def calculate_directory_size(directory_path: str) -> int:
    """Calculate total size of directory"""
    total_size = 0
    try:
        for dirpath, _, filenames in os.walk(directory_path):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                try:
                    total_size += os.path.getsize(filepath)
                except (OSError, FileNotFoundError):
                    continue
    except (OSError, FileNotFoundError):
        pass
    return total_size


def create_react_project(project_path: Path, request: ProjectRequest) -> int:
    """Create React project structure"""
    files = {
        "package.json": f'''{{
  "name": "{request.project_name}",
  "version": "1.0.0",
  "description": "{request.description}",
  "main": "index.js",
  "scripts": {{
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }},
  "dependencies": {{
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }},
  "devDependencies": {{
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }}
}}''',
        "index.html": '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>''',
        "src/main.jsx": '''import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)''',
        "src/App.jsx": f'''import React from 'react'

function App() {{
  return (
    <div>
      <h1>{request.project_name}</h1>
      <p>{request.description}</p>
    </div>
  )
}}

export default App'''
    }
    
    return write_files(project_path, files)


def create_nextjs_project(project_path: Path, request: ProjectRequest) -> int:
    """Create Next.js project structure"""
    files = {
        "package.json": f'''{{
  "name": "{request.project_name}",
  "version": "1.0.0",
  "description": "{request.description}",
  "scripts": {{
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }},
  "dependencies": {{
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }}
}}''',
        "app/page.js": f'''export default function Home() {{
  return (
    <main>
      <h1>{request.project_name}</h1>
      <p>{request.description}</p>
    </main>
  )
}}''',
        "app/layout.js": '''export const metadata = {
  title: 'Next.js App',
  description: 'Generated by VibeAI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}'''
    }
    
    return write_files(project_path, files)


def create_flutter_project(project_path: Path, request: ProjectRequest) -> int:
    """Create Flutter project structure"""
    files = {
        "pubspec.yaml": f'''name: {request.project_name.lower()}
description: {request.description}
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  material_app: ^1.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0''',
        "lib/main.dart": f'''import 'package:flutter/material.dart';

void main() {{
  runApp(MyApp());
}}

class MyApp extends StatelessWidget {{
  @override
  Widget build(BuildContext context) {{
    return MaterialApp(
      title: '{request.project_name}',
      home: MyHomePage(),
    );
  }}
}}

class MyHomePage extends StatelessWidget {{
  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(
        title: Text('{request.project_name}'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('{request.description}'),
          ],
        ),
      ),
    );
  }}
}}'''
    }
    
    return write_files(project_path, files)


def create_node_project(project_path: Path, request: ProjectRequest) -> int:
    """Create Node.js project structure"""
    files = {
        "package.json": f'''{{
  "name": "{request.project_name}",
  "version": "1.0.0",
  "description": "{request.description}",
  "main": "index.js",
  "scripts": {{
    "start": "node index.js",
    "dev": "nodemon index.js"
  }},
  "dependencies": {{
    "express": "^4.18.0"
  }},
  "devDependencies": {{
    "nodemon": "^3.0.0"
  }}
}}''',
        "index.js": f'''const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {{
  res.send(`
    <h1>{request.project_name}</h1>
    <p>{request.description}</p>
  `);
}});

app.listen(port, () => {{
  console.log(`Server running at http://localhost:${{port}}`);
}});'''
    }
    
    return write_files(project_path, files)


def write_files(project_path: Path, files: Dict[str, str]) -> int:
    """Write files to project directory"""
    files_created = 0
    
    for file_path, content in files.items():
        full_path = project_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        files_created += 1
    
    return files_created


def create_vue_project(project_path: Path, request: ProjectRequest) -> int:
    """Create Vue.js project"""
    files = {
        "package.json": f'{{"name": "{request.project_name}", "version": "1.0.0", "scripts": {{"serve": "vue-cli-service serve"}}, "dependencies": {{"vue": "^3.0.0"}}}}',
        "src/main.js": "import { createApp } from 'vue'\\nimport App from './App.vue'\\ncreateApp(App).mount('#app')",
        "src/App.vue": "<template><div>Vue App</div></template>",
        "README.md": f"# {request.project_name}\\n\\n{request.description}"
    }
    return write_files(project_path, files)


def create_angular_project(project_path: Path, request: ProjectRequest) -> int:
    """Create Angular project"""
    files = {
        "package.json": f'{{"name": "{request.project_name}", "version": "1.0.0", "dependencies": {{"@angular/core": "^17.0.0"}}}}',
        "src/app/app.component.ts": "import { Component } from '@angular/core';\\n@Component({selector: 'app-root', template: '<h1>Angular App</h1>'}) export class AppComponent {}",
        "README.md": f"# {request.project_name}\\n\\n{request.description}"
    }
    return write_files(project_path, files)


def create_python_project(project_path: Path, request: ProjectRequest) -> int:
    """Create Python project (Flask/FastAPI/Django)"""
    if "flask" in request.framework:
        files = {
            "app.py": "from flask import Flask\\napp = Flask(__name__)\\n@app.route('/')\\ndef home(): return 'Flask App'\\nif __name__ == '__main__': app.run()",
            "requirements.txt": "flask==2.3.0",
            "README.md": f"# {request.project_name}\\n\\n{request.description}"
        }
    elif "fastapi" in request.framework:
        files = {
            "main.py": "from fastapi import FastAPI\\napp = FastAPI()\\n@app.get('/')\\ndef read_root(): return {'Hello': 'FastAPI'}",
            "requirements.txt": "fastapi==0.104.0\\nuvicorn==0.24.0",
            "README.md": f"# {request.project_name}\\n\\n{request.description}"
        }
    else:  # Django
        files = {
            "manage.py": "import os, sys\\nif __name__ == '__main__': os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings'); from django.core.management import execute_from_command_line; execute_from_command_line(sys.argv)",
            "requirements.txt": "django==4.2.0",
            "README.md": f"# {request.project_name}\\n\\n{request.description}"
        }
    return write_files(project_path, files)


def create_ios_project(project_path: Path, request: ProjectRequest) -> int:
    """Create iOS Swift project"""
    files = {
        "ContentView.swift": "import SwiftUI\\nstruct ContentView: View {\\n    var body: some View {\\n        Text('iOS App')\\n    }\\n}",
        "Info.plist": '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict></dict></plist>',
        "README.md": f"# {request.project_name}\\n\\n{request.description}"
    }
    return write_files(project_path, files)


def create_android_project(project_path: Path, request: ProjectRequest) -> int:
    """Create Android Kotlin project"""
    files = {
        "app/src/main/java/MainActivity.kt": "package com.example.app\\nimport android.app.Activity\\nimport android.os.Bundle\\nclass MainActivity : Activity() {\\n    override fun onCreate(savedInstanceState: Bundle?) {\\n        super.onCreate(savedInstanceState)\\n    }\\n}",
        "app/build.gradle": "apply plugin: 'com.android.application'\\nandroid { compileSdk 34 }",
        "README.md": f"# {request.project_name}\\n\\n{request.description}"
    }
    return write_files(project_path, files)


def create_universal_project(project_path: Path, request: ProjectRequest) -> int:
    """Create universal project structure for any framework"""
    files = {
        "README.md": f"# {request.project_name}\\n\\n{request.description}\\n\\nFramework: {request.framework}",
        "src/index.js": f"// {request.project_name}\\nconsole.log('Hello from {request.framework}!');",
        "package.json": f'{{"name": "{request.project_name}", "version": "1.0.0", "description": "{request.description}", "main": "src/index.js"}}',
        "config/config.json": '{"environment": "development"}',
        "docs/GETTING_STARTED.md": f"# Getting Started with {request.project_name}\\n\\nThis project uses {request.framework}."
    }
    return write_files(project_path, files)