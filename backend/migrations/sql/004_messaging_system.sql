-- Migration : Système de messagerie
-- Version: 004_messaging_system
-- Description: Création des tables pour les messages, notifications et invitations

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    job_id VARCHAR(255) DEFAULT 'general',
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false,
    file_url VARCHAR(255),
    file_type VARCHAR(50),
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_role TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    job_id INTEGER,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_user_role_check CHECK (user_role = ANY (ARRAY['freelance'::text, 'entreprise'::text]))
);

-- Table des invitations
CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    entreprise_id INTEGER NOT NULL,
    freelance_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des assignations
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    job_id INTEGER,
    freelance_id INTEGER,
    assigned_at TIMESTAMP DEFAULT now()
);
