const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    vendor: { type: String, required: true },
    serviceDetails: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, default: 'Pending' }
}, { timestamps: true });
module.exports = mongoose.model('Booking', bookingSchema);