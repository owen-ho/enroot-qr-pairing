# 🚀 Quick Start Guide

Get your Arts & Crafts Event pairing system running in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (only for QR code generation)

## Step-by-Step Setup

### 1️⃣ Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
# IMPORTANT: Change these values!
# - POSTGRES_PASSWORD: Choose a secure password
# - JWT_SECRET: Generate a random string
# - ADMIN_PASSWORD: Choose your admin password
# - FRONTEND_URL: Replace with your server's IP (e.g., http://192.168.1.100)
```

**To find your server IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Linux/Mac: `ip addr` or `ifconfig` (look for inet)

### 2️⃣ Generate QR Code

```bash
# Install dependencies and generate QR code
npm run generate-qr
```

This creates:
- `qr-code.png` - Print this!
- `qr-code.html` - Printable formatted version

**📋 Print the QR code and post it at your event entrance!**

### 3️⃣ Start the Application

```bash
# Start all services with Docker
docker-compose up -d

# Check that everything is running
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

### 4️⃣ Verify It Works

1. **Test the participant app**: Open `http://YOUR_SERVER_IP` on your phone
2. **Test the admin dashboard**: Open `http://YOUR_SERVER_IP/admin` and login
3. **Test the QR code**: Scan it with your phone's camera app

### 5️⃣ You're Ready! 🎉

- **Participants**: Scan QR code → Get paired → Exchange gifts
- **Organizers**: Monitor `/admin` dashboard during event

## During the Event

### Admin Dashboard (`/admin`)

Access: `http://YOUR_SERVER_IP/admin`

You can:
- ✅ View all participants and their pairing status
- ✅ See real-time stats (total, paired, waiting)
- ✅ Manually pair specific participants
- ✅ Break pairings if needed
- ✅ Monitor the event in real-time

### If Something Goes Wrong

```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart

# Complete reset
docker-compose down -v
docker-compose up -d
```

## After the Event

### Reset for Next Event

**Option 1: Admin Dashboard**
- Login to `/admin`
- Click "Reset All Data (New Event)"

**Option 2: Command Line**
```bash
docker-compose down -v
docker-compose up -d
```

## Development Mode (Optional)

If you want to develop locally without Docker:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run migrate
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

## Common Issues

### "Can't access from other devices"
- Check your server's firewall settings
- Ensure you're using the correct IP address
- Try disabling firewall temporarily for testing

### "QR code doesn't work"
- Verify `FRONTEND_URL` in `.env` is correct
- Regenerate: `npm run generate-qr`
- Test the URL manually in a browser

### "Database connection failed"
- Check Docker is running: `docker-compose ps`
- View logs: `docker-compose logs db`
- Verify `.env` credentials

## Tips for a Smooth Event

1. **Test everything** 30 minutes before the event starts
2. **Have backup** - know your admin password
3. **Keep admin dashboard open** for monitoring
4. **Print extra QR codes** in case one gets damaged
5. **Have a fallback plan** for manual pairing if tech fails

## Need Help?

Check the full README.md for detailed documentation and troubleshooting.

---

**Have a great event! 🎨✨**
