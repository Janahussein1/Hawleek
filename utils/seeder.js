require('dotenv').config();
const mongoose  = require('mongoose');
const connectDB = require('../config/db');

const User    = require('../models/User');
const Place   = require('../models/Place');
const Booking = require('../models/Booking');
const Review  = require('../models/Review');

const seed = async () => {
  await connectDB();
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Place.deleteMany(),
      Booking.deleteMany(),
      Review.deleteMany(),
    ]);
    console.log('🧹 Cleared existing data');

    const adminUser = await User.create({
      name: 'Admin Hawleek',
      email: 'admin@hawleek.com',
      password: 'admin123',
      role: 'admin',
      neighborhood: 'Maadi',
      phone: '+201001234567',
    });

    const ownerUser = await User.create({
      name: 'Ahmed Kamal',
      email: 'owner@hawleek.com',
      password: 'owner123',
      role: 'business_owner',
      neighborhood: 'Maadi',
      phone: '+201009876543',
      businessName: 'Kamal Restaurants Group',
    });

    const ownerUser2 = await User.create({
      name: 'Layla Hassan',
      email: 'owner2@hawleek.com',
      password: 'owner123',
      role: 'business_owner',
      neighborhood: 'Zamalek',
      phone: '+201112244668',
      businessName: 'Hassan Group',
    });

    const residentUser = await User.create({
      name: 'Sara Mahmoud',
      email: 'resident@hawleek.com',
      password: 'resident123',
      role: 'resident',
      neighborhood: 'Maadi',
      phone: '+201112233445',
    });

    const residentUser2 = await User.create({
      name: 'Omar Farouk',
      email: 'resident2@hawleek.com',
      password: 'resident123',
      role: 'resident',
      neighborhood: 'Zamalek',
      phone: '+201223344556',
    });

    console.log('👥 Users created (5)');

    const restaurant = await Place.create({
      name: 'Koshary El Tahrir',
      type: 'restaurant',
      description: 'Famous Egyptian koshary restaurant serving authentic local food since 1950.',
      neighborhood: 'Maadi',
      address: '15 Road 9, Maadi, Cairo',
      phone: '+20221234567',
      openingHours: '8:00 AM - 11:00 PM',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9626, lng: 31.2497 },
      cuisine: 'Egyptian',
    });

    const riverBistro = await Place.create({
      name: 'Nile View Restaurant',
      type: 'restaurant',
      description: 'Scenic dining on the Nile with a menu full of grilled specialties and fresh seafood.',
      neighborhood: 'Maadi',
      address: '7 Nile Corniche, Maadi, Cairo',
      phone: '+20221001234',
      openingHours: '12:00 PM - 12:00 AM',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9635, lng: 31.2499 },
      cuisine: 'Grill & Seafood',
    });

    const riverBistro2 = await Place.create({
      name: 'Zamalek River Bistro',
      type: 'restaurant',
      description: 'Charming riverside restaurant serving modern Mediterranean dishes and signature cocktails.',
      neighborhood: 'Zamalek',
      address: '12 Mohamed Mazhar St, Zamalek, Cairo',
      phone: '+20222391234',
      openingHours: '10:00 AM - 1:00 AM',
      owner: ownerUser2._id,
      isVerified: true,
      location: { lat: 30.0637, lng: 31.2212 },
      cuisine: 'Mediterranean',
    });

    const downtownSeafood = await Place.create({
      name: 'Downtown Seafood Grill',
      type: 'restaurant',
      description: 'A popular seafood destination with fresh catches and classic Egyptian hospitality.',
      neighborhood: 'Maadi',
      address: '18 Road 218, Maadi, Cairo',
      phone: '+20229987654',
      openingHours: '11:00 AM - 11:00 PM',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9612, lng: 31.2505 },
      cuisine: 'Seafood',
    });

    const cafe = await Place.create({
      name: 'Cilantro Cafe Maadi',
      type: 'cafe',
      description: 'Cozy cafe with great coffee, fresh juices, and a relaxing atmosphere.',
      neighborhood: 'Maadi',
      address: '22 Road 218, Maadi, Cairo',
      phone: '+20229876543',
      openingHours: '7:00 AM - 12:00 AM',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9600, lng: 31.2500 },
    });

    const clinic = await Place.create({
      name: 'Dr. Salah Internal Medicine',
      type: 'clinic',
      description: 'Specialist internal medicine clinic with experienced doctors and modern equipment.',
      neighborhood: 'Maadi',
      address: '5 Road 82, Maadi, Cairo',
      phone: '+20223456789',
      openingHours: '10:00 AM - 6:00 PM',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9580, lng: 31.2520 },
      specialization: 'Internal Medicine',
    });

    const pharmacy = await Place.create({
      name: 'El Ezaby Pharmacy Maadi',
      type: 'pharmacy',
      description: '24/7 pharmacy with a wide range of medications and health products.',
      neighborhood: 'Maadi',
      address: '1 Road 9, Maadi, Cairo',
      phone: '+20221112233',
      openingHours: '24 hours',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9615, lng: 31.2495 },
    });

    const gym = await Place.create({
      name: 'Gold\'s Gym Maadi',
      type: 'gym',
      description: 'Fully equipped gym with personal trainers, group classes, and pool.',
      neighborhood: 'Maadi',
      address: '30 Road 257, Maadi, Cairo',
      phone: '+20224445566',
      openingHours: '6:00 AM - 11:00 PM',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9590, lng: 31.2510 },
    });

    const station = await Place.create({
      name: 'Maadi Car Station',
      type: 'station',
      description: 'Main private transport hub serving Maadi and surrounding areas with comfortable vehicles.',
      neighborhood: 'Maadi',
      address: 'Maadi Metro Station Area, Road 9, Maadi',
      phone: '+20224567890',
      openingHours: '6:00 AM - 10:00 PM',
      owner: ownerUser._id,
      isVerified: true,
      location: { lat: 29.9610, lng: 31.2490 },
      routes: [
        { destination: 'Tahrir Square',  departureTime: '08:00 AM', price: 10, totalSeats: 14, availableSeats: 10 },
        { destination: 'Nasr City',      departureTime: '09:00 AM', price: 15, totalSeats: 14, availableSeats: 14 },
        { destination: 'New Cairo',      departureTime: '10:00 AM', price: 20, totalSeats: 14, availableSeats: 7  },
        { destination: 'Cairo Airport',  departureTime: '11:00 AM', price: 30, totalSeats: 14, availableSeats: 14 },
        { destination: 'Heliopolis',     departureTime: '12:00 PM', price: 18, totalSeats: 14, availableSeats: 12 },
      ],
    });

    const zamalekCafe = await Place.create({
      name: 'Zamalek Garden Cafe',
      type: 'cafe',
      description: 'Charming cafe on the Nile island with garden seating and live music on weekends.',
      neighborhood: 'Zamalek',
      address: '26 Shagaret El Dor St, Zamalek, Cairo',
      phone: '+20222345678',
      openingHours: '9:00 AM - 1:00 AM',
      owner: ownerUser2._id,
      isVerified: true,
      location: { lat: 30.0640, lng: 31.2200 },
    });

    const zamalekClinic = await Place.create({
      name: 'Zamalek Dental Center',
      type: 'clinic',
      description: 'Modern dental clinic offering all dental services with the latest technology.',
      neighborhood: 'Zamalek',
      address: '10 Ismail Mohammed St, Zamalek',
      phone: '+20222876543',
      openingHours: '9:00 AM - 7:00 PM',
      owner: ownerUser2._id,
      isVerified: false, // pending verification
      location: { lat: 30.0630, lng: 31.2190 },
      specialization: 'Dentistry',
    });

    await Place.create({
      name: 'New Neighborhood Gym',
      type: 'gym',
      description: 'New gym opening soon in Heliopolis.',
      neighborhood: 'Heliopolis',
      address: '55 Merghany St, Heliopolis, Cairo',
      phone: '+20225556677',
      openingHours: '7:00 AM - 10:00 PM',
      owner: ownerUser._id,
      isVerified: false,
      location: { lat: 30.0870, lng: 31.3240 },
    });

    console.log('📍 Places created (12)');

    const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek  = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

    await Booking.create({
      user: residentUser._id,
      place: restaurant._id,
      type: 'table',
      date: tomorrow,
      time: '7:00 PM',
      partySize: 3,
      notes: 'Window seat preferred, one vegetarian',
      status: 'confirmed',
    });

    await Booking.create({
      user: residentUser._id,
      place: clinic._id,
      type: 'appointment',
      date: nextWeek,
      time: '11:00 AM',
      partySize: 1,
      status: 'pending',
    });

    await Booking.create({
      user: residentUser._id,
      place: station._id,
      type: 'seat',
      date: tomorrow,
      time: '08:00 AM',
      partySize: 1,
      routeIndex: 0,
      seatsBooked: 2,
      totalPrice: 20,
      status: 'confirmed',
    });

    station.routes[0].availableSeats -= 2;
    await station.save();

    await Booking.create({
      user: residentUser2._id,
      place: zamalekCafe._id,
      type: 'table',
      date: tomorrow,
      time: '8:00 PM',
      partySize: 2,
      status: 'pending',
    });

    await Booking.create({
      user: residentUser2._id,
      place: cafe._id,
      type: 'table',
      date: yesterday,
      time: '10:00 AM',
      partySize: 1,
      status: 'completed',
    });

    await Booking.create({
      user: residentUser._id,
      place: station._id,
      type: 'seat',
      date: nextWeek,
      time: '09:00 AM',
      partySize: 1,
      routeIndex: 1,
      seatsBooked: 1,
      totalPrice: 15,
      status: 'pending',
    });

    console.log('📅 Bookings created (6)');

    await Review.create({ user: residentUser._id,  place: restaurant._id, rating: 5, comment: 'Best koshary in Cairo! Authentic taste, huge portions.' });
    await Review.create({ user: residentUser2._id, place: restaurant._id, rating: 4, comment: 'Great food, a bit crowded on weekends.' });
    await Review.create({ user: adminUser._id,     place: cafe._id,       rating: 4, comment: 'Great coffee, a bit pricey but worth it.' });
    await Review.create({ user: residentUser._id,  place: cafe._id,       rating: 5, comment: 'Love the atmosphere! My go-to spot.' });
    await Review.create({ user: residentUser._id,  place: clinic._id,     rating: 5, comment: 'Dr. Salah is excellent. Very professional and thorough.' });
    await Review.create({ user: residentUser2._id, place: zamalekCafe._id, rating: 4, comment: 'Beautiful garden setting. Perfect for evening outings.' });

    console.log('⭐ Reviews created (6)');
    console.log('\n✅ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Test Accounts:');
    console.log('───────────────────────────────────────');
    console.log('  Admin:     admin@hawleek.com    / admin123');
    console.log('  Owner 1:   owner@hawleek.com    / owner123');
    console.log('  Owner 2:   owner2@hawleek.com   / owner123');
    console.log('  Resident:  resident@hawleek.com / resident123');
    console.log('  Resident2: resident2@hawleek.com / resident123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();

