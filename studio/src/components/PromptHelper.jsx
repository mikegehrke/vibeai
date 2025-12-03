import React, { useState } from 'react';
import './PromptHelper.css';

const PromptHelper = ({ onInsertPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  
  // Prompt Generator State
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [projectType, setProjectType] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [features, setFeatures] = useState([]);
  const [customFeature, setCustomFeature] = useState('');
  const [architecture, setArchitecture] = useState('');
  const [database, setDatabase] = useState('');
  const [deployment, setDeployment] = useState('');

  const promptTemplates = [
    {
      name: '📱 Mobile App (React Native)',
      prompt: `Erstelle eine vollständige Mobile App in React Native mit:
- Firebase Authentication (Login/Register/Forgot Password)
- Real-time Database
- Push Notifications
- Image Upload & Storage
- Responsive Design für iOS & Android
- Offline Support

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

Tech Stack: React Native, Expo, Firebase, TypeScript

Dateistruktur:
- src/screens/
- src/components/
- src/navigation/
- src/services/firebase.ts
- src/hooks/
- src/utils/

Erstelle ALLE Dateien komplett mit Production-Ready Code!`
    },
    {
      name: '🛒 E-Commerce Shop',
      prompt: `Entwickle einen vollständigen Online-Shop in Next.js mit:
- Produktkatalog mit Suche, Filter & Kategorien
- Warenkorb System
- Stripe Payment Integration
- User Dashboard & Order History
- Admin Panel (Produkte verwalten)
- PostgreSQL Datenbank
- Email Notifications

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

Stack: Next.js 14, Prisma, Stripe, TailwindCSS, TypeScript

Dateistruktur:
- app/page.tsx
- app/products/[id]/page.tsx
- app/checkout/page.tsx
- components/ProductCard.tsx
- components/Cart.tsx
- lib/stripe.ts
- prisma/schema.prisma

Erstelle ALLE Dateien komplett mit Production-Ready Code!`
    },
    {
      name: '📊 Dashboard Analytics',
      prompt: `Erstelle ein vollständiges Analytics Dashboard in React mit:
- Echtzeitdaten-Visualisierung (Charts, Graphs)
- Multiple Data Sources Integration
- Export Funktionen (PDF, CSV, Excel)
- Responsive Layout
- Dark/Light Mode
- User Management
- API Integration

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

Tech Stack: React, Vite, Recharts, TailwindCSS, TypeScript

Dateistruktur:
- src/components/charts/
- src/components/tables/
- src/hooks/useData.ts
- src/utils/exporters.ts
- src/api/client.ts

Erstelle ALLE Dateien komplett mit Production-Ready Code!`
    },
    {
      name: '💬 Chat App (Real-time)',
      prompt: `Entwickle eine vollständige Real-time Chat App mit:
- WebSocket Verbindung
- Private & Group Chats
- File Sharing (Images, Videos, Docs)
- Typing Indicators
- Read Receipts
- Push Notifications
- Voice Messages
- User Presence (Online/Offline)

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

Stack: React + Socket.io + Node.js + MongoDB + Redis

Frontend Struktur:
- src/components/ChatWindow.tsx
- src/components/MessageList.tsx
- src/components/UserList.tsx
- src/hooks/useSocket.ts

Backend Struktur:
- server/index.js
- server/socket/handlers.js
- server/models/Message.js

Erstelle ALLE Dateien komplett mit Production-Ready Code!`
    },
    {
      name: '🎯 SaaS Platform',
      prompt: `Erstelle eine vollständige SaaS-Plattform mit:
- Multi-Tenant Architektur
- Subscription Management (Stripe)
- Team/Organization Management
- Role-Based Access Control (RBAC)
- API mit Rate Limiting
- Analytics & Usage Tracking
- Email Campaigns
- Billing Portal

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

Stack: Next.js 14, Prisma, PostgreSQL, Stripe, NextAuth, TypeScript

Dateistruktur:
- app/(dashboard)/
- app/api/
- components/billing/
- components/teams/
- lib/auth.ts
- lib/stripe.ts
- prisma/schema.prisma

Erstelle ALLE Dateien komplett mit Production-Ready Code!`
    },
    {
      name: '🎮 Game (Browser)',
      prompt: `Entwickle ein vollständiges Browser-Game mit:
- Canvas/WebGL Rendering
- Multiplayer Funktionalität
- Scoreboard & Leaderboard
- Game State Management
- Sound Effects & Music
- Mobile Touch Controls
- Save/Load System

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

Stack: React Three Fiber, Socket.io, Zustand, TypeScript

Dateistruktur:
- src/game/
- src/components/
- src/hooks/
- src/utils/physics.ts
- src/store/gameStore.ts

Erstelle ALLE Dateien komplett mit Production-Ready Code!`
    }
  ];

  const bestPractices = [
    {
      title: '✅ Sei spezifisch mit Tech-Stack',
      good: 'Erstelle eine React Native App mit Expo, TypeScript, Firebase Auth, AsyncStorage, und React Navigation',
      bad: 'Mach eine mobile App'
    },
    {
      title: '✅ Fordere ALLE Dateien auf einmal',
      good: 'WICHTIG - AGENT MODUS: Erstelle ALLE Dateien komplett mit Production-Ready Code, keine Platzhalter!',
      bad: 'Zeig mir ein Beispiel oder mach die Hauptdatei'
    },
    {
      title: '✅ Gib kompletten Tech-Stack an',
      good: 'Next.js 14 + Prisma + PostgreSQL + TailwindCSS + NextAuth + Stripe + TypeScript',
      bad: 'Mach es modern mit den neuesten Tools'
    },
    {
      title: '✅ Verlange exakte Struktur',
      good: 'Dateistruktur: src/app/, components/, lib/, prisma/schema.prisma, .env.example, README.md',
      bad: 'Organisiere es irgendwie gut'
    },
    {
      title: '✅ Nutze AGENT MODUS',
      good: 'AGENT MODUS: Erstelle die komplette Flutter App mit allen Screens, Services, Models, und Widgets!',
      bad: 'Kannst du mir helfen eine App zu bauen?'
    },
    {
      title: '✅ Backend: Spezifiziere Framework & Datenbank',
      good: 'Erstelle ein FastAPI Backend mit:\n- PostgreSQL Datenbank mit SQLAlchemy ORM\n- Alembic für Database Migrations\n- JWT Authentication (Access & Refresh Tokens)\n- CORS Middleware für Frontend-Zugriff\n- Pydantic Models für Request/Response Validation\n- API Endpoints: /auth (register, login, refresh), /users (CRUD), /posts (CRUD mit Pagination)\n- Password Hashing mit bcrypt\n- Environment Variables (.env) für Secrets\n- Error Handling Middleware\n- API Documentation mit Swagger UI',
      bad: 'Python Backend mit Datenbank'
    },
    {
      title: '✅ Mobile: Plattform & Features klar definieren',
      good: 'Erstelle eine iOS App mit:\n- Swift 5.9 + SwiftUI für UI\n- Core Data für lokale Datenbank (Entities: User, Post, Comment)\n- CloudKit für Cloud Sync\n- Push Notifications (APNs) mit Badge, Sound, Alert\n- Face ID / Touch ID für Biometric Authentication\n- Combine Framework für Reactive Programming\n- MVVM Architektur\n- Networking Layer mit URLSession / Alamofire\n- Image Caching mit SDWebImage\n- Screens: Login, Home Feed, Profile, Settings, Detail View',
      bad: 'Eine App für iPhone'
    },
    {
      title: '✅ Web Frontend: Framework & Styling',
      good: 'Erstelle eine Vue 3 App mit:\n- Composition API + <script setup> Syntax\n- Pinia für Global State Management (stores: user, cart, products)\n- Vue Router für Navigation (/, /products, /cart, /checkout, /profile)\n- TailwindCSS für Styling mit Dark Mode Toggle\n- Vite als Build Tool (HMR, Code Splitting)\n- TypeScript für Type Safety\n- Axios für API Calls mit Interceptors\n- Form Validation mit VeeValidate / Yup\n- Components: Header, Footer, ProductCard, CartItem, SearchBar\n- Responsive Design (Mobile-First)',
      bad: 'Eine moderne Website'
    },
    {
      title: '✅ Game Development: Engine & Features',
      good: 'Erstelle ein Unity 3D Game mit:\n- C# Scripting (Player Controller, Game Manager, UI Manager)\n- Photon Unity Networking (PUN2) für Multiplayer (Lobby System, Room Matching, Player Sync)\n- Unity IAP für In-App Purchases (Coins, Power-ups, Premium Content)\n- PlayFab Leaderboard Integration (Score Tracking, Ranking System, Friend Leaderboards)\n- Save System (PlayerPrefs für lokale Daten, JSON für Game States, Cloud Save über PlayFab)\n- UI Struktur: Hauptmenü, Spielszene, Pause-Menü, Settings, Shop, Leaderboard\n- Audio Manager mit SFX und Background Music\n- Particle Effects für Explosionen und Power-ups',
      bad: 'Ein Spiel entwickeln'
    },
    {
      title: '✅ AI/ML: Spezifische Libraries',
      good: 'Erstelle eine Python ML App mit:\n- TensorFlow 2.x / Keras für Deep Learning Model (CNN für Image Classification)\n- Scikit-learn für Data Preprocessing (StandardScaler, Train-Test Split)\n- Pandas für Data Loading & Analysis (CSV/Excel)\n- NumPy für Matrix Operations\n- Matplotlib / Seaborn für Data Visualization\n- Jupyter Notebook für Exploration\n- FastAPI API Endpoints: /predict (POST), /train (POST), /metrics (GET)\n- Model Serialization mit joblib / pickle\n- Docker Container für Deployment\n- Requirements: tensorflow, scikit-learn, pandas, numpy, fastapi, uvicorn',
      bad: 'KI App mit Machine Learning'
    },
    {
      title: '✅ Blockchain: Smart Contract Details',
      good: 'Erstelle eine Ethereum DApp mit:\n- Solidity 0.8.x Smart Contracts (ERC-20 Token, NFT Marketplace, Staking)\n- Hardhat für Development & Testing (hardhat.config.js, deploy scripts)\n- OpenZeppelin Contracts (Ownable, Pausable, ReentrancyGuard)\n- Web3.js / Ethers.js für Blockchain Interaction\n- React Frontend mit MetaMask Integration\n- Truffle Tests mit Chai Assertions\n- Gas Optimization & Security Best Practices\n- Events & Logs für Transaction Tracking\n- IPFS für Decentralized Storage\n- Deployment auf Sepolia Testnet + Mainnet',
      bad: 'Blockchain App mit Krypto'
    },
    {
      title: '✅ Desktop: Cross-platform oder Native',
      good: 'Erstelle eine Electron App mit:\n- React + TypeScript für UI\n- Electron IPC (Main <-> Renderer Communication)\n- Auto-Updater für Automatic Updates (electron-updater)\n- SQLite Datenbank mit better-sqlite3\n- Native Menus (File, Edit, View, Help)\n- System Tray Icon mit Context Menu\n- Keyboard Shortcuts (accelerators)\n- File System Access (read/write files)\n- Notifications API\n- Window State Management (size, position)\n- Build für Windows (.exe), macOS (.dmg), Linux (.AppImage)\n- Code Signing für Production',
      bad: 'Desktop Anwendung'
    },
    {
      title: '✅ API: REST oder GraphQL',
      good: 'Erstelle eine GraphQL API mit:\n- Apollo Server 4 (Express Integration)\n- TypeScript für Type Safety (Schemas, Resolvers)\n- Prisma ORM mit PostgreSQL (User, Post, Comment Models)\n- DataLoader für N+1 Query Prevention\n- GraphQL Subscriptions für Real-time Updates (WebSocket)\n- Authentication Context (JWT Tokens)\n- Query Complexity Analysis (DoS Prevention)\n- Pagination (Cursor-based)\n- File Upload (graphql-upload)\n- Error Handling & Logging\n- GraphQL Playground / Apollo Studio\n- Schema Stitching für Microservices',
      bad: 'API erstellen'
    },
    {
      title: '✅ DevOps: Container & Orchestrierung',
      good: 'Erstelle Docker Microservices mit:\n- Docker Compose für Local Development (api, db, redis, rabbitmq)\n- Kubernetes Manifests (Deployments, Services, ConfigMaps, Secrets)\n- Helm Charts für Package Management\n- Redis für Caching & Session Store\n- RabbitMQ für Message Queue (Event-driven Architecture)\n- Prometheus für Metrics Collection\n- Grafana Dashboards für Monitoring\n- Liveness & Readiness Probes\n- Horizontal Pod Autoscaling (HPA)\n- Ingress Controller (nginx)\n- CI/CD Pipeline (GitHub Actions / GitLab CI)\n- ArgoCD für GitOps Deployment',
      bad: 'Microservices Architektur'
    },
    {
      title: '✅ Testing: Framework & Coverage',
      good: 'Erstelle eine Test-Suite mit:\n- Jest für Unit Tests (Functions, Utils, Hooks)\n- React Testing Library für Component Tests (render, fireEvent, waitFor)\n- Cypress für E2E Tests (Login Flow, CRUD Operations, Navigation)\n- MSW (Mock Service Worker) für API Mocking\n- Coverage Report mit 80% Threshold (Statements, Branches, Functions)\n- CI/CD Pipeline (GitHub Actions: test -> build -> deploy)\n- Test Utils & Custom Matchers\n- Snapshot Testing für UI Components\n- Integration Tests für API Endpoints\n- Performance Tests (Lighthouse CI)',
      bad: 'Mit Tests'
    },
    {
      title: '✅ Authentication: Methode & Provider',
      good: 'Erstelle ein Auth System mit:\n- NextAuth.js v5 (Auth.js)\n- OAuth Providers (Google, GitHub, Discord)\n- Email Magic Links (Passwordless)\n- JWT Tokens (Access + Refresh)\n- Session Management (Database Sessions)\n- CSRF Protection (Double Submit Cookies)\n- Rate Limiting (5 requests/min)\n- Password Reset Flow (Email Token)\n- Email Verification\n- 2FA (TOTP with QR Code)\n- Role-based Access Control (RBAC)\n- Middleware für Protected Routes\n- Secure Cookies (httpOnly, sameSite, secure)',
      bad: 'Login System'
    },
    {
      title: '✅ Payment: Gateway & Features',
      good: 'Erstelle eine Stripe Integration mit:\n- Subscription Management (Plans: Free, Pro, Enterprise)\n- Stripe Checkout Sessions\n- Webhooks (checkout.session.completed, customer.subscription.updated)\n- Customer Portal (Update Payment, Cancel Subscription)\n- Invoice PDF Generation (send via Email)\n- Refund Processing\n- Payment Intent für One-time Payments\n- Proration für Plan Upgrades\n- Trial Periods (14 days free)\n- Usage-based Billing (Metered)\n- Tax Calculation (Stripe Tax)\n- Payment Method Storage\n- SCA (Strong Customer Authentication) Compliance',
      bad: 'Bezahlung einbauen'
    },
    {
      title: '✅ Real-time: WebSocket oder Library',
      good: 'Erstelle einen Real-time Chat mit:\n- Socket.io für WebSocket Communication\n- Rooms & Namespaces (DMs, Group Chats, Channels)\n- Typing Indicators (user is typing...)\n- Read Receipts (sent, delivered, read status)\n- File Sharing (Images, PDFs, Videos)\n- Message Reactions (Emojis)\n- Online/Offline Status\n- Message History (Pagination)\n- Push Notifications (Browser & Mobile)\n- Encryption (End-to-End mit CryptoJS)\n- Mention System (@username)\n- Voice/Video Calls (WebRTC)\n- Reconnection Logic',
      bad: 'Chat Funktion'
    },
    {
      title: '✅ State Management: Library definieren',
      good: 'Erstelle State Management mit:\n- Redux Toolkit (createSlice, configureStore)\n- RTK Query für API Caching (auto-generated hooks)\n- Redux Persist (localStorage für user, cart)\n- Redux DevTools für Debugging\n- TypeScript für Type-safe Actions & Reducers\n- Immer für Immutable Updates\n- Slices: auth, user, cart, products, notifications\n- Middleware: logger, error handler\n- Selectors mit Reselect (Memoization)\n- Async Thunks für Side Effects\n- Normalized State (entities, ids)',
      bad: 'State Management'
    },
    {
      title: '✅ Styling: Framework & Theme',
      good: 'Erstelle Styling mit:\n- TailwindCSS v3 (JIT Mode)\n- Dark Mode Toggle (class strategy)\n- Custom Theme (colors, fonts, spacing in tailwind.config.js)\n- Responsive Breakpoints (sm, md, lg, xl, 2xl)\n- @tailwindcss/forms für schöne Forms\n- @tailwindcss/typography für Content\n- Custom Plugins für spezielle Utilities\n- CSS Variables für Dynamic Theming\n- Animation Classes (animate-spin, fade-in)\n- Custom Gradients & Shadows\n- Mobile-First Design\n- Accessibility (focus-visible, sr-only)',
      bad: 'Schönes Design'
    },
    {
      title: '✅ Database: SQL oder NoSQL',
      good: 'Erstelle eine PostgreSQL Datenbank mit:\n- Prisma ORM (schema.prisma mit Models: User, Post, Comment, Like)\n- Migrations (prisma migrate dev/deploy)\n- Indexes für Performance (@@index auf häufig abgefragte Felder)\n- Full-Text Search (@@fulltext oder pg_trgm)\n- Row-Level Security (RLS) Policies\n- Relations (1:1, 1:n, n:m)\n- Soft Deletes (deletedAt Timestamp)\n- Timestamps (createdAt, updatedAt)\n- UUID als Primary Key\n- Connection Pooling (PgBouncer)\n- Backup & Restore Strategy\n- Database Seeding für Dev Data',
      bad: 'Datenbank verwenden'
    },
    {
      title: '✅ File Upload: Storage & Validation',
      good: 'Erstelle File Upload mit:\n- AWS S3 Bucket für Storage (aws-sdk v3)\n- Multer Middleware für File Handling\n- Sharp für Image Resize (Thumbnails: 200x200, 800x600)\n- MIME Type Validation (image/jpeg, image/png, application/pdf)\n- File Size Limit (max 10MB)\n- Upload Progress Bar (Frontend mit Axios onUploadProgress)\n- Unique Filenames (UUID + timestamp)\n- Virus Scanning (ClamAV)\n- CDN Integration (CloudFront)\n- Signed URLs für Private Files\n- Drag & Drop UI\n- Multi-file Upload',
      bad: 'Bilder hochladen'
    },
    {
      title: '✅ Email: Service & Templates',
      good: 'Erstelle Email System mit:\n- SendGrid / Resend für Email Delivery\n- HTML Email Templates (Handlebars / MJML)\n- Bull Queue für Async Processing (Redis-backed)\n- Retry Logic (3 attempts mit exponential backoff)\n- Open & Click Tracking\n- Email Types: Welcome, Password Reset, Verification, Notification\n- Attachments Support (PDF Invoices)\n- Unsubscribe Links (One-click)\n- Bounce & Spam Handling\n- Email Preview (Mailtrap für Testing)\n- Rate Limiting (max 100 emails/hour)\n- Template Variables ({{name}}, {{link}})',
      bad: 'E-Mails versenden'
    },
    {
      title: '✅ Search: Engine & Features',
      good: 'Erstelle Search mit:\n- Elasticsearch 8.x für Search Engine\n- Full-Text Search (Multi-field matching)\n- Autocomplete / Typeahead (edge-ngram analyzer)\n- Filters (Category, Price Range, Rating)\n- Facets / Aggregations (Count per Category)\n- Search Result Highlighting (matched terms)\n- Fuzzy Search (typo tolerance)\n- Synonyms (Shirt = T-Shirt = Tee)\n- Boosting (Title boost 2x, Description 1x)\n- Pagination (from, size)\n- Search Analytics (Popular queries)\n- Indexing Strategy (Bulk Insert)',
      bad: 'Suchfunktion'
    },
    {
      title: '✅ Caching: Redis & Strategy',
      good: 'Erstelle Caching mit:\n- Redis 7.x als Cache Store\n- Cache-Aside Pattern (Check cache -> Query DB -> Set cache)\n- TTL (Time to Live): User Data 1h, Product List 5min\n- Cache Invalidation (on Update/Delete)\n- Session Store (Express-session mit connect-redis)\n- Rate Limiting Store (express-rate-limit)\n- Pub/Sub für Real-time Events\n- Cache Warming (Pre-populate hot data)\n- Cache Keys Naming (user:123, product:list:page:1)\n- LRU Eviction Policy\n- Monitoring (memory usage, hit rate)',
      bad: 'Cache nutzen'
    },
  ];

  const quickPrompts = [
    // Mobile Development
    { emoji: '📱', name: 'React Native App', desc: 'Cross-platform mobile app mit React Native, Expo, TypeScript' },
    { emoji: '🦋', name: 'Flutter App', desc: 'iOS & Android App mit Flutter, Dart, Firebase' },
    { emoji: '🍎', name: 'iOS App (Swift)', desc: 'Native iOS App mit Swift, SwiftUI, Core Data' },
    { emoji: '🤖', name: 'Android App (Kotlin)', desc: 'Native Android App mit Kotlin, Jetpack Compose, Room' },
    
    // Web Frontend
    { emoji: '⚛️', name: 'React Web App', desc: 'Modern React App mit Vite, TypeScript, TailwindCSS' },
    { emoji: '🟢', name: 'Vue.js App', desc: 'Vue 3 App mit Composition API, Pinia, TypeScript' },
    { emoji: '🅰️', name: 'Angular App', desc: 'Enterprise Angular App mit TypeScript, RxJS, Material' },
    { emoji: '⚡', name: 'Next.js Full-Stack', desc: 'Next.js 14 mit App Router, Server Components, Prisma' },
    { emoji: '🎯', name: 'Svelte App', desc: 'Reactive Svelte App mit SvelteKit, TypeScript' },
    
    // Backend
    { emoji: '🐍', name: 'FastAPI Backend', desc: 'Python REST API mit FastAPI, PostgreSQL, JWT Auth' },
    { emoji: '🟩', name: 'Node.js Express API', desc: 'Express.js API mit TypeScript, MongoDB, JWT' },
    { emoji: '☕', name: 'Spring Boot API', desc: 'Java Spring Boot REST API mit JPA, MySQL, Security' },
    { emoji: '🦀', name: 'Rust Backend', desc: 'High-performance API mit Rust, Actix-Web, PostgreSQL' },
    { emoji: '🔷', name: 'Django Backend', desc: 'Python Django API mit DRF, PostgreSQL, Celery' },
    { emoji: '💎', name: 'Ruby on Rails API', desc: 'Rails API mit PostgreSQL, Sidekiq, JWT Auth' },
    { emoji: '🟣', name: 'ASP.NET Core API', desc: 'C# .NET Core API mit Entity Framework, SQL Server' },
    { emoji: '🐘', name: 'Laravel API', desc: 'PHP Laravel REST API mit MySQL, Queue, Sanctum' },
    { emoji: '🚀', name: 'GraphQL Server', desc: 'GraphQL API mit Apollo Server, TypeScript, Prisma' },
    
    // Desktop Apps
    { emoji: '💻', name: 'Electron Desktop App', desc: 'Cross-platform Desktop mit Electron, React, TypeScript' },
    { emoji: '🦾', name: 'Tauri Desktop App', desc: 'Lightweight Desktop App mit Tauri, Rust, React' },
    { emoji: '🖥️', name: '.NET Desktop App', desc: 'Windows Desktop App mit .NET MAUI, C#, XAML' },
    
    // Game Development
    { emoji: '🎮', name: 'Unity Game', desc: '3D/2D Game mit Unity, C#, Multiplayer Networking' },
    { emoji: '🎯', name: 'Godot Game', desc: 'Cross-platform Game mit Godot Engine, GDScript' },
    { emoji: '🌐', name: 'Browser Game', desc: 'HTML5 Game mit Phaser.js, TypeScript, WebGL' },
    { emoji: '🎲', name: 'Three.js 3D App', desc: 'Interactive 3D App mit Three.js, React Three Fiber' },
    
    // Blockchain & Web3
    { emoji: '⛓️', name: 'Blockchain DApp', desc: 'Decentralized App mit Solidity, Web3.js, Hardhat, React' },
    { emoji: '💰', name: 'Smart Contracts', desc: 'Ethereum Smart Contracts mit Solidity, Truffle, OpenZeppelin' },
    { emoji: '🌊', name: 'NFT Marketplace', desc: 'NFT Platform mit Solidity, IPFS, Web3.js, Next.js' },
    
    // AI & Machine Learning
    { emoji: '🤖', name: 'AI/ML Python App', desc: 'Machine Learning App mit Python, TensorFlow, Scikit-learn' },
    { emoji: '🧠', name: 'Deep Learning Model', desc: 'Neural Network mit PyTorch, CUDA, Jupyter Notebook' },
    { emoji: '💬', name: 'ChatBot AI', desc: 'AI Chatbot mit OpenAI API, LangChain, Vector DB' },
    { emoji: '👁️', name: 'Computer Vision App', desc: 'Image Recognition mit OpenCV, YOLO, FastAPI' },
    
    // Cloud & DevOps
    { emoji: '☁️', name: 'Serverless Functions', desc: 'Serverless API mit AWS Lambda, API Gateway, DynamoDB' },
    { emoji: '🐳', name: 'Docker Microservices', desc: 'Microservices mit Docker, Kubernetes, Redis, RabbitMQ' },
    { emoji: '📊', name: 'Monitoring Dashboard', desc: 'DevOps Dashboard mit Grafana, Prometheus, Node.js' },
    
    // Extensions & Plugins
    { emoji: '🧩', name: 'Chrome Extension', desc: 'Browser Extension mit React, Manifest V3, Storage API' },
    { emoji: '📦', name: 'VS Code Extension', desc: 'VS Code Plugin mit TypeScript, Language Server Protocol' },
    { emoji: '🎨', name: 'Figma Plugin', desc: 'Figma Plugin mit TypeScript, Figma Plugin API' },
    
    // Other
    { emoji: '📱', name: 'Progressive Web App (PWA)', desc: 'PWA mit Next.js, Service Workers, Offline Support' },
    { emoji: '🔐', name: 'Authentication System', desc: 'Auth System mit OAuth2, JWT, 2FA, Password Reset' },
    { emoji: '💳', name: 'Payment Integration', desc: 'Payment Gateway mit Stripe, PayPal, Webhooks' },
    { emoji: '📧', name: 'Email Service', desc: 'Email System mit SendGrid, Templates, Queue, Analytics' },
    { emoji: '🔍', name: 'Search Engine', desc: 'Full-text Search mit Elasticsearch, Redis, FastAPI' },
    { emoji: '📊', name: 'Analytics Dashboard', desc: 'Data Visualization mit D3.js, Chart.js, React, PostgreSQL' }
  ];

  // Prompt Generator Options
  const projectTypes = [
    { value: 'web-app', label: '🌐 Web App', stack: ['React', 'Vue', 'Next.js', 'Angular'] },
    { value: 'mobile-app', label: '📱 Mobile App', stack: ['React Native', 'Flutter', 'Swift', 'Kotlin'] },
    { value: 'desktop-app', label: '💻 Desktop App', stack: ['Electron', 'Tauri', 'Qt', '.NET MAUI'] },
    { value: 'api-backend', label: '🔌 API/Backend', stack: ['FastAPI', 'Express', 'Django', 'Spring Boot'] },
    { value: 'fullstack', label: '🎯 Full-Stack', stack: ['Next.js', 'MERN', 'Django+React', 'Laravel+Vue'] },
    { value: 'game', label: '🎮 Game', stack: ['Unity', 'Godot', 'Three.js', 'Phaser'] },
    { value: 'ai-ml', label: '🤖 AI/ML App', stack: ['Python', 'TensorFlow', 'PyTorch', 'FastAPI'] },
    { value: 'blockchain', label: '⛓️ Blockchain', stack: ['Solidity', 'Web3.js', 'Hardhat', 'Ethers.js'] },
  ];

  const featuresList = [
    '🔐 Authentication (Login/Register)',
    '👤 User Profiles',
    '💳 Payment Integration (Stripe/PayPal)',
    '📧 Email Notifications',
    '🔔 Push Notifications',
    '📱 Real-time Updates',
    '🌙 Dark Mode',
    '🌍 i18n (Internationalization)',
    '📊 Analytics Dashboard',
    '🔍 Search & Filters',
    '📁 File Upload/Storage',
    '🎨 Admin Panel',
    '📱 Responsive Design',
    '♿ Accessibility (A11y)',
    '🔒 Role-Based Access Control',
    '💬 Chat/Messaging',
    '📅 Calendar/Scheduling',
    '🛒 Shopping Cart',
    '📦 Export/Import (CSV, JSON)',
    '🧪 Unit & E2E Tests',
  ];

  const databases = ['Firebase', 'PostgreSQL', 'MongoDB', 'MySQL', 'Supabase', 'Redis', 'Prisma', 'TypeORM'];
  const architectures = ['Monolith', 'Microservices', 'Serverless', 'JAMstack', 'Modular Monolith'];
  const deployments = ['Vercel', 'Netlify', 'AWS', 'Railway', 'Heroku', 'Docker', 'Kubernetes'];

  // Generate Prompt
  const generatePrompt = () => {
    if (!projectType) {
      alert('Bitte wähle einen Projekt-Typ!');
      return;
    }

    const selectedProject = projectTypes.find(p => p.value === projectType);
    const stackList = techStack.length > 0 ? techStack.join(', ') : selectedProject.stack.slice(0, 3).join(', ');
    const featureList = features.map(f => `- ${f}`).join('\n');
    
    const prompt = `Erstelle eine vollständige ${selectedProject.label} mit:

${featureList || '- [Füge Features hinzu]'}

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

**Tech Stack:** ${stackList}${database ? `\n**Database:** ${database}` : ''}${architecture ? `\n**Architecture:** ${architecture}` : ''}

**Dateistruktur:**
- src/
- components/
- utils/
- config/
${projectType === 'api-backend' ? '- routes/\n- models/\n- controllers/' : ''}
${projectType === 'mobile-app' ? '- screens/\n- navigation/' : ''}

**Deployment:** ${deployment || 'Vercel / Railway'}

**Erstelle ALLE Dateien komplett mit Production-Ready Code!**

**Anforderungen:**
- TypeScript verwenden
- Error Handling implementieren
- Tests schreiben (Unit + Integration)
- README.md mit Setup-Anleitung
- Environment Variables (.env.example)
- Clean Code & Best Practices`;

    setGeneratedPrompt(prompt);
    onInsertPrompt(prompt);
    setIsOpen(false);
  };

  const toggleTech = (tech) => {
    setTechStack(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const toggleFeature = (feature) => {
    setFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const addCustomFeature = () => {
    if (customFeature.trim()) {
      setFeatures(prev => [...prev, customFeature]);
      setCustomFeature('');
    }
  };

  return (
    <>
      <button 
        className="prompt-helper-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Prompt Templates & Best Practices"
      >
        💡 Prompt Helper
      </button>

      {isOpen && (
        <div className="prompt-helper-overlay" onClick={() => setIsOpen(false)}>
          <div className="prompt-helper-panel" onClick={(e) => e.stopPropagation()}>
            <div className="prompt-helper-header">
              <h2>🚀 Prompt Helper - Bessere Apps erstellen</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="prompt-helper-tabs">
              <button 
                className={activeTab === 'generator' ? 'active' : ''}
                onClick={() => setActiveTab('generator')}
              >
                ⚡ Generator
              </button>
              <button 
                className={activeTab === 'templates' ? 'active' : ''}
                onClick={() => setActiveTab('templates')}
              >
                📋 Templates
              </button>
              <button 
                className={activeTab === 'practices' ? 'active' : ''}
                onClick={() => setActiveTab('practices')}
              >
                🎯 Best Practices
              </button>
              <button 
                className={activeTab === 'quick' ? 'active' : ''}
                onClick={() => setActiveTab('quick')}
              >
                ⚡ Quick Start
              </button>
            </div>

            <div className="prompt-helper-content">
              {activeTab === 'generator' && (
                <div className="prompt-generator">
                  <h3 className="generator-title">🎯 Erstelle deinen perfekten Prompt</h3>
                  <p className="generator-subtitle">Wähle deine Optionen und generiere einen Production-Ready Prompt!</p>

                  <div className="generator-section">
                    <label className="generator-label">1️⃣ Projekt-Typ *</label>
                    <select 
                      value={projectType} 
                      onChange={(e) => setProjectType(e.target.value)}
                      className="generator-select"
                    >
                      <option value="">-- Wähle einen Typ --</option>
                      {projectTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {projectType && (
                    <>
                      <div className="generator-section">
                        <label className="generator-label">2️⃣ Tech Stack (wähle mehrere)</label>
                        <div className="tech-grid">
                          {projectTypes.find(p => p.value === projectType)?.stack.map(tech => (
                            <button
                              key={tech}
                              onClick={() => toggleTech(tech)}
                              className={`tech-btn ${techStack.includes(tech) ? 'selected' : ''}`}
                            >
                              {tech}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="generator-section">
                        <label className="generator-label">3️⃣ Features (wähle was du brauchst)</label>
                        <div className="features-grid">
                          {featuresList.map(feature => (
                            <button
                              key={feature}
                              onClick={() => toggleFeature(feature)}
                              className={`feature-btn ${features.includes(feature) ? 'selected' : ''}`}
                            >
                              {feature}
                            </button>
                          ))}
                        </div>
                        <div className="custom-feature">
                          <input
                            type="text"
                            value={customFeature}
                            onChange={(e) => setCustomFeature(e.target.value)}
                            placeholder="Eigenes Feature hinzufügen..."
                            className="custom-feature-input"
                            onKeyDown={(e) => e.key === 'Enter' && addCustomFeature()}
                          />
                          <button onClick={addCustomFeature} className="add-feature-btn">+ Hinzufügen</button>
                        </div>
                      </div>

                      <div className="generator-section">
                        <label className="generator-label">4️⃣ Datenbank (optional)</label>
                        <select 
                          value={database} 
                          onChange={(e) => setDatabase(e.target.value)}
                          className="generator-select"
                        >
                          <option value="">-- Keine / Später entscheiden --</option>
                          {databases.map(db => (
                            <option key={db} value={db}>{db}</option>
                          ))}
                        </select>
                      </div>

                      <div className="generator-section">
                        <label className="generator-label">5️⃣ Architektur (optional)</label>
                        <select 
                          value={architecture} 
                          onChange={(e) => setArchitecture(e.target.value)}
                          className="generator-select"
                        >
                          <option value="">-- Standard --</option>
                          {architectures.map(arch => (
                            <option key={arch} value={arch}>{arch}</option>
                          ))}
                        </select>
                      </div>

                      <div className="generator-section">
                        <label className="generator-label">6️⃣ Deployment (optional)</label>
                        <select 
                          value={deployment} 
                          onChange={(e) => setDeployment(e.target.value)}
                          className="generator-select"
                        >
                          <option value="">-- Standard (Vercel/Railway) --</option>
                          {deployments.map(deploy => (
                            <option key={deploy} value={deploy}>{deploy}</option>
                          ))}
                        </select>
                      </div>

                      <button onClick={generatePrompt} className="generate-btn">
                        ✨ Prompt Generieren & Einfügen
                      </button>

                      {features.length > 0 && (
                        <div className="selected-features">
                          <strong>Ausgewählte Features ({features.length}):</strong>
                          <div className="feature-tags">
                            {features.map((f, i) => (
                              <span key={i} className="feature-tag">
                                {f}
                                <button onClick={() => toggleFeature(f)} className="remove-tag">×</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="templates-grid">
                  {promptTemplates.map((template, index) => (
                    <div key={index} className="template-card">
                      <h3>{template.name}</h3>
                      <pre className="template-preview">{template.prompt.substring(0, 150)}...</pre>
                      <div className="template-actions">
                        <button 
                          className="btn-view"
                          onClick={() => {
                            alert(template.prompt);
                          }}
                        >
                          👁️ Vollständig anzeigen
                        </button>
                        <button 
                          className="btn-use"
                          onClick={() => {
                            onInsertPrompt(template.prompt);
                            setIsOpen(false);
                          }}
                        >
                          ✨ Verwenden
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'practices' && (
                <div className="practices-list">
                  <div className="practices-intro">
                    <h3>🎯 Wie man perfekte Prompts schreibt:</h3>
                    <p>Folge diesen Regeln für beste Ergebnisse mit allen AI Models!</p>
                  </div>
                  <div className="practices-scroll">
                    {bestPractices.map((practice, index) => (
                      <div key={index} className="practice-card">
                        <h4>{practice.title}</h4>
                        <div className="example good" onClick={() => {
                          onInsertPrompt(practice.good);
                          setIsOpen(false);
                        }} style={{cursor: 'pointer'}}>
                          <span className="label">✅ Gut (Klicken zum Testen):</span>
                          <code>{practice.good}</code>
                        </div>
                        <div className="example bad" onClick={() => {
                          onInsertPrompt(practice.bad);
                          setIsOpen(false);
                        }} style={{cursor: 'pointer'}}>
                          <span className="label">❌ Schlecht (Klicken zum Testen):</span>
                          <code>{practice.bad}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="practices-tip">
                    💡 <strong>Tipp:</strong> Klicke auf "Gut" oder "Schlecht" Beispiele, um sie direkt zu testen und den Unterschied zu sehen!
                  </div>
                </div>
              )}

              {activeTab === 'quick' && (
                <div className="quick-prompts">
                  <h3>⚡ Quick Start Prompts</h3>
                  <p>Klicke auf ein Template für schnellen Start:</p>
                  <div className="quick-grid">
                    {quickPrompts.map((item, index) => (
                      <div 
                        key={index}
                        className="quick-card"
                        onClick={() => {
                          const fullPrompt = `Erstelle eine vollständige ${item.name} App.

WICHTIG - AGENT MODUS (alle Dateien auf einmal):

Beschreibung: ${item.desc}

Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Tech Stack: [Beste Wahl für diesen Use-Case]

Dateistruktur:
- src/
- components/
- utils/
- config/

Erstelle ALLE Dateien komplett mit Production-Ready Code!

Anforderungen:
- TypeScript verwenden
- Error Handling implementieren
- Tests schreiben
- README.md mit Anleitung
- Environment Variables (.env.example)`;
                          onInsertPrompt(fullPrompt);
                          setIsOpen(false);
                        }}
                      >
                        <div className="quick-icon">{item.emoji}</div>
                        <div className="quick-content">
                          <h4>{item.name}</h4>
                          <p>{item.desc}</p>
                        </div>
                        <div className="quick-action">→</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptHelper;
