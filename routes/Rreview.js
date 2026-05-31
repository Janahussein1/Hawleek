const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getPlaceReviews, addReview, updateReview, deleteReview } = require('../controllers/Creview');

const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
];

// Public
router.get('/place/:placeId', getPlaceReviews);

// Protected
router.use(protect);
router.post('/place/:placeId', authorize('resident', 'admin'), reviewRules, validate, addReview);
router.put('/:id',             reviewRules, validate, updateReview);
router.delete('/:id',          deleteReview);

module.exports = router;
