// routes/chatbot.routes.js
const express = require('express');
const router = express.Router();
const { respondToQuestion } = require('../controllers/chatbot.controller');
const { verifyToken } = require('../middlewares/auth.middleware');


router.post('/chatbot', verifyToken, respondToQuestion);

module.exports = router;
