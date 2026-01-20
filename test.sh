#!/bin/bash

echo "🧪 Testing Arts & Crafts Pairing System"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Run: cp .env.example .env"
    exit 1
fi
echo "✅ .env file exists"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "   Please start Docker and try again"
    exit 1
fi
echo "✅ Docker is running"

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running"
    
    # Test backend health endpoint
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "✅ Backend is responding"
    else
        echo "⚠️  Backend is not responding on port 3000"
    fi
    
    # Test frontend
    if curl -s http://localhost:80 > /dev/null; then
        echo "✅ Frontend is responding"
    else
        echo "⚠️  Frontend is not responding on port 80"
    fi
else
    echo "⚠️  Services are not running"
    echo "   Start with: docker-compose up -d"
fi

# Check if QR code exists
if [ -f qr-code.png ]; then
    echo "✅ QR code generated"
else
    echo "⚠️  QR code not found"
    echo "   Generate with: npm run generate-qr"
fi

echo ""
echo "📋 Summary:"
echo "  • Participant URL: http://YOUR_SERVER_IP"
echo "  • Admin Dashboard: http://YOUR_SERVER_IP/admin"
echo "  • Backend API: http://YOUR_SERVER_IP:3000"
echo ""
