const pool = require('../config/db');

// ✅ Envoyer une invitation
const createInvitation = async (entrepriseId, freelanceId, jobId) => {
  const query = `
    INSERT INTO invitations (entreprise_id, freelance_id, job_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [entrepriseId, freelanceId, jobId]);
  return result.rows[0];
};

// ✅ Voir toutes les invitations d'un job
const getInvitationsByJob = async (jobId) => {
  const query = `SELECT * FROM invitations WHERE job_id = $1`;
  const result = await pool.query(query, [jobId]);
  return result.rows;
};

// ✅ Annuler une invitation
const cancelInvitation = async (invitationId, entrepriseId) => {
  const query = `
    DELETE FROM invitations
    WHERE id = $1 AND entreprise_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [invitationId, entrepriseId]);
  return result.rows[0];
};

// ✅ Modifier le statut (entreprise)
const updateInvitationStatus = async (invitationId, entrepriseId, status) => {
  const query = `
    UPDATE invitations SET status = $1
    WHERE id = $2 AND entreprise_id = $3
    RETURNING *;
  `;
  const result = await pool.query(query, [status, invitationId, entrepriseId]);
  return result.rows[0];
};

// ✅ Voir mes invitations (freelance)
async function getInvitationsByFreelanceId(freelanceId) {
  const result = await pool.query(
    `SELECT invitations.id AS invitation_id, jobs.id AS job_id, jobs.title AS job_title, invitations.status, invitations.created_at
     FROM invitations
     JOIN jobs ON invitations.job_id = jobs.id
     WHERE invitations.freelance_id = $1
     ORDER BY invitations.created_at DESC`,
    [freelanceId]
  );
  return result.rows;
}

// ✅ Modifier statut invitation (freelance)
async function updateInvitationStatusByFreelance(invitationId, freelanceId, status) {
  const result = await pool.query(
    `UPDATE invitations
     SET status = $1
     WHERE id = $2 AND freelance_id = $3
     RETURNING *`,
    [status, invitationId, freelanceId]
  );
  return result.rows[0];
}

module.exports = {
  createInvitation,
  getInvitationsByJob,
  cancelInvitation,
  updateInvitationStatus,
  getInvitationsByFreelanceId,
  updateInvitationStatusByFreelance
};
