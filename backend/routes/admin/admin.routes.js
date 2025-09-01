const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const { verifyAdminToken } = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/isAdmin');

router.use(verifyAdminToken, isAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Routes réservées à l’administrateur
 */

/**
 * @swagger
 * /api/admin/freelances:
 *   get:
 *     summary: Récupère la liste de tous les freelances
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des freelances
 */
router.get('/freelances', adminController.getAllFreelances);

/**
 * @swagger
 * /api/admin/entreprises:
 *   get:
 *     summary: Récupère la liste de toutes les entreprises
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des entreprises
 */
router.get('/entreprises', adminController.getAllEntreprises);

/**
 * @swagger
 * /api/admin/freelances/{id}:
 *   delete:
 *     summary: Supprime un freelance par ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du freelance
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Freelance supprimé
 */
router.delete('/freelances/:id', adminController.deleteFreelanceById);

/**
 * @swagger
 * /api/admin/entreprises/{id}:
 *   delete:
 *     summary: Supprime une entreprise par ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l’entreprise
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entreprise supprimée
 */
router.delete('/entreprises/:id', adminController.deleteEntrepriseById);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Accède au tableau de bord de l’administrateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accès autorisé au dashboard
 */
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    message: `Bienvenue Admin ID ${req.admin.id}`,
    email: req.admin.email,
    role: req.admin.role,
  });
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Récupère les statistiques administratives
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques renvoyées
 */
router.get('/stats', adminController.getAdminStats);

/**
 * @swagger
 * /api/admin/freelances/{id}/ban:
 *   patch:
 *     summary: Bannir un freelance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du freelance à bannir
 *     responses:
 *       200:
 *         description: Freelance banni
 */
router.patch('/freelances/:id/ban', adminController.banFreelance);

/**
 * @swagger
 * /api/admin/freelances/{id}/unban:
 *   patch:
 *     summary: Débannir un freelance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du freelance à débannir
 *     responses:
 *       200:
 *         description: Freelance débanni
 */
router.patch('/freelances/:id/unban', adminController.unbanFreelance);

/**
 * @swagger
 * /api/admin/entreprises/{id}/ban:
 *   patch:
 *     summary: Bannir une entreprise
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’entreprise à bannir
 *     responses:
 *       200:
 *         description: Entreprise bannie
 */
router.patch('/entreprises/:id/ban', adminController.banEntreprise);

/**
 * @swagger
 * /api/admin/entreprises/{id}/unban:
 *   patch:
 *     summary: Débannir une entreprise
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’entreprise à débannir
 *     responses:
 *       200:
 *         description: Entreprise débannie
 */
router.patch('/entreprises/:id/unban', adminController.unbanEntreprise);

module.exports = router;
