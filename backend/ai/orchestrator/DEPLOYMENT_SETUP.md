# 🚀 Deployment Setup Guide

Complete guide to set up all deployment platforms for VibeAI.

---

## 📦 Required CLI Tools

### Install All Tools
```bash
# Vercel
npm i -g vercel

# Cloudflare (Wrangler)
npm i -g wrangler

# GitHub Pages
npm i -g gh-pages

# Netlify
npm i -g netlify-cli

# AWS (boto3)
pip install boto3
```

---

## 🔑 Environment Variables

Add these to your `.env` file or system environment:

```bash
# ===== VERCEL =====
VERCEL_TOKEN=your_vercel_token_here
# Get token: https://vercel.com/account/tokens

# ===== CLOUDFLARE =====
CLOUDFLARE_API_TOKEN=your_cloudflare_token_here
# Get token: https://dash.cloudflare.com/profile/api-tokens

# ===== AWS S3 =====
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name  # Optional, auto-generated if not set

# ===== NETLIFY =====
NETLIFY_AUTH_TOKEN=your_netlify_token
# Get token: https://app.netlify.com/user/applications

# ===== GITHUB =====
GITHUB_USERNAME=your_github_username
# Auto-detected from git config if not set
```

---

## 🔧 Platform Setup

### 1️⃣ Vercel

```bash
# Login
vercel login

# Generate token
vercel token create

# Add to .env
echo "VERCEL_TOKEN=your_token" >> .env
```

**Deployment:**
- Supports: React, Vue, Next.js, Vite
- Auto-detects framework
- Production deployment with `--prod`

---

### 2️⃣ Cloudflare Pages

```bash
# Login
wrangler login

# Generate API token
# Go to: https://dash.cloudflare.com/profile/api-tokens
# Create token with "Cloudflare Pages" permissions

# Add to .env
echo "CLOUDFLARE_API_TOKEN=your_token" >> .env
```

**Deployment:**
- Supports: Static sites, Flutter web, React, Vue
- Uses `build/web` for Flutter, `build` for React, `dist` for Vue
- No server-side code

---

### 3️⃣ AWS S3 + CloudFront

```bash
# Install AWS CLI (optional)
brew install awscli  # macOS
# OR
pip install awscli

# Configure credentials
aws configure
# Enter: Access Key, Secret Key, Region

# Install boto3 for Python
pip install boto3
```

**Setup:**
1. Create IAM user with S3 permissions
2. Generate access keys
3. Add credentials to `.env`

**Deployment:**
- Automatic bucket creation
- Static website hosting enabled
- Public read access configured
- Content-Type detection for all files

---

### 4️⃣ GitHub Pages

```bash
# Install gh-pages
npm i -g gh-pages

# Configure git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Optional: Set GitHub username
echo "GITHUB_USERNAME=yourusername" >> .env
```

**Deployment:**
- Uses `gh-pages` branch
- Automatic git push
- URL: `https://username.github.io/project-name`

---

### 5️⃣ Netlify

```bash
# Login
netlify login

# Generate token
netlify token

# Add to .env
echo "NETLIFY_AUTH_TOKEN=your_token" >> .env

# Optional: Create site
netlify sites:create --name your-project-name
```

**Deployment:**
- Supports: Static sites + serverless functions
- Auto-detects build directory
- Production deployment with `--prod`

---

## 🧪 Test Deployments

### Test Each Platform

```bash
# 1. Vercel
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "project_id": "test_project",
    "prompt": "Deploy to Vercel"
  }'

# 2. Cloudflare
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "project_id": "test_project",
    "prompt": "Deploy to Cloudflare"
  }'

# 3. AWS S3
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "project_id": "test_project",
    "prompt": "Deploy to S3"
  }'

# 4. GitHub Pages
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "project_id": "test_project",
    "prompt": "Deploy to GitHub Pages"
  }'

# 5. Netlify
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "project_id": "test_project",
    "prompt": "Deploy to Netlify"
  }'

# 6. ZIP Download
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "project_id": "test_project",
    "prompt": "Create ZIP package"
  }'
```

