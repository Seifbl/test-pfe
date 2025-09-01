-- Migration initiale : Création des tables principales
-- Version: 001_initial_schema
-- Description: Création des tables admins, entreprises, freelances

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des entreprises
CREATE TABLE IF NOT EXISTS entreprises (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    organization_size VARCHAR(50),
    phone_number VARCHAR(20),
    email VARCHAR(150) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    accept_terms BOOLEAN DEFAULT false,
    accept_marketing BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    industry VARCHAR(100),
    website VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    zip_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true
);

-- Table des freelances
CREATE TABLE IF NOT EXISTS freelances (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'freelance',
    title TEXT,
    experience_level TEXT,
    skills TEXT[],
    bio TEXT,
    created_at TIMESTAMP DEFAULT now(),
    location VARCHAR,
    linkedin VARCHAR,
    github VARCHAR,
    website VARCHAR,
    is_active BOOLEAN DEFAULT true
);
