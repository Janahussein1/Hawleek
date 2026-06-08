const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
};


exports.updateProfile = async (req, res) => {
  const { name, phone, neighborhood, businessName } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, neighborhood, businessName },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: user, message: 'Profile updated successfully' });
};


exports.uploadAvatar = async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image file', 400));

  // Delete old avatar if exists
  const user = await User.findById(req.user.id);
  if (user.avatar) {
    const oldPath = path.join(__dirname, '..', user.avatar);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const avatarPath = `/uploads/${req.file.filename}`;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarPath },
    { new: true }
  );

  res.json({ success: true, data: updatedUser, message: 'Avatar uploaded successfully' });
};


exports.getMyBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Booking.countDocuments({ user: req.user.id });
  const bookings = await Booking.find({ user: req.user.id })
    .populate('place', 'name type address coverImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: bookings,
    pagination: { total, page, totalPages: Math.ceil(total / limit), limit },
  });
};


exports.getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate('place', 'name type coverImage')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reviews });
};


exports.deleteAccount = async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new AppError('Incorrect password', 401));

  await User.findByIdAndUpdate(req.user.id, { isActive: false });
  res.json({ success: true, message: 'Account deactivated successfully' });
};
