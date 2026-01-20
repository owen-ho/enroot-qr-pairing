const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');
const pool = require('../db');

// Middleware to verify participant token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.participantId = decoded.participantId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate unique slug
const generateUniqueSlug = async () => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const slug = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '-',
      length: 2,
      style: 'lowerCase'
    });
    
    // Check if slug already exists
    const result = await pool.query(
      'SELECT id FROM participants WHERE slug = $1',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return slug;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique slug');
};

// Attempt to pair with waiting participant
const attemptPairing = async (participantId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find a waiting participant (excluding current participant)
    const waitingResult = await client.query(
      `SELECT id FROM participants 
       WHERE status = 'waiting' AND id != $1 
       ORDER BY joined_at ASC 
       LIMIT 1 FOR UPDATE`,
      [participantId]
    );
    
    if (waitingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null; // No one to pair with
    }
    
    const partnerId = waitingResult.rows[0].id;
    
    // Update both participants to 'paired' status
    await client.query(
      `UPDATE participants SET status = 'paired' WHERE id = $1 OR id = $2`,
      [participantId, partnerId]
    );
    
    // Create pairing record
    await client.query(
      `INSERT INTO pairings (participant1_id, participant2_id, status) 
       VALUES ($1, $2, 'active')`,
      [participantId, partnerId]
    );
    
    await client.query('COMMIT');
    
    // Get partner info
    const partnerInfo = await pool.query(
      'SELECT id, slug FROM participants WHERE id = $1',
      [partnerId]
    );
    
    return partnerInfo.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// POST /api/join - Join the event
router.post('/join', async (req, res) => {
  try {
    // Generate unique slug
    const slug = await generateUniqueSlug();
    
    // Insert participant first (without token)
    const result = await pool.query(
      `INSERT INTO participants (slug, token, status) 
       VALUES ($1, $2, 'waiting') 
       RETURNING id, slug`,
      [slug, 'temp']
    );
    
    const participant = result.rows[0];
    
    // Create JWT token with participant ID
    const token = jwt.sign(
      { participantId: participant.id, slug: participant.slug },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Update participant with actual token
    await pool.query(
      'UPDATE participants SET token = $1 WHERE id = $2',
      [token, participant.id]
    );
    
    // Attempt immediate pairing
    const partner = await attemptPairing(participant.id);
    
    res.json({
      token,
      slug: participant.slug,
      paired: partner !== null,
      partner: partner ? { slug: partner.slug } : null
    });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// GET /api/status - Get current pairing status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.slug, p.status, p.joined_at,
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
       WHERE p.id = $1`,
      [req.participantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    const participant = result.rows[0];
    
    res.json({
      slug: participant.slug,
      status: participant.status,
      paired: participant.status === 'paired',
      partner: participant.partner_slug ? { slug: participant.partner_slug } : null
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// POST /api/unpair - Report that partner has left
router.post('/unpair', verifyToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find active pairing
    const pairingResult = await client.query(
      `SELECT id, participant1_id, participant2_id 
       FROM pairings 
       WHERE (participant1_id = $1 OR participant2_id = $1) 
       AND status = 'active'`,
      [req.participantId]
    );
    
    if (pairingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No active pairing found' });
    }
    
    const pairing = pairingResult.rows[0];
    
    // Mark pairing as broken
    await client.query(
      'UPDATE pairings SET status = $1 WHERE id = $2',
      ['broken', pairing.id]
    );
    
    // Update both participants to 'waiting' status
    await client.query(
      `UPDATE participants SET status = 'waiting' 
       WHERE id = $1 OR id = $2`,
      [pairing.participant1_id, pairing.participant2_id]
    );
    
    await client.query('COMMIT');
    
    // Try to re-pair current participant
    const newPartner = await attemptPairing(req.participantId);
    
    res.json({
      message: 'Unpaired successfully',
      paired: newPartner !== null,
      partner: newPartner ? { slug: newPartner.slug } : null
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error unpairing:', error);
    res.status(500).json({ error: 'Failed to unpair' });
  } finally {
    client.release();
  }
});

module.exports = router;
