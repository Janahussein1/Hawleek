require('dotenv').config({ override: true });
require('express-async-errors');


const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const i18n       = require('i18n');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const https      = require('https');
const http       = require('http');
const fs         = require('fs');

i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  autoReload: true,
  syncFiles: true,
  cookie: 'lang',
});

const app = express();
app.set('trust proxy', 1);

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'main'), path.join(__dirname, 'views')]); // Ensure this path matches your folder structure
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use('/public', express.static(path.join(__dirname, 'public')));

 
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
// Parse cookies manually for i18n and session token support
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        req.cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }
  next();
});

// Force HTTPS redirect if certificates exist and connection is not secure
app.use((req, res, next) => {
  const keyPath = path.join(__dirname, 'config', 'certs', 'key.pem');
  const certPath = path.join(__dirname, 'config', 'certs', 'cert.pem');
  if (fs.existsSync(keyPath) && fs.existsSync(certPath) && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Persist language choice in a cookie so it applies to ALL pages
app.use((req, res, next) => {
  const langQuery = req.query.lang;
  if (langQuery && ['en', 'ar'].includes(langQuery)) {
    // Set a long-lived cookie so every future request uses this locale
    res.setHeader('Set-Cookie', `lang=${langQuery}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax`);
    req.cookies.lang = langQuery;
  }
  next();
});

app.use(i18n.init);

// After i18n.init, override locale from cookie if no query param was supplied
app.use((req, res, next) => {
  // If the user set ?lang=xx on this request, i18n already picked it up.
  // Otherwise, honour the cookie.
  if (!req.query.lang && req.cookies.lang && ['en', 'ar'].includes(req.cookies.lang)) {
    i18n.setLocale(req, req.cookies.lang);
  }
  const currentLocale = i18n.getLocale(req) || 'en';
  res.locals.locale = currentLocale;
  res.locals.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
  // Expose translations as a JSON string for client-side JS scripts
  const catalog = i18n.getCatalog(currentLocale) || {};
  res.locals.translationsJson = JSON.stringify(catalog);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Keep the incoming UI routes
app.get('/', (req, res) => {
    res.render('index');
});

// Dashboard routes (render EJS templates)
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});


app.get('/dashboard/login', (req, res) => {
  res.render('login');
});
app.get('/dashboard/login.ejs', (req, res) => {
  res.render('login');
});

 
// TODO: add routes for places, bookings, and reviews if your app should expose those endpoints.
// app.use('/api/places',    require('./routes/place'));
// app.use('/api/bookings',  require('./routes/booking'));
// app.use('/api/reviews',   require('./routes/review'));

// Public page routes (render views/pages/*.ejs)
app.get('/services', (req, res) => res.render('pages/services'));
app.get('/services/request', (req, res) => res.render('pages/serviceRequest'));
app.get('/service-request', (req, res) => res.render('pages/serviceRequest'));
app.get('/booking',  (req, res) => res.render('pages/booking'));
app.get('/clinics',  (req, res) => res.render('pages/clinicBooking'));
app.get('/transport',(req, res) => res.render('pages/transport'));
app.get('/mosques',  (req, res) => res.render('pages/mosques'));
app.get('/toilets',  (req, res) => res.render('pages/toilets'));

// Also allow direct .ejs-style links (so `/pages/services.ejs` works)
app.get('/pages/services.ejs', (req, res) => res.render('pages/services'));
app.get('/pages/serviceRequest.ejs', (req, res) => res.render('pages/serviceRequest'));
app.get('/pages/booking.ejs',  (req, res) => res.render('pages/booking'));
app.get('/pages/clinics.ejs',  (req, res) => res.render('pages/clinicBooking'));
app.get('/pages/transport.ejs',(req, res) => res.render('pages/transport'));
app.get('/pages/mosques.ejs',  (req, res) => res.render('pages/mosques'));
app.get('/pages/toilets.ejs',  (req, res) => res.render('pages/toilets'));

app.use('/api/auth',      authLimiter, require('./routes/auth'));
app.use('/api/users',     require('./routes/user'));
app.use('/api/places',    require('./routes/Rplace'));
app.use('/api/bookings/guest', require('./routes/guestBooking'));
app.use('/api/bookings',  require('./routes/Rbooking'));
app.use('/api/reviews',   require('./routes/Rreview'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/weather',   require('./routes/weather'));
app.use('/api/contact',   require('./routes/contact'));


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

const startServer = async () => {
  console.log('DEBUG: using MONGO_URI =', process.env.MONGO_URI);
  await connectDB();

  const keyPath = path.join(__dirname, 'config', 'certs', 'key.pem');
  const certPath = path.join(__dirname, 'config', 'certs', 'cert.pem');
  const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

  let server;
  if (hasCerts) {
    const sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    server = https.createServer(sslOptions, app);
    console.log('🔒 SSL Certificates found. Starting server in HTTPS mode...');
  } else {
    server = http.createServer(app);
    console.log('🔓 SSL Certificates not found. Starting server in HTTP mode...');
  }

  server.listen(PORT, () => {
    const protocol = hasCerts ? 'https' : 'http';
    console.log(`✅ Hawleek server running on ${protocol}://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please stop the process using this port or change PORT in your .env file.`);
      process.exit(1);
    }
    console.error('❌ Server error:', err);
    process.exit(1);
  });
};

startServer();
