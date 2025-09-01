const { addFreelanceExperience } = require('../models/freelanceExperience.model');


const addExperienceController = async (req, res) => {
  const freelanceId = req.user.id;
  const experience = req.body;

  if (!experience.title || !experience.company || !experience.start_date) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }

  try {
    const saved = await addFreelanceExperience(freelanceId, experience);
    res.status(201).json({ message: "Expérience ajoutée", experience: saved });
  } catch (err) {
    console.error("Erreur ajout expérience :", err);
    res.status(500).json({ error: "Erreur lors de l’ajout de l’expérience" });
  }
};

module.exports = {
  addExperienceController,
};
