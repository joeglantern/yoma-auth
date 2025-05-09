/**
 * Tests for the Advanta webhook endpoint
 */

const request = require('supertest');
const app = require('../index');

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
  })
}));

describe('Webhook Endpoint', () => {
  // Valid test data
  const validUserData = {
    firstName: 'Liban',
    surname: 'Joe',
    email: 'Libanjoe7@gmail.com',
    phoneNumber: '+254758009278',
    countryCodeAlpha2: 'KE',
    dateOfBirth: '2003-08-03'
  };

  // Mock environment variables
  beforeAll(() => {
    process.env.ADVANTA_TOKEN = 'test-token';
  });

  // Test authentication
  test('returns 401 when no token is provided', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .send(validUserData);
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('returns 401 when an invalid token is provided', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'invalid-token')
      .send(validUserData);
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Test validation
  test('returns 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send({
        firstName: 'Liban',
        // Missing surname and contact info
        countryCodeAlpha2: 'KE'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('returns 400 when neither email nor phone is provided', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send({
        firstName: 'Liban',
        surname: 'Joe',
        countryCodeAlpha2: 'KE'
        // Missing both email and phoneNumber
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test successful creation
  test('returns 201 with user data on successful creation', async () => {
    const response = await request(app)
      .post('/advanta-webhook')
      .set('X-Advanta-Token', 'test-token')
      .send(validUserData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.firstName).toBe('Liban');
    expect(response.body.user.surname).toBe('Joe');
    expect(response.body.user.email).toBe('Libanjoe7@gmail.com');
    expect(response.body.user.phoneNumber).toBe('+254758009278');
    expect(response.body.user.dateOfBirth).toBe('2003-08-03');
  });

  // Test health check endpoint
  test('health endpoint returns 200', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
  });
}); 