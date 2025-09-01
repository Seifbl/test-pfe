-- Migration : Profils des freelances
-- Version: 003_freelance_profiles
-- Description: Création des tables pour les profils freelances (expériences, compétences, rôles, CVs)

-- Table des expériences freelance
CREATE TABLE IF NOT EXISTS freelance_experiences (
    id SERIAL PRIMARY KEY,
    freelance_id INTEGER,
    title VARCHAR NOT NULL,
    company VARCHAR NOT NULL,
    currently_working BOOLEAN DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT
);

-- Table des expériences (version alternative)
CREATE TABLE IF NOT EXISTS experiences (
    id SERIAL PRIMARY KEY,
    freelance_id INTEGER,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des compétences freelance
CREATE TABLE IF NOT EXISTS freelance_skills (
    id SERIAL PRIMARY KEY,
    freelance_id INTEGER,
    skill VARCHAR NOT NULL,
    is_top_skill BOOLEAN DEFAULT false
);

-- Table des rôles freelance
CREATE TABLE IF NOT EXISTS freelance_roles (
    id SERIAL PRIMARY KEY,
    freelance_id INTEGER,
    role VARCHAR NOT NULL,
    years_of_experience INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false
);

-- Table des CVs freelance
CREATE TABLE IF NOT EXISTS freelance_cvs (
    id SERIAL PRIMARY KEY,
    freelance_id INTEGER,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
