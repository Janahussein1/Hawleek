const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updatePassword } = require('../controllers/cauth');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['resident', 'business_owner']).withMessage('Invalid role'),
  body('phone').optional().matches(/^[0-9+\-\s]{7,15}$/).withMessage('Invalid phone number'),
];

const loginRules = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        protect,                 getMe);
router.put('/updatepassword', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, updatePassword);

module.exports = router;
