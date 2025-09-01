const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const jobController = require('../controllers/job.controller');
const { getRecommendedFreelancersController } = require('../controllers/job.controller');
const {
  createJobController,
  getEntrepriseJobs,
  updateJobController,
  getPublishedJobs,
  getDraftJobs,
  getJobByIdController,
  deleteJobController,
  getAllPublishedJobsForFreelancers,
  getPublicJobById,
  assignFreelanceController,
  markJobAsCompletedController,
  getAssignedFreelanceController
} = require('../controllers/job.controller');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Gestion des offres de mission
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Créer une nouvelle offre (job)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       201:
 *         description: Job créé
 */
router.post('/', verifyToken, createJobController);

/**
 * @swagger
 * /api/jobs/public:
 *   get:
 *     summary: Récupère tous les jobs publiés (côté freelance)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Liste des jobs publiés
 */
router.get('/public', getAllPublishedJobsForFreelancers);

/**
 * @swagger
 * /api/jobs/public/{id}:
 *   get:
 *     summary: Récupère un job publié spécifique (côté freelance)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du job publié
 *     responses:
 *       200:
 *         description: Détails du job
 */
router.get('/public/:id', getPublicJobById);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Récupère tous les jobs de l’entreprise connectée
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des jobs de l’entreprise
 */
router.get('/', verifyToken, getEntrepriseJobs);

/**
 * @swagger
 * /api/jobs/published:
 *   get:
 *     summary: Récupère les jobs publiés de l’entreprise
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des jobs publiés
 */
router.get('/published', verifyToken, getPublishedJobs);

/**
 * @swagger
 * /api/jobs/drafts:
 *   get:
 *     summary: Récupère les brouillons de l’entreprise
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des brouillons
 */
router.get('/drafts', verifyToken, getDraftJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Met à jour une offre
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID du job
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job mis à jour
 */
router.put('/:id', verifyToken, updateJobController);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Supprime une offre
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID du job
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job supprimé
 */
router.delete('/:id', verifyToken, deleteJobController);

/**
 * @swagger
 * /api/jobs/{jobId}/assign:
 *   put:
 *     summary: Assigne un freelance à un job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du job
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               freelanceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Freelance assigné au job
 */
router.put('/:jobId/assign', verifyToken, assignFreelanceController);



/**
 * @swagger
 * /api/jobs/{jobId}/complete:
 *   put:
 *     summary: Marque un job comme terminé
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du job à marquer comme terminé
 *     responses:
 *       200:
 *         description: Job marqué comme terminé
 *       404:
 *         description: Job introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:jobId/complete', verifyToken, markJobAsCompletedController);

/**
 * @swagger
 * /api/jobs/completed:
 *   get:
 *     summary: Récupère tous les jobs terminés de l’entreprise connectée
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des jobs terminés
 *       401:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/completed', verifyToken, jobController.getCompletedJobsByEntreprise);


/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Récupère un job spécifique de l’entreprise
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID du job
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du job
 */
router.get('/:id', verifyToken, getJobByIdController);
router.get('/:jobId/assigned-freelance', verifyToken, getAssignedFreelanceController);
router.get('/:id/recommend-freelances', verifyToken, getRecommendedFreelancersController);

module.exports = router;
