#!/bin/bash

# Script de déploiement de la base de données pour DevOps
# Ce script configure automatiquement la base de données PostgreSQL

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de la base de données Trailblazer"

# Vérifier que les variables d'environnement sont définies
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Variables d'environnement manquantes. Vérifiez DB_HOST, DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
fi

echo "📋 Configuration:"
echo "  - Host: $DB_HOST"
echo "  - Database: $DB_NAME"
echo "  - User: $DB_USER"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Exécuter les migrations
echo "🔄 Exécution des migrations..."
npm run migrate

echo "✅ Base de données déployée avec succès!"
echo "💡 Pour vérifier l'état: npm run migrate:status"
