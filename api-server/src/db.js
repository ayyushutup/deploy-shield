const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires SSL; rejectUnauthorized false to accept self‑signed certs
  ssl: { rejectUnauthorized: false }
});

// Run init.sql if present (used when container starts)
async function runMigrations() {
  try {
    const sql = fs.readFileSync('/db/init.sql', 'utf8');
    await pool.query(sql);
    console.log('Database migrations applied successfully');
  } catch (err) {
    console.error('Error applying migrations:', err);
    // proceed without crashing; tables may already exist
  }
}

module.exports = { pool, runMigrations };

