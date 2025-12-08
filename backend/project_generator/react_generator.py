# -------------------------------------------------------------
# VIBEAI – REACT PROJECT GENERATOR
# -------------------------------------------------------------
"""
React (Vite) Project Generator

Creates modern React projects with:
- Vite build tool
- React 18+
- Hot Module Replacement
- Modern JSX/JavaScript
- Component structure
"""

import os
from typing import Dict, Optional

from project_generator.base_writer import writer


class ReactProjectGenerator:
    """
    Generate modern React projects with Vite.

    Features:
    - Lightning-fast HMR
    - Modern tooling
    - Component-based architecture
    - Production-ready builds
    """

    def create_project(self, base_path: str, project_name: str, options: Optional[Dict] = None) -> Dict:
        """
        Create complete React project.

        Args:
            base_path: Project root directory
            project_name: Project name
            options: {
                "description": "App description",
                "use_typescript": False,
                "include_router": False
            }

        Returns:
            {
                "success": True,
                "files_created": 10,
                "project_path": "/path/to/project"
            }
        """
        if options is None:
            options = {}

        try:
            # Create structure
            self._create_structure(base_path)

            # Write config files
            self._write_config(base_path, project_name, options)

            # Write app files
            self._write_app(base_path, options)

            # Write styles
            self._write_styles(base_path)

            stats = writer.get_project_stats(base_path)

            return {
                "success": True,
                "files_created": stats["total_files"],
                "project_path": base_path,
                "framework": "react",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "framework": "react"}

    def _create_structure(self, base_path: str):
        """Create React directory structure."""
        structure = ["src", "src/components", "src/assets", "public"]

        writer.create_structure(base_path, structure)

    def _write_config(self, base_path: str, name: str, options: Dict):
        """Write React configuration files."""

        clean_name = name.lower().replace(" ", "-")
        description = options.get("description", f"{name} - React app built with VibeAI")

        # package.json
        package = f"""{{
  "name": "{clean_name}",
  "private": true,
  "version": "1.0.0",
  "description": "{description}",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src"
  }},
  "dependencies": {{
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }},
  "devDependencies": {{
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2"
  }}
}}
"""

        # vite.config.js
        vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
"""

        # index.html
        index_html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""

        # README.md
        readme = f"""# {name}

{description}

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

To install dependencies, run:"""
        writer.write_file(os.path.join(base_path, "README.md"), readme_content)


# Create instance for module-level import compatibility
react_project = ReactProjectGenerator()

