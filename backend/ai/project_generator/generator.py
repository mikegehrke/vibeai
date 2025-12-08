# -------------------------------------------------------------
# VIBEAI – PROJECT GENERATOR
# -------------------------------------------------------------
"""
Complete Project Generator - Automated Project Scaffolding

Creates production-ready project structures for:
- Flutter (Mobile + Web)
- React (Vite + Modern Stack)
- Next.js (Full-stack React)
- Node.js (Express Backend)
- Vue.js (Vite)
- Full-stack combinations

Features:
- Complete directory structure
- All configuration files
- Dependencies management
- Git initialization
- README generation
- Environment setup
- Best practices
"""

import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class ProjectGenerator:
    """
    Automated project scaffolding system.

    Generates complete, production-ready projects with:
    - Framework-specific structure
    - All config files (package.json, pubspec.yaml, etc.)
    - Git initialization
    - Dependencies
    - Sample code
    - Documentation
    """

    def __init__(self):
        self.templates_dir = Path(__file__).parent / "templates"
        self.output_dir = Path("/tmp/vibeai_projects")
        self.output_dir.mkdir(exist_ok=True)

    async def create_project(
        self,
        project_id: str,
        framework: str,
        project_name: str,
        options: Optional[Dict] = None,
    ) -> Dict:
        """
        Create complete project with full setup.

        Args:
            project_id: Unique project ID
            framework: flutter | react | vue | node | nextjs
            project_name: Display name for project
            options: {
                "description": "...",
                "author": "...",
                "git_init": True,
                "install_deps": True,
                "template_type": "basic" | "advanced"
            }

        Returns:
            {
                "success": True,
                "project_path": "/tmp/vibeai_projects/proj123",
                "framework": "flutter",
                "files_created": 15,
                "git_initialized": True,
                "dependencies_installed": True
            }
        """
        if options is None:
            options = {}

        project_path = self.output_dir / project_id
        project_path.mkdir(exist_ok=True)

        try:
            # Route to framework-specific generator
            if framework == "flutter":
                result = await self._create_flutter_project(project_path, project_name, options)
            elif framework == "react":
                result = await self._create_react_project(project_path, project_name, options)
            elif framework == "nextjs":
                result = await self._create_nextjs_project(project_path, project_name, options)
            elif framework == "vue":
                result = await self._create_vue_project(project_path, project_name, options)
            elif framework == "node":
                result = await self._create_node_project(project_path, project_name, options)
            else:
                return {
                    "success": False,
                    "error": f"Framework '{framework}' not supported",
                }

            # Post-processing: Git init
            if options.get("git_init", False):
                git_result = self._init_git(project_path)
                result["git_initialized"] = git_result

            # Post-processing: Install dependencies
            if options.get("install_deps", False):
                deps_result = await self._install_dependencies(project_path, framework)
                result["dependencies_installed"] = deps_result

            return result

        except Exception as e:
            return {"success": False, "error": str(e), "framework": framework}

    async def _create_flutter_project(self, path: Path, name: str, options: Optional[Dict]) -> Dict:
        """Create Flutter project structure."""
        from ai.project_generator.templates.flutter_template import FlutterTemplate

        template = FlutterTemplate()
        files_created = 0

        # Create directories
        (path / "lib").mkdir(exist_ok=True)
        (path / "test").mkdir(exist_ok=True)
        (path / "assets").mkdir(exist_ok=True)

        # Create pubspec.yaml
        pubspec = template.get_pubspec(name, options)
        with open(path / "pubspec.yaml", "w", encoding="utf-8") as f:
            f.write(pubspec)
        files_created += 1

        # Create main.dart
        main_dart = template.get_main(name, options)
        with open(path / "lib" / "main.dart", "w", encoding="utf-8") as f:
            f.write(main_dart)
        files_created += 1

        # Create README
        readme = template.get_readme(name)
        with open(path / "README.md", "w", encoding="utf-8") as f:
            f.write(readme)
        files_created += 1

        # Create .gitignore
        gitignore = template.get_gitignore()
        with open(path / ".gitignore", "w", encoding="utf-8") as f:
            f.write(gitignore)
        files_created += 1

        return {
            "success": True,
            "project_path": str(path),
            "framework": "flutter",
            "files_created": files_created,
        }

    async def _create_react_project(self, path: Path, name: str, options: Optional[Dict]) -> Dict:
        """Create React project structure."""
        from ai.project_generator.templates.react_template import ReactTemplate

        template = ReactTemplate()
        files_created = 0

        # Create directories
        (path / "src").mkdir(exist_ok=True)
        (path / "public").mkdir(exist_ok=True)

        # Create package.json
        package_json = template.get_package_json(name, options)
        with open(path / "package.json", "w", encoding="utf-8") as f:
            f.write(package_json)
        files_created += 1

        # Create index.html
        index_html = template.get_index_html(name)
        with open(path / "public" / "index.html", "w", encoding="utf-8") as f:
            f.write(index_html)
        files_created += 1

        # Create App.jsx
        app_jsx = template.get_app_jsx(name, options)
        with open(path / "src" / "App.jsx", "w", encoding="utf-8") as f:
            f.write(app_jsx)
        files_created += 1

        # Create index.jsx
        index_jsx = template.get_index_jsx()
        with open(path / "src" / "index.jsx", "w", encoding="utf-8") as f:
            f.write(index_jsx)
        files_created += 1

        # Create vite.config.js
        vite_config = template.get_vite_config()
        with open(path / "vite.config.js", "w", encoding="utf-8") as f:
            f.write(vite_config)
        files_created += 1

        # Create README
        readme = template.get_readme(name)
        with open(path / "README.md", "w", encoding="utf-8") as f:
            f.write(readme)
        files_created += 1

        return {
            "success": True,
            "project_path": str(path),
            "framework": "react",
            "files_created": files_created,
        }

    async def _create_nextjs_project(self, path: Path, name: str, options: Optional[Dict]) -> Dict:
        """
        Create Next.js project structure.

        Full-stack React with SSR, API routes, and modern features.
        """
        files_created = 0

        # Create directories
        (path / "pages").mkdir(exist_ok=True)
        (path / "pages" / "api").mkdir(exist_ok=True)
        (path / "components").mkdir(exist_ok=True)
        (path / "styles").mkdir(exist_ok=True)
        (path / "public").mkdir(exist_ok=True)

        # package.json
        package = {
            "name": name.lower().replace(" ", "-"),
            "version": "0.1.0",
            "description": options.get("description", f"{name} - Next.js App"),
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint",
            },
            "dependencies": {
                "next": "^14.0.0",
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
            },
            "devDependencies": {"eslint": "^8.50.0", "eslint-config-next": "^14.0.0"},
        }

        import json

        with open(path / "package.json", "w", encoding="utf-8") as f:
            json.dump(package, f, indent=2)
        files_created += 1

        # pages/index.js
        index_page = f"""import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {{
  return (
    <div className={{styles.container}}>
      <Head>
        <title>{name}</title>
        <meta name="description" content="{options.get('description', 'Built with VibeAI')}" />
      </Head>

      <main className={{styles.main}}>
        <h1 className={{styles.title}}>
          Welcome to {name}
        </h1>

        <p className={{styles.description}}>
          Built with VibeAI & Next.js
        </p>
      </main>
    </div>
  );
}}
"""
        with open(path / "pages" / "index.js", "w", encoding="utf-8") as f:
            f.write(index_page)
        files_created += 1

        # pages/api/hello.js
        api_route = """export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from VibeAI API' });
}
"""
        with open(path / "pages" / "api" / "hello.js", "w", encoding="utf-8") as f:
            f.write(api_route)
        files_created += 1

        # pages/_app.js
        app_page = """import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
"""
        with open(path / "pages" / "_app.js", "w", encoding="utf-8") as f:
            f.write(app_page)
        files_created += 1

        # styles/globals.css
        globals_css = """* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
"""
        with open(path / "styles" / "globals.css", "w", encoding="utf-8") as f:
            f.write(globals_css)
        files_created += 1

        # styles/Home.module.css
        home_css = """.container {
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main {
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
}

.description {
  text-align: center;
  line-height: 1.5;
  font-size: 1.5rem;
}
"""
        with open(path / "styles" / "Home.module.css", "w", encoding="utf-8") as f:
            f.write(home_css)
        files_created += 1

        # next.config.js
        next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
"""
        with open(path / "next.config.js", "w", encoding="utf-8") as f:
            f.write(next_config)
        files_created += 1

        # .gitignore
        gitignore = """node_modules/
.next/
out/
.env*.local
.DS_Store
*.log
"""
        with open(path / ".gitignore", "w", encoding="utf-8") as f:
            f.write(gitignore)
        files_created += 1

        # README.md
        readme = f"""# {name}

{options.get('description', 'Built with VibeAI & Next.js')}

## Getting Started