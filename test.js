require('dotenv').config();
process.env.NODE_ENV = 'test';

const axios = require('axios');

// Generate a random phone number in the format 07XXXXXXXX
const generateTestPhone = () => {
  const randomNum = Math.floor(Math.random() * 10000000);
  return `07${String(randomNum).padStart(7, '0')}`;
};

const testPhone = generateTestPhone();
const baseUrl = 'http://localhost:3000';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const simulateSms = async (phoneNumber, message) => {
  try {
    const response = await axios.post(`${baseUrl}/sms/webhook`, {
      phoneNumber,
      message
    });
    console.log(`SMS to ${phoneNumber}: ${message}`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};

const runTest = async () => {
  try {
    console.log('\nStarting test with phone number:', testPhone);
    console.log('(This should be automatically converted to international format)');

    console.log('\n1. Starting registration flow...');
    await simulateSms(testPhone, 'start');
    await delay(1000);

    console.log('\n2. Sending first name...');
    await simulateSms(testPhone, 'John');
    await delay(1000);

    console.log('\n3. Sending surname...');
    await simulateSms(testPhone, 'Doe');
    await delay(1000);

    console.log('\n4. Testing gender with mixed case...');
    await simulateSms(testPhone, 'MaLe');
    await delay(1000);

    console.log('\n5. Testing education level with alternative format...');
    await simulateSms(testPhone, 'HIGH SCHOOL');
    await delay(1000);

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run the test
runTest(); 