const pool = require('../../config/db');

// ✅ Récupérer tous les freelances
const getAllFreelances = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM freelances ORDER BY created_at DESC');
    return res.status(200).json({ freelances: result.rows });
  } catch (error) {
    console.error('Erreur getAllFreelances:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des freelances' });
  }
};

// ✅ Récupérer toutes les entreprises
const getAllEntreprises = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM entreprises ORDER BY created_at DESC');
    return res.status(200).json({ entreprises: result.rows });
  } catch (error) {
    console.error('Erreur getAllEntreprises:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des entreprises' });
  }
};

// ✅ Supprimer un freelance par ID
const deleteFreelanceById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM freelances WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Freelance introuvable' });
    }
    return res.status(200).json({ message: 'Freelance supprimé avec succès', deleted: result.rows[0] });
  } catch (error) {
    console.error('Erreur deleteFreelanceById:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression du freelance' });
  }
};

// ✅ Supprimer une entreprise par ID
const deleteEntrepriseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM entreprises WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entreprise introuvable' });
    }
    return res.status(200).json({ message: 'Entreprise supprimée avec succès', deleted: result.rows[0] });
  } catch (error) {
    console.error('Erreur deleteEntrepriseById:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression de l’entreprise' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [
      freelances,
      entreprises,
      jobs,
      invitations,
      candidatures
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM freelances'),
      pool.query('SELECT COUNT(*) FROM entreprises'),
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM invitations'),
      pool.query('SELECT COUNT(*) FROM job_applications')
    ]);

    res.status(200).json({
      total_freelances: parseInt(freelances.rows[0].count),
      total_entreprises: parseInt(entreprises.rows[0].count),
      total_jobs: parseInt(jobs.rows[0].count),
      total_invitations: parseInt(invitations.rows[0].count),
      total_candidatures: parseInt(candidatures.rows[0].count)
    });
  } catch (error) {
    console.error('Erreur dashboard admin :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// BAN FREELANCE
const banFreelance = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE freelances SET is_active = FALSE WHERE id = $1', [id]);
    res.json({ message: 'Freelance désactivé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la désactivation du freelance' });
  }
};

// UNBAN FREELANCE
const unbanFreelance = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE freelances SET is_active = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Freelance réactivé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réactivation du freelance' });
  }
};

// BAN ENTREPRISE
const banEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE entreprises SET is_active = FALSE WHERE id = $1', [id]);
    res.json({ message: 'Entreprise désactivée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la désactivation de l\'entreprise' });
  }
};

// UNBAN ENTREPRISE
const unbanEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE entreprises SET is_active = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Entreprise réactivée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réactivation de l\'entreprise' });
  }
};

module.exports = {
  getAllFreelances,
  getAllEntreprises,
  deleteFreelanceById,
  deleteEntrepriseById,
  getAdminStats,
  banFreelance,
  banEntreprise,
  unbanFreelance,
  
  unbanEntreprise
};
