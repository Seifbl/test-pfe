#!/usr/bin/env node

const Migrator = require('./migrations/migrator');
const pool = require('./config/db');

async function setupDatabase() {
  console.log('🚀 Configuration de la base de données...');
  
  try {
    // Tester la connexion
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données établie');
    
    // Exécuter les migrations
    const migrator = new Migrator();
    await migrator.migrate();
    
    console.log('🎉 Base de données configurée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    console.error('\n💡 Vérifiez que :');
    console.error('  - PostgreSQL est démarré');
    console.error('  - Les variables d\'environnement sont correctes dans .env');
    console.error('  - La base de données existe');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
