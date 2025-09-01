#!/usr/bin/env node

const Migrator = require('./migrator');

async function main() {
  const migrator = new Migrator();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'migrate':
        await migrator.migrate();
        break;
      case 'status':
        await migrator.status();
        break;
      case 'rollback':
        const version = process.argv[3];
        if (!version) {
          console.error('❌ Veuillez spécifier la version à rollback');
          process.exit(1);
        }
        await migrator.rollback(version);
        break;
      default:
        console.log(`
Usage: node migrations/cli.js <command>

Commands:
  migrate   - Exécute toutes les migrations en attente
  status    - Affiche l'état des migrations
  rollback  - Marque une migration comme non exécutée

Examples:
  node migrations/cli.js migrate
  node migrations/cli.js status
  node migrations/cli.js rollback 001_initial_schema
        `);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
