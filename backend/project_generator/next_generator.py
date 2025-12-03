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

    def create_project(
        self,
        base_path: str,
        project_name: str,
        options: Optional[Dict] = None
    ) -> Dict:
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
                "framework": "nextjs"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "framework": "nextjs"
            }

    def _create_structure(self, base_path: str, options: Dict):
        """Create Next.js directory structure."""
        structure = [
            "pages",
            "pages/api",
            "components",
            "styles",
            "public",
            "lib"
        ]
        
        writer.create_structure(base_path, structure)

    def _write_config(
        self,
        base_path: str,
        name: str,
        options: Dict
    ):
        """Write Next.js configuration files."""
        
        clean_name = name.lower().replace(" ", "-")
        description = options.get(
            "description",
            f"{name} - Next.js app built with VibeAI"
        )
        
        # package.json
        package = f'''{{
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
'''
        
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
npm run start
```

### Static Export

```bash
npm run export
```

Output: `out/`

## 📦 Project Structure

```
pages/
├── index.js            # Home page
├── about.js            # About page
└── api/                # API routes
    └── hello.js        # Example endpoint

components/             # React components
styles/                 # Global styles
public/                 # Static files
lib/                    # Utility functions
```

## 🛠️ Tech Stack

- Next.js 14
- React 18
- SSR/SSG
- API Routes
- Image Optimization

## 🎨 Features

- ⚡ Hybrid SSR/SSG rendering
- 🔌 Built-in API routes
- 🖼️ Automatic image optimization
- 📱 Mobile-first responsive
- 🚀 Production ready
- 🎯 SEO optimized

## 🌐 Deployment

### Vercel (Recommended)

```bash
vercel
```

### Other Platforms

Build static export:
```bash
npm run export
```

Deploy `out/` directory to any static host.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint with ESLint
- `npm run export` - Build static export
"""
        
        files = {
            "package.json": package,
            "next.config.js": next_config,
            ".eslintrc.json": eslint,
            ".gitignore": gitignore,
            "README.md": readme
        }
        
        writer.batch_write(base_path, files)

    def _write_pages(self, base_path: str, options: Dict):
        """Write Next.js pages."""
        
        # pages/index.js
        index_page = """import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>VibeAI - Next.js App</title>
        <meta name="description" content="Next.js app built with VibeAI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.gradient}>VibeAI</span>
        </h1>

        <p className={styles.description}>
          Next.js App Built with Intelligence
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>⚡ Fast</h2>
            <p>Hybrid SSR/SSG rendering for optimal performance</p>
          </div>

          <div className={styles.card}>
            <h2>🔌 API Routes</h2>
            <p>Built-in serverless API endpoints</p>
          </div>

          <div className={styles.card}>
            <h2>🖼️ Images</h2>
            <p>Automatic image optimization</p>
          </div>

          <div className={styles.card}>
            <h2>🚀 Deploy</h2>
            <p>One-click Vercel deployment</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with VibeAI ✨</p>
      </footer>
    </div>
  )
}
"""
        
        # pages/about.js
        about_page = """import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function About() {
  return (
    <div className={styles.container}>
      <Head>
        <title>About - VibeAI</title>
        <meta name="description" content="About this Next.js app" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>About</h1>
        <p className={styles.description}>
          This is a Next.js app generated by VibeAI
        </p>
        
        <Link href="/">
          <a className={styles.link}>← Back to Home</a>
        </Link>
      </main>
    </div>
  )
}
"""
        
        # pages/_app.js
        app_page = """import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
"""
        
        # pages/api/hello.js
        api_hello = """export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Hello from VibeAI API',
    timestamp: new Date().toISOString(),
    method: req.method
  })
}
"""
        
        writer.write_file(os.path.join(base_path, "pages/index.js"), index_page)
        writer.write_file(os.path.join(base_path, "pages/about.js"), about_page)
        writer.write_file(os.path.join(base_path, "pages/_app.js"), app_page)
        writer.write_file(os.path.join(base_path, "pages/api/hello.js"), api_hello)

    def _write_components(self, base_path: str):
        """Write reusable components."""
        
        # components/Layout.js
        layout = """import styles from '../styles/Home.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}
"""
        
        writer.write_file(os.path.join(base_path, "components/Layout.js"), layout)

    def _write_styles(self, base_path: str):
        """Write CSS styles."""
        
        # styles/globals.css
        globals = """html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
  body {
    color: white;
    background: black;
  }
}
"""
        
        # styles/Home.module.css
        home_module = """.container {
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main {
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.footer {
  width: 100%;
  height: 100px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
  color: white;
}

.gradient {
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.description {
  margin: 2rem 0;
  line-height: 1.5;
  font-size: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin-top: 3rem;
}

.card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  color: white;
}

.card:hover {
  transform: translateY(-5px);
}

.card h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.card p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.9;
}

.link {
  color: #ffd700;
  font-size: 1.2rem;
  margin-top: 2rem;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .title {
    font-size: 3rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
"""
        
        writer.write_file(os.path.join(base_path, "styles/globals.css"), globals)
        writer.write_file(os.path.join(base_path, "styles/Home.module.css"), home_module)


# Global instance
nextjs_project = NextJSProjectGenerator()
