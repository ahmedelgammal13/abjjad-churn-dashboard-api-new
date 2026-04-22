#!/bin/bash

# ABJJAD Dashboard - Automated GitHub Deployment
# This script creates the GitHub repo and pushes all files

set -e

echo "🚀 ABJJAD Dashboard - GitHub Deployment"
echo "========================================"
echo ""

# Configuration
REPO_NAME="abjjad-churn-dashboard"
REPO_DIR="/mnt/user-data/outputs/abjjad-dashboard-repo"

echo "📦 Repository: $REPO_NAME"
echo "📁 Source: $REPO_DIR"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found."
    echo "📥 Install with: brew install gh (macOS) or apt install gh (Linux)"
    echo ""
    echo "Or create repository manually at:"
    echo "https://github.com/new?name=$REPO_NAME&description=ABJJAD+Subscription+Churn+Dashboard"
    exit 1
fi

echo "✅ GitHub CLI detected"
echo ""

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub:"
    gh auth login
fi

echo "✅ Authenticated with GitHub"
echo ""

# Navigate to repo directory
cd "$REPO_DIR" || exit 1

# Rename README for GitHub
if [ -f "README-GITHUB.md" ]; then
    mv README-GITHUB.md README-main.md
fi

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Cloudflare Worker + D1 Database setup"
fi

echo ""
echo "🌐 Creating GitHub repository..."

# Create repository (private by default)
gh repo create "$REPO_NAME" \
    --private \
    --description "Real-time subscription churn and retention analytics dashboard powered by Cloudflare" \
    --source=. \
    --push

echo ""
echo "═════════════════════════════════════════"
echo "✅ REPOSITORY CREATED AND PUSHED!"
echo "═════════════════════════════════════════"
echo ""
echo "🌐 Repository URL:"
gh repo view --web --json url -q .url
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add GitHub Secrets for auto-deployment:"
echo "   gh secret set CLOUDFLARE_API_TOKEN"
echo "   gh secret set CLOUDFLARE_ACCOUNT_ID"
echo ""
echo "2. Or add them via web:"
REPO_URL=$(gh repo view --json url -q .url)
echo "   $REPO_URL/settings/secrets/actions"
echo ""
echo "3. Push a change to trigger deployment:"
echo "   git commit --allow-empty -m 'Test deployment'"
echo "   git push"
echo ""
echo "═════════════════════════════════════════"
