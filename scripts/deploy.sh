#!/bin/bash

# AGDS Corp POS - Production Deployment Script
# This script performs pre-deployment checks and deploys to Vercel

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Print banner
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AGDS Corp POS - Deployment Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if vercel CLI is installed
print_info "Checking for Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found"
    echo "Install with: npm install -g vercel"
    exit 1
fi
print_success "Vercel CLI found"

# Check if git is clean
print_info "Checking git status..."
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes"
    git status -s
    read -p "Continue anyway? (yes/no): " continue_anyway
    if [ "$continue_anyway" != "yes" ]; then
        print_error "Deployment cancelled"
        exit 1
    fi
else
    print_success "Git working directory clean"
fi

# Run TypeScript type check
print_info "Running TypeScript type check..."
if npm run build > /dev/null 2>&1; then
    print_success "TypeScript type check passed"
else
    print_error "TypeScript errors found. Fix them before deploying."
    npm run build
    exit 1
fi

# Run linter (if lint script exists)
if grep -q '"lint"' package.json; then
    print_info "Running ESLint..."
    if npm run lint > /dev/null 2>&1; then
        print_success "Linting passed"
    else
        print_warning "Linting warnings found (non-blocking)"
    fi
fi

# Build the project
print_info "Building production bundle..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed. Fix build errors before deploying."
    exit 1
fi

# Show build size
echo ""
print_info "Build Statistics:"
du -sh .next 2>/dev/null || echo "Build size: N/A"
echo ""

# Ask for deployment confirmation
echo -e "${YELLOW}╔════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║         READY TO DEPLOY TO PRODUCTION      ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════╝${NC}"
echo ""
print_warning "This will deploy to PRODUCTION"
echo ""
read -p "Type 'DEPLOY' to continue: " confirm

if [ "$confirm" != "DEPLOY" ]; then
    print_error "Deployment cancelled"
    exit 0
fi

# Deploy to Vercel
echo ""
print_info "Deploying to Vercel..."
echo ""

if vercel --prod; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║      DEPLOYMENT SUCCESSFUL!                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    print_success "Deployment completed successfully"
    echo ""
    echo "Next steps:"
    echo "  1. Test the deployment"
    echo "  2. Monitor for errors"
    echo "  3. Check health endpoints"
    echo "  4. Verify core features"
    echo ""
else
    echo ""
    print_error "Deployment failed"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check Vercel logs: vercel logs"
    echo "  2. Verify environment variables"
    echo "  3. Check build configuration"
    echo ""
    exit 1
fi
