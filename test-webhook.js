const axios = require('axios');

// Test both GET and POST methods
async function testWebhook() {
  const baseUrl = 'https://yoma-auth-le50.onrender.com/webhook';
  const testData = {
    shortcode: '22317',
    mobile: '254758009278',
    message: 'start'
  };

  try {
    // Test GET request
    console.log('\nTesting GET request...');
    const getUrl = `${baseUrl}?${new URLSearchParams(testData)}`;
    const getResponse = await axios.get(getUrl);
    console.log('GET Response:', getResponse.data);

    // Test POST request
    console.log('\nTesting POST request...');
    const postResponse = await axios.post(baseUrl, testData);
    console.log('POST Response:', postResponse.data);

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testWebhook(); 