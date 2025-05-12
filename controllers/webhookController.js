/**
 * Controller for handling Advanta webhook requests
 */

const logger = require('../utils/logger');

/**
 * Process webhook data from Advanta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processWebhook = async (req, res) => {
  try {
    // Extract data from Advanta's format
    const { shortcode, mobile, message } = req.body;
    logger.info('Received webhook data:', { shortcode, mobile, message });

    // Parse the message to extract user info
    // Expected format: "firstName:John,surname:Doe,email:john@example.com,displayName:John Doe,educationId:uuid,genderId:uuid,dateOfBirth:2000-01-01,countryCodeAlpha2:KE"
    const userInfo = {};
    const messageParts = message.split(',');
    
    for (const part of messageParts) {
      const [key, value] = part.split(':');
      if (key && value) {
        userInfo[key.trim()] = value.trim();
      }
    }

    // Convert to Yoma format
    const yomaFormat = {
      firstName: userInfo.firstName,
      surname: userInfo.surname,
      phoneNumber: mobile, // Use the mobile from Advanta
      email: userInfo.email,
      displayName: userInfo.displayName,
      educationId: userInfo.educationId,
      genderId: userInfo.genderId,
      dateOfBirth: userInfo.dateOfBirth,
      countryCodeAlpha2: userInfo.countryCodeAlpha2
    };

    logger.info('Converted to Yoma format:', yomaFormat);

    // Return success response with both original and converted data
    return res.status(200).json({
      success: true,
      message: 'Data received and converted successfully',
      data: {
        original: {
          shortcode,
          mobile,
          message
        },
        yomaFormat
      }
    });

  } catch (error) {
    logger.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Health check endpoint handler
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 */
function healthCheck(req, res) {
  res.status(200).json({ 
    status: 'UP', 
    message: 'Service is running',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  processWebhook,
  healthCheck
}; 