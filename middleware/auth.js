const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// ── Protect: verify JWT ───────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 403));
  }

  req.user = user;
  next();
};

// ── Authorize: role-based access ─────────────────────────────────────────────
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. This route is for: ${roles.join(', ')}`, 403)
      );
    }
    next();
  };
};
