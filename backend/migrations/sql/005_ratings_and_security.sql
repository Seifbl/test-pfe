-- Migration : Système de notation et sécurité
-- Version: 005_ratings_and_security
-- Description: Création des tables pour les ratings et la réinitialisation des mots de passe

-- Table des évaluations
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    job_id INTEGER,
    freelance_id INTEGER,
    entreprise_id INTEGER,
    rating INTEGER,
    review TEXT,
    created_at TIMESTAMP DEFAULT now(),
    CONSTRAINT ratings_rating_check CHECK ((rating >= 1) AND (rating <= 5))
);

-- Table des réinitialisations de mot de passe
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    token TEXT NOT NULL,
    token_expiration TIMESTAMP NOT NULL,
    CONSTRAINT password_resets_role_check CHECK (role = ANY (ARRAY['freelance'::text, 'entreprise'::text]))
);
