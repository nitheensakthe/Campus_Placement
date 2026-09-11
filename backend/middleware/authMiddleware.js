const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_campus_placement_2026');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return sendError(res, 'User no longer exists', 401);
    }

    if (req.user.role === 'student') {
      req.student = await Student.findOne({ userId: req.user._id });
    }

    next();
  } catch (error) {
    return sendError(res, 'Not authorized, token failed or expired', 401);
  }
};

module.exports = { protect };
