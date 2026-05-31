const fetch = require('node-fetch');
const AppError = require('../utils/AppError');

// ── @route   GET /api/weather ─────────────────────────────────────────────────
// Fetches weather from OpenWeatherMap — called from backend to keep API key safe
exports.getWeather = async (req, res, next) => {
  const city = req.query.city || process.env.WEATHER_CITY || 'Cairo';
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
    // Return mock data if no API key is configured
    return res.json({
      success: true,
      data: {
        city,
        temperature: 28,
        feelsLike: 30,
        description: 'Sunny',
        icon: '01d',
        humidity: 40,
        windSpeed: 12,
        isMock: true,
      },
    });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  if (!response.ok) {
    return next(new AppError('Failed to fetch weather data', 502));
  }

  const data = await response.json();

  res.json({
    success: true,
    data: {
      city: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      isMock: false,
    },
  });
};

