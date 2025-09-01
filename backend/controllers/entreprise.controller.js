const { updateEntrepriseById } = require('../models/entreprise.model');

const updateEntrepriseProfile = async (req, res) => {
  try {
    const entrepriseId = req.user.id; // depuis le token
    const updatedData = req.body;

    const updatedEntreprise = await updateEntrepriseById(entrepriseId, updatedData);

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      entreprise: updatedEntreprise,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
};

module.exports = {
  updateEntrepriseProfile,
};
