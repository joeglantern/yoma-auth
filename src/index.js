require('dotenv').config();
const express = require('express');
const { handleSmsWebhook } = require('./controllers/smsController');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Time:', new Date().toISOString());
  console.log('IP:', req.ip);
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('======================\n');
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: '*/*' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Yoma SMS webhook service is running',
    shortcode: process.env.ADVANTA_SHORTCODE,
    webhook: '/sms/webhook'
  });
});

// Routes
app.all('/sms/webhook', handleSmsWebhook);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Webhook URL:', `https://yoma-auth-le50.onrender.com/sms/webhook`);
  console.log('Shortcode:', process.env.ADVANTA_SHORTCODE);
}); 