#!/bin/bash

# Health Check Script
# Checks the health of deployed application

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_URL="${1:-http://localhost:3000}"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Health Check - AGDS Corp POS        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "Checking: $APP_URL"
echo ""

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local name=$2
    local url="$APP_URL$endpoint"

    echo -n "Checking $name... "

    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    elif [ "$http_code" = "000" ]; then
        echo -e "${RED}❌ FAILED (Connection refused)${NC}"
        return 1
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        return 1
    fi
}

# Check main health endpoint
echo "=== System Health ==="
check_endpoint "/api/health" "Overall Health"

# Check specific components
echo ""
echo "=== Component Health ==="
check_endpoint "/api/health/database" "Database"
check_endpoint "/api/health/redis" "Redis"

# Check main pages
echo ""
echo "=== Page Availability ==="
check_endpoint "/" "Homepage"
check_endpoint "/login" "Login Page"

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Health Check Complete            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "Run with custom URL:"
echo "  ./scripts/health-check.sh https://pos.yourdomain.com"
