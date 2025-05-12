const logger = require('../utils/logger');

/**
 * Validate the webhook request from Advanta
 * @param {Object} req - Express request object
 * @returns {Object} Validation result
 */
const validateAdvantaWebhook = (req) => {
  try {
    // Check if request has body
    if (!req.body) {
      return {
        isValid: false,
        error: 'Request body is missing'
      };
    }

    const { shortcode, mobile, message } = req.body;

    // Validate required fields
    if (!shortcode) {
      return {
        isValid: false,
        error: 'Shortcode is required'
      };
    }

    if (!mobile) {
      return {
        isValid: false,
        error: 'Mobile number is required'
      };
    }

    if (!message) {
      return {
        isValid: false,
        error: 'Message is required'
      };
    }

    // Validate message format
    const messageParts = message.split(',');
    const requiredFields = [
      'firstName',
      'surname',
      'countryCodeAlpha2',
      'email',
      'displayName',
      'educationId',
      'genderId',
      'dateOfBirth'
    ];
    
    for (const field of requiredFields) {
      if (!message.includes(`${field}:`)) {
        return {
          isValid: false,
          error: `Message must contain ${field}`
        };
      }
    }

    return {
      isValid: true
    };

  } catch (error) {
    logger.error('Error validating webhook:', error);
    return {
      isValid: false,
      error: 'Invalid request format'
    };
  }
};

module.exports = {
  validateAdvantaWebhook
}; 