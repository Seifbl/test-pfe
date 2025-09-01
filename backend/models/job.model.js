const pool = require('../config/db');

// ✅ Créer un job
const createJob = async (entrepriseId, jobData) => {
  const {
    title,
    description,
    duration,
    experience_level,
    skills,
    salary,
    questions,
    is_draft
  } = jobData;

  const query = `
    INSERT INTO jobs 
    (entreprise_id, title, description, duration, experience_level, skills, salary, questions, draft)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    entrepriseId,
    title,
    description,
    duration,
    experience_level,
    skills,
    salary,
    questions,
    is_draft || false
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// ✅ Récupérer les jobs par entreprise
const getJobsByEntrepriseId = async (entrepriseId) => {
  const query = `
    SELECT * FROM jobs
    WHERE entreprise_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [entrepriseId]);
  return result.rows;
};

// ✅ Mettre à jour un job
const updateJobById = async (jobId, entrepriseId, updatedData) => {
  const {
    title,
    description,
    duration,
    experience_level,
    skills,
    salary,
    questions,
    is_draft,
  } = updatedData;

  const query = `
    UPDATE jobs SET
      title = $1,
      description = $2,
      duration = $3,
      experience_level = $4,
      skills = $5,
      salary = $6,
      questions = $7,
      draft = $8
    WHERE id = $9 AND entreprise_id = $10
    RETURNING *;
  `;

  const values = [
    title,
    description,
    duration,
    experience_level,
    skills,
    salary,
    questions,
    is_draft || false,
    jobId,
    entrepriseId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};
const getJobById = async (jobId, entrepriseId) => {
   console.log("🔍 Requête getJobById avec:", { jobId, entrepriseId });

    const query = `
      SELECT * FROM jobs
      WHERE id = $1 AND entreprise_id = $2;
    `;
    const result = await pool.query(query, [jobId, entrepriseId]);
    return result.rows[0];
  };
  
  const getPublishedJobsByEntreprise = async (entrepriseId) => {
    const query = `
      SELECT * FROM jobs
      WHERE entreprise_id = $1 AND draft = false
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [entrepriseId]);
    return result.rows;
  };
  
  const getDraftJobsByEntreprise = async (entrepriseId) => {
    const query = `
      SELECT * FROM jobs
      WHERE entreprise_id = $1 AND draft = true
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [entrepriseId]);
    return result.rows;
  };

  const deleteJobById = async (jobId, entrepriseId) => {
    const query = `
      DELETE FROM jobs
      WHERE id = $1 AND entreprise_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [jobId, entrepriseId]);
    return result.rows[0]; // null si non trouvé
  };
  
  // ✅ Assigner un freelance à un job
async function assignFreelanceToJob(jobId, entrepriseId, freelanceId) {
  const result = await pool.query(
    `UPDATE jobs
     SET assigned_freelance_id = $1
     WHERE id = $2 AND entreprise_id = $3
     RETURNING *`,
    [freelanceId, jobId, entrepriseId]
  );
  return result.rows[0];
}
const markJobAsCompleted = async (jobId, entrepriseId) => {
  const result = await pool.query(
    `UPDATE jobs
     SET is_completed = true
     WHERE id = $1 AND entreprise_id = $2
     RETURNING *;`,
    [jobId, entrepriseId]
  );
  return result.rows[0];
};

const getAssignedFreelanceForJob = async (jobId) => {
  const result = await pool.query(`
    SELECT f.id, f.first_name, f.last_name, f.email
    FROM jobs j
    JOIN freelances f ON j.assigned_freelance_id = f.id
    WHERE j.id = $1 AND j.assigned_freelance_id IS NOT NULL
  `, [jobId]);

  return result.rows[0];
};


  
  module.exports = {
    createJob,
    getJobsByEntrepriseId,
    updateJobById,
    getJobById,
    getPublishedJobsByEntreprise,
    getDraftJobsByEntreprise,
    deleteJobById,
    assignFreelanceToJob,
    markJobAsCompleted,
    getAssignedFreelanceForJob,
    getJobById
  };
  