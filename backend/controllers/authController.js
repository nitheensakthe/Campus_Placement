const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_campus_placement_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, registerNumber, department, cgpa, graduationYear, phone, companyName } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email and password are required', 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'User with this email already exists', 409);
    }

    const userRole = role || 'student';
    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    let studentProfile = null;
    let companyProfile = null;

    if (userRole === 'student') {
      studentProfile = await Student.create({
        userId: user._id,
        registerNumber: registerNumber || `REG-${Date.now().toString().slice(-6)}`,
        department: department || 'Computer Science',
        cgpa: cgpa || 7.5,
        graduationYear: graduationYear || 2026,
        phone: phone || ''
      });
    } else if (userRole === 'recruiter') {
      companyProfile = await Company.create({
        name: companyName || `${name}'s Company`,
        description: 'Leading global enterprise',
        website: 'https://example.com',
        industry: 'Technology',
        location: 'Remote / Hybrid',
        recruiterId: user._id
      });
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 'User registered successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      student: studentProfile,
      company: companyProfile,
      token
    }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user._id);
    let studentProfile = null;
    let companyProfile = null;

    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      companyProfile = await Company.findOne({ recruiterId: user._id });
    }

    return sendSuccess(res, 'Login successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      student: studentProfile,
      company: companyProfile,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let studentProfile = null;
    let companyProfile = null;

    if (req.user.role === 'student') {
      studentProfile = await Student.findOne({ userId: req.user._id });
    } else if (req.user.role === 'recruiter') {
      companyProfile = await Company.findOne({ recruiterId: req.user._id });
    }

    return sendSuccess(res, 'Current user data retrieved', {
      user: req.user,
      student: studentProfile,
      company: companyProfile
    });
  } catch (error) {
    next(error);
  }
};
