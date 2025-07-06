#!/bin/bash

echo "🚀 SwiftChat - Quick Start Script"
echo "================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Ask user what they want to do
echo "Choose an option:"
echo "1. 🎮 Quick Demo (Frontend only - fastest)"
echo "2. 🏗️  Full Development Setup (All services)"
echo "3. 🐳 Docker Setup (Complete stack)"
echo "4. 🧪 Just install dependencies"
echo

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo
        echo "🎮 Starting Frontend Demo Mode..."
        echo "================================"
        
        # Check if frontend directory exists
        if [ ! -d "frontend" ]; then
            echo "❌ Frontend directory not found. Make sure you're in the project root."
            exit 1
        fi
        
        # Install frontend dependencies
        echo "📦 Installing frontend dependencies..."
        cd frontend
        npm install
        
        # Create demo environment file if it doesn't exist
        if [ ! -f ".env" ]; then
            echo "📄 Creating demo environment file..."
            cat > .env << EOF
REACT_APP_DEMO_MODE=true
REACT_APP_API_URL=http://localhost:4000
NODE_ENV=development
EOF
        fi
        
        echo
        echo "🎉 Starting demo mode..."
        echo "📱 Access the app at: http://localhost:3000"
        echo "🔐 Demo login credentials:"
        echo "   Email: demo@example.com | Password: demo123"
        echo "   Email: john@example.com | Password: password123"
        echo "   Email: jane@example.com | Password: password123"
        echo
        echo "Press Ctrl+C to stop"
        echo
        
        npm start
        ;;
        
    2)
        echo
        echo "🏗️  Starting Full Development Setup..."
        echo "===================================="
        
        # Check if Docker is running
        if ! docker info > /dev/null 2>&1; then
            echo "⚠️  Docker is not running. You can still run without database features."
            echo "   To run with full features, start Docker and run: docker-compose -f docker-compose.dev.yml up -d"
        else
            echo "🐳 Starting database containers..."
            docker-compose -f docker-compose.dev.yml up -d
            echo "✅ Database containers started"
        fi
        
        # Install dependencies for all services
        echo "📦 Installing dependencies for all services..."
        npm run setup
        
        echo
        echo "🚀 Starting all services..."
        echo "📱 Frontend: http://localhost:3000"
        echo "🌐 API Gateway: http://localhost:4000"
        echo "🔌 WebSocket: http://localhost:4001"
        echo "🔐 Auth Service: http://localhost:4002"
        echo "💬 Chat Service: http://localhost:4003"
        echo "📢 Notification Service: http://localhost:4004"
        echo
        echo "Press Ctrl+C to stop all services"
        echo
        
        npm run dev
        ;;
        
    3)
        echo
        echo "🐳 Starting Docker Setup..."
        echo "=========================="
        
        # Check if Docker is available
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker from https://www.docker.com/"
            exit 1
        fi
        
        if ! docker info > /dev/null 2>&1; then
            echo "❌ Docker is not running. Please start Docker."
            exit 1
        fi
        
        echo "🐳 Building and starting all containers..."
        docker-compose up --build
        ;;
        
    4)
        echo
        echo "📦 Installing Dependencies Only..."
        echo "================================"
        
        echo "🔧 Installing root dependencies..."
        npm install
        
        echo "📦 Installing dependencies for all services..."
        services=("frontend" "api-gateway" "websocket-gateway" "auth-service" "chat-service" "notification-service")
        
        for service in "${services[@]}"; do
            if [ -d "$service" ]; then
                echo "📦 Installing $service dependencies..."
                (cd "$service" && npm install)
            else
                echo "⚠️  $service directory not found"
            fi
        done
        
        echo "✅ All dependencies installed!"
        echo
        echo "To start the application:"
        echo "1. Demo mode: ./quick-start.sh and choose option 1"
        echo "2. Full setup: ./quick-start.sh and choose option 2"
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1-4."
        exit 1
        ;;
esac
