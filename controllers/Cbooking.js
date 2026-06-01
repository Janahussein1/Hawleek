const Booking = require('../models/Booking');
const Place = require('../models/Place');
const AppError = require('../utils/AppError');
const { sendBookingConfirmation } = require('../utils/email');

// ── @route   POST /api/bookings ───────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  const { placeId, type, date, time, partySize, notes, routeIndex, seatsBooked, contactEmail } = req.body;

  const place = await Place.findById(placeId);
  if (!place || !place.isActive) return next(new AppError('Place not found', 404));

  // Prevent booking in the past
  const bookingDate = new Date(date);
  if (bookingDate < new Date().setHours(0, 0, 0, 0)) {
    return next(new AppError('Cannot book a date in the past', 400));
  }

  let totalPrice = 0;

  // Handle transport seat booking - check availability
  if (type === 'seat' && routeIndex !== undefined) {
    const route = place.routes[routeIndex];
    if (!route) return next(new AppError('Route not found', 404));

    const seats = seatsBooked || 1;
    if (route.availableSeats < seats) {
      return next(new AppError(`Only ${route.availableSeats} seats available`, 400));
    }

    // Decrement available seats
    place.routes[routeIndex].availableSeats -= seats;
    await place.save();
    totalPrice = route.price * seats;
  }

  const booking = await Booking.create({
    user: req.user.id,
    place: placeId,
    type,
    date: bookingDate,
    time,
    partySize: partySize || 1,
    notes,
    contactEmail: contactEmail || undefined,
    routeIndex: routeIndex !== undefined ? routeIndex : null,
    seatsBooked: seatsBooked || 1,
    totalPrice,
  });

  await booking.populate('place', 'name type address phone');

  res.status(201).json({ success: true, data: booking, message: 'Booking created successfully' });

  const recipientEmail = contactEmail?.trim() || req.user.email;
  const placeName = place.name || 'Restaurant';
  sendBookingConfirmation({
    userEmail: req.user.email,
    userName: req.user.name,
    booking,
    placeName,
  }).catch(err => console.error('Booking confirmation email failed:', err));

  if (recipientEmail && recipientEmail !== req.user.email) {
    sendBookingConfirmation({
      userEmail: recipientEmail,
      userName: req.user.name,
      booking,
      placeName,
    }).catch(err => console.error('Booking confirmation email failed:', err));
  }
};

// ── @route   GET /api/bookings/:id ───────────────────────────────────────────
exports.getBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('place', 'name type address phone coverImage')
    .populate('user', 'name email phone');

  if (!booking) return next(new AppError('Booking not found', 404));

  // Only owner of booking, place owner, or admin can view
  const placePopulated = await Place.findById(booking.place._id);
  const isPlaceOwner = placePopulated?.owner?.toString() === req.user.id;
  const isBookingUser = booking.user._id.toString() === req.user.id;

  if (!isBookingUser && !isPlaceOwner && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  res.json({ success: true, data: booking });
};

// ── @route   PUT /api/bookings/:id/cancel ────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Booking is already cancelled', 400));
  }

  if (booking.status === 'completed') {
    return next(new AppError('Cannot cancel a completed booking', 400));
  }

  // Restore seats if transport booking
  if (booking.type === 'seat' && booking.routeIndex !== null) {
    await Place.findByIdAndUpdate(booking.place, {
      $inc: { [`routes.${booking.routeIndex}.availableSeats`]: booking.seatsBooked },
    });
  }

  booking.status = 'cancelled';
  await booking.save();

  res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
};

// ── @route   PUT /api/bookings/:id/status (business owner / admin) ────────────
exports.updateBookingStatus = async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return next(new AppError('Invalid status value', 400));

  const booking = await Booking.findById(req.params.id).populate('place');
  if (!booking) return next(new AppError('Booking not found', 404));

  const isPlaceOwner = booking.place?.owner?.toString() === req.user.id;
  if (!isPlaceOwner && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  booking.status = status;
  await booking.save();

  res.json({ success: true, data: booking, message: `Booking marked as ${status}` });
};

// ── @route   GET /api/bookings/place/:placeId (business owner) ───────────────
exports.getPlaceBookings = async (req, res, next) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) return next(new AppError('Place not found', 404));

  if (place.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await Booking.countDocuments({ place: req.params.placeId });
  const bookings = await Booking.find({ place: req.params.placeId })
    .populate('user', 'name email phone')
    .sort({ date: 1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: bookings,
    pagination: { total, page, totalPages: Math.ceil(total / limit), limit },
  });
};
