const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  createFreelance,
  findFreelanceByEmail,
  findFreelanceById,
  getExperiencesByFreelanceId,
  updateExperienceById,
  deleteExperienceById
} = require('../models/freelance.model');

const { getSkillsByFreelanceId } = require('../models/freelanceSkill.model');
const { getRolesByFreelanceId } = require('../models/freelanceRole.model');
const { getAllFreelances } = require('../models/freelance.model');
const { getLastCVByFreelanceId } = require('../models/freelance.model');

const SECRET_KEY = process.env.JWT_SECRET || 'votre_cle_secrete';

// ✅ Inscription
const registerFreelance = async (req, res) => {
  try {
    const {
  first_name,
  last_name,
  email,
  password
} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newFreelance = await createFreelance({
  first_name,
  last_name,
  email,
  password: hashedPassword
});

    res.status(201).json({ message: 'Freelance créé avec succès', freelance: newFreelance });
  } catch (error) {
    console.error('Erreur création freelance:', error);
    res.status(500).json({ error: 'Erreur lors de la création du freelance' });
  }
};

// ✅ Connexion
const loginFreelance = async (req, res) => {
  try {
    const { email, password } = req.body;

    const freelance = await findFreelanceByEmail(email);
    if (!freelance) {
      return res.status(404).json({ error: 'Freelance non trouvé' });
    }

    const isValid = await bcrypt.compare(password, freelance.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: freelance.id, email: freelance.email, role: 'freelance' },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      freelance: {
        id: freelance.id,
        email: freelance.email,
        first_name: freelance.first_name,
        last_name: freelance.last_name
      }
    });
  } catch (err) {
    console.error('Erreur login freelance:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// ✅ Profil
const getFreelanceProfile = async (req, res) => {
  try {
    const freelance = await findFreelanceById(req.user.id);

    if (!freelance) {
      return res.status(404).json({ message: 'Freelance introuvable' });
    }

    const roles = await getRolesByFreelanceId(freelance.id);     // ✅
    const skills = await getSkillsByFreelanceId(freelance.id);   // ✅
    const experiences = await getExperiencesByFreelanceId(freelance.id); 
    const cv = await getLastCVByFreelanceId(freelance.id);
    res.status(200).json({
      id: freelance.id,
      email: freelance.email,
      first_name: freelance.first_name,
      last_name: freelance.last_name,
      title: freelance.title,
      experience_level: freelance.experience_level,
      bio: freelance.bio,
      location: freelance.location,
      linkedin: freelance.linkedin,
      github: freelance.github,
      website: freelance.website,
      roles,      // ✅ list of roles
      skills,      // ✅ list of skills
      experiences, // ✅ ici
       cv_url: cv ? cv.file_url : null  // <-- ✅ ici
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération du profil" });
  }
};


// ✅ Voir toutes les expériences
const getFreelanceExperiences = async (req, res) => {
  try {
    const experiences = await getExperiencesByFreelanceId(req.user.id);
    res.status(200).json(experiences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des expériences" });
  }
};

// ✅ Modifier une expérience
const updateFreelanceExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const updated = await updateExperienceById(req.user.id, experienceId, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Expérience non trouvée ou non autorisée' });
    }

    res.status(200).json({ message: 'Expérience mise à jour', experience: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'expérience" });
  }
};

// ✅ Supprimer une expérience
const deleteFreelanceExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const deleted = await deleteExperienceById(req.user.id, experienceId);

    if (!deleted) {
      return res.status(404).json({ message: 'Expérience non trouvée ou non autorisée' });
    }

    res.status(200).json({ message: 'Expérience supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'expérience" });
  }
};

const listAllFreelances = async (req, res) => {
  try {
    const freelances = await getAllFreelances();
    res.status(200).json(freelances);
  } catch (error) {
    console.error('Erreur lors de la récupération des freelances :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getFreelanceByIdController = async (req, res) => {
  try {
    const freelanceId = req.params.id;
    const freelance = await findFreelanceById(freelanceId);
    const cv = await getLastCVByFreelanceId(freelanceId); // <-- à ajouter ici

    if (!freelance) {
      return res.status(404).json({ message: 'Freelance non trouvé' });
    }

    const roles = await getRolesByFreelanceId(freelanceId);
    const skills = await getSkillsByFreelanceId(freelanceId);
    const experiences = await getExperiencesByFreelanceId(freelanceId);

    res.status(200).json({
      id: freelance.id,
      email: freelance.email,
      first_name: freelance.first_name,
      last_name: freelance.last_name,
      title: freelance.title,
      experience_level: freelance.experience_level,
      bio: freelance.bio,
      location: freelance.location,
      linkedin: freelance.linkedin,
      github: freelance.github,
      website: freelance.website,
      roles,
      skills,
      experiences,
      cv_url: cv ? cv.file_url : null
    });
  } catch (error) {
    console.error("Erreur dans getFreelanceByIdController:", error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil freelance' });
  }
};


module.exports = {
  registerFreelance,
  loginFreelance,
  getFreelanceProfile,
  getFreelanceExperiences,
  updateFreelanceExperience,
  deleteFreelanceExperience,
  getSkillsByFreelanceId,
  getRolesByFreelanceId,
  getAllFreelances,
  listAllFreelances,
  getFreelanceByIdController,
  getLastCVByFreelanceId
};