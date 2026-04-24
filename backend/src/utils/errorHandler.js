// Structured error handling utility
const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types with predefined codes
const ErrorTypes = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication errors (401)
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Not found errors (404)
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  FIELD_NOT_FOUND: 'FIELD_NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  
  // Rate limiting errors (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR'
};

// Create specific error functions
const createError = (type, message, details = null) => {
  const errorMap = {
    [ErrorTypes.VALIDATION_ERROR]: { status: 400, message: message || 'Validation failed' },
    [ErrorTypes.INVALID_INPUT]: { status: 400, message: message || 'Invalid input provided' },
    [ErrorTypes.MISSING_REQUIRED_FIELD]: { status: 400, message: message || 'Required field is missing' },
    [ErrorTypes.INVALID_FORMAT]: { status: 400, message: message || 'Invalid data format' },
    
    [ErrorTypes.INVALID_CREDENTIALS]: { status: 401, message: message || 'Invalid credentials' },
    [ErrorTypes.TOKEN_EXPIRED]: { status: 401, message: message || 'Token has expired' },
    [ErrorTypes.TOKEN_INVALID]: { status: 401, message: message || 'Invalid token' },
    [ErrorTypes.UNAUTHORIZED]: { status: 401, message: message || 'Unauthorized access' },
    
    [ErrorTypes.FORBIDDEN]: { status: 403, message: message || 'Access forbidden' },
    [ErrorTypes.INSUFFICIENT_PERMISSIONS]: { status: 403, message: message || 'Insufficient permissions' },
    
    [ErrorTypes.NOT_FOUND]: { status: 404, message: message || 'Resource not found' },
    [ErrorTypes.USER_NOT_FOUND]: { status: 404, message: message || 'User not found' },
    [ErrorTypes.FIELD_NOT_FOUND]: { status: 404, message: message || 'Field not found' },
    [ErrorTypes.RESOURCE_NOT_FOUND]: { status: 404, message: message || 'Resource not found' },
    
    [ErrorTypes.DUPLICATE_RESOURCE]: { status: 409, message: message || 'Resource already exists' },
    [ErrorTypes.EMAIL_ALREADY_EXISTS]: { status: 409, message: message || 'Email already registered' },
    
    [ErrorTypes.RATE_LIMIT_EXCEEDED]: { status: 429, message: message || 'Rate limit exceeded' },
    
    [ErrorTypes.INTERNAL_ERROR]: { status: 500, message: message || 'Internal server error' },
    [ErrorTypes.DATABASE_ERROR]: { status: 500, message: message || 'Database operation failed' },
    [ErrorTypes.EXTERNAL_SERVICE_ERROR]: { status: 500, message: message || 'External service error' },
    [ErrorTypes.FILE_UPLOAD_ERROR]: { status: 500, message: message || 'File upload failed' }
  };
  
  const config = errorMap[type];
  if (!config) {
    return new AppError(message || 'Unknown error', 500, ErrorTypes.INTERNAL_ERROR);
  }
  
  return new AppError(config.message, config.status, type, details);
};

// Error response formatter
const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
  
  // Add details if available
  if (error.details) {
    response.details = error.details;
  }
  
  // Add stack trace in development
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }
  
  return response;
};

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  let error = err;
  
  // Convert non-AppError to AppError
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    error = new AppError(
      error.message || 'Internal server error',
      statusCode,
      ErrorTypes.INTERNAL_ERROR,
      error.details || null
    );
  }
  
  // Log error
  logger.error('Global error handler triggered', {
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    stack: error.stack
  });
  
  // Format and send error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = formatErrorResponse(error, isDevelopment);
  
  res.status(error.statusCode).json(errorResponse);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ErrorTypes,
  createError,
  formatErrorResponse,
  globalErrorHandler,
  asyncHandler
};
