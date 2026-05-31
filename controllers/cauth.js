
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendWelcomeEmail } = require('../utils/email');


const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      neighborhood: user.neighborhood,
      avatar: user.avatar,
      phone: user.phone,
      businessName: user.businessName,
    },
  });
};


exports.register = async (req, res, next) => {
  const { name, email, password, role, neighborhood, phone, businessName } = req.body;

  // Prevent self-assigning admin role
  const safeRole = role === 'admin' ? 'resident' : role || 'resident';

  const user = await User.create({ name, email, password, role: safeRole, neighborhood, phone, businessName });

  // Send welcome email (non-blocking — don't fail registration if email fails)
  sendWelcomeEmail({ userEmail: email, userName: name, role: safeRole }).catch(err =>
    console.warn('Welcome email failed:', err.message)
  );

  sendToken(user, 201, res);
};


exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppError('Invalid email or password', 401));

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new AppError('Invalid email or password', 401));

  if (!user.isActive) return next(new AppError('Your account has been deactivated. Contact support.', 403));

  sendToken(user, 200, res);
};


exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
};


exports.updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) return next(new AppError('Current password is incorrect', 401));

  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
};
