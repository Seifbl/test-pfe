const express = require('express');
const router = express.Router();
const passport = require('passport')
const {
  signupEntreprise,
  loginEntreprise,
  forgotPasswordController,
  resetPasswordController
} = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l'authentification et des entreprises
 */

/**
 * @swagger
 * /api/auth/signup/company:
 *   post:
 *     summary: Crée une entreprise et un compte associé
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compte entreprise créé
 */
router.post('/signup/company', signupEntreprise);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecte une entreprise
 *     tags: [Auth]
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
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', loginEntreprise);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Envoie un email de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email envoyé
 */
router.post('/forgot-password', forgotPasswordController);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Réinitialise le mot de passe à partir d’un token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de réinitialisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré
 */
router.post('/reset-password/:token', resetPasswordController);

// Démarre l’auth Google avec ?role=freelance ou ?role=entreprise
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'freelance'
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role
  })(req, res, next)
})

// Callback Google
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: 'http://localhost:3000/login',
  session: false // facultatif selon usage
}), (req, res) => {
  const user = req.user
  // Redirige vers ton frontend avec les infos
  res.redirect(`http://localhost:3000/auth/success?user=${encodeURIComponent(JSON.stringify(user))}`)
})

module.exports = router;
