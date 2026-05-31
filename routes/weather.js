const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weather.controller');

// Public — no auth needed
router.get('/', getWeather);

module.exports = router;
