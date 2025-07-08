#!/bin/bash

echo "🚀 Starting Authentication Backend..."
echo "📁 Working directory: $(pwd)"
echo "📦 Installing dependencies..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, creating from .env.example..."
    cp .env.example .env
fi

echo "🌟 Starting server on http://localhost:3000"
echo "📖 API Documentation: http://localhost:3000"
echo "🔄 Frontend integration: Update FRONTEND_URL in .env if needed"
echo ""

# Start the server
node server.js