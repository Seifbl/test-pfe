/**
 * Script to create an admin account
 * Usage: node create-admin.js <email> <password>
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'seif12345',
  host: process.env.DB_HOST || 'postgres',  // Use the postgres container name
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'trailblazer'
});

async function createAdmin() {
  try {
    // Check if admin table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      );
    `);
    
    // Create admins table if it doesn't exist
    if (!tableCheck.rows[0].exists) {
      console.log('Creating admins table...');
      await pool.query(`
        CREATE TABLE admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Check if admin with email already exists
    const adminCheck = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    
    if (adminCheck.rows.length > 0) {
      console.log(`Admin with email ${email} already exists. Updating password...`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update admin
      await pool.query('UPDATE admins SET password = $1 WHERE email = $2', [hashedPassword, email]);
      console.log(`Admin password updated successfully for ${email}`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new admin
      await pool.query('INSERT INTO admins (email, password) VALUES ($1, $2)', [email, hashedPassword]);
      console.log(`Admin created successfully with email: ${email}`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
