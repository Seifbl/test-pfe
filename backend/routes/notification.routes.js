const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getMyNotifications } = require('../controllers/notification.controller');

// ✅ GET /api/notifications ➔ notifications de l'utilisateur connecté
router.get('/', verifyToken, getMyNotifications);

module.exports = router;
 