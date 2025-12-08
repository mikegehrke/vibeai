# -------------------------------------------------------------
# VIBEAI – NEXT.JS PROJECT GENERATOR
# -------------------------------------------------------------
"""
Next.js Project Generator

Creates production-ready Next.js apps with:
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- API Routes
- File-based routing
- Image optimization
"""

import os
from typing import Dict, Optional

from project_generator.base_writer import writer


class NextJSProjectGenerator:
    """
    Generate Next.js projects with SSR and API routes.

    Features:
    - Hybrid SSR/SSG rendering
    - API routes built-in
    - Image optimization
    - TypeScript ready
    - Production optimized
    """

    def create_project(self, base_path: str, project_name: str, options: Optional[Dict] = None) -> Dict:
        """
        Create complete Next.js project.

        Args:
            base_path: Project root directory
            project_name: Project name
            options: {
                "description": "App description",
                "use_app_router": False,  # Use pages/ by default
                "include_api": True
            }

        Returns:
            {
                "success": True,
                "files_created": 15,
                "project_path": "/path/to/project"
            }
        """
        if options is None:
            options = {}

        try:
            # Create structure
            self._create_structure(base_path, options)

            # Write config
            self._write_config(base_path, project_name, options)

            # Write pages
            self._write_pages(base_path, options)

            # Write components
            self._write_components(base_path)

            # Write styles
            self._write_styles(base_path)

            stats = writer.get_project_stats(base_path)

            return {
                "success": True,
                "files_created": stats["total_files"],
                "project_path": base_path,
                "framework": "nextjs",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "framework": "nextjs"}

    def _create_structure(self, base_path: str, options: Dict):
        """Create Next.js directory structure."""
        structure = ["pages", "pages/api", "components", "styles", "public", "lib"]

        writer.create_structure(base_path, structure)

    def _write_config(self, base_path: str, name: str, options: Dict):
        """Write Next.js configuration files."""

        clean_name = name.lower().replace(" ", "-")
        description = options.get("description", f"{name} - Next.js app built with VibeAI")

        # package.json
        package = f"""{{
  "name": "{clean_name}",
  "version": "1.0.0",
  "description": "{description}",
  "private": true,
  "scripts": {{
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build && next export"
  }},
  "dependencies": {{
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }},
  "devDependencies": {{
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.4"
  }}
}}
"""

        # next.config.js
        next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
"""

        # .eslintrc.json
        eslint = """{
  "extends": "next/core-web-vitals"
}
"""

        # .gitignore
        gitignore = """# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/

# Production
dist/

# Misc
.DS_Store
*.pem
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel

# Editor
.vscode/
.idea/
"""

        # README.md
        readme = f"""# {name}

{description}

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation