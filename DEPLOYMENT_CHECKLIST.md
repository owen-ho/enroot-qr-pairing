# 📋 Deployment Checklist

Use this checklist to ensure your Arts & Crafts Event pairing system is ready!

## 🔧 Pre-Deployment

### Environment Setup
- [ ] `.env` file created from `.env.example`
- [ ] `POSTGRES_PASSWORD` changed from default
- [ ] `JWT_SECRET` set to random secure string
- [ ] `ADMIN_PASSWORD` set to your chosen password
- [ ] `FRONTEND_URL` set to your server's IP address
- [ ] Server IP address confirmed (run `ipconfig` or `ip addr`)

### Software Requirements
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Node.js installed (for QR generation)

### QR Code Generation
- [ ] Run `npm run generate-qr` successfully
- [ ] `qr-code.png` file created
- [ ] `qr-code.html` file created
- [ ] QR code printed (at least 2 copies)
- [ ] QR code tested with phone camera

## 🚀 Deployment

### Starting Services
- [ ] Run `docker-compose up -d`
- [ ] All containers started successfully
- [ ] Run `docker-compose ps` to verify
- [ ] Database container healthy
- [ ] Backend container running
- [ ] Frontend container running

### Testing
- [ ] Frontend accessible at `http://YOUR_IP`
- [ ] Backend API responding at `http://YOUR_IP:3000/health`
- [ ] Admin dashboard accessible at `http://YOUR_IP/admin`
- [ ] Can login to admin dashboard
- [ ] QR code scan redirects correctly
- [ ] Can join as participant from mobile device
- [ ] Status updates working (wait ~5 seconds)
- [ ] Second participant gets paired with first

## 📱 Event Preparation

### 30 Minutes Before Event
- [ ] System is running (`docker-compose ps`)
- [ ] Test join from mobile device
- [ ] Test admin dashboard access
- [ ] Admin password ready and accessible
- [ ] QR codes posted at entrance
- [ ] Backup QR codes available
- [ ] Admin dashboard open on organizer device
- [ ] Internet/network connectivity confirmed

### Physical Setup
- [ ] QR codes placed at visible entrance location
- [ ] QR codes at appropriate height for scanning
- [ ] Good lighting on QR codes
- [ ] Clear instructions posted near QR code
- [ ] Designated meeting area for paired participants
- [ ] All craft stations set up and ready

## 📊 During Event

### Monitoring
- [ ] Admin dashboard open and visible
- [ ] Checking participant count periodically
- [ ] Monitoring pairing success rate
- [ ] Watching for participants stuck in "waiting"
- [ ] Ready to manually pair if needed

### Issue Response
- [ ] Know how to manually pair participants
- [ ] Know how to break pairings if needed
- [ ] Backup plan ready if system fails
- [ ] Contact person for technical issues

## ✅ Event Day Checklist

### Morning Of
- [ ] Server powered on and connected to network
- [ ] Docker started
- [ ] Run `docker-compose up -d`
- [ ] Verify all services running
- [ ] Test from mobile device
- [ ] Admin dashboard accessible
- [ ] QR codes ready to post

### At Venue
- [ ] Post QR codes at entrance
- [ ] Open admin dashboard on tablet/laptop
- [ ] Position organizer device for monitoring
- [ ] Brief staff on how pairing works
- [ ] Ready to assist participants

### During Event
- [ ] Monitor dashboard regularly
- [ ] Help participants who seem confused
- [ ] Manually pair if someone stuck waiting too long
- [ ] Keep backup QR codes handy
- [ ] Note any issues for future improvement

### After Event
- [ ] Thank participants
- [ ] Screenshot final stats (optional)
- [ ] Run `docker-compose down` to stop services
- [ ] Or keep running if database needed for records

## 🔄 For Next Event

### Reset Process
- [ ] Decide: keep data or reset?
- [ ] If reset: run `docker-compose down -v`
- [ ] Regenerate QR code if URL changed
- [ ] Test system again before next event

## ❌ Troubleshooting Quick Reference

### Can't Access System
```bash
# Check if running
docker-compose ps

# Restart services
docker-compose restart

# View logs
docker-compose logs -f
```

### Participants Not Pairing
- Check admin dashboard for stuck participants
- Manually pair if needed
- Check backend logs: `docker-compose logs backend`

### QR Code Not Working
- Verify URL is correct
- Test URL manually in browser
- Regenerate if needed: `npm run generate-qr`

### Database Issues
```bash
# Check database health
docker-compose logs db

# Restart database
docker-compose restart db
```

## 📞 Emergency Contacts

Write down before event:

**Technical Support**: _________________

**Venue WiFi Password**: _________________

**Server IP Address**: _________________

**Admin Password**: _________________

**Backup Contact**: _________________

## 🎯 Success Criteria

Your system is ready when:
- ✅ All checklist items completed
- ✅ Successfully paired test participants
- ✅ Admin dashboard showing correct data
- ✅ Mobile devices can scan and join
- ✅ Staff briefed on system usage
- ✅ Backup plan in place

---

**Good luck with your event! 🎨✨**

Print this checklist and use it on event day!
