#!/bin/bash

# VibeAI API Test Script
# Testet alle wichtigen Endpunkte

echo "🧪 VibeAI API Tests"
echo "==================="
echo ""

BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3001"

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test-Funktion
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d '{"message":"test","model":"gpt-4o","agent":"smart_agent"}' "$url" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC} ($http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} ($http_code)"
        return 1
    fi
}

# Backend Tests
echo "📡 Backend Tests (Port 8000)"
echo "----------------------------"
test_endpoint "Health Check" "$BACKEND_URL/health"
test_endpoint "Models API" "$BACKEND_URL/api/home/models"
test_endpoint "Agents API" "$BACKEND_URL/api/home/agents"
test_endpoint "Chat API" "$BACKEND_URL/api/home/chat" "POST"
echo ""

# Frontend Tests
echo "🌐 Frontend Tests (Port 3001)"
echo "----------------------------"
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "Frontend läuft: ${GREEN}✓ OK${NC}"
else
    echo -e "Frontend läuft: ${RED}✗ FAIL${NC}"
fi
echo ""

# Port-Check
echo "🔌 Port-Check"
echo "-------------"
if lsof -i :8000 | grep -q LISTEN; then
    echo -e "Port 8000 (Backend): ${GREEN}✓ OPEN${NC}"
else
    echo -e "Port 8000 (Backend): ${RED}✗ CLOSED${NC}"
fi

if lsof -i :3001 | grep -q LISTEN; then
    echo -e "Port 3001 (Frontend): ${GREEN}✓ OPEN${NC}"
else
    echo -e "Port 3001 (Frontend): ${RED}✗ CLOSED${NC}"
fi
echo ""

echo "==================="
echo "✅ Tests abgeschlossen"
