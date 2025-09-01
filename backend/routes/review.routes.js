const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  createReviewController,
  getReviewsController
} = require('../controllers/review.controller');

router.post('/', verifyToken, createReviewController);
router.get('/:role/:id', getReviewsController); // /reviews/freelance/6 ou /reviews/entreprise/7
// review.routes.js
router.get('/freelance/:id', getReviewsController);
router.get('/entreprise/:id', getReviewsController);

module.exports = router;
