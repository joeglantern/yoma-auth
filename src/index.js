require('dotenv').config();
const express = require('express');
const { handleSmsWebhook } = require('./controllers/smsController');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/sms/webhook', handleSmsWebhook);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 