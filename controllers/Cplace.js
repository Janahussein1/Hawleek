const Place = require('../models/Place');
const AppError = require('../utils/AppError');
const path = require('path');
const fs = require('fs');

// ── @route   GET /api/places ──────────────────────────────────────────────────
// Query params: neighborhood, type, search, page, limit, sort
exports.getPlaces = async (req, res) => {
  const { neighborhood, type, search, sort, page = 1, limit = 12 } = req.query;

  const filter = { isActive: true };
  if (neighborhood) filter.neighborhood = new RegExp(neighborhood, 'i');
  if (type) filter.type = type;
  if (search) filter.$text = { $search: search };

  const sortOption = sort === 'rating'
    ? { averageRating: -1 }
    : sort === 'newest'
    ? { createdAt: -1 }
    : { name: 1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Place.countDocuments(filter);

  const places = await Place.find(filter)
    .populate('owner', 'name email')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: places,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
};

// ── @route   GET /api/places/:id ──────────────────────────────────────────────
exports.getPlace = async (req, res, next) => {
  const place = await Place.findById(req.params.id).populate('owner', 'name email phone');
  if (!place || !place.isActive) return next(new AppError('Place not found', 404));
  res.json({ success: true, data: place });
};

// ── @route   POST /api/places ─────────────────────────────────────────────────
exports.createPlace = async (req, res) => {
  const placeData = { ...req.body, owner: req.user.id };

  if (req.files) {
    if (req.files.coverImage) placeData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    if (req.files.menu) placeData.menu = `/uploads/${req.files.menu[0].filename}`;
    if (req.files.images) placeData.images = req.files.images.map(f => `/uploads/${f.filename}`);
  }

  // Parse routes JSON if sent as string
  if (req.body.routes && typeof req.body.routes === 'string') {
    placeData.routes = JSON.parse(req.body.routes);
  }

  // Parse location JSON if sent as string
  if (req.body.location && typeof req.body.location === 'string') {
    placeData.location = JSON.parse(req.body.location);
  }

  const place = await Place.create(placeData);
  res.status(201).json({ success: true, data: place, message: 'Place created successfully' });
};

// ── @route   PUT /api/places/:id ─────────────────────────────────────────────
exports.updatePlace = async (req, res, next) => {
  let place = await Place.findById(req.params.id);
  if (!place) return next(new AppError('Place not found', 404));

  // Only owner or admin can update
  if (place.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this place', 403));
  }

  const updateData = { ...req.body };

  if (req.files) {
    if (req.files.coverImage) updateData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    if (req.files.menu) updateData.menu = `/uploads/${req.files.menu[0].filename}`;
  }

  if (req.body.routes && typeof req.body.routes === 'string') {
    updateData.routes = JSON.parse(req.body.routes);
  }

  place = await Place.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: place, message: 'Place updated successfully' });
};

// ── @route   DELETE /api/places/:id ──────────────────────────────────────────
exports.deletePlace = async (req, res, next) => {
  const place = await Place.findById(req.params.id);
  if (!place) return next(new AppError('Place not found', 404));

  if (place.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this place', 403));
  }

  await Place.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Place removed successfully' });
};

// ── @route   GET /api/places/owner/my-places ─────────────────────────────────
exports.getMyPlaces = async (req, res) => {
  const places = await Place.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: places });
};

// ── @route   GET /api/places/types/list ──────────────────────────────────────
exports.getTypes = async (req, res) => {
  const types = ['restaurant', 'cafe', 'clinic', 'station', 'pharmacy', 'gym', 'other'];
  res.json({ success: true, data: types });
};

// ── @route   GET /api/places/neighborhoods/list ───────────────────────────────
exports.getNeighborhoods = async (req, res) => {
  const neighborhoods = await Place.distinct('neighborhood', { isActive: true });
  res.json({ success: true, data: neighborhoods });
};
