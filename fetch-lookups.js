require('dotenv').config();
const axios = require('axios');

const getAccessToken = async () => {
  try {
    const response = await axios.post(`${process.env.YOMA_AUTH_URL}/protocol/openid-connect/token`, 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.YOMA_CLIENT_ID,
        client_secret: process.env.YOMA_CLIENT_SECRET
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
};

const fetchLookups = async () => {
  try {
    const token = await getAccessToken();
    
    // Fetch genders
    console.log('\nFetching gender options...');
    const genderResponse = await axios.get(`${process.env.YOMA_API_URL}/lookup/gender`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Available genders:');
    console.log(JSON.stringify(genderResponse.data, null, 2));

    // Fetch education levels
    console.log('\nFetching education levels...');
    const educationResponse = await axios.get(`${process.env.YOMA_API_URL}/lookup/education`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Available education levels:');
    console.log(JSON.stringify(educationResponse.data, null, 2));

  } catch (error) {
    console.error('Error fetching lookups:', error.response?.data || error.message);
  }
};

fetchLookups(); 