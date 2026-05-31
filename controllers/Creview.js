const Review = require('../models/Review');
const Place = require('../models/Place');
const AppError = require('../utils/AppError');

// ── @route   GET /api/reviews/place/:placeId ─────────────────────────────────
exports.getPlaceReviews = async (req, res, next) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) return next(new AppError('Place not found', 404));

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Review.countDocuments({ place: req.params.placeId });
  const reviews = await Review.find({ place: req.params.placeId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: reviews,
    pagination: { total, page, totalPages: Math.ceil(total / limit), limit },
  });
};

// ── @route   POST /api/reviews/place/:placeId ────────────────────────────────
exports.addReview = async (req, res, next) => {
  const { rating, comment } = req.body;

  const place = await Place.findById(req.params.placeId);
  if (!place || !place.isActive) return next(new AppError('Place not found', 404));

  // Check existing review
  const existing = await Review.findOne({ user: req.user.id, place: req.params.placeId });
  if (existing) return next(new AppError('You have already reviewed this place', 400));

  const review = await Review.create({
    user: req.user.id,
    place: req.params.placeId,
    rating,
    comment,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: review, message: 'Review added successfully' });
};

// ── @route   PUT /api/reviews/:id ────────────────────────────────────────────
exports.updateReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  if (review.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to edit this review', 403));
  }

  review.rating = rating || review.rating;
  review.comment = comment !== undefined ? comment : review.comment;
  await review.save();

  // Recalculate avg rating
  await Review.calcAverageRating(review.place);

  res.json({ success: true, data: review, message: 'Review updated successfully' });
};

// ── @route   DELETE /api/reviews/:id ─────────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this review', 403));
  }

  const placeId = review.place;
  await review.deleteOne();
  await Review.calcAverageRating(placeId);

  res.json({ success: true, message: 'Review deleted successfully' });
};
