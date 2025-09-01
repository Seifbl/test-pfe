const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'votre_cle_secrete';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Accès refusé : token manquant' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Accès refusé : token invalide' });
    }

    console.log('✅ Token décodé :', decoded); // <-- 🔍 Ajoute ceci
    req.user = decoded; // Ex: { id: 13, email: "...", role: "entreprise" }
    next();
  });
};

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err || decoded.role !== 'admin') {
      return res.status(401).json({ message: 'Accès refusé' });
    }
    req.admin = decoded;
    next();
  });
};

module.exports = {
  verifyToken,
  verifyAdminToken
};

