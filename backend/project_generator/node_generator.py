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

    def create_project(
        self,
        base_path: str,
        project_name: str,
        options: Optional[Dict] = None
    ) -> Dict:
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
                "framework": "node"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "framework": "node"
            }

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
            "tests"
        ]
        
        writer.create_structure(base_path, structure)

    def _write_config(
        self,
        base_path: str,
        name: str,
        options: Dict
    ):
        """Write Node.js configuration files."""
        
        clean_name = name.lower().replace(" ", "-")
        description = options.get(
            "description",
            f"{name} - Express API built with VibeAI"
        )
        port = options.get("port", 5000)
        
        # package.json
        package = f'''{{
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
'''
        
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

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables in `.env`

### Development

```bash
npm run dev
```

Server runs on [http://localhost:{port}](http://localhost:{port})

### Production

```bash
npm start
```

## 📦 Project Structure

```
src/
├── server.js           # Entry point
├── routes/             # API routes
├── controllers/        # Business logic
├── middleware/         # Custom middleware
├── models/             # Data models
├── utils/              # Helper functions
└── config/             # Configuration files

tests/                  # Test files
```

## 🛠️ Tech Stack

- Express.js 4
- Node.js 18+
- CORS enabled
- Helmet security
- Morgan logging
- Environment config

## 🎨 Features

- ✅ RESTful API structure
- ✅ CORS configured
- ✅ Security headers (Helmet)
- ✅ Request logging (Morgan)
- ✅ Environment variables
- ✅ Error handling
- ✅ Development hot reload

## 📝 API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Example Endpoints

```
GET    /api/v1/items      # Get all items
GET    /api/v1/items/:id  # Get item by ID
POST   /api/v1/items      # Create item
PUT    /api/v1/items/:id  # Update item
DELETE /api/v1/items/:id  # Delete item
```

## 🧪 Testing

```bash
npm test
```

## 🌐 Deployment

### Environment Variables

Set in production:
- `PORT` - Server port
- `NODE_ENV=production`
- `CORS_ORIGIN` - Allowed origins

### Deploy to Render/Heroku/Railway

1. Push to Git
2. Connect repository
3. Set environment variables
4. Deploy

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start with nodemon
- `npm test` - Run tests
- `npm run lint` - Lint code
"""
        
        files = {
            "package.json": package,
            ".env.example": env_example,
            ".env": env,
            ".gitignore": gitignore,
            "README.md": readme
        }
        
        writer.batch_write(base_path, files)

    def _write_server(self, base_path: str, options: Dict):
        """Write main server file."""
        
        server_js = """import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import itemRoutes from './routes/items.js'
import errorHandler from './middleware/errorHandler.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const API_PREFIX = process.env.API_PREFIX || '/api/v1'

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API Routes
app.use(`${API_PREFIX}/items`, itemRoutes)

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to VibeAI API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: API_PREFIX
    }
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📍 API: http://localhost:${PORT}${API_PREFIX}`)
})

export default app
"""
        
        writer.write_file(os.path.join(base_path, "src/server.js"), server_js)

    def _write_routes(self, base_path: str):
        """Write API routes."""
        
        # src/routes/items.js
        items_route = """import express from 'express'
import * as itemController from '../controllers/itemController.js'

const router = express.Router()

// GET all items
router.get('/', itemController.getAllItems)

// GET item by ID
router.get('/:id', itemController.getItemById)

// POST create item
router.post('/', itemController.createItem)

// PUT update item
router.put('/:id', itemController.updateItem)

// DELETE item
router.delete('/:id', itemController.deleteItem)

export default router
"""
        
        writer.write_file(os.path.join(base_path, "src/routes/items.js"), items_route)
        
        # src/controllers/itemController.js
        controller = """// In-memory data store (replace with database)
let items = [
  { id: 1, name: 'Item 1', description: 'Sample item' },
  { id: 2, name: 'Item 2', description: 'Another item' }
]

let nextId = 3

// Get all items
export const getAllItems = (req, res) => {
  res.json({
    success: true,
    count: items.length,
    data: items
  })
}

// Get item by ID
export const getItemById = (req, res) => {
  const id = parseInt(req.params.id)
  const item = items.find(i => i.id === id)
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    })
  }
  
  res.json({
    success: true,
    data: item
  })
}

// Create new item
export const createItem = (req, res) => {
  const { name, description } = req.body
  
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Name is required'
    })
  }
  
  const newItem = {
    id: nextId++,
    name,
    description: description || ''
  }
  
  items.push(newItem)
  
  res.status(201).json({
    success: true,
    data: newItem
  })
}

// Update item
export const updateItem = (req, res) => {
  const id = parseInt(req.params.id)
  const itemIndex = items.findIndex(i => i.id === id)
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    })
  }
  
  items[itemIndex] = {
    ...items[itemIndex],
    ...req.body,
    id // Prevent ID change
  }
  
  res.json({
    success: true,
    data: items[itemIndex]
  })
}

// Delete item
export const deleteItem = (req, res) => {
  const id = parseInt(req.params.id)
  const itemIndex = items.findIndex(i => i.id === id)
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    })
  }
  
  items = items.filter(i => i.id !== id)
  
  res.json({
    success: true,
    message: 'Item deleted'
  })
}
"""
        
        writer.write_file(
            os.path.join(base_path, "src/controllers/itemController.js"),
            controller
        )

    def _write_middleware(self, base_path: str):
        """Write middleware files."""
        
        # src/middleware/errorHandler.js
        error_handler = """const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack)
  
  const statusCode = err.statusCode || 500
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default errorHandler
"""
        
        writer.write_file(
            os.path.join(base_path, "src/middleware/errorHandler.js"),
            error_handler
        )


# Global instance
node_project = NodeProjectGenerator()
