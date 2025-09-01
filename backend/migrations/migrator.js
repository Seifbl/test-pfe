const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

class Migrator {
  constructor() {
    this.migrationsDir = path.join(__dirname, 'sql');
    this.migrationsTable = 'schema_migrations';
  }

  async init() {
    // Créer la table des migrations si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const result = await pool.query(
      `SELECT version FROM ${this.migrationsTable} ORDER BY version`
    );
    return result.rows.map(row => row.version);
  }

  async getPendingMigrations() {
    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = this.getAllMigrationFiles();
    
    return allMigrations.filter(migration => 
      !executedMigrations.includes(migration.version)
    );
  }

  getAllMigrationFiles() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    return files.map(file => ({
      version: file.replace('.sql', ''),
      filename: file,
      path: path.join(this.migrationsDir, file)
    }));
  }

  async executeMigration(migration) {
    const sql = fs.readFileSync(migration.path, 'utf8');
    
    try {
      await pool.query('BEGIN');
      
      // Exécuter le SQL de migration
      await pool.query(sql);
      
      // Marquer la migration comme exécutée
      await pool.query(
        `INSERT INTO ${this.migrationsTable} (version) VALUES ($1)`,
        [migration.version]
      );
      
      await pool.query('COMMIT');
      console.log(`✅ Migration ${migration.version} exécutée avec succès`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`❌ Erreur lors de l'exécution de la migration ${migration.version}:`, error.message);
      throw error;
    }
  }

  async migrate() {
    await this.init();
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ Aucune migration en attente');
      return;
    }

    console.log(`📦 ${pendingMigrations.length} migration(s) en attente`);
    
    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }
    
    console.log('🎉 Toutes les migrations ont été exécutées avec succès');
  }

  async rollback(version) {
    // Pour un rollback simple, on peut supprimer l'entrée de la table des migrations
    // Note: cela ne défait pas réellement les changements SQL
    await pool.query(
      `DELETE FROM ${this.migrationsTable} WHERE version = $1`,
      [version]
    );
    console.log(`🔄 Migration ${version} marquée comme non exécutée`);
  }

  async status() {
    await this.init();
    const executed = await this.getExecutedMigrations();
    const pending = await this.getPendingMigrations();
    
    console.log('\n📊 État des migrations:');
    console.log(`✅ Exécutées: ${executed.length}`);
    console.log(`⏳ En attente: ${pending.length}`);
    
    if (pending.length > 0) {
      console.log('\nMigrations en attente:');
      pending.forEach(m => console.log(`  - ${m.version}`));
    }
  }
}

module.exports = Migrator;
