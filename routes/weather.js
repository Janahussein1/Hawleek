const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/cweather');

router.get('/', getWeather);

module.exports = router;
