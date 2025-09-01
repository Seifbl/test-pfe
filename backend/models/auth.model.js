const pool = require('../config/db');

// Récupérer un utilisateur par email, pour entreprise ou freelance
async function getUserByEmail(email) {
  const freelance = await pool.query('SELECT id, email FROM freelances WHERE email = $1', [email]);
  if (freelance.rows.length > 0) return { ...freelance.rows[0], role: 'freelance' };

  const entreprise = await pool.query('SELECT id, email FROM entreprises WHERE email = $1', [email]);
  if (entreprise.rows.length > 0) return { ...entreprise.rows[0], role: 'entreprise' };

  return null;
}

// Sauvegarder le token
const saveResetToken = async (userId, token, expiration, role) => {
    await pool.query(
      `INSERT INTO password_resets (user_id, token, token_expiration, role)
       VALUES ($1, $2, $3, $4)`,
      [userId, token, expiration, role]
    );
  };

// Récupérer via token
async function getUserByToken(token) {
  const result = await pool.query(
    `SELECT user_id as id, role, token_expiration FROM password_resets WHERE token = $1`,
    [token]
  );
  return result.rows[0];
}

// Mettre à jour le mot de passe
async function updatePassword(userId, hashedPassword, role) {
  const table = role === 'freelance' ? 'freelances' : 'entreprises';
  await pool.query(`UPDATE ${table} SET password = $1 WHERE id = $2`, [hashedPassword, userId]);
  await pool.query('DELETE FROM password_resets WHERE user_id = $1 AND role = $2', [userId, role]);
}

module.exports = {
  getUserByEmail,
  saveResetToken,
  getUserByToken,
  updatePassword,
};
