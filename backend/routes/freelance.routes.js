const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const {
  updateFreelanceProfile,
} = require('../controllers/freelanceProfile.controller');

const {
  addRolesController,
  deleteRoleController,
} = require('../controllers/freelanceRole.controller');

const {
  addSkillsController,
  deleteSkillController,
  getSkillsController,
} = require('../controllers/freelanceSkill.controller');

const {
  addExperienceController,
} = require('../controllers/freelanceExperience.controller');

const {
  uploadCVController,
} = require('../controllers/freelanceCV.controller');

const {
  registerFreelance,
  loginFreelance,
  getFreelanceProfile,
  getFreelanceExperiences,
  updateFreelanceExperience,
  deleteFreelanceExperience,
  listAllFreelances,
  getFreelanceByIdController,
} = require('../controllers/freelance.controller');

/**
 * @swagger
 * tags:
 *   name: Freelance
 *   description: Gestion des freelances
 */

/**
 * @swagger
 * /api/freelances/register:
 *   post:
 *     summary: Enregistre un freelance
 *     tags: [Freelance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Freelance enregistré
 */
router.post('/register', registerFreelance);

/**
 * @swagger
 * /api/freelances/login:
 *   post:
 *     summary: Connexion d’un freelance
 *     tags: [Freelance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 */
router.post('/login', loginFreelance);

/**
 * @swagger
 * /api/freelances/me:
 *   get:
 *     summary: Récupère le profil du freelance connecté
 *     tags: [Freelance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil freelance
 */
router.get('/me', verifyToken, getFreelanceProfile);

/**
 * @swagger
 * /api/freelances/me:
 *   put:
 *     summary: Met à jour le profil du freelance connecté
 *     tags: [Freelance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               headline:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/me', verifyToken, updateFreelanceProfile);

/**
 * @swagger
 * /api/freelances/roles:
 *   post:
 *     summary: Ajoute un rôle au freelance
 *     tags: [Freelance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rôle ajouté
 */
router.post('/roles', verifyToken, addRolesController);

/**
 * @swagger
 * /api/freelances/skills:
 *   post:
 *     summary: Ajoute une compétence au freelance
 *     tags: [Freelance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skill:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compétence ajoutée
 */
router.post('/skills', verifyToken, addSkillsController);

/**
 * @swagger
 * /api/freelances/experiences:
 *   post:
 *     summary: Ajoute une expérience au freelance
 *     tags: [Freelance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Expérience ajoutée
 */
router.post('/experiences', verifyToken, addExperienceController);

/**
 * @swagger
 * /api/freelances/experiences:
 *   get:
 *     summary: Récupère les expériences du freelance connecté
 *     tags: [Freelance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des expériences
 */
router.get('/experiences', verifyToken, getFreelanceExperiences);

/**
 * @swagger
 * /api/freelances/upload-cv:
 *   post:
 *     summary: Upload du CV du freelance
 *     tags: [Freelance]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CV envoyé
 */
router.post('/upload-cv', verifyToken, upload.single('cv'), uploadCVController);

/**
 * @swagger
 * /api/freelances:
 *   get:
 *     summary: Liste tous les freelances
 *     tags: [Freelance]
 *     responses:
 *       200:
 *         description: Liste des freelances
 */
router.get('/', listAllFreelances);

/**
 * @swagger
 * /api/freelances/{id}:
 *   get:
 *     summary: Récupère un profil freelance spécifique par ID
 *     tags: [Freelance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du freelance
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil freelance
 */
router.get('/:id', getFreelanceByIdController);

module.exports = router;
