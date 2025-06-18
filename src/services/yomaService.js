const axios = require('axios');
const cache = require('memory-cache');

// Cache keys
const TOKEN_CACHE_KEY = 'yoma_access_token';
const GENDER_CACHE_KEY = 'yoma_genders';
const EDUCATION_CACHE_KEY = 'yoma_education_levels';

// Cache TTL (1 hour for lookups, token TTL will be set based on expires_in)
const LOOKUP_CACHE_TTL = 60 * 60 * 1000;

// Mapping objects for quick lookups with actual IDs from Yoma API
const genderMap = {
  'female': '6342c98a-0572-4e6a-a4fb-a1aeafd3c053',
  'male': '6dbd31e9-5196-49ca-8d3b-8354a9bff996',
  'prefer not to say': '26ba24a5-9209-48b2-a885-95c43ef142b5'
};

const educationMap = {
  'no formal education': 'd306bea3-04aa-4778-969f-4f92da45559e',
  'primary': 'beebea3b-381e-4bd8-91d8-319089ab14da',
  'secondary': '5642e521-34b9-4dc8-bffa-b975f5c95d99',
  'tertiary': '2c0f0175-7007-40bf-9bf9-6d15b793bc09'
};

const getAccessToken = async () => {
  let token = cache.get(TOKEN_CACHE_KEY);
  if (token) return token;

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

    token = response.data.access_token;
    
    // Default to 1 hour if expires_in is not provided or invalid
    const expiresIn = response.data.expires_in || 3600;
    const ttl = Math.max((expiresIn - 300) * 1000, 60000); // At least 1 minute, 5 minutes less than expiry
    
    cache.put(TOKEN_CACHE_KEY, token, ttl);
    return token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
};

// Initialize the mappings by fetching from Yoma API
const initializeMappings = async () => {
  try {
    const token = await getAccessToken();

    // Fetch and map genders
    const genderResponse = await axios.get(`${process.env.YOMA_API_URL}/lookup/gender`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    genderResponse.data.forEach(gender => {
      const key = gender.name.toLowerCase();
      if (key in genderMap) {
        genderMap[key] = gender.id;
      }
    });
    console.log('Gender mappings initialized:', genderMap);

    // Fetch and map education levels
    const educationResponse = await axios.get(`${process.env.YOMA_API_URL}/lookup/education`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    educationResponse.data.forEach(education => {
      const key = education.name.toLowerCase();
      if (key in educationMap) {
        educationMap[key] = education.id;
      }
    });
    console.log('Education mappings initialized:', educationMap);

  } catch (error) {
    console.error('Error initializing mappings:', error);
    throw new Error('Failed to initialize ID mappings');
  }
};

const getGenderId = (genderInput) => {
  const key = genderInput.toLowerCase();
  return genderMap[key] || null;
};

const getEducationId = (educationInput) => {
  const key = educationInput.toLowerCase();
  return educationMap[key] || null;
};

const registerUser = async (userData) => {
  try {
    const token = await getAccessToken();
    const response = await axios.post(
      `${process.env.YOMA_API_URL}/externalpartner/user`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle validation errors
      if (Array.isArray(errorData) && errorData[0]?.type === 'ValidationException') {
        throw new Error(errorData[0].message);
      }
      
      // Handle other API errors
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    }
    
    throw new Error('Failed to register user');
  }
};

// Initialize mappings when the service starts
initializeMappings().catch(console.error);

module.exports = {
  getGenderId,
  getEducationId,
  registerUser,
  initializeMappings, // Export for testing
  genderMap,         // Export for testing
  educationMap       // Export for testing
}; 