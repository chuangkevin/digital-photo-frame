@echo off

echo Development Start - Digital Photo Frame
echo =====================================

:: Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running.
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

:: Create .env if not exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
)

:: Start the services
echo.
echo Starting services...
echo.
docker-compose up --build

:: This will keep running until Ctrl+C
echo.
echo Services stopped.
pause