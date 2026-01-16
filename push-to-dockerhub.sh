#!/bin/bash

echo "Digital Photo Frame - Push to Docker Hub (Multi-Platform)"
echo "=========================================================="

# Set your Docker Hub username here
DOCKERHUB_USERNAME="kevin950805"
VERSION="latest"

echo
echo "Current username: $DOCKERHUB_USERNAME"
echo

if [ "$DOCKERHUB_USERNAME" = "your-username" ]; then
    echo "ERROR: Please update DOCKERHUB_USERNAME in this script first!"
    exit 1
fi

echo
echo "Logging into Docker Hub..."
docker login
if [ $? -ne 0 ]; then
    echo "ERROR: Docker login failed!"
    exit 1
fi

echo
echo "Setting up buildx for multi-platform builds..."
docker buildx create --name multiplatform --use 2>/dev/null || docker buildx use multiplatform
docker buildx inspect --bootstrap

echo
echo "Building and pushing frontend image (amd64 + arm64)..."
docker buildx build --platform linux/amd64,linux/arm64 \
    -t $DOCKERHUB_USERNAME/digital-photo-frame-frontend:$VERSION \
    --push ./frontend
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend build/push failed!"
    exit 1
fi

echo
echo "Building and pushing backend image (amd64 + arm64)..."
docker buildx build --platform linux/amd64,linux/arm64 \
    -t $DOCKERHUB_USERNAME/digital-photo-frame-backend:$VERSION \
    --push ./backend
if [ $? -ne 0 ]; then
    echo "ERROR: Backend build/push failed!"
    exit 1
fi

echo
echo "SUCCESS: Multi-platform images pushed to Docker Hub!"
echo
echo "Your images are now available at:"
echo "  - https://hub.docker.com/r/$DOCKERHUB_USERNAME/digital-photo-frame-frontend"
echo "  - https://hub.docker.com/r/$DOCKERHUB_USERNAME/digital-photo-frame-backend"
echo
echo "Supported platforms: linux/amd64, linux/arm64 (Raspberry Pi)"
echo
echo "Others can now run your application with:"
echo "  docker-compose -f docker-compose.hub.yml up -d"
echo
