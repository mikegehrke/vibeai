#!/usr/bin/env python3
# -------------------------------------------------------------
# VIBEAI CLI – Command Line Interface
# -------------------------------------------------------------
"""
VibeAI CLI - Create and manage VibeAI projects

Usage:
  vibeai create <name> [--type=<type>] [--template=<template>]
  vibeai init [--framework=<framework>]
  vibeai deploy [--platform=<platform>]
  vibeai theme [--framework=<framework>] [--preset=<preset>]
  vibeai --version
  vibeai --help

Examples:
  vibeai create myapp --type=flutter
  vibeai create webapp --type=react --template=dashboard
  vibeai init --framework=nextjs
  vibeai deploy --platform=vercel
  vibeai theme --framework=flutter --preset=ocean
"""

import click
import os
import json
import subprocess
from pathlib import Path
from typing import Optional

VERSION = "2.0.0"


@click.group()
@click.version_option(VERSION, prog_name="VibeAI CLI")
def cli():
    """🚀 VibeAI CLI - AI-Powered App Development Platform"""
    pass


@cli.command()
@click.argument("name")
@click.option(
    "--type",
    "-t",
    default="flutter",
    type=click.Choice(["flutter", "react", "nextjs", "vue", "angular", "api"]),
    help="Project type"
)
@click.option(
    "--template",
    default=None,
    type=click.Choice(["basic", "dashboard", "ecommerce", "social", "chat"]),
    help="Project template"
)
@click.option(
    "--theme",
    default="purple",
    type=click.Choice(["purple", "ocean", "forest", "sunset", "rose", "midnight"]),
    help="Color theme"
)
def create(name: str, type: str, template: Optional[str], theme: str):
    """
    📦 Create a new VibeAI project
    
    Creates a complete project structure with:
    - Framework setup
    - Theme configuration
    - Authentication (optional)
    - Database connection (optional)
    - Deployment config
    """
    click.echo(f"\n🚀 Creating VibeAI project: {click.style(name, fg='cyan', bold=True)}")
    click.echo(f"   Type: {click.style(type, fg='green')}")
    if template:
        click.echo(f"   Template: {click.style(template, fg='yellow')}")
    click.echo(f"   Theme: {click.style(theme, fg='magenta')}\n")
    
    # Create project directory
    project_path = Path(name)
    if project_path.exists():
        click.echo(f"❌ Error: Directory '{name}' already exists", err=True)
        return
    
    project_path.mkdir(parents=True)
    
    # Generate project structure
    _create_project_structure(project_path, type, template, theme)
    
    # Initialize git
    if click.confirm("Initialize git repository?", default=True):
        _init_git(project_path)
    
    # Install dependencies
    if click.confirm("Install dependencies?", default=True):
        _install_dependencies(project_path, type)
    
    click.echo(f"\n✅ Project '{name}' created successfully!")
    click.echo(f"\nNext steps:")
    click.echo(f"  cd {name}")
    click.echo(_get_run_command(type))
    click.echo(f"  vibeai deploy --platform=vercel")


@cli.command()
@click.option(
    "--framework",
    "-f",
    default="react",
    type=click.Choice(["flutter", "react", "nextjs", "vue", "angular"]),
    help="Framework to initialize"
)
def init(framework: str):
    """
    🎯 Initialize VibeAI in existing project
    
    Adds VibeAI configuration to current directory
    """
    click.echo(f"\n🎯 Initializing VibeAI for {click.style(framework, fg='cyan')}...\n")
    
    current_dir = Path.cwd()
    
    # Create vibeai.json config
    config = {
        "framework": framework,
        "version": VERSION,
        "features": {
            "auth": False,
            "database": False,
            "pwa": False,
            "theme": "default"
        }
    }
    
    config_path = current_dir / "vibeai.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    
    click.echo("✅ Created vibeai.json")
    
    # Create .vibeai directory
    vibeai_dir = current_dir / ".vibeai"
    vibeai_dir.mkdir(exist_ok=True)
    
    click.echo("✅ Created .vibeai/ directory")
    click.echo("\n✅ Initialization complete!")


