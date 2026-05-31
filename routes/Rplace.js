const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  getPlaces, getPlace, createPlace, updatePlace,
  deletePlace, getMyPlaces, getTypes, getNeighborhoods,
} = require('../controllers/Cplace');

const placeUpload = uploadFields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'menu', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

const placeRules = [
  body('name').trim().notEmpty().withMessage('Place name is required'),
  body('type').isIn(['restaurant', 'cafe', 'clinic', 'station', 'pharmacy', 'gym', 'other'])
    .withMessage('Invalid place type'),
  body('neighborhood').trim().notEmpty().withMessage('Neighborhood is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

// Public routes
router.get('/',                   getPlaces);
router.get('/types/list',         getTypes);
router.get('/neighborhoods/list', getNeighborhoods);
router.get('/:id',                getPlace);

// Protected routes
router.use(protect);
router.get('/owner/my-places',    authorize('business_owner', 'admin'), getMyPlaces);
router.post('/',                  authorize('business_owner', 'admin'), placeUpload, placeRules, validate, createPlace);
router.put('/:id',                authorize('business_owner', 'admin'), placeUpload, updatePlace);
router.delete('/:id',             authorize('business_owner', 'admin'), deletePlace);

module.exports = router;
