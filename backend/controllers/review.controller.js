const reviewModel = require('../models/review.model');

// POST /api/reviews
const createReviewController = async (req, res) => {
  try {
    const { target_id, target_role, job_id, rating, comment } = req.body;

    const reviewer_id = req.user.id;
    const reviewer_role = req.user.role;

    if (!target_id || !target_role || !job_id || !rating) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const review = await reviewModel.createReview({
      reviewer_id,
      reviewer_role,
      target_id,
      target_role,
      job_id,
      rating,
      comment
    });

    res.status(201).json({ message: 'Avis créé avec succès', review });
  } catch (error) {
    console.error('Erreur création avis :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/reviews/:role/:id
const getReviewsController = async (req, res) => {
  try {
    const target_id = req.params.id;
    const target_role = req.params.role;

    const reviews = await reviewModel.getReviewsForUser(target_id, target_role);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Erreur récupération avis :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  createReviewController,
  getReviewsController
};
