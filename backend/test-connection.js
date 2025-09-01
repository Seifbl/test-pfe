require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔍 Test de connexion PostgreSQL...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Base système
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion PostgreSQL réussie !');
    
    // Tester si la base cible existe
    const result = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [process.env.DB_NAME]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Base "${process.env.DB_NAME}" existe`);
    } else {
      console.log(`⚠️ Base "${process.env.DB_NAME}" n'existe pas`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
