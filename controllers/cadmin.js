const User = require('../models/User');
const Place = require('../models/Place');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');

// ── @route   GET /api/admin/dashboard ────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const [totalUsers, totalPlaces, totalBookings, totalReviews,
    pendingPlaces, pendingBookings] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Place.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Review.countDocuments(),
    Place.countDocuments({ isVerified: false, isActive: true }),
    Booking.countDocuments({ status: 'pending' }),
  ]);

  // Recent activity
  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('place', 'name type')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentUsers = await User.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      stats: { totalUsers, totalPlaces, totalBookings, totalReviews, pendingPlaces, pendingBookings },
      recentBookings,
      recentUsers,
    },
  });
};

// ── @route   GET /api/admin/users ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { role, search } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.json({
    success: true,
    data: users,
    pagination: { total, page, totalPages: Math.ceil(total / limit), limit },
  });
};

// ── @route   PUT /api/admin/users/:id/role ────────────────────────────────────
exports.updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  const allowed = ['resident', 'business_owner', 'admin'];
  if (!allowed.includes(role)) return next(new AppError('Invalid role', 400));

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return next(new AppError('User not found', 404));

  res.json({ success: true, data: user, message: `User role updated to ${role}` });
};

// ── @route   PUT /api/admin/users/:id/toggle ──────────────────────────────────
exports.toggleUserStatus = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
  });
};

// ── @route   GET /api/admin/places ────────────────────────────────────────────
exports.getAllPlaces = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { type, verified, search } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (verified !== undefined) filter.isVerified = verified === 'true';
  if (search) filter.name = new RegExp(search, 'i');

  const total = await Place.countDocuments(filter);
  const places = await Place.find(filter)
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: places,
    pagination: { total, page, totalPages: Math.ceil(total / limit), limit },
  });
};

// ── @route   PUT /api/admin/places/:id/verify ─────────────────────────────────
exports.verifyPlace = async (req, res, next) => {
  const place = await Place.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  );
  if (!place) return next(new AppError('Place not found', 404));

  res.json({ success: true, data: place, message: 'Place verified successfully' });
};

// ── @route   DELETE /api/admin/places/:id ────────────────────────────────────
exports.adminDeletePlace = async (req, res, next) => {
  const place = await Place.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!place) return next(new AppError('Place not found', 404));
  res.json({ success: true, message: 'Place removed by admin' });
};

// ── @route   GET /api/admin/bookings ──────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('place', 'name type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: bookings,
    pagination: { total, page, totalPages: Math.ceil(total / limit), limit },
  });
};

// ── @route   DELETE /api/admin/reviews/:id ───────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const placeId = review.place;
  await review.deleteOne();
  await Review.calcAverageRating(placeId);

  res.json({ success: true, message: 'Review deleted by admin' });
};

