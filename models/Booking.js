const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    type: {
      type: String,
      enum: ['table', 'appointment', 'seat', 'other'],
      required: [true, 'Booking type is required'],
    },
    date: { type: Date, required: [true, 'Booking date is required'] },
    time: { type: String, required: [true, 'Booking time is required'] },
    partySize: { type: Number, min: [1, 'Party size must be at least 1'], default: 1 },
    notes: { type: String, trim: true, maxlength: [300, 'Notes cannot exceed 300 characters'] },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },

    // For transport seat bookings (Consolidated fields)
    routeIndex: {
      type: Number,
      default: null,
    },
    seatsBooked: {
      type: Number,
      default: 1,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);