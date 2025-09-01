const invitationModel = require('../models/invitation.model');
const { createNotification } = require('../models/notification.model');
const pool = require('../config/db');

// ✅ Envoyer une invitation (Entreprise ➔ Freelance)
const createInvitationController = async (req, res) => {
  try {
    const entrepriseId = req.user.id;
    const { freelance_id, job_id } = req.body;

    // 🔒 Vérifie que l’entreprise est active
    const entrepriseCheck = await pool.query(`SELECT is_active FROM entreprises WHERE id = $1`, [entrepriseId]);
    if (!entrepriseCheck.rows[0]?.is_active) {
      return res.status(403).json({ message: "Compte entreprise désactivé. Impossible d'envoyer une invitation." });
    }

    // 🔒 Vérifie que le freelance est actif
    const freelanceCheck = await pool.query(`SELECT is_active FROM freelances WHERE id = $1`, [freelance_id]);
    if (!freelanceCheck.rows[0]?.is_active) {
      return res.status(403).json({ message: "Ce freelance est désactivé. Vous ne pouvez pas lui envoyer d'invitation." });
    }

    const invitation = await invitationModel.createInvitation(entrepriseId, freelance_id, job_id);
    res.status(201).json({ message: "Invitation envoyée", invitation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l’envoi de l’invitation" });
  }
};

// ✅ Voir les invitations pour un job spécifique (Entreprise)
const getJobInvitationsController = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const invitations = await invitationModel.getInvitationsByJob(jobId);
    res.status(200).json(invitations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des invitations" });
  }
};

// ✅ Annuler une invitation (Entreprise)
const cancelInvitationController = async (req, res) => {
  try {
    const invitationId = req.params.id;
    const entrepriseId = req.user.id;

    const result = await invitationModel.cancelInvitation(invitationId, entrepriseId);
    if (!result) {
      return res.status(404).json({ message: 'Invitation non trouvée ou non autorisée' });
    }

    res.status(200).json({ message: 'Invitation annulée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’annulation de l’invitation' });
  }
};

// ✅ Modifier le statut d'une invitation (Entreprise ➔ Changer statut manuel)
const updateInvitationStatusController = async (req, res) => {
  try {
    const invitationId = req.params.id;
    const entrepriseId = req.user.id;
    const { status } = req.body;

    const result = await invitationModel.updateInvitationStatus(invitationId, entrepriseId, status);
    if (!result) {
      return res.status(404).json({ message: 'Invitation non trouvée ou non autorisée' });
    }

    res.status(200).json({ message: 'Statut mis à jour', invitation: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// ✅ Voir ses propres invitations (Freelance connecté)
const getInvitationsForLoggedFreelance = async (req, res) => {
  try {
    if (req.user.role !== 'freelance') {
      return res.status(403).json({ message: "Accès refusé. Seuls les freelances peuvent voir leurs invitations." });
    }

    const freelanceId = req.user.id;
    const invitations = await invitationModel.getInvitationsByFreelanceId(freelanceId);

    res.status(200).json(invitations);
  } catch (error) {
    console.error('Erreur récupération invitations pour freelance connecté:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Accepter une invitation (Freelance)
const acceptInvitationController = async (req, res) => {
  try {
    const invitationId = req.params.invitationId;
    const freelanceId = req.user.id;

    // 🔒 Vérifie que le freelance est actif
    const checkStatus = await pool.query(`SELECT is_active FROM freelances WHERE id = $1`, [freelanceId]);
    if (!checkStatus.rows[0]?.is_active) {
      return res.status(403).json({ message: "Ton compte est désactivé. Tu ne peux pas accepter d'invitations." });
    }

    const updated = await invitationModel.updateInvitationStatusByFreelance(invitationId, freelanceId, 'accepted');
    if (!updated) {
      return res.status(404).json({ message: 'Invitation non trouvée ou non autorisée' });
    }

    const result = await pool.query(`SELECT entreprise_id, job_id FROM invitations WHERE id = $1`, [invitationId]);
    const { entreprise_id, job_id } = result.rows[0];

    await createNotification({
      user_id: entreprise_id,
      user_role: 'entreprise',
      type: 'invitation_response',
      title: 'Invitation acceptée',
      message: `Un freelance a accepté votre invitation.`,
      job_id,
    });

    if (global.io) {
      global.io.to(`user_${entreprise_id}`).emit('new_notification', {
        type: 'invitation_response',
        title: 'Invitation acceptée',
        message: `Un freelance a accepté votre invitation.`,
        job_id,
        created_at: new Date().toISOString(),
      });
    }

    res.status(200).json({ message: "Invitation acceptée", invitation: updated });
  } catch (error) {
    console.error('Erreur acceptation invitation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const refuseInvitationController = async (req, res) => {
  try {
    const invitationId = req.params.invitationId;
    const freelanceId = req.user.id;

    // 🔒 Vérifie que le freelance est actif
    const checkStatus = await pool.query(`SELECT is_active FROM freelances WHERE id = $1`, [freelanceId]);
    if (!checkStatus.rows[0]?.is_active) {
      return res.status(403).json({ message: "Ton compte est désactivé. Tu ne peux pas refuser d'invitations." });
    }

    const updated = await invitationModel.updateInvitationStatusByFreelance(invitationId, freelanceId, 'refused');
    if (!updated) {
      return res.status(404).json({ message: 'Invitation non trouvée ou non autorisée' });
    }

    const result = await pool.query(`SELECT entreprise_id, job_id FROM invitations WHERE id = $1`, [invitationId]);
    const { entreprise_id, job_id } = result.rows[0];

    await createNotification({
      user_id: entreprise_id,
      user_role: 'entreprise',
      type: 'invitation_response',
      title: 'Invitation refusée',
      message: `Un freelance a refusé votre invitation.`,
      job_id,
    });

    if (global.io) {
      global.io.to(`user_${entreprise_id}`).emit('new_notification', {
        type: 'invitation_response',
        title: 'Invitation refusée',
        message: `Un freelance a refusé votre invitation.`,
        job_id,
        created_at: new Date().toISOString(),
      });
    }

    res.status(200).json({ message: "Invitation refusée", invitation: updated });
  } catch (error) {
    console.error('Erreur refus invitation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
module.exports = {
  createInvitationController,
  getJobInvitationsController,
  cancelInvitationController,
  updateInvitationStatusController,
  getInvitationsForLoggedFreelance,
  acceptInvitationController,
  refuseInvitationController,
};
