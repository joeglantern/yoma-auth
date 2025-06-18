require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method === 'GET') {
    console.log('Query:', JSON.stringify(req.query, null, 2));
  } else {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('======================\n');
  next();
});

// Shortcode webhook handler
app.all('/webhook', async (req, res) => {
  try {
    console.log('Processing shortcode message...');
    
    // Extract message data based on request method
    const messageData = req.method === 'GET' ? req.query : req.body;
    
    // Validate required fields
    if (!messageData.shortcode || !messageData.message || !(messageData.mobile || messageData.msisdn)) {
      console.log('Invalid request format:', messageData);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Required: shortcode, mobile/msisdn, message'
      });
    }

    // Log the received message
    console.log('Received message:', {
      shortcode: messageData.shortcode,
      mobile: messageData.mobile || messageData.msisdn,
      message: messageData.message,
      partnerId: messageData.partnerId
    });

    // Process the message
    const response = await processMessage(messageData);

    // Send response back to Advanta (they will forward this to the user)
    res.json({
      success: true,
      message: response
    });

  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// Message processing function
async function processMessage(data) {
  const phoneNumber = data.mobile || data.msisdn;
  const message = data.message.trim().toLowerCase();

  // Simple response logic
  if (message === 'start') {
    return "Welcome to Yoma! What's your first name?";
  }
  
  return "Thank you for your message. We'll get back to you soon.";
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Webhook URL:', `https://yoma-auth-le50.onrender.com/webhook`);
  console.log('Shortcode:', process.env.ADVANTA_SHORTCODE);
  console.log('Environment:', process.env.NODE_ENV);
}); 