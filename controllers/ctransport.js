const Place = require('../models/Place');
const AppError = require('../utils/AppError');

// ── @route   GET /api/transport/stations ─────────────────────────────────────
exports.getStations = async (req, res) => {
  const { neighborhood } = req.query;
  const filter = { type: 'station', isActive: true };
  if (neighborhood) filter.neighborhood = new RegExp(neighborhood, 'i');

  const stations = await Place.find(filter).populate('owner', 'name phone');
  res.json({ success: true, data: stations });
};

// ── @route   GET /api/transport/stations/:id/routes ──────────────────────────
exports.getRoutes = async (req, res, next) => {
  const station = await Place.findById(req.params.id);
  if (!station || station.type !== 'station') return next(new AppError('Station not found', 404));

  res.json({ success: true, data: station.routes });
};

// ── @route   GET /api/transport/stations/:id/routes/:routeIndex/seats ─────────
exports.getSeatsAvailability = async (req, res, next) => {
  const station = await Place.findById(req.params.id);
  if (!station || station.type !== 'station') return next(new AppError('Station not found', 404));

  const route = station.routes[req.params.routeIndex];
  if (!route) return next(new AppError('Route not found', 404));

  res.json({
    success: true,
    data: {
      destination: route.destination,
      departureTime: route.departureTime,
      price: route.price,
      totalSeats: route.totalSeats,
      availableSeats: route.availableSeats,
      bookedSeats: route.totalSeats - route.availableSeats,
    },
  });
};

// ── @route   PUT /api/transport/stations/:id/routes (owner only) ──────────────
exports.updateRoutes = async (req, res, next) => {
  const station = await Place.findById(req.params.id);
  if (!station || station.type !== 'station') return next(new AppError('Station not found', 404));

  if (station.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  station.routes = req.body.routes;
  await station.save();

  res.json({ success: true, data: station.routes, message: 'Routes updated successfully' });
};

