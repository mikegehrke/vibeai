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

from typing import Dict, Optional, List
from pathlib import Path
import os
import shutil
import subprocess
from datetime import datetime


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
        options: Optional[Dict] = None
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
                result = await self._create_flutter_project(
                    project_path, project_name, options
                )
            elif framework == "react":
                result = await self._create_react_project(
                    project_path, project_name, options
                )
            elif framework == "nextjs":
                result = await self._create_nextjs_project(
                    project_path, project_name, options
                )
            elif framework == "vue":
                result = await self._create_vue_project(
                    project_path, project_name, options
                )
            elif framework == "node":
                result = await self._create_node_project(
                    project_path, project_name, options
                )
            else:
                return {
                    "success": False,
                    "error": f"Framework '{framework}' not supported"
                }

            # Post-processing: Git init
            if options.get("git_init", False):
                git_result = self._init_git(project_path)
                result["git_initialized"] = git_result

            # Post-processing: Install dependencies
            if options.get("install_deps", False):
                deps_result = await self._install_dependencies(
                    project_path, framework
                )
                result["dependencies_installed"] = deps_result

            return result

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "framework": framework
            }

    async def _create_flutter_project(
        self,
        path: Path,
        name: str,
        options: Optional[Dict]
    ) -> Dict:
        """Create Flutter project structure."""
        from ai.project_generator.templates.flutter_template import (
            FlutterTemplate
        )

        template = FlutterTemplate()
        files_created = 0

        # Create directories
        (path / "lib").mkdir(exist_ok=True)
        (path / "test").mkdir(exist_ok=True)
        (path / "assets").mkdir(exist_ok=True)

        # Create pubspec.yaml
        pubspec = template.get_pubspec(name, options)
        with open(path / "pubspec.yaml", 'w') as f:
            f.write(pubspec)
        files_created += 1

        # Create main.dart
        main_dart = template.get_main(name, options)
        with open(path / "lib" / "main.dart", 'w') as f:
            f.write(main_dart)
        files_created += 1

        # Create README
        readme = template.get_readme(name)
        with open(path / "README.md", 'w') as f:
            f.write(readme)
        files_created += 1

        # Create .gitignore
        gitignore = template.get_gitignore()
        with open(path / ".gitignore", 'w') as f:
            f.write(gitignore)
        files_created += 1

        return {
            "success": True,
            "project_path": str(path),
            "framework": "flutter",
            "files_created": files_created
        }

    async def _create_react_project(
        self,
        path: Path,
        name: str,
        options: Optional[Dict]
    ) -> Dict:
        """Create React project structure."""
        from ai.project_generator.templates.react_template import (
            ReactTemplate
        )

        template = ReactTemplate()
        files_created = 0

        # Create directories
        (path / "src").mkdir(exist_ok=True)
        (path / "public").mkdir(exist_ok=True)

        # Create package.json
        package_json = template.get_package_json(name, options)
        with open(path / "package.json", 'w') as f:
            f.write(package_json)
        files_created += 1

        # Create index.html
        index_html = template.get_index_html(name)
        with open(path / "public" / "index.html", 'w') as f:
            f.write(index_html)
        files_created += 1

        # Create App.jsx
        app_jsx = template.get_app_jsx(name, options)
        with open(path / "src" / "App.jsx", 'w') as f:
            f.write(app_jsx)
        files_created += 1

        # Create index.jsx
        index_jsx = template.get_index_jsx()
        with open(path / "src" / "index.jsx", 'w') as f:
            f.write(index_jsx)
        files_created += 1

        # Create vite.config.js
        vite_config = template.get_vite_config()
        with open(path / "vite.config.js", 'w') as f:
            f.write(vite_config)
        files_created += 1

        # Create README
        readme = template.get_readme(name)
        with open(path / "README.md", 'w') as f:
            f.write(readme)
        files_created += 1

        return {
            "success": True,
            "project_path": str(path),
            "framework": "react",
            "files_created": files_created
        }

    async def _create_nextjs_project(
        self,
        path: Path,
        name: str,
        options: Optional[Dict]
    ) -> Dict:
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
                "lint": "next lint"
            },
            "dependencies": {
                "next": "^14.0.0",
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            },
            "devDependencies": {
                "eslint": "^8.50.0",
                "eslint-config-next": "^14.0.0"
            }
        }

        import json
        with open(path / "package.json", 'w') as f:
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
        with open(path / "pages" / "index.js", 'w') as f:
            f.write(index_page)
        files_created += 1

        # pages/api/hello.js
        api_route = """export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from VibeAI API' });
}
"""
        with open(path / "pages" / "api" / "hello.js", 'w') as f:
            f.write(api_route)
        files_created += 1

        # pages/_app.js
        app_page = """import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
"""
        with open(path / "pages" / "_app.js", 'w') as f:
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
        with open(path / "styles" / "globals.css", 'w') as f:
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
        with open(path / "styles" / "Home.module.css", 'w') as f:
            f.write(home_css)
        files_created += 1

        # next.config.js
        next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
