const pool = require('../config/db');

const updateFreelanceProfile = async (req, res) => {
  const freelanceId = req.user.id;
  const {
    location,
    bio,
    linkedin,
    github,
    website,
    title,
    experience_level
  } = req.body;

  try {
    const query = `
      UPDATE freelances SET
        location = $1,
        bio = $2,
        linkedin = $3,
        github = $4,
        website = $5,
        title = $6,
        experience_level = $7
      WHERE id = $8
      RETURNING *;
    `;

    const values = [
      location,
      bio,
      linkedin,
      github,
      website,
      title,
      experience_level,
      freelanceId
    ];

    const result = await pool.query(query, values);

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      freelance: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour profil freelance :', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
  }
};

module.exports = {
  updateFreelanceProfile,
};
