/**
 * Routes for webhook endpoints
 */

const express = require('express');
const router = express.Router();

const { verifyAdvantaToken } = require('../middleware/auth');
const { validateWebhookPayload, checkValidationResult } = require('../middleware/validation');
const webhookController = require('../controllers/webhookController');

// Webhook endpoint with authentication and validation middleware
router.post(
  '/advanta-webhook',
  verifyAdvantaToken,
  validateWebhookPayload,
  checkValidationResult,
  webhookController.processWebhook
);

// Health check endpoint
router.get('/health', webhookController.healthCheck);

module.exports = router; 