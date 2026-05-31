const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createBooking, getBooking, cancelBooking,
  updateBookingStatus, getPlaceBookings,
} = require('../controllers/Cbooking');

const bookingRules = [
  body('placeId').notEmpty().withMessage('Place ID is required').isMongoId().withMessage('Invalid place ID'),
  body('type').isIn(['table', 'appointment', 'seat']).withMessage('Invalid booking type'),
  body('date').isISO8601().withMessage('Invalid date format').toDate(),
  body('time').notEmpty().withMessage('Time is required'),
  body('partySize').optional().isInt({ min: 1 }).withMessage('Party size must be a positive integer'),
];

router.use(protect); // All booking routes require auth

router.post('/',                                bookingRules, validate, createBooking);
router.get('/place/:placeId',                   authorize('business_owner', 'admin'), getPlaceBookings);
router.get('/:id',                              getBooking);
router.put('/:id/cancel',                       cancelBooking);
router.put('/:id/status',                       authorize('business_owner', 'admin'), updateBookingStatus);

module.exports = router;
