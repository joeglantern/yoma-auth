/**
 * Controller for handling Advanta webhook requests
 */

/**
 * Process the webhook from Advanta
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 */
async function processWebhook(req, res) {
  try {
    const userData = req.body;
    console.log('Received user data from Advanta:', userData);

    // Return success response with received data
    return res.status(201).json({
      success: true,
      message: 'Data received successfully',
      data: userData
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error occurred while processing the request'
    });
  }
}

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