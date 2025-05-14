/**
 * Test script for the Advanta webhook with optional phone number
 */

// Load environment variables
require('dotenv').config();

// Set NODE_ENV to production to use real API calls
process.env.NODE_ENV = 'production';

const { processWebhook, userConversations } = require('./controllers/webhookController');

// Custom implementation of mock functions since we're not using Jest
function createMockFunction() {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    return mockFn.returnValue;
  };
  mockFn.calls = [];
  mockFn.returnValue = mockFn;
  mockFn.mockReturnValue = function(value) {
    this.returnValue = value;
    return this;
  };
  return mockFn;
}

// Mock Express request and response objects
const createMockReq = (body) => ({
  body
});

const createMockRes = () => {
  const res = {};
  res.status = createMockFunction().mockReturnValue(res);
  res.json = createMockFunction().mockReturnValue(res);
  return res;
};

/**
 * Test the optional phone number feature
 */
async function testOptionalPhoneNumber() {
  try {
    console.log('========== Testing Optional Phone Number Feature ==========');
    
    // 1. Test WITH phone number provided
    await testWithPhoneNumber();
    
    // 2. Test WITHOUT phone number
    await testWithoutPhoneNumber();
    
    console.log('\n========== All Tests Completed ==========');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

/**
 * Test registration WITH a phone number provided
 */
async function testWithPhoneNumber() {
  // Generate unique user details with timestamp
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const senderPhone = '+254700123456';  // Phone number of SMS sender
  const customPhone = '+254799999999';  // Custom phone number provided by user
  
  console.log('\n1. Testing registration WITH phone number provided...');
  
  // Start conversation to get options
  console.log('Starting new conversation to get options...');
  const initialReq = createMockReq({
    shortcode: '22317',
    mobile: senderPhone,
    message: 'hello'
  });
  
  const initialRes = createMockRes();
  await processWebhook(initialReq, initialRes);
  
  // Wait for a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if conversation was stored with options
  if (userConversations.has(senderPhone)) {
    console.log('✓ Conversation state created');
    const conversation = userConversations.get(senderPhone);
    
    if (conversation.educationOptions?.length > 0 && conversation.genderOptions?.length > 0) {
      console.log('✓ Education and gender options received');
      
      // Get first options from each category
      const educationName = conversation.educationOptions[0].name;
      const genderName = conversation.genderOptions[0].name;
      
      // User sends registration WITH custom phone number
      console.log(`Using education: ${educationName}, gender: ${genderName}`);
      console.log(`Custom phone number: ${customPhone}`);
      
      const registrationReq = createMockReq({
        shortcode: '22317',
        mobile: senderPhone,
        message: `Test,User,${testEmail},Test User,2000-01-01,KE,${educationName},${genderName},${customPhone}`
      });
      
      const registrationRes = createMockRes();
      await processWebhook(registrationReq, registrationRes);
      
      // Check if the custom phone number was used
      if (registrationRes.json.calls[0][0].success) {
        const userData = registrationRes.json.calls[0][0].data.yomaFormat;
        if (userData.phoneNumber === customPhone) {
          console.log('✓ Provided phone number was correctly used');
        } else {
          console.log('❌ Provided phone number was not used, got:', userData.phoneNumber);
        }
      } else {
        console.log('❌ Registration failed:', registrationRes.json.calls[0][0].message);
      }
    } else {
      console.log('❌ Failed to get education and gender options');
    }
  } else {
    console.log('❌ Conversation state not created');
  }
}

/**
 * Test registration WITHOUT a phone number
 */
async function testWithoutPhoneNumber() {
  // Generate unique user details with timestamp
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const senderPhone = '+254711123456';  // Different phone to avoid conflicts
  
  console.log('\n2. Testing registration WITHOUT phone number...');
  
  // Start conversation to get options
  console.log('Starting new conversation to get options...');
  const initialReq = createMockReq({
    shortcode: '22317',
    mobile: senderPhone,
    message: 'hello'
  });
  
  const initialRes = createMockRes();
  await processWebhook(initialReq, initialRes);
  
  // Wait for a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if conversation was stored with options
  if (userConversations.has(senderPhone)) {
    console.log('✓ Conversation state created');
    const conversation = userConversations.get(senderPhone);
    
    if (conversation.educationOptions?.length > 0 && conversation.genderOptions?.length > 0) {
      console.log('✓ Education and gender options received');
      
      // Get first options from each category
      const educationName = conversation.educationOptions[0].name;
      const genderName = conversation.genderOptions[0].name;
      
      // User sends registration WITHOUT phone number
      console.log(`Using education: ${educationName}, gender: ${genderName}`);
      console.log('No phone number provided');
      
      const registrationReq = createMockReq({
        shortcode: '22317',
        mobile: senderPhone,
        message: `Test,User,${testEmail},Test User,2000-01-01,KE,${educationName},${genderName}`
      });
      
      const registrationRes = createMockRes();
      await processWebhook(registrationReq, registrationRes);
      
      // Check that no phone number was set
      if (registrationRes.json.calls[0][0].success) {
        const userData = registrationRes.json.calls[0][0].data.yomaFormat;
        if (!userData.phoneNumber) {
          console.log('✓ No phone number was set as expected');
        } else {
          console.log('❌ Phone number was incorrectly set to:', userData.phoneNumber);
        }
      } else {
        console.log('❌ Registration failed:', registrationRes.json.calls[0][0].message);
      }
    } else {
      console.log('❌ Failed to get education and gender options');
    }
  } else {
    console.log('❌ Conversation state not created');
  }
}

// Run the test
testOptionalPhoneNumber(); 