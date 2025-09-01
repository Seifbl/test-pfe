const pool = require('../config/db');

const createNotification = async ({ user_id, user_role, type, title, message, job_id }) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, user_role, type, title, message, job_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_id, user_role, type, title, message, job_id]
  );
  return result.rows[0];
};

const getNotificationsByUser = async (user_id, user_role) => {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 AND user_role = $2
     ORDER BY created_at DESC`,
    [user_id, user_role]
  );
  return result.rows;
};

module.exports = {
  createNotification,
  getNotificationsByUser,
};
