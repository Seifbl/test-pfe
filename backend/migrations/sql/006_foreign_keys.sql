-- Migration : Clés étrangères et contraintes
-- Version: 006_foreign_keys
-- Description: Ajout de toutes les relations entre les tables (sécurisé)

-- Fonction pour ajouter une contrainte seulement si elle n'existe pas
DO $$ 
BEGIN
    -- Nettoyer les données incompatibles avant d'ajouter les contraintes
    
    -- 1. Supprimer les invitations avec des freelance_id inexistants
    DELETE FROM invitations 
    WHERE freelance_id NOT IN (SELECT id FROM freelances);
    
    -- 2. Supprimer les invitations avec des entreprise_id inexistants
    DELETE FROM invitations 
    WHERE entreprise_id NOT IN (SELECT id FROM entreprises);
    
    -- 3. Supprimer les invitations avec des job_id inexistants
    DELETE FROM invitations 
    WHERE job_id NOT IN (SELECT id FROM jobs);
    
    -- 4. Nettoyer les autres tables
    DELETE FROM job_applications 
    WHERE freelance_id NOT IN (SELECT id FROM freelances) 
    OR job_id NOT IN (SELECT id FROM jobs);
    
    DELETE FROM assignments 
    WHERE freelance_id NOT IN (SELECT id FROM freelances) 
    OR job_id NOT IN (SELECT id FROM jobs);
    
    DELETE FROM ratings 
    WHERE (freelance_id IS NOT NULL AND freelance_id NOT IN (SELECT id FROM freelances))
    OR (entreprise_id IS NOT NULL AND entreprise_id NOT IN (SELECT id FROM entreprises))
    OR (job_id IS NOT NULL AND job_id NOT IN (SELECT id FROM jobs));
    -- Relations pour la table jobs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_entreprise_id_fkey') THEN
        ALTER TABLE jobs ADD CONSTRAINT jobs_entreprise_id_fkey 
        FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_assigned_freelance_id_fkey') THEN
        ALTER TABLE jobs ADD CONSTRAINT jobs_assigned_freelance_id_fkey 
        FOREIGN KEY (assigned_freelance_id) REFERENCES freelances(id);
    END IF;

    -- Relations pour job_applications
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_job_id_fkey') THEN
        ALTER TABLE job_applications ADD CONSTRAINT job_applications_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_freelance_id_fkey') THEN
        ALTER TABLE job_applications ADD CONSTRAINT job_applications_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour job_invitations
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_invitations_job_id_fkey') THEN
        ALTER TABLE job_invitations ADD CONSTRAINT job_invitations_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour freelance_experiences
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'freelance_experiences_freelance_id_fkey') THEN
        ALTER TABLE freelance_experiences ADD CONSTRAINT freelance_experiences_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour experiences
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'experiences_freelance_id_fkey') THEN
        ALTER TABLE experiences ADD CONSTRAINT experiences_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour freelance_skills
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'freelance_skills_freelance_id_fkey') THEN
        ALTER TABLE freelance_skills ADD CONSTRAINT freelance_skills_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour freelance_roles
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'freelance_roles_freelance_id_fkey') THEN
        ALTER TABLE freelance_roles ADD CONSTRAINT freelance_roles_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour freelance_cvs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'freelance_cvs_freelance_id_fkey') THEN
        ALTER TABLE freelance_cvs ADD CONSTRAINT freelance_cvs_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour invitations
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_entreprise_id_fkey') THEN
        ALTER TABLE invitations ADD CONSTRAINT invitations_entreprise_id_fkey 
        FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_freelance_id_fkey') THEN
        ALTER TABLE invitations ADD CONSTRAINT invitations_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_job_id_fkey') THEN
        ALTER TABLE invitations ADD CONSTRAINT invitations_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;

    -- Relations pour assignments
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assignments_job_id_fkey') THEN
        ALTER TABLE assignments ADD CONSTRAINT assignments_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assignments_freelance_id_fkey') THEN
        ALTER TABLE assignments ADD CONSTRAINT assignments_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id);
    END IF;

    -- Relations pour notifications
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_job_id_fkey') THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
    END IF;

    -- Relations pour ratings
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_job_id_fkey') THEN
        ALTER TABLE ratings ADD CONSTRAINT ratings_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_freelance_id_fkey') THEN
        ALTER TABLE ratings ADD CONSTRAINT ratings_freelance_id_fkey 
        FOREIGN KEY (freelance_id) REFERENCES freelances(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_entreprise_id_fkey') THEN
        ALTER TABLE ratings ADD CONSTRAINT ratings_entreprise_id_fkey 
        FOREIGN KEY (entreprise_id) REFERENCES entreprises(id);
    END IF;
END $$;
