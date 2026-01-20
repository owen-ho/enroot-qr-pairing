const pool = require('../db');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create participants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        token TEXT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'waiting',
        CONSTRAINT status_check CHECK (status IN ('waiting', 'paired', 'left'))
      )
    `);

    // Create pairings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pairings (
        id SERIAL PRIMARY KEY,
        participant1_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        participant2_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        paired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        CONSTRAINT pairing_status_check CHECK (status IN ('active', 'broken'))
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_participants_slug ON participants(slug)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pairings_status ON pairings(status)
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createTables };