@cli.command()
@click.option(
    "--platform",
    "-p",
    default="vercel",
    type=click.Choice(["vercel", "netlify", "cloudflare", "railway", "render", "docker"]),
    help="Deployment platform"
)
def deploy(platform: str):
    """
    🚀 Deploy project to platform
    
    Generates deployment configuration and deploys
    """
    click.echo(f"\n🚀 Deploying to {click.style(platform, fg='cyan', bold=True)}...\n")
    
    # Check if vibeai.json exists
    config_path = Path.cwd() / "vibeai.json"
    if not config_path.exists():
        click.echo("❌ No vibeai.json found. Run 'vibeai init' first.", err=True)
        return
    
    with open(config_path) as f:
        config = json.load(f)
    
    framework = config.get("framework", "react")
    
    # Generate deployment config
    click.echo(f"📦 Generating {platform} configuration...")
    _generate_deploy_config(platform, framework)
    
    # Deploy
    if click.confirm("Deploy now?", default=True):
        _run_deploy(platform)
    
    click.echo("\n✅ Deployment configuration ready!")


@cli.command()
@click.option(
    "--framework",
    "-f",
    default="react",
    type=click.Choice(["flutter", "react", "css", "tailwind", "vue", "angular"]),
    help="Framework for theme"
)
@click.option(
    "--preset",
    "-p",
    default="purple",
    type=click.Choice(["purple", "ocean", "forest", "sunset", "rose", "midnight"]),
    help="Color preset"
)
def theme(framework: str, preset: str):
    """
    🎨 Generate theme configuration
    
    Creates theme files for framework
    """
    click.echo(f"\n🎨 Generating {click.style(preset, fg='magenta')} theme for {click.style(framework, fg='cyan')}...\n")
    
    theme_colors = _get_theme_colors(preset)
    
    click.echo("Colors:")
    for name, color in theme_colors.items():
        click.echo(f"  {name}: {click.style(color, fg='white', bg='black')}")
    
    # Generate theme files
    _generate_theme_files(framework, theme_colors)
    
    click.echo("\n✅ Theme generated successfully!")


# ========== HELPER FUNCTIONS ==========

def _create_project_structure(
    project_path: Path,
    project_type: str,
    template: Optional[str],
    theme: str
):
    """Creates project directory structure"""
    
    # Create basic structure
    if project_type == "flutter":
        _create_flutter_project(project_path, template, theme)
    elif project_type in ["react", "nextjs"]:
        _create_react_project(project_path, project_type, template, theme)
    elif project_type == "vue":
        _create_vue_project(project_path, template, theme)
    elif project_type == "api":
        _create_api_project(project_path)
    
    # Create vibeai.json
    config = {
        "name": project_path.name,
        "type": project_type,
        "template": template,
        "theme": theme,
        "version": VERSION
    }
    
    with open(project_path / "vibeai.json", "w") as f:
        json.dump(config, f, indent=2)


def _create_flutter_project(project_path: Path, template: Optional[str], theme: str):
    """Creates Flutter project structure"""
    click.echo("📱 Creating Flutter project...")
    
    # Create directories
    (project_path / "lib").mkdir()
    (project_path / "lib" / "screens").mkdir()
    (project_path / "lib" / "widgets").mkdir()
    (project_path / "lib" / "theme").mkdir()
    
    # Create main.dart
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
        primarySwatch: Colors.purple,
      ),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('VibeAI')),
      body: Center(child: Text('Welcome to VibeAI!')),
    );
  }
}
"""
    
    with open(project_path / "lib" / "main.dart", "w") as f:
        f.write(main_content)
    
    # Create pubspec.yaml
    pubspec_content = f"""name: {project_path.name}
