const { addFreelanceRoles } = require('../models/freelanceRole.model');
const { deleteFreelanceRole } = require('../models/freelanceRole.model');
const addRolesController = async (req, res) => {
  const freelanceId = req.user.id;
  const { roles } = req.body; // tableau d’objets

  if (!Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ error: "Aucun rôle fourni." });
  }

  try {
    await addFreelanceRoles(freelanceId, roles);
    res.status(201).json({ message: "Rôles ajoutés avec succès" });
  } catch (err) {
    console.error("Erreur ajout rôles :", err);
    res.status(500).json({ error: "Erreur lors de l’ajout des rôles" });
  }
};

const deleteRoleController = async (req, res) => {
  try {
    const roleId = req.params.id;
    const freelanceId = req.user.id;

    const deletedRole = await deleteFreelanceRole(freelanceId, roleId);

    if (!deletedRole) {
      return res.status(404).json({ message: 'Rôle non trouvé ou non autorisé' });
    }

    res.status(200).json({ message: 'Rôle supprimé avec succès' });
  } catch (err) {
    console.error('Erreur suppression rôle:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du rôle' });
  }
};


module.exports = {
  addRolesController,
  deleteRoleController 
};