"""
        with open(path / "next.config.js", 'w') as f:
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
        with open(path / ".gitignore", 'w') as f:
            f.write(gitignore)
        files_created += 1

        # README.md
        readme = f"""# {name}

{options.get('description', 'Built with VibeAI & Next.js')}

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- Next.js 14
- React 18
- API Routes
- CSS Modules
- Built with VibeAI
"""
        with open(path / "README.md", 'w') as f:
            f.write(readme)
        files_created += 1

        return {
            "success": True,
            "project_path": str(path),
            "framework": "nextjs",
            "files_created": files_created
        }

    async def _create_vue_project(
        self,
        path: Path,
        name: str,
        options: Optional[Dict]
    ) -> Dict:
        """
        Create Vue.js 3 project with Vite.
        """
        files_created = 0

        # Create directories
        (path / "src").mkdir(exist_ok=True)
        (path / "src" / "components").mkdir(exist_ok=True)
        (path / "public").mkdir(exist_ok=True)

        # package.json
        package = {
            "name": name.lower().replace(" ", "-"),
            "version": "0.1.0",
            "description": options.get("description", f"{name} - Vue App"),
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            "dependencies": {
                "vue": "^3.3.0"
            },
            "devDependencies": {
                "@vitejs/plugin-vue": "^4.4.0",
                "vite": "^5.0.0"
            }
        }

        import json
        with open(path / "package.json", 'w') as f:
            json.dump(package, f, indent=2)
        files_created += 1

        # src/App.vue
        app_vue = f"""<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {{
  name: 'App',
  data() {{
    return {{
      title: '{name}',
      description: 'Built with VibeAI & Vue 3'
    }}
  }}
}}
</script>

<style>
#app {{
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}}
</style>
"""
        with open(path / "src" / "App.vue", 'w') as f:
            f.write(app_vue)
        files_created += 1

        # src/main.js
        main_js = """import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
