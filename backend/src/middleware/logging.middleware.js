const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request start
  logger.info(`${req.method} ${req.originalUrl} - Request started`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    logger.apiRequest(
      req.method,
      req.originalUrl,
      req.user?.id || 'anonymous',
      res.statusCode,
      responseTime
    );
    
    // Call original end
    originalEnd.apply(this, args);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'anonymous',
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};
