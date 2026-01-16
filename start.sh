#!/bin/bash

echo "Starting Digital Photo Frame Service..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Copy environment variables file
if [ ! -f .env ]; then
    echo "Creating environment variables file..."
    cp .env.example .env
    echo "Environment file created. Please check and modify .env file if needed."
fi

# Start services
echo "Starting Docker containers..."
docker-compose up -d

echo "Waiting for services to start..."
sleep 10

echo ""
echo "===== Digital Photo Frame Service Started! ====="
echo ""
echo "Display Page:  http://localhost:3000"
echo "Admin Panel:   http://localhost:3000/admin"
echo "API Docs:      http://localhost:3001/api"
echo ""
echo "Commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop service: docker-compose down"
echo ""