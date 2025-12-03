# 🚀 Project Generator - Complete Guide

Automated project scaffolding for all major frameworks.

---

## 📦 Supported Frameworks

| Framework | Version | Features | Build Output |
|-----------|---------|----------|--------------|
| **Flutter** | Latest | Mobile + Web + Desktop | APK, Web, Desktop |
| **React** | 18+ (Vite) | Modern React with HMR | Web (SPA) |
| **Next.js** | 14+ | Full-stack with SSR/SSG | Web + API Routes |
| **Vue.js** | 3+ (Vite) | Composition API | Web (SPA) |
| **Node.js** | 18+ | Express REST API | Server |

---

## 🔧 API Endpoints

### 1. Create Project
```bash
POST /generator/create
```

**Request:**
```json
{
  "project_id": "myapp_123",
  "framework": "react",
  "project_name": "My Awesome App",
  "description": "A social media app",
  "author": "VibeAI",
  "git_init": true,
  "install_deps": false,
  "template_type": "basic"
}
```

**Response:**
```json
{
  "success": true,
  "project_path": "/tmp/vibeai_projects/myapp_123",
  "framework": "react",
  "files_created": 8,
  "git_initialized": true,
  "dependencies_installed": false
}
```

### 2. List All Projects
```bash
GET /generator/list
```

**Response:**
```json
{
  "projects": [
    {
      "project_id": "myapp_123",
      "project_path": "/tmp/vibeai_projects/myapp_123",
      "framework": "react",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 1
}
```

### 3. Get Project Info
```bash
GET /generator/project/{project_id}
```

**Response:**
```json
{
  "project_id": "myapp_123",
  "project_path": "/tmp/vibeai_projects/myapp_123",
  "framework": "react",
  "file_count": 12,
  "size_mb": 2.5,
  "created_at": "2024-01-01T12:00:00Z",
  "modified_at": "2024-01-01T13:00:00Z"
}
```

### 4. Delete Project
```bash
DELETE /generator/project/{project_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Project 'myapp_123' deleted"
}
```

### 5. Get Statistics
```bash
GET /generator/stats
```

**Response:**
```json
{
  "total_projects": 15,
  "frameworks": {
    "react": 5,
    "flutter": 4,
    "nextjs": 3,
    "vue": 2,
    "node": 1
  },
  "total_size_mb": 125.6,
  "output_directory": "/tmp/vibeai_projects"
}
```

### 6. Get Supported Frameworks
```bash
GET /generator/frameworks
```

**Response:**
```json
{
  "frameworks": [
    {
      "id": "flutter",
      "name": "Flutter",
      "description": "Google's UI toolkit",
      "features": ["Cross-platform", "Hot reload"],
      "build_types": ["APK", "Web", "Desktop"]
    },
    ...
  ]
}
```

---

## 📁 Generated Project Structures

### Flutter Project
```
myapp/
├── pubspec.yaml           # Dependencies
├── lib/
│   └── main.dart         # Entry point
├── test/
├── assets/
├── README.md
└── .gitignore
```

### React (Vite) Project
```
myapp/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   └── App.css
├── public/
├── README.md
└── .gitignore
```

### Next.js Project
```
myapp/
├── package.json
├── next.config.js
├── pages/
│   ├── index.js
│   ├── _app.js
│   └── api/
│       └── hello.js      # API route
├── components/
├── styles/
│   ├── globals.css
│   └── Home.module.css
├── public/
├── README.md
└── .gitignore
```

### Vue.js (Vite) Project
```
myapp/
├── package.json
├── vite.config.js
├── src/
│   ├── App.vue
│   ├── main.js
│   └── components/
├── public/
│   └── index.html
├── README.md
└── .gitignore
```

### Node.js (Express) Project
```
myapp/
├── package.json
├── src/
│   └── index.js          # Express server
├── routes/
├── README.md
└── .gitignore
```

---

## 🔨 Usage Examples

### Example 1: Create React App
```bash
curl -X POST http://localhost:8000/generator/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "social_app",
    "framework": "react",
    "project_name": "Social Media App",
    "description": "A modern social platform",
    "git_init": true
  }'
```

### Example 2: Create Next.js Full-Stack App
```bash
curl -X POST http://localhost:8000/generator/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "fullstack_app",
    "framework": "nextjs",
    "project_name": "Full Stack App",
    "install_deps": true
  }'
```

### Example 3: Create Flutter Mobile App
```bash
curl -X POST http://localhost:8000/generator/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "mobile_app",
    "framework": "flutter",
    "project_name": "Mobile App",
    "git_init": true,
    "install_deps": true
  }'
```

