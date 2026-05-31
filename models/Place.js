const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['restaurant', 'cafe', 'clinic', 'station', 'pharmacy', 'gym', 'other'],
      required: [true, 'Place type is required'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    neighborhood: {
      type: String,
      required: [true, 'Neighborhood is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    openingHours: {
      type: String, // e.g. "9:00 AM - 10:00 PM"
    },
    coverImage: {
      type: String,
      default: null,
    },
    images: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    // Average rating (updated on each review)
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // For restaurants/cafes
    menu: {
      type: String, // image path
      default: null,
    },
    cuisine: {
      type: String,
    },
    // For stations
    routes: [
      {
        destination: String,
        departureTime: String,
        price: Number,
        totalSeats: { type: Number, default: 10 },
        availableSeats: { type: Number, default: 10 },
      },
    ],
    // For clinics
    specialization: {
      type: String,
    },
  },
  { timestamps: true }
);

// ── Index for neighborhood-based queries ──────────────────────────────────────
placeSchema.index({ neighborhood: 1, type: 1 });
placeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Place', placeSchema);
