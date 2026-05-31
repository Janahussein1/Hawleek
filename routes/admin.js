const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard, getAllUsers, updateUserRole, toggleUserStatus,
  getAllPlaces, verifyPlace, adminDeletePlace,
  getAllBookings, deleteReview,
} = require('../controllers/admin.controller');

// All admin routes: must be logged in AND be admin
router.use(protect, authorize('admin'));

router.get('/dashboard',          getDashboard);

// Users
router.get('/users',              getAllUsers);
router.put('/users/:id/role',     updateUserRole);
router.put('/users/:id/toggle',   toggleUserStatus);

// Places
router.get('/places',             getAllPlaces);
router.put('/places/:id/verify',  verifyPlace);
router.delete('/places/:id',      adminDeletePlace);

// Bookings
router.get('/bookings',           getAllBookings);

// Reviews
router.delete('/reviews/:id',     deleteReview);

module.exports = router;
