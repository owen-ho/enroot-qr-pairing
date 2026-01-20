#!/bin/bash

echo "🎨 Arts & Crafts Event Pairing - Setup Script"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your settings before continuing!"
    echo "   - Change passwords"
    echo "   - Update FRONTEND_URL with your server IP"
    echo ""
    read -p "Press Enter when you've updated .env file..."
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install QR generator dependencies
echo "Installing QR code generator dependencies..."
cd scripts
npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🔧 Next steps:"
echo "1. Generate QR code: npm run generate-qr"
echo "2. Start with Docker: docker-compose up -d"
echo "3. Access app at: http://YOUR_SERVER_IP"
echo "4. Access admin at: http://YOUR_SERVER_IP/admin"
echo ""
