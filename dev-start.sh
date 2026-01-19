#!/bin/bash

echo "Starting LOCAL DEVELOPMENT servers..."
echo "==================================="
echo ""

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    # Kill all processes in the process group
    kill 0
}

# Trap Ctrl+C and other signals
trap cleanup SIGINT SIGTERM EXIT

echo "Installing dependencies and starting Backend Server (nodemon)..."
echo "Visit http://localhost:3001"
(cd backend && npm install && npm run dev) &
echo ""

echo "Installing dependencies and starting Frontend Server (React)..."
echo "Visit http://localhost:3000"
(cd frontend && npm install && npm start) &
echo ""

echo "Both servers are starting in the background."
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait for any background process to exit
wait -n