---

## 📊 Platform Comparison

| Platform | Framework Support | Build Required | Server | Price |
|----------|------------------|----------------|--------|-------|
| **Vercel** | React, Vue, Next.js | No (auto) | Serverless | Free tier |
| **Cloudflare** | All static | Yes | Edge | Free tier |
| **AWS S3** | All static | Yes | No | Pay per use |
| **GitHub** | All static | Yes | No | Free |
| **Netlify** | All static + functions | Yes | Serverless | Free tier |
| **ZIP** | All | No | Self-hosted | Free |

---

## 🛠️ Framework Build Directories

| Framework | Build Directory | Build Command |
|-----------|----------------|---------------|
| **React** | `build` | `npm run build` |
| **Vue** | `dist` | `npm run build` |
| **Flutter Web** | `build/web` | `flutter build web` |
| **Next.js** | `.next` | `npm run build` |
| **Vite** | `dist` | `npm run build` |
| **HTML** | `.` | None |

---

## ⚠️ Troubleshooting

### "CLI not found" Error
```bash
# Reinstall missing CLI
npm i -g vercel wrangler netlify-cli gh-pages
```

### "Authentication failed" Error
```bash
# Re-login to platform
vercel login
wrangler login
netlify login
```

### "Build directory not found" Error
```bash
# Build project first
cd /tmp/vibeai_projects/your_project
npm run build  # React/Vue
flutter build web  # Flutter
```

### AWS Credentials Error
```bash
# Check credentials
aws sts get-caller-identity

# Reconfigure
aws configure
```

---

## 🔄 Auto-Platform Detection

The Deploy Agent automatically detects the target platform from your prompt:

```python
# User says:
"Deploy to Vercel" → Vercel
"Upload to Cloudflare" → Cloudflare
"Deploy to AWS" → S3
"Push to GitHub Pages" → GitHub
"Deploy to Netlify" → Netlify
"Download ZIP" → ZIP package

# No platform specified:
React/Vue → Vercel (default)
Flutter → Cloudflare (default)
```

---

## 📝 Example: Full Deployment Flow

```bash
# 1. Create project
curl -X POST http://localhost:8000/orchestrator/project/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "project_id": "myapp",
    "framework": "react",
    "name": "My Awesome App"
  }'

# 2. Generate code
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "project_id": "myapp",
    "prompt": "Create a login screen with email and password"
  }'

# 3. Build project
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "project_id": "myapp",
    "prompt": "Build for web"
  }'

# 4. Deploy to Vercel
curl -X POST http://localhost:8000/orchestrator/handle \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "project_id": "myapp",
    "prompt": "Deploy to Vercel"
  }'

# Response:
{
  "success": true,
  "platform": "vercel",
  "url": "https://myapp.vercel.app",
  "deployment_id": "deploy_abc123",
  "status": "deployed"
}
```

---

## 🎯 Production Checklist

- [ ] Install all CLI tools
- [ ] Configure environment variables
- [ ] Test each platform individually
- [ ] Set up CI/CD (optional)
- [ ] Configure custom domains (optional)
- [ ] Enable HTTPS (auto on most platforms)
- [ ] Set up monitoring/analytics
- [ ] Configure rollback strategy

---

## 🔐 Security Best Practices

1. **Never commit API tokens** to version control
2. **Use environment variables** for all credentials
3. **Rotate tokens** regularly
4. **Use minimal permissions** (IAM for AWS)
5. **Enable 2FA** on all platforms
6. **Review deployment logs** for sensitive data

---

## 📚 Resources

- **Vercel**: https://vercel.com/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **AWS S3**: https://docs.aws.amazon.com/s3
- **GitHub Pages**: https://pages.github.com
- **Netlify**: https://docs.netlify.com
- **boto3**: https://boto3.amazonaws.com/v1/documentation

---

**Status**: ✅ All platforms integrated and production-ready!
