/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Authentification des administrateurs
 */

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Connexion de l’administrateur
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie avec token JWT
 *       401:
 *         description: Identifiants incorrects
 */

const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../../controllers/admin/admin.auth.controller');

router.post('/login', loginAdmin);

module.exports = router; // <-- ✅ NE PAS OUBLIER ÇA
