const { addFreelanceSkills } = require('../models/freelanceSkill.model');
const { deleteFreelanceSkill } = require('../models/freelanceSkill.model');
const { getSkillsWithIdByFreelanceId } = require('../models/freelanceSkill.model');
const addSkillsController = async (req, res) => {
  const freelanceId = req.user.id;
  const { skills } = req.body;

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: "Aucune compétence fournie." });
  }

  try {
    await addFreelanceSkills(freelanceId, skills);
    res.status(201).json({ message: "Compétences ajoutées avec succès" });
  } catch (err) {
    console.error("Erreur ajout compétences :", err);
    res.status(500).json({ error: "Erreur lors de l’ajout des compétences" });
  }
};

const deleteSkillController = async (req, res) => {
  try {
    const skillId = req.params.id;
    const deleted = await deleteFreelanceSkill(req.user.id, skillId);


    if (!deleted) {
      return res.status(404).json({ message: 'Compétence non trouvée ou non autorisée' });
    }

    res.status(200).json({ message: 'Compétence supprimée' });
  } catch (error) {
    console.error('Erreur suppression compétence:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la compétence' });
  }
};

const getSkillsController = async (req, res) => {
  try {
    const skills = await getSkillsWithIdByFreelanceId(req.user.id);
    res.status(200).json(skills);
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des compétences' });
  }
};

module.exports = {
  addSkillsController,
  deleteSkillController,
  deleteFreelanceSkill,
  getSkillsController
};
