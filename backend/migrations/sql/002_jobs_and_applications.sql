-- Migration : Création des tables jobs et applications
-- Version: 002_jobs_and_applications
-- Description: Création des tables jobs, job_applications, job_invitations

-- Table des jobs
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    entreprise_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    experience_level TEXT,
    skills TEXT[],
    salary NUMERIC,
    questions TEXT[],
    draft BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now(),
    assigned_freelance_id INTEGER,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP
);

-- Table des candidatures
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    freelance_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_freelance_job UNIQUE (job_id, freelance_id)
);

-- Table des invitations de jobs
CREATE TABLE IF NOT EXISTS job_invitations (
    id SERIAL PRIMARY KEY,
    job_id INTEGER,
    freelancer_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
