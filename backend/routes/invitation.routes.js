const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');

const {
  createInvitationController,
  getJobInvitationsController,
  cancelInvitationController,
  updateInvitationStatusController,
  getInvitationsForLoggedFreelance,
  acceptInvitationController,
  refuseInvitationController
} = require('../controllers/invitation.controller');

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Gestion des invitations entre entreprises et freelances
 */

/**
 * @swagger
 * /api/invitations/freelance/me:
 *   get:
 *     summary: Récupère les invitations reçues par le freelance connecté
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des invitations
 */
router.get('/freelance/me', verifyToken, getInvitationsForLoggedFreelance);

/**
 * @swagger
 * /api/invitations/freelance/{invitationId}/accept:
 *   put:
 *     summary: Accepter une invitation spécifique
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'invitation à accepter
 *     responses:
 *       200:
 *         description: Invitation acceptée
 */
router.put('/freelance/:invitationId/accept', verifyToken, acceptInvitationController);

/**
 * @swagger
 * /api/invitations/freelance/{invitationId}/refuse:
 *   put:
 *     summary: Refuser une invitation spécifique
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'invitation à refuser
 *     responses:
 *       200:
 *         description: Invitation refusée
 */
router.put('/freelance/:invitationId/refuse', verifyToken, refuseInvitationController);

/**
 * @swagger
 * /api/invitations:
 *   post:
 *     summary: Créer une nouvelle invitation (par une entreprise)
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - freelanceId
 *               - jobId
 *             properties:
 *               freelanceId:
 *                 type: string
 *               jobId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitation créée
 */
router.post('/', verifyToken, createInvitationController);

/**
 * @swagger
 * /api/invitations/{id}:
 *   delete:
 *     summary: Supprimer une invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'invitation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation supprimée
 */
router.delete('/:id', verifyToken, cancelInvitationController);

/**
 * @swagger
 * /api/invitations/{id}:
 *   patch:
 *     summary: Modifier le statut ou d'autres champs d'une invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'invitation à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               status: "pending"
 *     responses:
 *       200:
 *         description: Invitation mise à jour
 */
router.patch('/:id', verifyToken, updateInvitationStatusController);

/**
 * @swagger
 * /api/invitations/{jobId}:
 *   get:
 *     summary: Récupère toutes les invitations liées à une offre (job)
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         description: ID de l'offre liée aux invitations
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des invitations pour ce job
 */
router.get('/:jobId', verifyToken, getJobInvitationsController);

module.exports = router;
