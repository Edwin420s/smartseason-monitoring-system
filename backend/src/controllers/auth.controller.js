const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { validate, validationSchemas } = require('../middleware/validation.middleware');
const { createError, ErrorTypes, asyncHandler } = require('../utils/errorHandler');

const prisma = new PrismaClient();

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user (Admin only in real scenario, but open for demo)
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Validate input
  const validationErrors = validate({ name, email, password, role, phone }, validationSchemas.register);
  if (validationErrors.length > 0) {
    throw createError(ErrorTypes.VALIDATION_ERROR, 'Validation failed', validationErrors);
  }

  // Check if user already exists
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw createError(ErrorTypes.EMAIL_ALREADY_EXISTS);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'AGENT',
      phone,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  // Generate token
  const token = generateToken(user.id, user.role);

  // Log registration
  logger.audit('USER_REGISTERED', user.id, {
    email: user.email,
    role: user.role,
    name: user.name
  });

  res.status(201).json({
    success: true,
    user,
    token,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  const validationErrors = validate({ email, password }, validationSchemas.login);
  if (validationErrors.length > 0) {
    throw createError(ErrorTypes.VALIDATION_ERROR, 'Validation failed', validationErrors);
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createError(ErrorTypes.INVALID_CREDENTIALS);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError(ErrorTypes.INVALID_CREDENTIALS);
  }

  // Generate token
  const token = generateToken(user.id, user.role);

  // Log successful login
  logger.audit('USER_LOGIN', user.id, {
    email: user.email,
    role: user.role,
    ip: req.ip
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    token,
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });
  
  if (!user) {
    throw createError(ErrorTypes.USER_NOT_FOUND);
  }
  
  res.json(user);
});

module.exports = { register, login, getMe };