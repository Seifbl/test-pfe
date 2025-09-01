const nodemailer = require('nodemailer');

// Utilise un compte test ou ton propre SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou 'mailtrap.io', 'outlook'...
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} to - l'email du destinataire
 * @param {string} token - le token de réinitialisation
 */
async function sendResetEmail(to, token) {
  const resetLink = `http://localhost:5173/reset-password/${token}`; // Modifie l'URL selon ton frontend

  await transporter.sendMail({
    from: `"Support Trailblazer" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien suivant pour continuer :</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ce lien expire dans 30 minutes.</p>
    `,
  });
}

module.exports = { sendResetEmail };
