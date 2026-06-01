const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { createGuestBooking } = require('../controllers/Cbooking');

const bookingRules = [
  body('placeId').notEmpty().withMessage('Place ID is required').isMongoId().withMessage('Invalid place ID'),
  body('type').isIn(['table', 'appointment', 'seat']).withMessage('Invalid booking type'),
  body('date').isISO8601().withMessage('Invalid date format').toDate(),
  body('time').notEmpty().withMessage('Time is required'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
];

router.post('/', bookingRules, validate, createGuestBooking);

module.exports = router;
