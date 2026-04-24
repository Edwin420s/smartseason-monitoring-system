const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { requestLogger, errorLogger } = require('./middleware/logging.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use('/api', generalLimiter.middleware());

// Logging middleware
app.use(requestLogger);

// Serve static files for uploaded images (if using local storage)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/fields', require('./routes/field.routes'));
app.use('/api/updates', require('./routes/update.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/health', require('./routes/health.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error logging middleware
app.use(errorLogger);

// Global error handler
const { globalErrorHandler } = require('./utils/errorHandler');
app.use(globalErrorHandler);

module.exports = app;