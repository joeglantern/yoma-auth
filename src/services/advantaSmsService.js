const axios = require('axios');

const sendSms = async (phoneNumber, message) => {
  try {
    // For testing purposes, just log the message
    if (process.env.NODE_ENV === 'test') {
      console.log(`SMS to ${phoneNumber}: ${message}`);
      return true;
    }

    // Validate required environment variables
    const requiredEnvVars = {
      ADVANTA_SMS_API_URL: process.env.ADVANTA_SMS_API_URL,
      ADVANTA_SMS_API_KEY: process.env.ADVANTA_SMS_API_KEY,
      ADVANTA_PARTNER_ID: process.env.ADVANTA_PARTNER_ID,
      ADVANTA_SHORTCODE: process.env.ADVANTA_SHORTCODE
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    const response = await axios.post(process.env.ADVANTA_SMS_API_URL, {
      apikey: process.env.ADVANTA_SMS_API_KEY,
      partnerID: process.env.ADVANTA_PARTNER_ID,
      shortcode: process.env.ADVANTA_SHORTCODE,
      message: message,
      mobile: phoneNumber
    });

    console.log('Advanta SMS API response:', response.data);

    // Check if any response in the responses array has a response-code of 200
    if (response.data.responses && Array.isArray(response.data.responses)) {
      const successfulResponse = response.data.responses.some(r => r['response-code'] === 200);
      if (!successfulResponse) {
        throw new Error(`SMS sending failed: ${JSON.stringify(response.data)}`);
      }
    } else {
      throw new Error(`Unexpected response format: ${JSON.stringify(response.data)}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    // Don't throw error during testing
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    throw error; // Throw the original error to preserve the stack trace and details
  }
};

module.exports = {
  sendSms
}; 