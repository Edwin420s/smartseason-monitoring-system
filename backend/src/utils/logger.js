const fs = require('fs');
const path = require('path');

// Simple logging utility for production monitoring
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }

  writeToFile(filename, content) {
    const filepath = path.join(this.logDir, filename);
    fs.appendFileSync(filepath, content + '\n');
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('INFO', message, meta);
    console.log(formatted);
    this.writeToFile('app.log', formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('WARN', message, meta);
    console.warn(formatted);
    this.writeToFile('app.log', formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('ERROR', message, meta);
    console.error(formatted);
    this.writeToFile('error.log', formatted);
  }

  // Audit logging for important actions
  audit(action, userId, details = {}) {
    const auditData = {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    };
    const formatted = this.formatMessage('AUDIT', `${action} by user ${userId}`, auditData);
    console.log(formatted);
    this.writeToFile('audit.log', formatted);
  }

  // API request logging
  apiRequest(method, url, userId, statusCode, responseTime) {
    const apiData = {
      method,
      url,
      userId,
      statusCode,
      responseTime: `${responseTime}ms`
    };
    const formatted = this.formatMessage('API', `${method} ${url}`, apiData);
    console.log(formatted);
    this.writeToFile('api.log', formatted);
  }
}

module.exports = new Logger();
