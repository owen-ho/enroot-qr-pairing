# Arts & Crafts Event Pairing Webapp

A companion webapp for arts and crafts events where participants scan a QR code to get paired with partners for gift exchange. Participants visit stations (tote bag decoration, origami crafts, bead bracelets, keychain painting) and create gifts for each other.

## Features

- 🎨 **QR Code Check-in**: Single QR code at entrance for all participants
- 🤝 **Automatic Pairing**: Instantly pairs participants as they join
- 🔔 **In-App Notifications**: Real-time status updates via polling
- 🏷️ **Mnemonic IDs**: Memorable adjective-animal combinations (e.g., "happy-turtle")
- 👥 **Re-pairing Support**: Participants can report if their partner leaves
- 📊 **Admin Dashboard**: Monitor participants, manually pair/unpair, view stats
- 🐳 **Docker Deployment**: Easy deployment with docker-compose

## Tech Stack

- **Frontend**: React 18 + Vite + react-hot-toast
- **Backend**: Node.js + Express + JWT authentication
- **Database**: PostgreSQL 15
- **Deployment**: Docker + Docker Compose

## Project Structure

```
enroot-qr-pairing/
├── backend/
│   ├── routes/
│   │   ├── participant.js   # Participant API endpoints
│   │   └── admin.js          # Admin API endpoints
│   ├── migrations/
│   │   ├── 001_initial.js    # Database schema
│   │   └── run.js            # Migration runner
│   ├── db.js                 # PostgreSQL connection
│   ├── server.js             # Express server
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ParticipantPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── scripts/
│   ├── generate-qr.js        # QR code generator
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your home server
- Node.js 18+ (for local development)

### 1. Clone and Configure

```bash
cd enroot-qr-pairing

# Copy and configure environment variables
cp .env.example .env
```

### 2. Edit `.env` File

Open `.env` and update these values:

```env
# Database credentials (change these for production)
POSTGRES_USER=pairinguser
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=pairing_db
DATABASE_URL=postgresql://pairinguser:your_secure_password_here@db:5432/pairing_db

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here

# Admin password for dashboard
ADMIN_PASSWORD=your_admin_password_here

# Frontend URL (your server's IP address)
FRONTEND_URL=http://192.168.1.100
```

**Important**: Replace `192.168.1.100` with your home server's actual IP address on your local network.

### 3. Generate QR Code

Before starting the event, generate the QR code that participants will scan:

```bash
cd scripts
npm install
npm run generate
```

This creates:
- `qr-code.png` - Image file to print
- `qr-code.html` - Formatted printable version

**Print the QR code and place it at the entrance!**

### 4. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Participant app**: `http://YOUR_SERVER_IP` (port 80)
- **Backend API**: `http://YOUR_SERVER_IP:3000`
- **Admin dashboard**: `http://YOUR_SERVER_IP/admin`

### 5. Access the Admin Dashboard

1. Navigate to `http://YOUR_SERVER_IP/admin`
2. Login with the password from your `.env` file
3. Monitor participants and manage pairings

## Local Development

### Backend

```bash
cd backend
npm install

# Create .env file with DATABASE_URL pointing to localhost
# Then run migrations
npm run migrate

# Start dev server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Participant Endpoints

- `POST /api/join` - Join event and get paired
- `GET /api/status` - Get current pairing status (requires auth)
- `POST /api/unpair` - Report partner left (requires auth)

### Admin Endpoints (require admin auth)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/participants` - List all participants
- `GET /api/admin/stats` - Get event statistics
- `POST /api/admin/pair` - Manually pair two participants
- `DELETE /api/admin/unpair/:id` - Break a pairing
- `POST /api/admin/reset` - Reset database for new event

## How It Works

### For Participants

1. **Scan QR code** at entrance
2. **Receive unique ID** (e.g., "brave-penguin")
3. **Get paired automatically** with another participant
4. **Meet at entrance** (notification appears)
5. **Visit stations** and create gifts together
6. **Report if partner leaves** to get re-paired

### For Organizers

1. **Print QR code** before event
2. **Start Docker containers** on home server
3. **Monitor admin dashboard** during event
4. **Manually pair participants** if needed
5. **Reset database** after event

## Pairing Algorithm

- Participants are paired **immediately** upon joining
- Uses **FIFO queue**: first person waiting gets paired with next person to join
- If **no partner available**, participant enters waiting state
- **Re-pairing supported**: when partner leaves, participant returns to queue
- **Odd numbers handled**: last person waits until next participant joins

## Database Schema

### `participants` table
- `id` - Primary key
- `slug` - Unique mnemonic ID
- `token` - JWT token for authentication
- `joined_at` - Timestamp
- `status` - 'waiting', 'paired', or 'left'

### `pairings` table
- `id` - Primary key
- `participant1_id` - Foreign key
- `participant2_id` - Foreign key
- `paired_at` - Timestamp
- `status` - 'active' or 'broken'

## Troubleshooting

### Can't access from other devices

- Check firewall settings on home server
- Ensure ports 80 and 3000 are open
- Verify server IP address in `.env`

### Database connection errors

- Check PostgreSQL container is running: `docker-compose ps`
- Verify credentials in `.env` match `docker-compose.yml`
- View logs: `docker-compose logs db`

### QR code doesn't work

- Verify `FRONTEND_URL` in `.env` is correct
- Regenerate QR code: `cd scripts && npm run generate`
- Test URL manually in a browser

### Participants not pairing

- Check backend logs: `docker-compose logs backend`
- Verify database connection
- Check admin dashboard for participant status

## Resetting for New Event

```bash
# Option 1: Use admin dashboard
# Navigate to /admin and click "Reset All Data"

# Option 2: Restart containers (clears database)
docker-compose down -v
docker-compose up -d
```

## Security Notes

- Change default passwords in `.env` before deployment
- Admin authentication uses simple password (suitable for local network)
- JWT tokens expire after 24 hours for participants, 12 hours for admin
- Run on local network only (not exposed to internet)

## License

MIT
