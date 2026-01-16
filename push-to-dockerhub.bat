@echo off

echo Digital Photo Frame - Push to Docker Hub
echo ==========================================

:: Set your Docker Hub username here
set DOCKERHUB_USERNAME=kevin950805
set VERSION=latest

echo.
echo Please replace 'your-username' with your actual Docker Hub username in this script.
echo Current username: %DOCKERHUB_USERNAME%
echo.

if "%DOCKERHUB_USERNAME%"=="your-username" (
    echo ERROR: Please update DOCKERHUB_USERNAME in this script first!
    pause
    exit /b 1
)

echo.
echo Logging into Docker Hub...
docker login
if errorlevel 1 goto error

echo.
echo Building images...
docker-compose build
if errorlevel 1 goto error

echo.
echo Tagging images for Docker Hub...
docker tag digital-photo-frame-frontend:latest %DOCKERHUB_USERNAME%/digital-photo-frame-frontend:%VERSION%
docker tag digital-photo-frame-backend:latest %DOCKERHUB_USERNAME%/digital-photo-frame-backend:%VERSION%

echo.
echo Pushing frontend image...
docker push %DOCKERHUB_USERNAME%/digital-photo-frame-frontend:%VERSION%
if errorlevel 1 goto error

echo.
echo Pushing backend image...
docker push %DOCKERHUB_USERNAME%/digital-photo-frame-backend:%VERSION%
if errorlevel 1 goto error

echo.
echo SUCCESS: Images pushed to Docker Hub!
echo.
echo Your images are now available at:
echo   - https://hub.docker.com/r/%DOCKERHUB_USERNAME%/digital-photo-frame-frontend
echo   - https://hub.docker.com/r/%DOCKERHUB_USERNAME%/digital-photo-frame-backend
echo.
echo Others can now run your application with:
echo   docker-compose -f docker-compose.hub.yml up -d
echo.

goto end

:error
echo.
echo ERROR: Push failed! Please check the error messages above.
echo.

:end
pause