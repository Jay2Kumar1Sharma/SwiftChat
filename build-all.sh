#!/bin/bash
# Build script for all services

echo "🏗️ Building all services for production..."

# Build API Gateway
echo "Building API Gateway..."
cd api-gateway
npm install
npm run build
cd ..

# Build Auth Service  
echo "Building Auth Service..."
cd auth-service
npm install
npm run build
cd ..

# Build WebSocket Gateway
echo "Building WebSocket Gateway..."
cd websocket-gateway
npm install
npm run build
cd ..

# Build Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ All services built successfully!"
