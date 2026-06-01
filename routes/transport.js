const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStations, getRoutes, getSeatsAvailability, updateRoutes } = require('../controllers/ctransport');


router.get('/stations',                               getStations);
router.get('/stations/:id/routes',                    getRoutes);
router.get('/stations/:id/routes/:routeIndex/seats',  getSeatsAvailability);


router.put('/stations/:id/routes', protect, authorize('business_owner', 'admin'), updateRoutes);

module.exports = router;
