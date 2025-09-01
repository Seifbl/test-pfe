const pool = require('../config/db');

const addFreelanceRoles = async (freelanceId, roles) => {
  const queries = roles.map(({ role, years_of_experience, is_primary }) => {
    return pool.query(
      `INSERT INTO freelance_roles (freelance_id, role, years_of_experience, is_primary)
       VALUES ($1, $2, $3, $4)`,
      [freelanceId, role, years_of_experience, is_primary || false]
    );
  });

  await Promise.all(queries); // exécute tous les insertions en parallèle
};

const getRolesByFreelanceId = async (freelanceId) => {
  const query = `SELECT id, role, years_of_experience, is_primary FROM freelance_roles WHERE freelance_id = $1`;
  const result = await pool.query(query, [freelanceId]);
  return result.rows;
};

const deleteFreelanceRole = async (freelanceId, roleId) => {
  const query = `
    DELETE FROM freelance_roles 
    WHERE id = $1 AND freelance_id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [roleId, freelanceId]);
  return result.rows[0]; // null si rien supprimé
};


module.exports = {
  addFreelanceRoles,
  getRolesByFreelanceId,
  deleteFreelanceRole 
};