### Example 4: List All Projects
```bash
curl http://localhost:8000/generator/list
```

### Example 5: Get Project Statistics
```bash
curl http://localhost:8000/generator/stats
```

---

## 🎯 Complete Workflow

### Workflow 1: React App from Scratch
```bash
# 1. Create project
curl -X POST http://localhost:8000/generator/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "myreactapp",
    "framework": "react",
    "project_name": "My React App",
    "git_init": true
  }'

# 2. Check project info
curl http://localhost:8000/generator/project/myreactapp

# 3. (Manual) Install dependencies
cd /tmp/vibeai_projects/myreactapp
npm install

# 4. (Manual) Start dev server
npm run dev

# 5. Open browser: http://localhost:5173
```

### Workflow 2: Full-Stack Next.js with API
```bash
# 1. Create Next.js project
curl -X POST http://localhost:8000/generator/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "fullstack",
    "framework": "nextjs",
    "project_name": "Full Stack App",
    "install_deps": true
  }'

# 2. Start dev server (auto-installs deps)
cd /tmp/vibeai_projects/fullstack
npm run dev

# 3. Access:
# - Frontend: http://localhost:3000
# - API: http://localhost:3000/api/hello
```

### Workflow 3: Flutter Mobile App
```bash
# 1. Create Flutter project
curl -X POST http://localhost:8000/generator/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "mobileapp",
    "framework": "flutter",
    "project_name": "Mobile App"
  }'

# 2. Get dependencies
cd /tmp/vibeai_projects/mobileapp
flutter pub get

# 3. Run on web
flutter run -d chrome

# 4. Build APK
flutter build apk
```

---

## 🔄 Integration with Orchestrator

The Project Generator integrates seamlessly with the Multi-Agent Orchestrator:

```bash
# Complete workflow: Create → Generate UI → Build → Deploy
curl -X POST http://localhost:8000/orchestrator/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "project_id": "myapp",
    "workflow": "full_cycle",
    "params": {
      "framework": "react",
      "project_name": "My App",
      "prompt": "Create a login screen with email and password"
    }
  }'

# This will:
# 1. Generate project structure (Project Generator)
# 2. Create UI from prompt (UI Agent)
# 3. Generate code (Code Agent)
# 4. Start preview (Preview Agent)
# 5. Build app (Build Agent)
# 6. Deploy (Deploy Agent)
```

---

## 📊 Project Generator Features

### ✅ Automated Setup
- Complete directory structure
- All configuration files
- Dependencies management
- Git initialization (optional)
- README generation

### ✅ Framework-Specific Templates
- Flutter: Material Design template
- React: Modern Vite setup
- Next.js: SSR + API routes
- Vue: Composition API
- Node: Express REST API

### ✅ Best Practices
- ESLint configuration
- .gitignore files
- Package manager setup
- Hot reload support
- Production-ready configs

### ✅ Management Tools
- List all projects
- Get project details
- Delete projects
- Statistics tracking
- Framework detection

---

## 🛠️ Advanced Options

### Custom Templates
```json
{
  "template_type": "advanced"  // basic | advanced
}
```

### Git Initialization
```json
{
  "git_init": true  // Creates .git, initial commit
}
```

### Auto-Install Dependencies
```json
{
  "install_deps": true  // Runs npm install or flutter pub get
}
```

---

## 📈 Statistics & Monitoring

### Global Stats
```bash
GET /generator/stats

# Returns:
{
  "total_projects": 42,
  "frameworks": {
    "react": 15,
    "flutter": 12,
    "nextjs": 8,
    "vue": 5,
    "node": 2
  },
  "total_size_mb": 850.5,
  "output_directory": "/tmp/vibeai_projects"
}
```

### Per-Project Stats
```bash
GET /generator/project/myapp

# Returns:
{
  "project_id": "myapp",
  "framework": "react",
  "file_count": 25,
  "size_mb": 15.8,
  "created_at": "2024-01-01T12:00:00Z",
  "modified_at": "2024-01-01T14:30:00Z"
}
```

---

## 🔐 Best Practices

1. **Unique Project IDs**: Use descriptive, unique IDs
2. **Git Init**: Enable for version control
3. **Install Deps**: Enable for automated setup
4. **Cleanup**: Delete unused projects regularly
5. **Backups**: Copy important projects outside /tmp

---

## 📚 Resources

- **Output Directory**: `/tmp/vibeai_projects/`
- **Templates**: `/backend/ai/project_generator/templates/`
- **API Docs**: http://localhost:8000/docs#/Project%20Generator

---

**Status**: ✅ Production Ready!
