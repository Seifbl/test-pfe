#!/usr/bin/env node

const Migrator = require('./migrator');
const pool = require('../config/db');

async function dryRun() {
  console.log('🔍 Simulation des migrations (DRY RUN)');
  console.log('Aucune modification ne sera apportée à la base de données\n');
  
  try {
    // Tester la connexion
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données établie\n');
    
    const migrator = new Migrator();
    await migrator.init();
    
    const executed = await migrator.getExecutedMigrations();
    const pending = await migrator.getPendingMigrations();
    
    console.log('📊 État actuel:');
    console.log(`  ✅ Migrations déjà exécutées: ${executed.length}`);
    if (executed.length > 0) {
      executed.forEach(m => console.log(`    - ${m}`));
    }
    
    console.log(`  ⏳ Migrations en attente: ${pending.length}`);
    if (pending.length > 0) {
      console.log('\n🔄 Ces migrations seraient exécutées:');
      pending.forEach(m => console.log(`    - ${m.version}`));
      
      console.log('\n📝 Contenu des migrations en attente:');
      const fs = require('fs');
      pending.forEach(m => {
        console.log(`\n--- ${m.version} ---`);
        const content = fs.readFileSync(m.path, 'utf8');
        console.log(content.substring(0, 200) + '...');
      });
    } else {
      console.log('  ✅ Aucune migration en attente');
    }
    
    console.log('\n💡 Pour exécuter réellement: npm run migrate');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

dryRun();
