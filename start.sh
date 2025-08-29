#!/bin/bash

# PixelCyberZone Startup Script
echo "🎮 Starting PixelCyberZone Development Environment"
echo "================================================"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start MongoDB if not running
start_mongodb() {
    if ! pgrep -x mongod >/dev/null; then
        echo "📊 Starting MongoDB..."
        if command -v brew >/dev/null 2>&1; then
            brew services start mongodb/brew/mongodb-community
            echo "✓ MongoDB started"
        else
            echo "❌ MongoDB not found. Please install MongoDB first."
            echo "   Run: brew tap mongodb/brew && brew install mongodb-community"
            exit 1
        fi
    else
        echo "✓ MongoDB is already running"
    fi
}

# Check if backend port is already in use
if check_port 3001; then
    echo "⚠️  Port 3001 is already in use. Please stop the existing process or use a different port."
    echo "   You can kill existing processes with: lsof -ti:3001 | xargs kill"
    read -p "   Do you want to continue anyway? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if frontend port is already in use
if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. Please stop the existing process or use a different port."
    echo "   You can kill existing processes with: lsof -ti:5173 | xargs kill"
    read -p "   Do you want to continue anyway? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start MongoDB
start_mongodb

# Start Backend
echo "🔧 Starting Backend API..."
cd backend
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🔨 Building backend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Backend build successful"
    echo "🚀 Starting backend server on http://localhost:3001"
    npm run dev &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Wait a bit for backend to start
sleep 3

# Test backend health
echo "🏥 Testing backend health..."
if curl -s http://localhost:3001/health >/dev/null; then
    echo "✓ Backend API is healthy"
else
    echo "❌ Backend health check failed"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Frontend
cd ..
echo "🎨 Starting Frontend..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting frontend development server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait a bit for frontend to start
sleep 5

echo ""
echo "🎉 PixelCyberZone is now running!"
echo "================================"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3001"
echo "API Health: http://localhost:3001/health"
echo ""
echo "To stop both services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or press Ctrl+C to stop this script and then run:"
echo "  pkill -f 'vite\\|nodemon'"

# Keep script running
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for user to stop
echo "Press Ctrl+C to stop all services..."
wait
