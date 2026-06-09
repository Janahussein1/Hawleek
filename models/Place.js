const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  destination: { type: String, required: true },
  departureTime: { type: String, required: true },
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
});

const locationSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number },
});

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
      enum: ['restaurant', 'cafe', 'clinic', 'station', 'pharmacy', 'gym', 'mosque', 'toilet', 'service', 'other'],
      required: [true, 'Place type is required'],
    },
    description: { type: String, trim: true, maxlength: [500, 'Description cannot exceed 500 characters'] },
    neighborhood: { type: String, required: [true, 'Neighborhood is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    openingHours: { type: String, trim: true },
    coverImage: { type: String, default: null },
    images: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    location: { type: locationSchema },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    menu: { type: String, default: null },
    cuisine: { type: String, trim: true },
    routes: [routeSchema],
    specialization: { type: String, trim: true },
  },
  { timestamps: true }
);

placeSchema.index({ neighborhood: 1, type: 1 });
placeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Place', placeSchema);
