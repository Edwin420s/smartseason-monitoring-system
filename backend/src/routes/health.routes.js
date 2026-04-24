const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SmartSeason Backend API',
    version: '1.0.0'
  });
});

module.exports = router;
