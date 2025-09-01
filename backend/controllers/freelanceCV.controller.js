const pool = require('../config/db');

const uploadCVController = async (req, res) => {
  const freelanceId = req.user.id;
  const fileUrl = req.file?.path;

  if (!fileUrl) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO freelance_cvs (freelance_id, file_url)
       VALUES ($1, $2)
       RETURNING *`,
      [freelanceId, fileUrl]
    );

    res.status(201).json({
      message: 'CV téléversé avec succès',
      cv: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur téléversement CV :', error);
    res.status(500).json({ error: "Erreur lors du téléversement du CV" });
  }
};

module.exports = {
  uploadCVController,
};
