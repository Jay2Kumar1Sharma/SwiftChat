#!/bin/bash

echo "=========================================="
echo "   WebSocket Gateway - Production Build"
echo "=========================================="
echo

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Install production dependencies
echo "Installing production dependencies..."
npm ci --only=production
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies!"
    exit 1
fi

# Build TypeScript
echo "Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Verify build
if [ ! -f "dist/index.js" ]; then
    echo "Build verification failed - dist/index.js not found!"
    exit 1
fi

echo
echo "=========================================="
echo "   Build completed successfully!"
echo "=========================================="
echo
echo "To start the production server, run:"
echo "  npm start"
echo
echo "Or use the production script:"
echo "  npm run prod"
echo
