# Système de Migrations - Trailblazer

Ce système de migrations permet de gérer automatiquement la création et la mise à jour de la base de données PostgreSQL.

## Utilisation

### Exécuter toutes les migrations
```bash
npm run migrate
# ou
npm run db:setup
```

### Vérifier l'état des migrations
```bash
npm run migrate:status
```

### Rollback d'une migration (marquer comme non exécutée)
```bash
npm run migrate:rollback <version>
# Exemple: npm run migrate:rollback 001_initial_schema
```

## Structure des migrations

Les migrations sont stockées dans `migrations/sql/` et suivent le format de nommage :
- `001_initial_schema.sql` - Tables principales (admins, entreprises, freelances)
- `002_jobs_and_applications.sql` - Jobs et candidatures
- `003_freelance_profiles.sql` - Profils des freelances
- `004_messaging_system.sql` - Système de messagerie
- `005_ratings_and_security.sql` - Évaluations et sécurité
- `006_foreign_keys.sql` - Relations entre tables

## Déploiement

Pour un nouveau déploiement :
1. Créer une base de données PostgreSQL vide
2. Configurer les variables d'environnement dans `.env`
3. Exécuter `npm run db:setup`

## Bonnes pratiques

- ✅ Toujours tester les migrations sur un environnement de développement
- ✅ Faire des sauvegardes avant d'exécuter des migrations en production
- ✅ Les migrations sont exécutées dans l'ordre alphabétique
- ✅ Une fois exécutée, une migration ne doit pas être modifiée