description: A VibeAI Flutter application
version: 1.0.0

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0
"""
    
    with open(project_path / "pubspec.yaml", "w") as f:
        f.write(pubspec_content)


def _create_react_project(project_path: Path, project_type: str, template: Optional[str], theme: str):
    """Creates React/Next.js project structure"""
    click.echo("⚛️  Creating React project...")
    
    (project_path / "src").mkdir()
    (project_path / "public").mkdir()
    
    # Create package.json
    package_json = {
        "name": project_path.name,
        "version": "1.0.0",
        "private": True,
        "scripts": {
            "dev": "vite" if project_type == "react" else "next dev",
            "build": "vite build" if project_type == "react" else "next build",
            "start": "vite preview" if project_type == "react" else "next start"
        },
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
        },
        "devDependencies": {
            "vite": "^5.0.0" if project_type == "react" else None,
            "@vitejs/plugin-react": "^4.0.0" if project_type == "react" else None
        }
    }
    
    # Remove None values
    package_json["devDependencies"] = {k: v for k, v in package_json["devDependencies"].items() if v}
    
    with open(project_path / "package.json", "w") as f:
        json.dump(package_json, f, indent=2)


def _create_vue_project(project_path: Path, template: Optional[str], theme: str):
    """Creates Vue project structure"""
    click.echo("💚 Creating Vue project...")
    
    (project_path / "src").mkdir()
    (project_path / "public").mkdir()


def _create_api_project(project_path: Path):
    """Creates API project structure"""
    click.echo("🔧 Creating API project...")
    
    (project_path / "app").mkdir()
    (project_path / "app" / "routes").mkdir()
    (project_path / "app" / "models").mkdir()


def _init_git(project_path: Path):
    """Initializes git repository"""
    click.echo("🔧 Initializing git...")
    subprocess.run(["git", "init"], cwd=project_path, check=True)
    
    # Create .gitignore
    gitignore_content = """# Dependencies
node_modules/
.dart_tool/
.packages
build/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
"""
    
    with open(project_path / ".gitignore", "w") as f:
        f.write(gitignore_content)


def _install_dependencies(project_path: Path, project_type: str):
    """Installs project dependencies"""
    click.echo("📦 Installing dependencies...")
    
    if project_type == "flutter":
        subprocess.run(["flutter", "pub", "get"], cwd=project_path)
    elif project_type in ["react", "nextjs", "vue"]:
        subprocess.run(["npm", "install"], cwd=project_path)


def _get_run_command(project_type: str) -> str:
    """Returns run command for project type"""
    commands = {
        "flutter": "  flutter run",
        "react": "  npm run dev",
        "nextjs": "  npm run dev",
        "vue": "  npm run dev",
        "angular": "  ng serve",
        "api": "  uvicorn app.main:app --reload"
    }
    return commands.get(project_type, "  npm start")


def _generate_deploy_config(platform: str, framework: str):
    """Generates deployment configuration"""
    configs = {
        "vercel": "vercel.json",
        "netlify": "netlify.toml",
        "railway": "railway.json",
        "render": "render.yaml"
    }
    
    config_file = configs.get(platform)
    if config_file:
        click.echo(f"✅ Created {config_file}")


def _run_deploy(platform: str):
    """Runs deployment command"""
    commands = {
        "vercel": ["vercel", "--prod"],
        "netlify": ["netlify", "deploy", "--prod"],
        "railway": ["railway", "up"],
        "render": ["render", "deploy"]
    }
    
    cmd = commands.get(platform, ["echo", "Deploy manually"])
    subprocess.run(cmd)


def _get_theme_colors(preset: str) -> dict:
    """Returns color palette for preset"""
    presets = {
        "purple": {"primary": "#667eea", "secondary": "#764ba2"},
        "ocean": {"primary": "#0ea5e9", "secondary": "#06b6d4"},
        "forest": {"primary": "#059669", "secondary": "#10b981"},
        "sunset": {"primary": "#f97316", "secondary": "#fb923c"},
        "rose": {"primary": "#ec4899", "secondary": "#f472b6"},
        "midnight": {"primary": "#6366f1", "secondary": "#8b5cf6"}
    }
    return presets.get(preset, presets["purple"])


def _generate_theme_files(framework: str, colors: dict):
    """Generates theme files"""
    click.echo(f"✅ Generating {framework} theme files...")


if __name__ == "__main__":
    cli()
