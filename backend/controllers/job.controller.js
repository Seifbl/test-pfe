const axios = require('axios');
const freelanceModel = require('../models/freelance.model');
const pool = require('../config/db');
const jobModel = require('../models/job.model');
const { createJob, getJobsByEntrepriseId, updateJobById } = require('../models/job.model');
const { getJobById } = require('../models/job.model');
const { deleteJobById } = require('../models/job.model');
const { getAssignedFreelanceForJob } = require('../models/job.model');

// ✅ Créer un job
const createJobController = async (req, res) => {
  try {
    const entrepriseId = req.user.id;
    const jobData = req.body;

    const job = await createJob(entrepriseId, jobData);

    res.status(201).json({
      message: 'Job créé avec succès',
      job,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création du job" });
  }
};

// ✅ Récupérer tous les jobs d’une entreprise
const getEntrepriseJobs = async (req, res) => {
  try {
    const entrepriseId = req.user.id;
    const jobs = await getJobsByEntrepriseId(entrepriseId);

    res.status(200).json(jobs);
  } catch (err) {
    console.error('❌ Erreur récupération jobs :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des jobs' });
  }
};

// ✅ Mettre à jour un job
const updateJobController = async (req, res) => {
  try {
    const entrepriseId = req.user.id;
    const jobId = req.params.id;
    const updatedData = req.body;

    const updatedJob = await updateJobById(jobId, entrepriseId, updatedData);

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job introuvable ou non autorisé' });
    }

    res.status(200).json({
      message: 'Job mis à jour avec succès',
      job: updatedJob,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du job' });
  }
};

const getJobByIdController = async (req, res) => {
    try {
      const entrepriseId = req.user.id;
      const jobId = req.params.id;
  
      const job = await getJobById(jobId, entrepriseId);
  
      if (!job) {
        return res.status(404).json({ message: 'Job non trouvé' });
      }
  
      res.status(200).json(job);
    } catch (err) {
      console.error('❌ Erreur récupération job par ID :', err);
      res.status(500).json({ error: 'Erreur lors de la récupération du job' });
    }
  };

  const {
    getPublishedJobsByEntreprise,
    getDraftJobsByEntreprise,
  } = require('../models/job.model');
  
  const getPublishedJobs = async (req, res) => {
    try {
      const entrepriseId = req.user.id;
      const jobs = await getPublishedJobsByEntreprise(entrepriseId);
      res.status(200).json(jobs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des jobs publiés' });
    }
  };
  
  const getDraftJobs = async (req, res) => {
    try {
      const entrepriseId = req.user.id;
      const jobs = await getDraftJobsByEntreprise(entrepriseId);
      res.status(200).json(jobs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des brouillons' });
    }
  };
  
  const deleteJobController = async (req, res) => {
    try {
      const entrepriseId = req.user.id;
      const jobId = req.params.id;
  
      const deletedJob = await deleteJobById(jobId, entrepriseId);
  
      if (!deletedJob) {
        return res.status(404).json({ message: "Job introuvable ou non autorisé" });
      }
  
      res.status(200).json({ message: "Job supprimé avec succès", job: deletedJob });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur lors de la suppression du job" });
    }
  };
  const getAllPublishedJobsForFreelancers = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          j.id, j.title, j.salary, j.created_at, j.skills, j.experience_level,
          e.first_name AS company_first_name,
          e.surname AS company_surname
        FROM jobs j
        JOIN entreprises e ON j.entreprise_id = e.id
        WHERE j.draft = false
        ORDER BY j.created_at DESC
      `);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("Erreur dans getAllPublishedJobsForFreelancers:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des jobs." });
    }
  };
  

  const getPublicJobById = async (req, res) => {
    try {
      const jobId = req.params.id;
  
      const result = await pool.query(
        `
        SELECT 
          j.id, j.title, j.salary, j.description, j.duration, j.skills, 
          j.experience_level, j.created_at, 
          e.first_name AS company_first_name, 
          e.surname AS company_surname
        FROM jobs j
        JOIN entreprises e ON j.entreprise_id = e.id
        WHERE j.id = $1 AND j.draft = false
        `,
        [jobId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Job non trouvé ou n'est pas publié" });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Erreur dans getPublicJobById:", err);
      res.status(500).json({ message: "Erreur lors de la récupération du job" });
    }
  }; 

  const assignFreelanceController = async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const entrepriseId = req.user.id;
      const { freelance_id } = req.body;
  
      const updatedJob = await jobModel.assignFreelanceToJob(jobId, entrepriseId, freelance_id);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "Job non trouvé ou non autorisé." });
      }
  
      // CORRECTION ici : freelance_id
      if (global.io) {
        global.io.to(`user_${freelance_id}`).emit('new_notification', {
          type: 'assignment',
          title: 'Nouvelle mission assignée',
          message: `Une entreprise vous a affecté à une mission.`,
          job_id: jobId,
          created_at: new Date().toISOString()
        });
      }
  
      res.status(200).json({ message: "Freelance affecté avec succès.", job: updatedJob });
    } catch (error) {
      console.error('Erreur affectation freelance:', error);
      res.status(500).json({ message: "Erreur serveur lors de l'affectation." });
    }
  };

  const { markJobAsCompleted } = require('../models/job.model');

const markJobAsCompletedController = async (req, res) => {
  try {
    const entrepriseId = req.user.id;
    const jobId = req.params.jobId;

    const job = await markJobAsCompleted(jobId, entrepriseId);

    if (!job) {
      return res.status(404).json({ message: "Job non trouvé ou non autorisé" });
    }

    res.status(200).json({ message: "Job marqué comme terminé", job });
  } catch (error) {
    console.error("Erreur lors du marquage du job terminé :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Récupérer les jobs terminés d'une entreprise
const getCompletedJobsByEntreprise = async (req, res) => {
  try {
    const entrepriseId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM jobs WHERE entreprise_id = $1 AND is_completed = true ORDER BY completed_at DESC`,
      [entrepriseId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Erreur récupération jobs terminés:', err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des jobs terminés" });
  }
};
const getAssignedFreelanceController = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const freelance = await getAssignedFreelanceForJob(jobId);

    if (!freelance) {
      return res.status(404).json({ message: "Aucun freelance assigné à ce job." });
    }

    res.status(200).json(freelance);
  } catch (err) {
    console.error("Erreur récupération freelance assigné :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getRecommendedFreelancersController = async (req, res) => {
  console.log("Entreprise connectée :", req.user); // 👈 AJOUTE CECI ICI
  try {
    const jobId = req.params.id;
    const entrepriseId = req.user.id; // ✅ entreprise connectée

 // adapte en fonction de ton auth

const job = await jobModel.getJobById(jobId, entrepriseId);

if (!job) {
  return res.status(404).json({ message: 'Job introuvable ou non autorisé' });
}

    const freelances = await freelanceModel.getAllFreelances();
console.log(JSON.stringify({
  job: {
    title: job.title,
    description: job.description,
    skills: Array.isArray(job.skills) ? job.skills.join(" ") : job.skills
  },
  freelances: freelances.map(f => ({
    id: f.id,
    title: f.title,
    skills: Array.isArray(f.skills) ? f.skills.join(" ") : f.skills,
    bio: f.bio
  }))
}, null, 2));

const payload = {
  job: {
    title: job.title || '',
    description: job.description || '',
    skills: Array.isArray(job.skills) ? job.skills.join(" ") : (job.skills || '')
  },
  freelances: freelances.map(f => ({
    id: f.id,
    title: f.title || '',
    skills: Array.isArray(f.skills)
  ? f.skills.map(s => s.skill).join(" ")
  : (f.skills || ''),

    bio: f.bio || ''
  }))
};

console.log("Payload sent to FastAPI:", JSON.stringify(payload, null, 2));
console.log(JSON.stringify({
  job: {
    title: job.title,
    description: job.description,
    skills: Array.isArray(job.skills) ? job.skills.join(" ") : (job.skills || '')
  },
  freelances: freelances.map(f => ({
    id: f.id,
    title: f.title,
    skills: Array.isArray(f.skills) ? f.skills.map(s => s.skill).join(" ") : (f.skills || ''),
    bio: f.bio
  }))
}, null, 2));
 const response = await axios.post(process.env.RECOMMENDATION_URL + '/recommend', {
  job: {
    title: job.title || '',
    description: job.description || '',
    skills: Array.isArray(job.skills) ? job.skills.join(" ") : (job.skills || '')
  },
  freelances: freelances.map(f => ({
    id: f.id,
    title: f.title || '',
    skills: Array.isArray(f.skills) ? f.skills.join(" ") : (f.skills || ''),
    bio: f.bio || ''
  }))
});

    const results = response.data.recommended_freelancers;

    // enrichir les résultats avec les infos des freelances
    const matchedFreelances = results.map(result => {
      const f = freelances.find(f => f.id === result.freelance_id);
      return {
        ...f,
        score: result.score
      };
    });

    res.status(200).json({ matchedFreelances });
 } catch (error) {
  console.error('Erreur NLP Matching :', error);
  res.status(500).json({ message: error.message });
}

};

  module.exports = {
    createJobController,
    getEntrepriseJobs,
    updateJobController,
    getPublishedJobs,
    getDraftJobs,
    getJobByIdController,
    deleteJobController, // 👈
    getAllPublishedJobsForFreelancers, // 👈 ajoute ceci
    getPublicJobById,
    assignFreelanceController,
    markJobAsCompletedController,
   getCompletedJobsByEntreprise ,
   getAssignedFreelanceController,
   getRecommendedFreelancersController
  };
  
