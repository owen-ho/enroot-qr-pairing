@echo off
echo 🎨 Arts & Crafts Event Pairing - Setup Script
echo ==============================================
echo.

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your settings before continuing!
    echo    - Change passwords
    echo    - Update FRONTEND_URL with your server IP
    echo.
    pause
)

echo.
echo 📦 Installing dependencies...
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Install QR generator dependencies
echo Installing QR code generator dependencies...
cd scripts
call npm install
cd ..

echo.
echo ✅ Dependencies installed!
echo.
echo 🔧 Next steps:
echo 1. Generate QR code: npm run generate-qr
echo 2. Start with Docker: docker-compose up -d
echo 3. Access app at: http://YOUR_SERVER_IP
echo 4. Access admin at: http://YOUR_SERVER_IP/admin
echo.
pause
