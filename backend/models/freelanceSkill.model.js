const pool = require('../config/db');

const addFreelanceSkills = async (freelanceId, skills) => {
  const queries = skills.map(({ skill, is_top_skill }) => {
    return pool.query(
      `INSERT INTO freelance_skills (freelance_id, skill, is_top_skill)
       VALUES ($1, $2, $3)`,
      [freelanceId, skill, is_top_skill || false]
    );
  });

  await Promise.all(queries);
};

const getSkillsByFreelanceId = async (freelanceId) => {
  const query = `
    SELECT skill, is_top_skill
    FROM freelance_skills
    WHERE freelance_id = $1
  `;
  const result = await pool.query(query, [freelanceId]);
  return result.rows;
};
const deleteFreelanceSkill = async (freelanceId, skillId) => {
  const query = `
    DELETE FROM freelance_skills
    WHERE id = $1 AND freelance_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [skillId, freelanceId]);
  return result.rows[0]; // null si rien supprimé
};

const getSkillsWithIdByFreelanceId = async (freelanceId) => {
  const query = `
    SELECT id, skill, is_top_skill
    FROM freelance_skills
    WHERE freelance_id = $1
  `;
  const result = await pool.query(query, [freelanceId]);
  return result.rows;
};

module.exports = {
  addFreelanceSkills,
  getSkillsByFreelanceId,
  deleteFreelanceSkill,
  getSkillsWithIdByFreelanceId
};
