#!/bin/bash

echo "Digital Photo Frame - Push to Docker Hub"
echo "=========================================="

# Set your Docker Hub username here
DOCKERHUB_USERNAME="kevin950805"
VERSION="latest"

echo
echo "Please replace 'your-username' with your actual Docker Hub username in this script."
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
echo "Building images using docker-compose.hub.yml..."
docker-compose -f docker-compose.hub.yml build
if [ $? -ne 0 ]; then
    echo "ERROR: Docker build failed!"
    exit 1
fi

echo
echo "Pushing frontend image..."
docker push $DOCKERHUB_USERNAME/digital-photo-frame-frontend:$VERSION
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend push failed!"
    exit 1
fi

echo
echo "Pushing backend image..."
docker push $DOCKERHUB_USERNAME/digital-photo-frame-backend:$VERSION
if [ $? -ne 0 ]; then
    echo "ERROR: Backend push failed!"
    exit 1
fi

echo
echo "SUCCESS: Images pushed to Docker Hub!"
echo
echo "Your images are now available at:"
echo "  - https://hub.docker.com/r/$DOCKERHUB_USERNAME/digital-photo-frame-frontend"
echo "  - https://hub.docker.com/r/$DOCKERHUB_USERNAME/digital-photo-frame-backend"
echo
echo "Others can now run your application with:"
echo "  docker-compose -f docker-compose.hub.yml up -d"
echo