"""
        with open(path / "src" / "main.js", 'w') as f:
            f.write(main_js)
        files_created += 1

        # public/index.html
        index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
"""
        with open(path / "public" / "index.html", 'w') as f:
            f.write(index_html)
        files_created += 1

        # vite.config.js
        vite_config = """import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()]
});
"""
        with open(path / "vite.config.js", 'w') as f:
            f.write(vite_config)
        files_created += 1

        # .gitignore
        gitignore = """node_modules/
dist/
.DS_Store
*.log
"""
        with open(path / ".gitignore", 'w') as f:
            f.write(gitignore)
        files_created += 1

        # README.md
        readme = f"""# {name}

{options.get('description', 'Built with VibeAI & Vue 3')}

## Setup

```bash
npm install
npm run dev
```
"""
        with open(path / "README.md", 'w') as f:
            f.write(readme)
        files_created += 1

        return {
            "success": True,
            "project_path": str(path),
            "framework": "vue",
            "files_created": files_created
        }

    async def _create_node_project(
        self,
        path: Path,
        name: str,
        options: Optional[Dict]
    ) -> Dict:
        """Create Node.js backend project."""
        files_created = 0

        # Create directories
        (path / "src").mkdir(exist_ok=True)
        (path / "routes").mkdir(exist_ok=True)

        # Create package.json
        package = {
            "name": name,
            "version": "1.0.0",
            "main": "src/index.js",
            "scripts": {
                "start": "node src/index.js",
                "dev": "nodemon src/index.js"
            },
            "dependencies": {
                "express": "^4.18.0",
                "cors": "^2.8.5"
            },
            "devDependencies": {
                "nodemon": "^3.0.0"
            }
        }

        import json
        with open(path / "package.json", 'w') as f:
            json.dump(package, f, indent=2)
        files_created += 1

        # Create index.js
        index_js = """const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'VibeAI Backend' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
"""
        with open(path / "src" / "index.js", 'w') as f:
            f.write(index_js)
        files_created += 1

        return {
            "success": True,
            "project_path": str(path),
            "framework": "node",
            "files_created": files_created
        }

    def _init_git(self, path: Path) -> bool:
        """Initialize Git repository in project."""
        try:
            result = subprocess.run(
                ["git", "init"],
                cwd=path,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                # Create initial commit
                subprocess.run(
                    ["git", "add", "."],
                    cwd=path,
                    capture_output=True
                )
                subprocess.run(
                    ["git", "commit", "-m", "Initial commit (VibeAI)"],
                    cwd=path,
                    capture_output=True
                )
                return True
            
            return False
            
        except Exception:
            return False

    async def _install_dependencies(
        self,
        path: Path,
        framework: str
    ) -> bool:
        """
        Install project dependencies.
        
        - Flutter: flutter pub get
        - React/Vue/Next/Node: npm install
        """
        try:
            if framework == "flutter":
                result = subprocess.run(
                    ["flutter", "pub", "get"],
                    cwd=path,
                    capture_output=True,
                    timeout=120
                )
            else:
                # npm install for JS frameworks
                result = subprocess.run(
                    ["npm", "install"],
                    cwd=path,
                    capture_output=True,
                    timeout=180
                )
            
            return result.returncode == 0
            
        except Exception:
            return False

    def list_projects(self) -> List[Dict]:
        """List all generated projects."""
        projects = []
        
        if not self.output_dir.exists():
            return projects
        
        for project_dir in self.output_dir.iterdir():
            if project_dir.is_dir():
                # Detect framework
                framework = self._detect_framework(project_dir)
                
                projects.append({
                    "project_id": project_dir.name,
                    "project_path": str(project_dir),
                    "framework": framework,
                    "created_at": datetime.fromtimestamp(
                        project_dir.stat().st_ctime
                    ).isoformat()
                })
        
        return projects

    def _detect_framework(self, path: Path) -> str:
        """Detect project framework from files."""
        if (path / "pubspec.yaml").exists():
            return "flutter"
        elif (path / "next.config.js").exists():
            return "nextjs"
        elif (path / "package.json").exists():
            with open(path / "package.json", 'r', encoding='utf-8') as f:
                import json
                pkg = json.load(f)
                deps = pkg.get("dependencies", {})
                
                if "next" in deps:
                    return "nextjs"
                elif "vue" in deps:
                    return "vue"
                elif "react" in deps:
                    return "react"
                elif "express" in deps:
                    return "node"
        
        return "unknown"

    def get_project_info(self, project_id: str) -> Optional[Dict]:
        """Get detailed project information."""
        project_path = self.output_dir / project_id
        
        if not project_path.exists():
            return None
        
        framework = self._detect_framework(project_path)
        
        # Count files
        file_count = sum(
            1 for _ in project_path.rglob('*') if _.is_file()
        )
        
        return {
            "project_id": project_id,
            "project_path": str(project_path),
            "framework": framework,
            "file_count": file_count,
            "size_mb": self._get_dir_size(project_path),
            "created_at": datetime.fromtimestamp(
                project_path.stat().st_ctime
            ).isoformat(),
            "modified_at": datetime.fromtimestamp(
                project_path.stat().st_mtime
            ).isoformat()
        }

    def _get_dir_size(self, path: Path) -> float:
        """Get directory size in MB."""
        total = sum(
            f.stat().st_size for f in path.rglob('*') if f.is_file()
        )
        return round(total / 1024 / 1024, 2)

    def delete_project(self, project_id: str) -> bool:
        """Delete project completely."""
        project_path = self.output_dir / project_id

        if project_path.exists():
            shutil.rmtree(project_path)
            return True

        return False

    def project_exists(self, project_id: str) -> bool:
        """Check if project exists."""
        return (self.output_dir / project_id).exists()

    def get_stats(self) -> Dict:
        """Get global project generator statistics."""
        projects = self.list_projects()
        
        framework_counts = {}
        for project in projects:
            fw = project["framework"]
            framework_counts[fw] = framework_counts.get(fw, 0) + 1
        
        total_size = sum(
            self._get_dir_size(self.output_dir / p["project_id"])
            for p in projects
        )
        
        return {
            "total_projects": len(projects),
            "frameworks": framework_counts,
            "total_size_mb": round(total_size, 2),
            "output_directory": str(self.output_dir)
        }


# Global instance
project_generator = ProjectGenerator()
