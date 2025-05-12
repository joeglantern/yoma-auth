/**
 * Routes for webhook endpoints
 */

const express = require('express');
const router = express.Router();

const { verifyAdvantaToken } = require('../middleware/auth');
const { processWebhook } = require('../controllers/webhookController');
const { validateAdvantaWebhook } = require('../validators/webhookValidator');

// Advanta webhook endpoint
router.post(
  '/advanta-webhook',
  verifyAdvantaToken,
  (req, res, next) => {
    // Use the custom validator as middleware
    const validationResult = validateAdvantaWebhook(req);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.error
      });
    }
    next();
  },
  processWebhook
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Service is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for testing
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Advanta-Yoma Integration Service is running',
    endpoints: {
      webhook: '/advanta-webhook',
      health: '/health'
    }
  });
});

module.exports = router; 