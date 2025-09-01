module.exports = (req, res, next) => {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé : admin requis' });
  }
  next();
};
