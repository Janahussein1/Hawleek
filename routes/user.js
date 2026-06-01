const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadAvatar,
  getMyBookings, getMyReviews, deleteAccount,
} = require('../controllers/cuser');

router.use(protect); // All user routes require auth

router.get('/profile',       getProfile);
router.put('/profile',       updateProfile);
router.put('/avatar',        uploadSingle('avatar'), uploadAvatar);
router.get('/my-bookings',   getMyBookings);
router.get('/my-reviews',    getMyReviews);
router.delete('/account',    deleteAccount);

module.exports = router;
