#!/usr/bin/env bash
# ================================================================
# PipePrime Production Deployment & Update Script
# Usage: ./deploy.sh [docker|systemd]
# ================================================================

set -e

MODE=${1:-docker}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "🚀 PipePrime Enterprise Deployment"
echo "Mode: $MODE"
echo "Directory: $PROJECT_DIR"
echo "=========================================="

cd "$PROJECT_DIR"

# 1. Pull latest changes from Git
echo "📥 Pulling latest code from origin/main..."
git pull origin main

# 2. Check environment configuration
if [ ! -f "server/.env" ] && [ ! -f ".env" ]; then
    if [ -f "server/.env.example" ]; then
        echo "⚠️  No .env found. Creating server/.env from template..."
        cp server/.env.example server/.env
        echo "ℹ️  Please edit server/.env with your production TELEGRAM_BOT_TOKEN and CHAT_ID."
    fi
fi

# Ensure storage directories exist
mkdir -p server/data server/storage/uploads server/storage/protected

if [ "$MODE" = "docker" ]; then
    echo "🐳 Building and restarting Docker containers..."
    docker compose down --remove-orphans || true
    docker compose build --pull
    docker compose up -d

    echo "⏳ Waiting for health check..."
    sleep 5
    if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "✅ PipePrime container is HEALTHY and running!"
    else
        echo "⚠️ Health check pending, check logs with: docker compose logs -f"
    fi

elif [ "$MODE" = "systemd" ]; then
    echo "⚙️ Updating Python dependencies in virtualenv..."
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r server/requirements.txt

    echo "🔄 Restarting pipeprime.service..."
    sudo systemctl restart pipeprime.service
    sudo systemctl status pipeprime.service --no-pager

    sleep 3
    if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "✅ PipePrime service is HEALTHY and running!"
    else
        echo "⚠️ Health check warning, check logs with: sudo journalctl -u pipeprime -n 50"
    fi
else
    echo "❌ Unknown mode: $MODE. Use 'docker' or 'systemd'."
    exit 1
fi

echo "=========================================="
echo "🎉 Deployment completed successfully!"
echo "=========================================="
