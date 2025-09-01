const pool = require('../config/db');

// 🔧 Création d'une entreprise
const createEntreprise = async ({
  first_name,
  surname,
  organization_size,
  phone_number,
  email,
  password,
  accept_terms,
  accept_marketing
}) => {
  const query = `
    INSERT INTO entreprises 
    (first_name, surname, organization_size, phone_number, email, password, accept_terms, accept_marketing) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [first_name, surname, organization_size, phone_number, email, password, accept_terms, accept_marketing];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// 🔍 Recherche d'une entreprise par email
const findEntrepriseByEmail = async (email) => {
  const query = 'SELECT * FROM entreprises WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// 🔍 Recherche d'une entreprise par ID
const findEntrepriseById = async (id) => {
  const query = 'SELECT * FROM entreprises WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ✏️ Mise à jour du profil entreprise par ID
const updateEntrepriseById = async (id, data) => {
  const {
    first_name,
    surname,
    organization_size,
    phone_number,
    industry,
    website,
    country,
    city,
    zip_code
  } = data;

  const query = `
    UPDATE entreprises SET
      first_name = $1,
      surname = $2,
      organization_size = $3,
      phone_number = $4,
      industry = $5,
      website = $6,
      country = $7,
      city = $8,
      zip_code = $9
    WHERE id = $10
    RETURNING *;
  `;

  const values = [
    first_name,
    surname,
    organization_size,
    phone_number,
    industry,
    website,
    country,
    city,
    zip_code,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createEntreprise,
  findEntrepriseByEmail,
  findEntrepriseById,
  updateEntrepriseById, // 👈 nouvel export ajouté ici
};
