/**
 * Service for interacting with Yoma API
 */

const axios = require('axios');

// Constants
const YOMA_API_URL = process.env.YOMA_API_URL || 'https://api.yoma.world/api/v3';
// Ensure we're using the correct base URL format from the documentation
const YOMA_STAGE_API_URL = 'https://v3api.stage.yoma.world/api/v3';
const YOMA_PROD_API_URL = 'https://api.yoma.world/api/v3';
const YOMA_AUTH_URL = process.env.YOMA_AUTH_URL || 'https://yoma.world/auth/realms/yoma';

// Determine if we're in stage or production and set the actual API URL accordingly
const API_URL = process.env.YOMA_API_URL?.includes('stage') ? YOMA_STAGE_API_URL : YOMA_PROD_API_URL;

/**
 * Get an authentication token from Yoma's OAuth service
 * @returns {Promise<string>} The access token
 */
async function getAuthToken() {
  // For development mode with placeholder credentials, return a mock token
  if (process.env.NODE_ENV !== 'production' && 
      (process.env.YOMA_CLIENT_ID === 'dev-client-id' || 
       process.env.YOMA_CLIENT_SECRET === 'dev-client-secret')) {
    console.log('Using mock authentication token for development');
    return 'mock-token-for-development';
  }
  
  try {
    if (!process.env.YOMA_CLIENT_ID || !process.env.YOMA_CLIENT_SECRET) {
      throw new Error('Missing YOMA_CLIENT_ID or YOMA_CLIENT_SECRET environment variables');
    }
    
    const tokenResponse = await axios.post(
      `${YOMA_AUTH_URL}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.YOMA_CLIENT_ID,
        client_secret: process.env.YOMA_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Error obtaining Yoma auth token:', error.response?.data || error.message);
    throw new Error('Failed to obtain authentication token from Yoma API: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Create a user in Yoma
 * @param {Object} userData User data received from Advanta
 * @returns {Promise<Object>} The created user object from Yoma
 */
async function createUser(userData) {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    // Prepare payload for Yoma API
    const payload = {
      firstName: userData.firstName,
      surname: userData.surname,
      countryCodeAlpha2: userData.countryCodeAlpha2,
      // Include either email or phoneNumber or both if available
      ...(userData.email && { email: userData.email }),
      ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber }),
      // Optional fields if provided
      ...(userData.displayName && { displayName: userData.displayName }),
      ...(userData.educationId && { educationId: userData.educationId }),
      ...(userData.genderId && { genderId: userData.genderId }),
      ...(userData.dateOfBirth && { dateOfBirth: userData.dateOfBirth })
    };

    console.log('Sending payload to Yoma API:', payload);
    
    // For development mode with mock token, return a mock response
    if (process.env.NODE_ENV !== 'production' && authToken === 'mock-token-for-development') {
      console.log('Using mock response for development');
      return {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        username: userData.email || userData.phoneNumber,
        email: userData.email,
        emailConfirmed: false,
        firstName: userData.firstName,
        surname: userData.surname,
        displayName: userData.displayName || `${userData.firstName} ${userData.surname}`,
        phoneNumber: userData.phoneNumber,
        phoneNumberConfirmed: false,
        countryId: userData.countryCodeAlpha2,
        dateCreated: new Date().toISOString()
      };
    }

    // Send request to Yoma API using the correct URL
    const response = await axios.post(
      `${API_URL}/externalpartner/user`, 
      payload,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating user in Yoma:', error.response?.data || error.message);
    // Rethrow the error for the controller to handle
    throw error;
  }
}

/**
 * Get reference data from Yoma API
 * @param {string} type The type of reference data to get (e.g., 'education', 'gender')
 * @returns {Promise<Array>} The reference data
 */
async function getReferenceData(type) {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    // Use the correct endpoint path based on B2B documentation
    const endpoint = `${API_URL}/lookup/${type}`;
    
    console.log(`Fetching ${type} data from endpoint: ${endpoint}`);
    
    // Send request to Yoma API
    const response = await axios.get(
      endpoint,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    // Log the response data for debugging
    console.log(`Received ${type} data:`, response.data);

    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type} data from Yoma:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getAuthToken,
  createUser,
  getReferenceData
}; 