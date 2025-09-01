const express = require('express');
const router = express.Router();
const {
  applyToJobController,
  getJobApplicationsController
} = require('../controllers/jobApplication.controller');

/**
 * @swagger
 * tags:
 *   name: Job Applications
 *   description: Gestion des candidatures aux offres de mission
 */

/**
 * @swagger
 * /api/job-applications/apply:
 *   post:
 *     summary: Un freelance postule à un job
 *     tags: [Job Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - freelance_id
 *               - job_id
 *             properties:
 *               freelance_id:
 *                 type: string
 *               job_id:
 *                 type: string
 *             
 *     responses:
 *       201:
 *         description: Candidature envoyée avec succès
 */
router.post('/apply', applyToJobController);

/**
 * @swagger
 * /api/job-applications/job/{jobId}:
 *   get:
 *     summary: Récupère toutes les candidatures pour un job spécifique
 *     tags: [Job Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’offre concernée
 *     responses:
 *       200:
 *         description: Liste des candidatures pour ce job
 */
router.get('/job/:jobId', getJobApplicationsController);

module.exports = router;
