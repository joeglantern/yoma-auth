/**
 * Test script for the Advanta webhook integration
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
 * Test the complete webhook flow
 */
async function testWebhook() {
  try {
    console.log('========== Testing Webhook Flow ==========');
    
    // 1. Initial message test
    console.log('\n1. Testing initial message response...');
    const initialReq = createMockReq({
      shortcode: '22317',
      mobile: '+254700123456',
      message: 'hello'
    });
    
    const initialRes = createMockRes();
    
    await processWebhook(initialReq, initialRes);
    
    console.log('Initial response status:', initialRes.status.calls[0][0]);
    console.log('Initial response data:', JSON.stringify(initialRes.json.calls[0][0], null, 2));
    
    // Check if conversation was stored
    if (userConversations.has('+254700123456')) {
      console.log('✓ Conversation state created');
      const conversation = userConversations.get('+254700123456');
      console.log('Conversation state:', {
        state: conversation.state,
        optionsReceived: conversation.educationOptions.length > 0 && conversation.genderOptions.length > 0,
        educationCount: conversation.educationOptions.length,
        genderCount: conversation.genderOptions.length
      });
    } else {
      console.log('❌ Conversation state not created');
    }
    
    // Wait for a bit to simulate user thinking and typing
    console.log('\nWaiting for 2 seconds to simulate user response time...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. User registration test with complete data
    console.log('\n2. Testing user registration with complete data...');
    
    // Get education and gender options from the stored conversation
    const conversation = userConversations.get('+254700123456');
    const educationName = conversation.educationOptions[0].name;
    const genderName = conversation.genderOptions[0].name;
    
    console.log(`Using first education option: ${educationName}`);
    console.log(`Using first gender option: ${genderName}`);
    
    const registrationReq = createMockReq({
      shortcode: '22317',
      mobile: '+254700123456',
      message: `Test,User,testuser${Date.now()}@example.com,Test User,2000-01-01,KE,${educationName},${genderName}`
    });
    
    const registrationRes = createMockRes();
    
    await processWebhook(registrationReq, registrationRes);
    
    console.log('Registration response status:', registrationRes.status.calls[0][0]);
    console.log('Registration response data:', JSON.stringify(registrationRes.json.calls[0][0], null, 2));
    
    // Check if conversation was cleared
    if (!userConversations.has('+254700123456')) {
      console.log('✓ Conversation state cleared after successful registration');
    } else {
      console.log('❌ Conversation state not cleared after registration');
    }
    
    console.log('\n========== Test Completed ==========');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testWebhook(); 