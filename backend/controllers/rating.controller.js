const pool = require('../config/db');

// 🔥 L'entreprise donne une note à un freelance après la fin du job
exports.rateFreelance = async (req, res) => {
  const { job_id, freelance_id, rating, review } = req.body;
  const { id: entreprise_id, role } = req.user;

  if (role !== 'entreprise') {
    return res.status(403).json({ message: "Seules les entreprises peuvent noter un freelance." });
  }

  try {
    // ✅ Vérifie que ce job appartient bien à cette entreprise et qu’il est terminé
    const jobCheck = await pool.query(
      `SELECT * FROM jobs 
       WHERE id = $1 AND is_completed = true AND entreprise_id = $2 AND assigned_freelance_id = $3`,
      [job_id, entreprise_id, freelance_id]
    );

    if (jobCheck.rowCount === 0) {
      return res.status(403).json({ message: "Job non terminé ou ne vous appartient pas." });
    }

    // ❌ Vérifie si une note existe déjà
    const existing = await pool.query(
      `SELECT * FROM ratings WHERE job_id = $1`,
      [job_id]
    );

    if (existing.rowCount > 0) {
      return res.status(400).json({ message: "Ce job a déjà été noté." });
    }

    // ✅ Insertion de la note
    const result = await pool.query(
      `INSERT INTO ratings (job_id, freelance_id, entreprise_id, rating, review, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [job_id, freelance_id, entreprise_id, rating, review]
    );

    res.status(201).json({ message: "Note ajoutée", data: result.rows[0] });
  } catch (error) {
    console.error("Erreur rating:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔍 Obtenir toutes les notes d’un freelance
exports.getFreelanceRatings = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT rating, review, created_at 
       FROM ratings 
       WHERE freelance_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Aucune évaluation trouvée." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur getFreelanceRatings:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔍 Récupérer les notes du freelance connecté
exports.getMyOwnRatings = async (req, res) => {
  const { id, role } = req.user;

  if (role !== 'freelance') {
    return res.status(403).json({ message: "Accès refusé : uniquement pour les freelances." });
  }

  try {
   const result = await pool.query(
  `SELECT 
      r.id, r.rating, r.review, r.created_at,
      j.id AS job_id, j.title AS job_title,
      e.id AS entreprise_id, 
      e.first_name || ' ' || e.surname AS entreprise_name
   FROM ratings r
   LEFT JOIN jobs j ON r.job_id = j.id
   LEFT JOIN entreprises e ON r.entreprise_id = e.id
   WHERE r.freelance_id = $1
   ORDER BY r.created_at DESC`,
  [id]
);


    const formatted = result.rows.map(row => ({
      id: row.id,
      rating: row.rating,
      review: row.review,
      created_at: row.created_at,
      job: {
        id: row.job_id,
        title: row.job_title
      },
      company: {
        id: row.entreprise_id,
        name: row.entreprise_name
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Erreur getMyOwnRatings:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
