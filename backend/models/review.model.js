const pool = require('../config/db');

const createReview = async ({ reviewer_id, reviewer_role, target_id, target_role, job_id, rating, comment }) => {
  const result = await pool.query(
    `INSERT INTO reviews 
      (reviewer_id, reviewer_role, target_id, target_role, job_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [reviewer_id, reviewer_role, target_id, target_role, job_id, rating, comment]
  );
  return result.rows[0];
};

const getReviewsForUser = async (target_id, target_role) => {
  const result = await pool.query(
    `SELECT * FROM reviews
     WHERE target_id = $1 AND target_role = $2
     ORDER BY created_at DESC`,
    [target_id, target_role]
  );
  return result.rows;
};
const getAverageRatingForUser = async (target_id, target_role) => {
  const result = await pool.query(
    `SELECT AVG(rating) as average_rating
     FROM reviews
     WHERE target_id = $1 AND target_role = $2`,
    [target_id, target_role]
  );
  return result.rows[0].average_rating;
};

module.exports = {
  createReview,
  getReviewsForUser,
  getAverageRatingForUser
};
