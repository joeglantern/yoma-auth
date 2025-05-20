/**
 * Service for interacting with Advanta SMS API
 */

const axios = require('axios');
const logger = require('../utils/logger');

// Constants
const ADVANTA_SMS_API_URL = process.env.ADVANTA_SMS_API_URL || 'https://api.advantasms.com/send';
const ADVANTA_SMS_API_KEY = process.env.ADVANTA_SMS_API_KEY;
const ADVANTA_PARTNER_ID = process.env.ADVANTA_PARTNER_ID;
const ADVANTA_SHORTCODE = process.env.ADVANTA_SHORTCODE;

/**
 * Send SMS using Advanta SMS API
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message to send
 * @returns {Promise<Object>} - API response
 */
async function sendSMS(phoneNumber, message) {
    try {
        const response = await axios.post(ADVANTA_SMS_API_URL, {
            partnerID: ADVANTA_PARTNER_ID,
            apikey: ADVANTA_SMS_API_KEY,
            shortcode: ADVANTA_SHORTCODE,
            mobile: phoneNumber,
            message: message
        });

        // Extract messageId from the nested response
        const messageId = response.data.responses?.[0]?.messageid;

        logger.info('SMS sent successfully', {
            phoneNumber,
            messageId,
            response: response.data
        });

        return response.data;
    } catch (error) {
        logger.error('Failed to send SMS', {
            error: error.message,
            phoneNumber
        });
        throw error;
    }
}

module.exports = {
    sendSMS
}; 