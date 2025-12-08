"""
Clean FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from project_generator.project_router import router as project_router

# Initialize FastAPI app
app = FastAPI(
    title="VibeAI Backend API",
    description="AI-Powered Development Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(project_router, prefix="/api/projects", tags=["projects"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🚀 VibeAI Backend API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Backend is running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)