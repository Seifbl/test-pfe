#!/usr/bin/env node

const { Pool } = require('pg');
const Migrator = require('./migrations/migrator');

// Configuration pour la base de test 'trailer'
const testPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'trailer', // Base de test
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Créer une version du migrator pour la base de test
class TestMigrator extends Migrator {
  constructor() {
    super();
    // Remplacer la connexion par celle de test
    this.pool = testPool;
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const result = await this.pool.query(
      `SELECT version FROM ${this.migrationsTable} ORDER BY version`
    );
    return result.rows.map(row => row.version);
  }

  async executeMigration(migration) {
    const fs = require('fs');
    const sql = fs.readFileSync(migration.path, 'utf8');
    
    try {
      await this.pool.query('BEGIN');
      
      // Exécuter le SQL de migration
      await this.pool.query(sql);
      
      // Marquer la migration comme exécutée
      await this.pool.query(
        `INSERT INTO ${this.migrationsTable} (version) VALUES ($1)`,
        [migration.version]
      );
      
      await this.pool.query('COMMIT');
      console.log(`✅ Migration ${migration.version} exécutée avec succès`);
    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.error(`❌ Erreur lors de l'exécution de la migration ${migration.version}:`, error.message);
      throw error;
    }
  }
}

async function testMigrations() {
  console.log('🧪 Test des migrations sur la base "trailer"');
  
  try {
    // Tester la connexion
    await testPool.query('SELECT NOW()');
    console.log('✅ Connexion à la base "trailer" établie');
    
    // Exécuter les migrations
    const migrator = new TestMigrator();
    await migrator.migrate();
    
    // Vérifier les tables créées
    const result = await testPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables créées dans la base "trailer":');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    console.log('\n🎉 Test réussi ! Le système de migrations fonctionne parfaitement.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  } finally {
    await testPool.end();
  }
}

testMigrations();
