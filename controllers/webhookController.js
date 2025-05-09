/**
 * Controller for handling Advanta webhook requests
 */

const yomaService = require('../services/yomaService');

/**
 * Process the webhook from Advanta and create a user in Yoma
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 */
async function processWebhook(req, res) {
  try {
    const userData = req.body;
    console.log('Received user data from Advanta:', userData);

    // Create user in Yoma
    const createdUser = await yomaService.createUser(userData);
    
    console.log('User successfully created in Yoma:', createdUser);
    
    // Return success response with Yoma user data
    return res.status(201).json({
      success: true,
      message: 'User successfully created in Yoma',
      user: createdUser
    });
  } catch (error) {
    // Log the full error for debugging
    console.error('Error processing webhook:', error);
    
    if (error.response) {
      // Log detailed API error information
      console.error('API Error Details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      const status = error.response.status || 500;
      const message = error.response.data?.message || 'An error occurred with the Yoma API';
      
      return res.status(status).json({
        success: false,
        error: message,
        details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
      });
    }
    
    // Generic error handling with more details in development
    return res.status(500).json({
      success: false,
      error: 'Internal server error occurred while processing the request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Health check endpoint handler
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 */
function healthCheck(req, res) {
  // Add environment info in development mode
  const envInfo = process.env.NODE_ENV === 'development' 
    ? {
        environment: process.env.NODE_ENV,
        apiUrl: process.env.YOMA_API_URL,
        authUrl: process.env.YOMA_AUTH_URL,
        // Don't include sensitive information like tokens or secrets
      }
    : undefined;
    
  res.status(200).json({ 
    status: 'UP', 
    message: 'Service is running',
    timestamp: new Date().toISOString(),
    ...envInfo
  });
}

module.exports = {
  processWebhook,
  healthCheck
}; 