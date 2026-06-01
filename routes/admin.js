const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard, getAllUsers, updateUserRole, toggleUserStatus,
  getAllPlaces, verifyPlace, adminDeletePlace,
  getAllBookings, deleteReview,
} = require('../controllers/admin.controller');


router.use(protect, authorize('admin'));

router.get('/dashboard',          getDashboard);


router.get('/users',              getAllUsers);
router.put('/users/:id/role',     updateUserRole);
router.put('/users/:id/toggle',   toggleUserStatus);


router.get('/places',             getAllPlaces);
router.put('/places/:id/verify',  verifyPlace);
router.delete('/places/:id',      adminDeletePlace);


router.get('/bookings',           getAllBookings);


router.delete('/reviews/:id',     deleteReview);

module.exports = router;
