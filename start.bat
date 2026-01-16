@echo off
chcp 65001 >nul

echo Starting Digital Photo Frame Service...

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

:: Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

:: Copy environment variables file
if not exist .env (
    echo Creating environment variables file...
    copy .env.example .env >nul
    echo Environment file created. Please check and modify .env file if needed.
)

:: Start services
echo Starting Docker containers...
docker-compose up -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ===== Digital Photo Frame Service Started! =====
echo.
echo Display Page:  http://localhost:3000
echo Admin Panel:   http://localhost:3000/admin
echo API Docs:      http://localhost:3001/api
echo.
echo Commands:
echo   View logs:   docker-compose logs -f
echo   Stop service: docker-compose down
echo.
echo Press any key to exit...
pause >nul