const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'votre_cle_secrete';

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Admin non trouvé' });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Erreur login admin :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

module.exports = { loginAdmin };
