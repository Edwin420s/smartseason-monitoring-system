// Simple in-memory rate limiting middleware
const logger = require('../utils/logger');

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.max = options.max || 100; // limit each IP to 100 requests per windowMs
    this.message = options.message || 'Too many requests, please try again later';
    this.resetTimeout = options.resetTimeout || this.windowMs;
    
    this.requests = new Map(); // IP -> { count: number, resetTime: number }
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.resetTimeout);
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(ip);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      // Get or create request record for this IP
      let record = this.requests.get(ip);
      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + this.windowMs };
        this.requests.set(ip, record);
      }
      
      // Increment request count
      record.count++;
      
      // Check if limit exceeded
      if (record.count > this.max) {
        logger.warn('Rate limit exceeded', {
          ip,
          count: record.count,
          max: this.max,
          url: req.originalUrl,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(429).json({
          error: 'Too many requests',
          message: this.message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        });
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.max,
        'X-RateLimit-Remaining': Math.max(0, this.max - record.count),
        'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000)
      });
      
      next();
    };
  }
}

// Stricter rate limiter for authentication endpoints
const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

// General rate limiter for all endpoints
const generalLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

// Stricter rate limiter for update submissions (to prevent spam)
const updateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 update submissions per minute
  message: 'Too many update submissions, please wait before submitting again'
});

module.exports = {
  RateLimiter,
  authLimiter,
  generalLimiter,
  updateLimiter
};
