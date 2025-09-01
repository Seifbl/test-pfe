const pool = require('../config/db');

const addFreelanceExperience = async (freelanceId, data) => {
  const {
    title,
    company,
    currently_working,
    start_date,
    end_date,
    description
  } = data;

  const query = `
    INSERT INTO freelance_experiences 
    (freelance_id, title, company, currently_working, start_date, end_date, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    freelanceId,
    title,
    company,
    currently_working || false,
    start_date,
    end_date || null,
    description
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  addFreelanceExperience,
};
