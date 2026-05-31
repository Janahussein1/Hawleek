const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const pageViews = ['booking', 'clinics', 'services', 'toilets', 'transport', 'mosques'];

app.get('/pages/:pageName.html', (req, res) => {
    const pageName = req.params.pageName;
    if (!pageViews.includes(pageName)) {
        return res.status(404).send('Page not found');
    }
    res.render(`pages/${pageName}`);
});

app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/businesses', require('./routes/businessRoutes')); // Person 2 will handle this file

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));