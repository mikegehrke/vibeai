# -------------------------------------------------------------
# VIBEAI – NODE.JS (EXPRESS) PROJECT GENERATOR
# -------------------------------------------------------------
"""
Node.js Express Backend Generator

Creates production-ready Express API servers with:
- RESTful API structure
- Middleware setup
- Error handling
- Environment configuration
- Database ready
"""

import os
from typing import Dict, Optional

from project_generator.base_writer import writer


class NodeProjectGenerator:
    """
    Generate Node.js Express backend projects.

    Features:
    - Express server setup
    - REST API structure
    - CORS enabled
    - Environment config
    - Error handling
    - Logging ready
    """

    def create_project(self, base_path: str, project_name: str, options: Optional[Dict] = None) -> Dict:
        """
        Create complete Node.js Express project.

        Args:
            base_path: Project root directory
            project_name: Project name
            options: {
                "description": "API description",
                "port": 5000,
                "include_db": False,
                "include_auth": False
            }

        Returns:
            {
                "success": True,
                "files_created": 12,
                "project_path": "/path/to/project"
            }
        """
        if options is None:
            options = {}

        try:
            # Create structure
            self._create_structure(base_path)

            # Write config
            self._write_config(base_path, project_name, options)

            # Write server
            self._write_server(base_path, options)

            # Write routes
            self._write_routes(base_path)

            # Write middleware
            self._write_middleware(base_path)

            stats = writer.get_project_stats(base_path)

            return {
                "success": True,
                "files_created": stats["total_files"],
                "project_path": base_path,
                "framework": "node",
            }

        except Exception as e:
            return {"success": False, "error": str(e), "framework": "node"}

    def _create_structure(self, base_path: str):
        """Create Node.js project structure."""
        structure = [
            "src",
            "src/routes",
            "src/middleware",
            "src/controllers",
            "src/models",
            "src/utils",
            "src/config",
            "tests",
        ]

        writer.create_structure(base_path, structure)

    def _write_config(self, base_path: str, name: str, options: Dict):
        """Write Node.js configuration files."""

        clean_name = name.lower().replace(" ", "-")
        description = options.get("description", f"{name} - Express API built with VibeAI")
        port = options.get("port", 5000)

        # package.json
        package = f"""{{
  "name": "{clean_name}",
  "version": "1.0.0",
  "description": "{description}",
  "main": "src/server.js",
  "type": "module",
  "scripts": {{
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "lint": "eslint src/**/*.js"
  }},
  "keywords": ["express", "api", "backend", "vibeai"],
  "author": "VibeAI",
  "license": "MIT",
  "dependencies": {{
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0"
  }},
  "devDependencies": {{
    "nodemon": "^3.0.2",
    "eslint": "^8.55.0",
    "jest": "^29.7.0"
  }}
}}
"""

        # .env.example
        env_example = f"""# Server Configuration
PORT={port}
NODE_ENV=development

# API Configuration
API_PREFIX=/api/v1

# CORS
CORS_ORIGIN=http://localhost:3000

# Database (if needed)
# DATABASE_URL=mongodb://localhost:27017/{clean_name}

# JWT Secret (if using auth)
# JWT_SECRET=your-secret-key-here
"""

        # .env
        env = f"""PORT={port}
NODE_ENV=development
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000
"""

        # .gitignore
        gitignore = """# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# Production
dist/
build/

# Testing
coverage/

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
"""

        # README.md
        readme = f"""# {name}

{description}

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation
"""

        writer.write_file(os.path.join(base_path, 'package.json'), package)
        writer.write_file(os.path.join(base_path, '.env.example'), env_example)
        writer.write_file(os.path.join(base_path, '.env'), env)
        writer.write_file(os.path.join(base_path, '.gitignore'), gitignore)
        writer.write_file(os.path.join(base_path, 'README.md'), readme)

    def _write_server(self, base_path: str, options: Dict):
        """Write the server setup file."""
        server_content = """import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
"""
        writer.write_file(os.path.join(base_path, 'src', 'server.js'), server_content)

    def _write_routes(self, base_path: str):
        """Write the routes setup file."""
        routes_content = """import express from 'express';

const router = express.Router();

router.get('/example', (req, res) => {
  res.json({ message: 'This is an example route' });
});

export default router;
"""
        writer.write_file(os.path.join(base_path, 'src', 'routes', 'example.js'), routes_content)

    def _write_middleware(self, base_path: str):
        """Write the middleware setup file."""
        middleware_content = """export const exampleMiddleware = (req, res, next) => {
  console.log('Middleware executed');
  next();
};
"""
        writer.write_file(os.path.join(base_path, 'src', 'middleware', 'exampleMiddleware.js'), middleware_content)
# Singleton instance
node_project = NodeProjectGenerator()
