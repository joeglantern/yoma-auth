const axios = require('axios');

const sendSms = async (phoneNumber, message) => {
  try {
    // For testing purposes, just log the message
    if (process.env.NODE_ENV === 'test') {
      console.log(`SMS to ${phoneNumber}: ${message}`);
      return true;
    }

    const response = await axios.post(process.env.ADVANTA_SMS_API_URL, {
      apikey: process.env.ADVANTA_SMS_API_KEY,
      partnerID: process.env.ADVANTA_PARTNER_ID,
      shortcode: process.env.ADVANTA_SHORTCODE,
      message: message,
      mobile: phoneNumber
    });

    if (response.data.status !== 'success') {
      throw new Error(`SMS sending failed: ${response.data.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    // Don't throw error during testing
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    throw new Error('Failed to send SMS');
  }
};

module.exports = {
  sendSms
}; 