@echo off
echo Starting LOCAL DEVELOPMENT servers for Windows...
echo =============================================
echo.

echo Installing dependencies and starting Backend Server (nodemon)...
echo Visit http://localhost:3001
start "Backend Dev Server" cmd /c "cd backend && npm install && npm run dev"

echo.
echo Installing dependencies and starting Frontend Server (React)...
echo Visit http://localhost:3000
start "Frontend Dev Server" cmd /c "cd frontend && npm install && npm start"

echo.
echo Both servers are starting in new windows.
pause
