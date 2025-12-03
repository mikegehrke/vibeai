#!/bin/bash

# ============================================================
# VIBEAI SERVER START SCRIPT
# ============================================================
# Starts the VibeAI backend with all integrated systems
# ============================================================

echo "🚀 Starting VibeAI Backend Server..."
echo ""
echo "📦 Integrated Systems:"
echo "  ✅ Code Studio (9 Languages)"
echo "  ✅ Build System (5 Platforms)"
echo "  ✅ App Builder"
echo "  ✅ AI Agents (4 Agents)"
echo "  ✅ Admin Dashboard"
echo "  ✅ Billing System"
echo ""

# Check if port 8005 is in use
if lsof -Pi :8005 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8005 is already in use!"
    echo "Killing existing process..."
    kill -9 $(lsof -t -i:8005)
    sleep 1
fi

# Start server
echo "🌐 Starting server on http://localhost:8005"
echo ""

cd /Users/mikegehrke/dev/vibeai/backend

# Use uvicorn with reload
uvicorn main:app \
    --reload \
    --host 0.0.0.0 \
    --port 8005 \
    --log-level info

# Alternative: Production mode (no reload)
# uvicorn main:app --host 0.0.0.0 --port 8005 --workers 4
