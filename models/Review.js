const mongoose = require('mongoose');
const Place = require('./Place');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// One review per user per place
reviewSchema.index({ user: 1, place: 1 }, { unique: true });

// ── After save: recalculate average rating on Place ───────────────────────────
reviewSchema.statics.calcAverageRating = async function (placeId) {
  const stats = await this.aggregate([
    { $match: { place: placeId } },
    { $group: { _id: '$place', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Place.findByIdAndUpdate(placeId, { averageRating: 0, reviewCount: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.place);
});

reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.place);
});

module.exports = mongoose.model('Review', reviewSchema);
