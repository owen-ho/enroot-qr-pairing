const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    
    // Simple password check (in production, use hashed passwords)
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate admin token
    const token = jwt.sign(
      { isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/admin/participants - Get all participants
router.get('/participants', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         p.id, 
         p.slug, 
         p.status, 
         p.joined_at,
         pair.id as pairing_id,
         CASE 
           WHEN pair.participant1_id = p.id THEN p2.slug
           WHEN pair.participant2_id = p.id THEN p1.slug
         END as partner_slug
       FROM participants p
       LEFT JOIN pairings pair ON 
         (pair.participant1_id = p.id OR pair.participant2_id = p.id) 
         AND pair.status = 'active'
       LEFT JOIN participants p1 ON pair.participant1_id = p1.id
       LEFT JOIN participants p2 ON pair.participant2_id = p2.id
       WHERE p.status != 'left'
       ORDER BY p.joined_at DESC`
    );
    
    res.json({ participants: result.rows });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// GET /api/admin/stats - Get event statistics
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM participants WHERE status != 'left'`
    );
    
    const pairedResult = await pool.query(
      `SELECT COUNT(*) as paired FROM participants WHERE status = 'paired'`
    );
    
    const waitingResult = await pool.query(
      `SELECT COUNT(*) as waiting FROM participants WHERE status = 'waiting'`
    );
    
    const activePairingsResult = await pool.query(
      `SELECT COUNT(*) as active_pairings FROM pairings WHERE status = 'active'`
    );
    
    res.json({
      total: parseInt(totalResult.rows[0].total),
      paired: parseInt(pairedResult.rows[0].paired),
      waiting: parseInt(waitingResult.rows[0].waiting),
      activePairings: parseInt(activePairingsResult.rows[0].active_pairings)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/admin/pair - Manually pair two participants
router.post('/pair', verifyAdminToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { participant1Id, participant2Id } = req.body;
    
    if (!participant1Id || !participant2Id) {
      return res.status(400).json({ error: 'Both participant IDs required' });
    }
    
    if (participant1Id === participant2Id) {
      return res.status(400).json({ error: 'Cannot pair participant with themselves' });
    }
    
    await client.query('BEGIN');
    
    // Check if participants exist and are waiting
    const participantsResult = await client.query(
      `SELECT id, slug, status FROM participants WHERE id = $1 OR id = $2`,
      [participant1Id, participant2Id]
    );
    
    if (participantsResult.rows.length !== 2) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'One or both participants not found' });
    }
    
    const p1 = participantsResult.rows.find(p => p.id == participant1Id);
    const p2 = participantsResult.rows.find(p => p.id == participant2Id);
    
    if (p1.status !== 'waiting' || p2.status !== 'waiting') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Both participants must be in waiting status' });
    }
    
    // Update participants to paired
    await client.query(
      `UPDATE participants SET status = 'paired' WHERE id = $1 OR id = $2`,
      [participant1Id, participant2Id]
    );
    
    // Create pairing
    await client.query(
      `INSERT INTO pairings (participant1_id, participant2_id, status) 
       VALUES ($1, $2, 'active')`,
      [participant1Id, participant2Id]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Participants paired successfully',
      pairing: {
        participant1: { id: p1.id, slug: p1.slug },
        participant2: { id: p2.id, slug: p2.slug }
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error pairing participants:', error);
    res.status(500).json({ error: 'Failed to pair participants' });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/unpair/:pairingId - Break a pairing
router.delete('/unpair/:pairingId', verifyAdminToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { pairingId } = req.params;
    
    await client.query('BEGIN');
    
    // Get pairing info
    const pairingResult = await client.query(
      `SELECT participant1_id, participant2_id FROM pairings WHERE id = $1 AND status = 'active'`,
      [pairingId]
    );
    
    if (pairingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Active pairing not found' });
    }
    
    const { participant1_id, participant2_id } = pairingResult.rows[0];
    
    // Mark pairing as broken
    await client.query(
      `UPDATE pairings SET status = 'broken' WHERE id = $1`,
      [pairingId]
    );
    
    // Update participants to waiting
    await client.query(
      `UPDATE participants SET status = 'waiting' WHERE id = $1 OR id = $2`,
      [participant1_id, participant2_id]
    );
    
    await client.query('COMMIT');
    
    res.json({ message: 'Pairing broken successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error unpairing:', error);
    res.status(500).json({ error: 'Failed to unpair participants' });
  } finally {
    client.release();
  }
});

// POST /api/admin/reset - Reset all data (for new events)
router.post('/reset', verifyAdminToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query('DELETE FROM pairings');
    await client.query('DELETE FROM participants');
    
    await client.query('COMMIT');
    
    res.json({ message: 'Database reset successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  } finally {
    client.release();
  }
});

module.exports = router;
