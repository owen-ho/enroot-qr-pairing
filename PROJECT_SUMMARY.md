# 🎨 Arts & Crafts Event Pairing System - Complete!

## ✅ What You Have

A fully functional webapp that pairs event participants for gift exchange at craft stations.

### Key Features Implemented

✅ **Single QR Code System** - One printed QR code for all participants  
✅ **Instant Random Pairing** - Pairs participants immediately upon joining  
✅ **Mnemonic Slugs** - Memorable IDs like "happy-turtle" and "brave-penguin"  
✅ **Real-time Updates** - Status polling every 4 seconds  
✅ **Re-pairing Support** - "My partner left" button for flexible pairing  
✅ **In-app Notifications** - Toast messages using react-hot-toast  
✅ **Admin Dashboard** - Full monitoring and manual control  
✅ **Session Persistence** - Survives page refresh via localStorage  
✅ **Docker Deployment** - Simple docker-compose setup  
✅ **QR Code Generator** - Script to create printable QR codes  

## 📁 Project Structure

```
enroot-qr-pairing/
├── 📄 README.md              # Full documentation
├── 📄 QUICKSTART.md          # Quick start guide  
├── 📄 .env.example           # Environment template
├── 📄 docker-compose.yml     # Docker orchestration
├── 📄 package.json           # Root scripts
│
├── backend/                   # Node.js + Express API
│   ├── server.js             # Main server
│   ├── db.js                 # PostgreSQL connection
│   ├── routes/
│   │   ├── participant.js    # Participant endpoints
│   │   └── admin.js          # Admin endpoints
│   ├── migrations/
│   │   ├── 001_initial.js    # Database schema
│   │   └── run.js            # Migration runner
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ParticipantPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf            # Production nginx config
│   ├── package.json
│   └── Dockerfile
│
└── scripts/
    ├── generate-qr.js        # QR code generator
    └── package.json
```

## 🚀 How to Use

### Initial Setup (One Time)

1. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

2. **Generate QR code**:
   ```bash
   npm run generate-qr
   ```
   This creates `qr-code.png` and `qr-code.html` to print.

3. **Start the system**:
   ```bash
   docker-compose up -d
   ```

### During the Event

**Participants**:
- Scan QR code at entrance
- Receive unique ID
- Get paired automatically
- Meet partner at entrance
- Visit stations together

**Organizers**:
- Monitor at `/admin`
- View real-time stats
- Manually pair if needed
- Break pairings if required

### After the Event

Reset for next event:
```bash
# Option 1: Via admin dashboard
# Visit /admin → Click "Reset All Data"

# Option 2: Via command line
docker-compose down -v
docker-compose up -d
```

## 🔧 Technical Details

### Tech Stack
- **Frontend**: React 18, Vite, react-hot-toast, react-router-dom
- **Backend**: Node.js, Express, JWT, unique-names-generator
- **Database**: PostgreSQL 15
- **Deployment**: Docker, docker-compose, nginx

### API Endpoints

**Participant**:
- `POST /api/join` - Join event, get paired
- `GET /api/status` - Check pairing status
- `POST /api/unpair` - Report partner left

**Admin**:
- `POST /api/admin/login` - Login with password
- `GET /api/admin/participants` - List all participants
- `GET /api/admin/stats` - Event statistics
- `POST /api/admin/pair` - Manual pairing
- `DELETE /api/admin/unpair/:id` - Break pairing
- `POST /api/admin/reset` - Reset database

### Database Schema

**participants**:
- id, slug, token, joined_at, status

**pairings**:
- id, participant1_id, participant2_id, paired_at, status

### Pairing Algorithm

1. New participant joins → enters waiting state
2. System checks for waiting participants (FIFO)
3. If found → pairs immediately, both marked as 'paired'
4. If not found → participant waits for next person
5. When partner leaves → both return to waiting queue
6. Auto re-pair attempts immediately

## 🎯 Event Stations

The app is configured for these craft stations:
- 🎨 Tote bag decoration
- 🦢 Origami crafts
- 📿 Bead bracelets
- 🔑 Keychain painting

## 🔐 Security

- JWT authentication for participants (24h expiry)
- JWT authentication for admin (12h expiry)
- Simple password protection for admin dashboard
- Designed for local network use only
- No personal information collected (anonymous slugs only)

## 📱 Browser Compatibility

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (iOS & macOS)
- ✅ Firefox
- ✅ Mobile browsers

## 🐛 Troubleshooting

See full README.md for:
- Network connectivity issues
- Database connection problems
- QR code generation issues
- Pairing algorithm edge cases

## 📝 Configuration

Key environment variables:
```env
POSTGRES_PASSWORD=<secure-password>
JWT_SECRET=<random-secret>
ADMIN_PASSWORD=<admin-password>
FRONTEND_URL=http://<your-server-ip>
```

## 🎉 Success Checklist

Before your event:
- [ ] `.env` configured with your settings
- [ ] QR code generated and printed
- [ ] Docker containers running
- [ ] Tested from mobile device
- [ ] Admin dashboard accessible
- [ ] Admin password known
- [ ] Backup QR codes printed

## 💡 Pro Tips

1. **Test 30 minutes early** - Catch issues before participants arrive
2. **Keep admin dashboard open** - Monitor in real-time
3. **Have backup plan** - Manual pairing if needed
4. **Print multiple QR codes** - In case one gets damaged
5. **Note your server IP** - Easy reference during event

## 🆘 Support

- Check `README.md` for detailed documentation
- Check `QUICKSTART.md` for setup steps
- Run `test.sh` or `test.bat` to verify setup
- Check Docker logs: `docker-compose logs -f`

## 📊 Monitoring

The admin dashboard shows:
- Total participants
- Number paired
- Number waiting
- Active pairings
- Full participant list with status
- Real-time updates every 5 seconds

---

**Everything is ready! Have an amazing arts & crafts event! 🎨✨**
