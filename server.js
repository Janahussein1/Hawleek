require('dotenv').config();
require('express-async-errors');

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const i18n       = require('i18n');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  autoReload: true,
  syncFiles: true,
  cookie: 'lang',
});

connectDB();

const app = express();
app.set('trust proxy', 1);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});

app.use(globalLimiter);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',      authLimiter, require('./routes/auth'));
app.use('/api/users',     require('./routes/user'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/weather',   require('./routes/weather'));

// TODO: add routes for places, bookings, and reviews if your app should expose those endpoints.
// app.use('/api/places',    require('./routes/place'));
// app.use('/api/bookings',  require('./routes/booking'));
// app.use('/api/reviews',   require('./routes/review'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hawleek API is running 🚀',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Hawleek server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
