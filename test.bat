@echo off
echo 🧪 Testing Arts & Crafts Pairing System
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ❌ .env file not found!
    echo    Run: copy .env.example .env
    exit /b 1
)
echo ✅ .env file exists

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running!
    echo    Please start Docker Desktop and try again
    exit /b 1
)
echo ✅ Docker is running

REM Check if services are running
docker-compose ps | find "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services are running
) else (
    echo ⚠️  Services are not running
    echo    Start with: docker-compose up -d
)

REM Check if QR code exists
if exist qr-code.png (
    echo ✅ QR code generated
) else (
    echo ⚠️  QR code not found
    echo    Generate with: npm run generate-qr
)

echo.
echo 📋 Summary:
echo   • Participant URL: http://YOUR_SERVER_IP
echo   • Admin Dashboard: http://YOUR_SERVER_IP/admin
echo   • Backend API: http://YOUR_SERVER_IP:3000
echo.
pause
