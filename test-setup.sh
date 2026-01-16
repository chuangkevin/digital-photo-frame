#!/bin/bash

echo "Digital Photo Frame - Setup Test"
echo "================================="

echo
echo "Checking project structure..."

# Check main directories
if [ ! -d "backend" ]; then
    echo "ERROR: backend directory not found"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "ERROR: frontend directory not found"
    exit 1
fi

if [ ! -d "uploads" ]; then
    echo "Creating uploads directory..."
    mkdir -p uploads/media uploads/thumbnails
fi

if [ ! -d "database" ]; then
    echo "Creating database directory..."
    mkdir -p database
fi

# Check key files
echo
echo "Checking key files..."

files_to_check=(
    "docker-compose.yml"
    "backend/package.json"
    "frontend/package.json"
    "backend/server.js"
    "frontend/src/App.js"
)

for file in "${files_to_check[@]}"; do
    if [ ! -f "$file" ]; then
        echo "ERROR: $file not found"
        exit 1
    fi
done

echo
echo "SUCCESS: All required files and directories are present!"
echo

# Show project structure
echo "Project structure:"
echo
ls -la

echo
echo "You can now run:"
echo "  ./start.sh       - Start with Docker (recommended)"
echo "  ./dev-start.sh   - Start with Docker in development mode"
echo "  docker-compose up - Start manually"
echo
echo "Next steps:"
echo "1. Make sure Docker and Docker Compose are installed"
echo "2. Run ./start.sh to launch the application"
echo "3. Open http://localhost:3000 in your browser"
echo