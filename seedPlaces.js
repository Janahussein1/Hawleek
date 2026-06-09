const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Place = require('./models/Place');

const newPlaces = [
  // Mosques
  {
    name: 'Al-Rahman Mosque',
    type: 'mosque',
    description: 'Main Street, 5 mins walk from Dokki Square.',
    address: 'Main Street, Dokki',
    openingHours: 'Open Now',
    specialization: 'Walk south on Dokki Street, then left onto Main Street',
    neighborhood: 'Dokki',
    location: { lat: 30.0384, lng: 31.2114 },
    coverImage: '/photos/mosque.jpg'
  },
  {
    name: 'Al-Nour Mosque',
    type: 'mosque',
    description: 'West District, has women\'s prayer area.',
    address: 'West Avenue',
    openingHours: 'Friday Prayer Focus',
    specialization: 'Head north on West Avenue, turn right at Market Street',
    neighborhood: 'West District',
    location: { lat: 30.0396, lng: 31.2008 },
    coverImage: '/photos/mosque2.jpg'
  },
  
  // Restrooms
  {
    name: 'Dokki Square Public Restroom',
    type: 'toilet',
    description: 'Clean public restroom maintained by the municipality.',
    address: 'Dokki Square Center',
    neighborhood: 'Dokki',
    openingHours: '24/7',
    location: { lat: 30.0381, lng: 31.2111 },
    coverImage: '/photos/bathroom.jpg'
  },
  {
    name: 'Tahrir Mall Restroom',
    type: 'toilet',
    description: 'Located on the ground floor of Tahrir Mall.',
    address: 'Tahrir Square',
    neighborhood: 'Tahrir',
    openingHours: '10:00 AM - 11:00 PM',
    location: { lat: 30.0444, lng: 31.2357 },
    coverImage: '/photos/bathroom.jpg'
  },

  // Services
  {
    name: 'Sayed Electric & Plumbing',
    type: 'service',
    description: 'Reliable home maintenance and emergency repairs.',
    address: '15 El Tahrir Street',
    neighborhood: 'Dokki',
    openingHours: '9:00 AM - 9:00 PM',
    location: { lat: 30.0412, lng: 31.2234 },
    coverImage: '/photos/technician.jpg'
  },
  {
    name: 'Modern Carpentry Works',
    type: 'service',
    description: 'Custom furniture and wood repair services.',
    address: '22 Dokki Street',
    neighborhood: 'Dokki',
    openingHours: '10:00 AM - 6:00 PM',
    location: { lat: 30.0375, lng: 31.2105 },
    coverImage: '/photos/technician.jpg'
  }
];

async function seedData() {
  await connectDB();
  console.log('Connected to DB');
  
  // Check if they already exist to avoid duplicates
  for (let place of newPlaces) {
    const exists = await Place.findOne({ name: place.name });
    if (!exists) {
      await Place.create(place);
      console.log('Added:', place.name);
    } else {
      console.log('Already exists:', place.name);
    }
  }
  
  console.log('Seeding complete!');
  process.exit();
}

seedData();
