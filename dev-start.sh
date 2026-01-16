#!/bin/bash

echo "Development Start - Digital Photo Frame"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not running."
    echo "Please install Docker and make sure it's running."
    exit 1
fi

# Create .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

# Start the services
echo ""
echo "Starting services..."
echo ""
docker-compose up --build

# This will keep running until Ctrl+C
echo ""
echo "Services stopped."