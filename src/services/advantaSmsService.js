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

    // Format phone number for Advanta API (remove '+' if present)
    const formattedPhone = phoneNumber.replace(/^\+/, '');

    // Log the full request details
    console.log('Sending SMS request:', {
      url: process.env.ADVANTA_SMS_API_URL,
      params: {
        apikey: process.env.ADVANTA_SMS_API_KEY,
        partnerID: process.env.ADVANTA_PARTNER_ID,
        shortcode: process.env.ADVANTA_SHORTCODE,
        message: message,
        mobile: formattedPhone
      }
    });

    const response = await axios.post(process.env.ADVANTA_SMS_API_URL, {
      apikey: process.env.ADVANTA_SMS_API_KEY,
      partnerID: process.env.ADVANTA_PARTNER_ID,
      shortcode: process.env.ADVANTA_SHORTCODE,
      message: message,
      mobile: formattedPhone
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Enhanced response logging
    console.log('Advanta SMS API full response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });

    // Check response format and status
    if (response.data.responses && Array.isArray(response.data.responses)) {
      const successfulResponse = response.data.responses.some(r => r['response-code'] === 200);
      if (!successfulResponse) {
        throw new Error(`SMS sending failed: ${JSON.stringify(response.data)}`);
      }
    } else if (response.data.status === 'success' || response.status === 200) {
      // Alternative success check
      console.log('SMS sent successfully');
      return true;
    } else {
      throw new Error(`Unexpected response format: ${JSON.stringify(response.data)}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
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