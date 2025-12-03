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

    def create_project(
        self,
        base_path: str,
        project_name: str,
        options: Optional[Dict] = None
    ) -> Dict:
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
                "framework": "react"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "framework": "react"
            }

    def _create_structure(self, base_path: str):
        """Create React directory structure."""
        structure = [
            "src",
            "src/components",
            "src/assets",
            "public"
        ]
        
        writer.create_structure(base_path, structure)

    def _write_config(
        self,
        base_path: str,
        name: str,
        options: Dict
    ):
        """Write React configuration files."""
        
        clean_name = name.lower().replace(" ", "-")
        description = options.get(
            "description",
            f"{name} - React app built with VibeAI"
        )
        
        # package.json
        package = f'''{{
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
'''
        
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

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

Build output: `dist/`

### Preview Production Build

```bash
npm run preview
```

## 📦 Project Structure

```
src/
├── main.jsx            # Entry point
├── App.jsx             # Main app component
├── App.css             # App styles
├── components/         # Reusable components
└── assets/             # Images, fonts

public/                 # Static assets
```

## 🛠️ Tech Stack

- React 18
- Vite 5
- Modern JavaScript/JSX
- Hot Module Replacement

## 🎨 Features

- ⚡ Lightning-fast HMR
- 📦 Optimized production builds
- 🎯 Component-based architecture
- 🔧 ESLint ready
- 🚀 Built with VibeAI

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint
"""
        
        # .gitignore
        gitignore = """# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# Vite
.vite
"""
        
        files = {
            "package.json": package,
            "vite.config.js": vite_config,
            "index.html": index_html,
            "README.md": readme,
            ".gitignore": gitignore
        }
        
        writer.batch_write(base_path, files)

    def _write_app(self, base_path: str, options: Dict):
        """Write React app files."""
        
        # src/main.jsx
        main_jsx = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
"""
        
        # src/App.jsx
        app_jsx = """import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to VibeAI</h1>
        <p>React App Built with Intelligence</p>
        
        <div className="counter-section">
          <button onClick={() => setCount((count) => count + 1)}>
            Count: {count}
          </button>
          <p>Click the button to increment</p>
        </div>
        
        <div className="features">
          <div className="feature">
            <h3>⚡ Fast</h3>
            <p>Lightning-fast HMR with Vite</p>
          </div>
          <div className="feature">
            <h3>🎯 Modern</h3>
            <p>React 18 with Hooks</p>
          </div>
          <div className="feature">
            <h3>🚀 Ready</h3>
            <p>Production builds optimized</p>
          </div>
        </div>
      </header>
    </div>
  )
}

export default App
"""
        
        writer.write_file(os.path.join(base_path, "src/main.jsx"), main_jsx)
        writer.write_file(os.path.join(base_path, "src/App.jsx"), app_jsx)

    def _write_styles(self, base_path: str):
        """Write CSS styles."""
        
        app_css = """* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.App-header {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 2rem;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.counter-section {
  margin: 3rem 0;
  text-align: center;
}

button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

button:active {
  transform: translateY(0);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  max-width: 800px;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature h3 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.feature p {
  opacity: 0.9;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}
"""
        
        writer.write_file(os.path.join(base_path, "src/App.css"), app_css)


# Global instance
react_project = ReactProjectGenerator()
