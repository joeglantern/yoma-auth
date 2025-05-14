/**
 * Tests for the Advanta webhook endpoint
 */

const request = require('supertest');
const app = require('../index');
const axios = require('axios');
const { getReferenceData } = require('../services/yomaService');

// Mock the Yoma service to avoid actual API calls during tests
jest.mock('../services/yomaService', () => ({
  createUser: jest.fn().mockResolvedValue({
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    username: 'Libanjoe7@gmail.com',
    firstName: 'Liban',
    surname: 'Joe',
    email: 'Libanjoe7@gmail.com',
    emailConfirmed: false,
    phoneNumber: '+254758009278',
    phoneNumberConfirmed: false,
    dateOfBirth: '2003-08-03'
  }),
  getReferenceData: jest.fn().mockImplementation((type) => {
    if (type === 'education') {
      return Promise.resolve([
        { id: '1', name: 'Primary School' },
        { id: '2', name: 'Secondary School' },
        { id: '3', name: 'College/University' }
      ]);
    } else if (type === 'gender') {
      return Promise.resolve([
        { id: '1', name: 'Male' },
        { id: '2', name: 'Female' },
        { id: '3', name: 'Other' }
      ]);
    }
    return Promise.resolve([]);
  })
}));

// Mock axios to avoid actual SMS API calls
jest.mock('axios');

describe('Webhook Endpoint', () => {
  // Valid test data for Advanta's format
  const validInitialMessage = {
    shortcode: '22317',
    mobile: '+254758009278',
    message: 'hello'
  };

  const validCompleteDataMessage = {
    shortcode: '22317',
    mobile: '+254758009278',
    message: 'Liban,Joe,Libanjoe7@gmail.com,Liban Joe,2003-08-03,KE,College/University,Male'
  };

  const invalidEducationMessage = {
    shortcode: '22317',
    mobile: '+254758009278',
    message: 'Liban,Joe,Libanjoe7@gmail.com,Liban Joe,2003-08-03,KE,InvalidEducation,Male'
  };

  const invalidGenderMessage = {
    shortcode: '22317',
    mobile: '+254758009278',
    message: 'Liban,Joe,Libanjoe7@gmail.com,Liban Joe,2003-08-03,KE,College/University,InvalidGender'
  };

  const incompleteMessage = {
    shortcode: '22317',
    mobile: '+254758009278',
    message: 'Liban,Joe,Libanjoe7@gmail.com'
  };

  // Mock environment variables
  beforeAll(() => {
    process.env.ADVANTA_TOKEN = 'test-token';
    process.env.ADVANTA_SMS_API_URL = 'https://api.test.com/sms';
    process.env.ADVANTA_SMS_API_KEY = 'test-api-key';
    process.env.DEFAULT_EDUCATION_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    process.env.DEFAULT_GENDER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    
    // Mock axios.post to return success for SMS sending
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  // Reset conversation states between tests
  afterEach(() => {
    // Clear the userConversations map
    const { userConversations } = require('../controllers/webhookController');
    userConversations.clear();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  // Test authentication
  test('returns 401 when no token is provided', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .send(validInitialMessage);
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('returns 401 when an invalid token is provided', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'invalid-token')
      .send(validInitialMessage);
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Test validation
  test('returns 400 when required fields are missing in Advanta format', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send({
        // Missing shortcode
        mobile: '+254758009278',
        message: 'hello'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test the new single-step flow
  test('sends comprehensive instructions when receiving first message', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(validInitialMessage);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Instructions sent to user');
    
    // Check that SMS was sent
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.test.com/sms',
      expect.objectContaining({
        apiKey: 'test-api-key',
        phoneNumber: '+254758009278',
        message: expect.stringContaining('Welcome to Yoma')
      })
    );
    
    // Verify that the SMS message contains education and gender options
    const smsMessage = axios.post.mock.calls[0][1].message;
    expect(smsMessage).toContain('education,gender');
    expect(smsMessage).toContain('Available Education Options');
    expect(smsMessage).toContain('Available Gender Options');
    
    // Verify getReferenceData was called for both education and gender
    expect(getReferenceData).toHaveBeenCalledWith('education');
    expect(getReferenceData).toHaveBeenCalledWith('gender');
  });

  test('handles incomplete data submission', async () => {
    // First send the initial message to start conversation
    await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(validInitialMessage);
    
    // Reset mock to check next call
    axios.post.mockClear();
    
    // Now send incomplete data
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(incompleteMessage);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Check that error SMS was sent
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.test.com/sms',
      expect.objectContaining({
        phoneNumber: '+254758009278',
        message: expect.stringContaining('Information incomplete')
      })
    );
  });

  test('rejects invalid education ID', async () => {
    // First send the initial message to start conversation
    await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(validInitialMessage);
    
    // Reset mock to check next call
    axios.post.mockClear();
    
    // Now send data with invalid education ID
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(invalidEducationMessage);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid education option');
    
    // Check that error SMS was sent
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.test.com/sms',
      expect.objectContaining({
        phoneNumber: '+254758009278',
        message: expect.stringContaining('Invalid education option')
      })
    );
  });

  test('rejects invalid gender ID', async () => {
    // First send the initial message to start conversation
    await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(validInitialMessage);
    
    // Reset mock to check next call
    axios.post.mockClear();
    
    // Now send data with invalid gender ID
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(invalidGenderMessage);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid gender option');
    
    // Check that error SMS was sent
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.test.com/sms',
      expect.objectContaining({
        phoneNumber: '+254758009278',
        message: expect.stringContaining('Invalid gender option')
      })
    );
  });

  test('successfully creates user with complete data in a single step', async () => {
    // First send the initial message to start conversation
    await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(validInitialMessage);
    
    // Reset mock to check next call
    axios.post.mockClear();
    
    // Now send complete data
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(validCompleteDataMessage);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User created successfully');
    
    // Check that userData was properly formatted
    expect(response.body.data.yomaFormat).toBeDefined();
    expect(response.body.data.yomaFormat.firstName).toBe('Liban');
    expect(response.body.data.yomaFormat.surname).toBe('Joe');
    expect(response.body.data.yomaFormat.email).toBe('Libanjoe7@gmail.com');
    expect(response.body.data.yomaFormat.educationId).toBe('3');
    expect(response.body.data.yomaFormat.genderId).toBe('1');
    
    // Check that success SMS was sent
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.test.com/sms',
      expect.objectContaining({
        phoneNumber: '+254758009278',
        message: expect.stringContaining('Thank you')
      })
    );
  });

  // Test health check endpoint
  test('health endpoint returns 200', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
  });
}); 