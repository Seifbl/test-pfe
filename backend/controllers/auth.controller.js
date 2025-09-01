const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { createEntreprise, findEntrepriseByEmail } = require('../models/entreprise.model');
const { findFreelanceByEmail } = require('../models/freelance.model'); // ✅ à créer si besoin
const { sendResetEmail } = require('../utils/mailer');
const {
  getUserByEmail,
  saveResetToken,
  getUserByToken,
  updatePassword
} = require('../models/auth.model');

const SECRET_KEY = process.env.JWT_SECRET || 'votre_cle_secrete';

// 👉 Inscription entreprise
const signupEntreprise = async (req, res) => {
  try {
    const {
      first_name,
      surname,
      organization_size,
      phone_number,
      email,
      password,
      accept_terms,
      accept_marketing,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const entreprise = await createEntreprise({
      first_name,
      surname,
      organization_size,
      phone_number,
      email,
      password: hashedPassword,
      accept_terms,
      accept_marketing,
    });

    res.status(201).json({ message: 'Entreprise créée avec succès', entreprise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de l’entreprise' });
  }
};

// 👉 Connexion entreprise
const loginEntreprise = async (req, res) => {
  try {
    const { email, password } = req.body;

    const entreprise = await findEntrepriseByEmail(email);
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    const isPasswordValid = await bcrypt.compare(password, entreprise.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: entreprise.id, email: entreprise.email, role: 'entreprise' },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      entreprise: {
        id: entreprise.id,
        email: entreprise.email,
        first_name: entreprise.first_name,
        surname: entreprise.surname,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// 👉 Mot de passe oublié
const forgotPasswordController = async (req, res) => {
  const { email, role } = req.body;

  if (!role || !["freelance", "entreprise"].includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  // Sélectionner la bonne fonction selon le rôle
  const user = role === "freelance"
    ? await findFreelanceByEmail(email)
    : await findEntrepriseByEmail(email);

  if (!user) return res.status(404).json({ message: "Email introuvable" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiration = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await saveResetToken(user.id, token, expiration, role);
  await sendResetEmail(user.email, token);

  res.status(200).json({ message: "Email envoyé pour réinitialiser le mot de passe" });
};

// 👉 Réinitialisation du mot de passe
const resetPasswordController = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await getUserByToken(token);
  if (!user || Date.now() > user.token_expiration) {
    return res.status(400).json({ message: "Lien expiré ou invalide" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await updatePassword(user.id, hashedPassword, user.role);

  res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
};

module.exports = {
  signupEntreprise,
  loginEntreprise,
  forgotPasswordController,
  resetPasswordController,
};
