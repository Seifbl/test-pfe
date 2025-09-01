/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Système de notation des freelances par les entreprises
 */

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { verifyToken } = require('../middlewares/auth.middleware');


/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Noter un freelance après une mission
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - freelance_id
 *               - job_id
 *               - rating
 *               - review
 *             properties:
 *               freelance_id:
 *                 type: integer
 *                 example: 4
 *               job_id:
 *                 type: integer
 *                 example: 17
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Excellent travail, très pro."
 *     responses:
 *       201:
 *         description: Évaluation enregistrée avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       403:
 *         description: Non autorisé ou job invalide
 *       500:
 *         description: Erreur serveur
 */
// 👉 L’entreprise note le freelance
router.post('/', verifyToken, ratingController.rateFreelance);
/**
 * @swagger
 * /api/ratings/freelances/me:
 *   get:
 *     summary: Obtenir les évaluations du freelance connecté
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des évaluations reçues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   rating:
 *                     type: number
 *                     example: 4.5
 *                   review:
 *                     type: string
 *                     example: "Très bon travail, communication fluide."
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-07T13:01:12.614Z"
 *                   job:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 17
 *                       title:
 *                         type: string
 *                         example: "Développeur React"
 *                   company:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       name:
 *                         type: string
 *                         example: "ACME Corp"
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       403:
 *         description: Accès refusé (non freelance)
 *       500:
 *         description: Erreur serveur
 */

router.get('/freelances/me', verifyToken, ratingController.getMyOwnRatings);
/**
 * @swagger
 * /api/ratings/freelances/{id}:
 *   get:
 *     summary: Obtenir toutes les évaluations d’un freelance
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du freelance
 *     responses:
 *       200:
 *         description: Liste des évaluations du freelance
 *       404:
 *         description: Aucune note trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/freelances/:id', ratingController.getFreelanceRatings);

module.exports = router;
