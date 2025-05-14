/**
 * Advanta-Yoma Integration Service
 * 
 * A Node.js backend service that receives webhook notifications from Advanta
 * and registers users with the Yoma B2B API.
 */

const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set default NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Import routes
const webhookRoutes = require('./routes/webhookRoutes');

// Import conversation cleanup
const { setupPeriodicCleanup } = require('./utils/conversationCleanup');
const { userConversations } = require('./controllers/webhookController');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/', webhookRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Start the server if this file is run directly (not imported by tests)
if (require.main === module) {
  // Constants
  const PORT = process.env.PORT || 3000;
  
  // Set up conversation cleanup (run every 15 minutes, expire after 30 minutes)
  setupPeriodicCleanup(userConversations);

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
    console.log(`Webhook endpoint available at: http://localhost:${PORT}/advanta-webhook`);
  });
}

// Export for testing purposes
module.exports = app; 