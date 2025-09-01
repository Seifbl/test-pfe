const pool = require('../config/db');

// 📥 Appliquer à un job
async function applyToJob(jobId, freelanceId) {
  // Vérifier si le freelance existe et est actif
  const checkFreelance = await pool.query(
    `SELECT is_active FROM freelances WHERE id = $1`,
    [freelanceId]
  );

  if (checkFreelance.rows.length === 0) {
    throw new Error('Freelance introuvable.');
  }

  if (!checkFreelance.rows[0].is_active) {
    throw new Error('Ton compte est désactivé. Tu ne peux pas postuler à des missions.');
  }

  // Vérifier si le freelance a déjà postulé
  const existing = await pool.query(
    `SELECT * FROM job_applications WHERE job_id = $1 AND freelance_id = $2`,
    [jobId, freelanceId]
  );

  if (existing.rows.length > 0) {
    throw new Error('Tu as déjà postulé à ce job.');
  }

  // Sinon, insérer la candidature
  const result = await pool.query(
    `INSERT INTO job_applications (job_id, freelance_id, status)
     VALUES ($1, $2, 'pending') RETURNING *`,
    [jobId, freelanceId]
  );

  return result.rows[0];
}


// 📋 Récupérer toutes les candidatures pour un job
async function getApplicationsByJobId(jobId) {
  const result = await pool.query(
    `SELECT * FROM job_applications WHERE job_id = $1`,
    [jobId]
  );
  return result.rows;
}

module.exports = {
  applyToJob,
  getApplicationsByJobId,
};
