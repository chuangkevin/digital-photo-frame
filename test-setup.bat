@echo off

echo Digital Photo Frame - Setup Test
echo ==================================

echo.
echo Checking project structure...

:: Check main directories
if not exist "backend" (
    echo ERROR: backend directory not found
    goto :error
)

if not exist "frontend" (
    echo ERROR: frontend directory not found
    goto :error
)

if not exist "uploads" (
    echo Creating uploads directory...
    mkdir uploads
    mkdir uploads\media
    mkdir uploads\thumbnails
)

if not exist "database" (
    echo Creating database directory...
    mkdir database
)

:: Check key files
echo.
echo Checking key files...

if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml not found
    goto :error
)

if not exist "backend\package.json" (
    echo ERROR: backend\package.json not found
    goto :error
)

if not exist "frontend\package.json" (
    echo ERROR: frontend\package.json not found
    goto :error
)

if not exist "backend\server.js" (
    echo ERROR: backend\server.js not found
    goto :error
)

if not exist "frontend\src\App.js" (
    echo ERROR: frontend\src\App.js not found
    goto :error
)

echo.
echo SUCCESS: All required files and directories are present!
echo.

:: Show project structure
echo Project structure:
echo.
dir /b

echo.
echo You can now run:
echo   start.bat        - Start with Docker (recommended)
echo   dev-start.bat    - Start with Docker in development mode
echo.
echo Next steps:
echo 1. Make sure Docker Desktop is installed and running
echo 2. Run start.bat to launch the application
echo 3. Open http://localhost:3000 in your browser
echo.

goto :end

:error
echo.
echo ERROR: Setup check failed!
echo Please ensure you are in the correct project directory.
echo.

:end
pause