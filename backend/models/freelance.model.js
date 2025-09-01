const pool = require('../config/db');

// ✅ Création d’un freelance
const createFreelance = async (freelanceData) => {
 const {
  first_name,
  last_name,
  email,
  password
} = freelanceData;

const query = `
  INSERT INTO freelances 
  (first_name, last_name, email, password)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

const values = [
  first_name,
  last_name,
  email,
  password
];


  const result = await pool.query(query, values);
  return result.rows[0];
};

// 🔍 Trouver un freelance par email
const findFreelanceByEmail = async (email) => {
  const query = 'SELECT * FROM freelances WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// 🔍 Trouver un freelance par ID
const findFreelanceById = async (id) => {
  const query = 'SELECT * FROM freelances WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ✅ Voir les expériences d’un freelance
const getExperiencesByFreelanceId = async (freelanceId) => {
  const query = `
    SELECT * FROM freelance_experiences
    WHERE freelance_id = $1
    ORDER BY start_date DESC;
  `;
  const result = await pool.query(query, [freelanceId]);
  return result.rows;
};

// ✏️ Mettre à jour une expérience
const updateExperienceById = async (freelanceId, experienceId, data) => {
  const {
    title,
    company,
    start_date,
    end_date,
    currently_working,
    description
  } = data;

  const query = `
    UPDATE freelance_experiences SET
      title = $1,
      company = $2,
      start_date = $3,
      end_date = $4,
      currently_working = $5,
      description = $6
    WHERE id = $7 AND freelance_id = $8
    RETURNING *;
  `;

  const values = [
    title,
    company,
    start_date,
    end_date,
    currently_working,
    description,
    experienceId,
    freelanceId
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// ❌ Supprimer une expérience
const deleteExperienceById = async (freelanceId, experienceId) => {
  const query = `
    DELETE FROM freelance_experiences 
    WHERE id = $1 AND freelance_id = $2 
    RETURNING *;
  `;
  const result = await pool.query(query, [experienceId, freelanceId]);
  return result.rows[0];
};

const getAllFreelances = async () => {
  const query = `
    SELECT 
      f.id,
      f.first_name,
      f.last_name,
      f.email,
      f.title,
      f.experience_level,
      f.bio,
      f.created_at,
      f.location,
      f.linkedin,
      f.github,
      f.website,
      f.is_active,
      cv.file_url AS cv_url,
      COALESCE(
        json_agg(
          json_build_object(
            'skill', fs.skill,
            'is_top_skill', fs.is_top_skill
          )
      ) FILTER (WHERE fs.skill IS NOT NULL), '[]') AS skills
    FROM freelances f
    LEFT JOIN LATERAL (
      SELECT file_url
      FROM freelance_cvs
      WHERE freelance_id = f.id
      ORDER BY uploaded_at DESC
      LIMIT 1
    ) AS cv ON true
    LEFT JOIN freelance_skills fs ON f.id = fs.freelance_id
    GROUP BY f.id, cv.file_url;
  `;

  const result = await pool.query(query);
  return result.rows;
};


const getLastCVByFreelanceId = async (freelanceId) => {
  const query = `
    SELECT file_url
    FROM freelance_cvs
    WHERE freelance_id = $1
    ORDER BY uploaded_at DESC
    LIMIT 1;
  `;
  const result = await pool.query(query, [freelanceId]);
  if (result.rows[0]) {
    result.rows[0].file_url = result.rows[0].file_url.replace(/\\/g, '/'); // 🔥 Remplace \ par /
  }
  return result.rows[0]; // Peut être undefined si aucun CV
};





module.exports = {
  createFreelance,
  findFreelanceByEmail,
  findFreelanceById,
  getExperiencesByFreelanceId,
  updateExperienceById,
  deleteExperienceById,
  getAllFreelances,
  getLastCVByFreelanceId
};
