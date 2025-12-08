"""
VibeAI - Minimal Working Server
Startet nur die funktionierenden Core-Features
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db

# Create App
app = FastAPI(title="VibeAI API", version="2.0.0", description="AI-Powered Full-Stack Development Platform")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
init_db()


# Root endpoint
@app.get("/")
async def root():
    return {"status": "online", "service": "VibeAI API", "version": "2.0.0", "message": "Server läuft! 🚀"}


# Health check
@app.get("/health")
async def health():
    return {"status": "healthy"}


# Try to load working modules
try:
    from auth import router as auth_router

    app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
    print("✅ Auth router loaded")
except ImportError as e:
    print(f"⚠️  Auth router failed: {e}")

try:
    from sessions import router as sessions_router

    app.include_router(sessions_router, prefix="/api/sessions", tags=["Sessions"])
    print("✅ Sessions router loaded")
except ImportError as e:
    print(f"⚠️  Sessions router failed: {e}")

if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting VibeAI Minimal Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)