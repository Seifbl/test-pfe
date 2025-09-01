const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { findEntrepriseById, updateEntrepriseById } = require('../models/entreprise.model');

/**
 * @swagger
 * tags:
 *   name: Entreprise
 *   description: Gestion du profil entreprise
 */

/**
 * @swagger
 * /api/entreprise/me:
 *   get:
 *     summary: Récupère le profil complet de l’entreprise connectée
 *     tags: [Entreprise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l’entreprise récupéré avec succès
 *       401:
 *         description: Token invalide ou manquant
 *       404:
 *         description: Entreprise introuvable
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const entreprise = await findEntrepriseById(req.user.id);

    if (!entreprise) {
      return res.status(404).json({ message: 'Entreprise introuvable' });
    }

    res.status(200).json({
      id: entreprise.id,
      email: entreprise.email,
      first_name: entreprise.first_name,
      surname: entreprise.surname,
      organization_size: entreprise.organization_size,
      phone_number: entreprise.phone_number,
      accept_terms: entreprise.accept_terms,
      accept_marketing: entreprise.accept_marketing,
      industry: entreprise.industry,
      website: entreprise.website,
      country: entreprise.country,
      city: entreprise.city,
      zip_code: entreprise.zip_code
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

/**
 * @swagger
 * /api/entreprise/me:
 *   put:
 *     summary: Met à jour le profil de l’entreprise connectée
 *     tags: [Entreprise]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               surname:
 *                 type: string
 *               organization_size:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               accept_terms:
 *                 type: boolean
 *               accept_marketing:
 *                 type: boolean
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               zip_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       401:
 *         description: Token invalide ou manquant
 *       500:
 *         description: Erreur serveur
 */
router.put('/me', verifyToken, async (req, res) => {
  try {
    const updatedEntreprise = await updateEntrepriseById(req.user.id, req.body);

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      entreprise: updatedEntreprise,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
  }
});

/**
 * @swagger
 * /api/entreprise/dashboard:
 *   get:
 *     summary: Vérifie l’authentification de l’entreprise et retourne des infos basiques
 *     tags: [Entreprise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accès autorisé
 *       401:
 *         description: Token invalide ou manquant
 */
router.get('/dashboard', verifyToken, (req, res) => {
  res.status(200).json({
    message: `Bienvenue entreprise ID ${req.user.id}`,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;
