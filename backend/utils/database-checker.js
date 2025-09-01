const { Pool } = require('pg');
const Migrator = require('../migrations/migrator');

class DatabaseChecker {
  constructor() {
    this.adminPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: 'postgres', // Base système pour créer d'autres bases
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    
    this.appPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  }

  async checkAndCreateDatabase() {
    try {
      console.log('🔍 Vérification de la base de données...');
      
      // Vérifier si la base existe
      const dbExists = await this.databaseExists();
      
      if (!dbExists) {
        console.log(`📦 Création de la base de données "${process.env.DB_NAME}"...`);
        await this.createDatabase();
      } else {
        console.log(`✅ Base de données "${process.env.DB_NAME}" existe déjà`);
      }
      
      // Fermer la connexion admin
      await this.adminPool.end();
      
      // Vérifier la connexion à la base applicative
      await this.appPool.query('SELECT NOW()');
      console.log('✅ Connexion à la base applicative établie');
      
      // Exécuter les migrations
      await this.runMigrations();
      
      return this.appPool;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la base:', error.message);
      throw error;
    }
  }

  async databaseExists() {
    try {
      const result = await this.adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [process.env.DB_NAME]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error.message);
      return false;
    }
  }

  async createDatabase() {
    try {
      await this.adminPool.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`✅ Base de données "${process.env.DB_NAME}" créée avec succès`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`✅ Base de données "${process.env.DB_NAME}" existe déjà`);
      } else {
        throw error;
      }
    }
  }

  async runMigrations() {
    try {
      console.log('🔄 Vérification des migrations...');
      const migrator = new Migrator();
      await migrator.migrate();
    } catch (error) {
      console.error('❌ Erreur lors des migrations:', error.message);
      throw error;
    }
  }
}

module.exports = DatabaseChecker;
