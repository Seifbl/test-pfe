const { applyToJob, getApplicationsByJobId } = require('../models/jobApplication.model');
const pool = require('../config/db');

// 📥 Le freelance postule à un job
exports.applyToJobController = async (req, res) => {
  const { job_id, freelance_id } = req.body;

  try {
    // 🔒 Vérifier que le compte du freelance est actif
    const checkFreelance = await pool.query('SELECT is_active FROM freelances WHERE id = $1', [freelance_id]);
    if (!checkFreelance.rows.length) {
      return res.status(404).json({ message: "Freelance introuvable." });
    }
    if (!checkFreelance.rows[0].is_active) {
      return res.status(403).json({ message: "Ton compte est désactivé. Tu ne peux pas postuler." });
    }

    const application = await applyToJob(job_id, freelance_id);
    res.status(201).json({ message: "Candidature envoyée", application });
  } catch (error) {
    console.error("Erreur candidature :", error);

    // ➔ S'il a déjà postulé, renvoyer un 400
    if (error.message === 'Tu as déjà postulé à ce job.') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erreur lors de la candidature" });
  }
};

// 📋 Récupérer toutes les candidatures pour un job
exports.getJobApplicationsController = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    const applications = await getApplicationsByJobId(jobId);
    res.status(200).json(applications);
  } catch (error) {
    console.error("Erreur récupération candidatures :", error);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};
