/**
 * Test script to verify Yoma API integration for user creation
 */

// Load environment variables
require('dotenv').config();

const { createUser, getReferenceData, getAuthToken } = require('./services/yomaService');

async function testYomaApi() {
  try {
    console.log('Testing Yoma API integration...');
    
    // First test authentication
    console.log('\n1. Testing authentication...');
    const token = await getAuthToken();
    console.log('✓ Authentication successful, got token:', token.substring(0, 20) + '...');
    
    // Test getting reference data for education and gender
    console.log('\n2. Fetching education options...');
    const educationOptions = await getReferenceData('education');
    console.log('✓ Received education options:', educationOptions.map(e => `${e.id}: ${e.name}`).join(', '));
    
    console.log('\n3. Fetching gender options...');
    const genderOptions = await getReferenceData('gender');
    console.log('✓ Received gender options:', genderOptions.map(g => `${g.id}: ${g.name}`).join(', '));
    
    // Use the first education and gender option for the test user
    const educationId = educationOptions[0]?.id;
    const genderId = genderOptions[0]?.id;
    
    // Create a test user with timestamp to make email unique
    const timestamp = Date.now();
    const testUser = {
      firstName: 'Test',
      surname: 'User',
      email: `testuser${timestamp}@example.com`,
      phoneNumber: '+254700000000',
      displayName: 'Test User',
      dateOfBirth: '2000-01-01',
      countryCodeAlpha2: 'KE',
      educationId,
      genderId
    };
    
    console.log('\n4. Creating test user with data:', testUser);
    
    // Create the user
    const createdUser = await createUser(testUser);
    console.log('✓ User created successfully!');
    console.log('User details:', JSON.stringify(createdUser, null, 2));
    
    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
  }
}

// Run the test
testYomaApi(); 