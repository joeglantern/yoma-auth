const cache = require('memory-cache');
const { sendSms } = require('../services/advantaSmsService');
const { getGenderId, getEducationId, registerUser, genderMap, educationMap } = require('../services/yomaService');

// Normalize phone number to international format
const normalizePhoneNumber = (phone) => {
  // Remove any spaces or special characters
  let cleaned = phone.replace(/[^\d]/g, '');
  
  // If starts with 0, replace with +254
  if (cleaned.startsWith('0')) {
    cleaned = '+254' + cleaned.substring(1);
  }
  
  // If starts with 254 without +, add it
  if (cleaned.startsWith('254')) {
    cleaned = '+' + cleaned;
  }
  
  // If no country code detected, assume Kenyan number and add +254
  if (!cleaned.startsWith('+') && !cleaned.startsWith('254')) {
    cleaned = '+254' + cleaned;
  }
  
  return cleaned;
};

// Normalize gender input
const normalizeGender = (input) => {
  const normalized = input.toLowerCase().trim();
  
  // Map common variations to standard format
  const genderMap = {
    'f': 'female',
    'female': 'female',
    'm': 'male',
    'male': 'male',
    'prefer not to say': 'prefer not to say',
    'prefer not': 'prefer not to say',
    'other': 'prefer not to say',
    'none': 'prefer not to say'
  };
  
  return genderMap[normalized] || normalized;
};

// Normalize education level input
const normalizeEducation = (input) => {
  const normalized = input.toLowerCase().trim();
  
  // Map common variations to standard format
  const educationMap = {
    'none': 'no formal education',
    'no education': 'no formal education',
    'no formal': 'no formal education',
    'no formal education': 'no formal education',
    'primary': 'primary',
    'primary school': 'primary',
    'secondary': 'secondary',
    'secondary school': 'secondary',
    'high school': 'secondary',
    'tertiary': 'tertiary',
    'college': 'tertiary',
    'university': 'tertiary'
  };
  
  return educationMap[normalized] || normalized;
};

// Cache keys
const SESSION_CACHE_KEY = 'sms_sessions';

// Session states
const STATES = {
  FIRST_NAME: 'first_name',
  SURNAME: 'surname',
  GENDER: 'gender',
  EDUCATION: 'education',
  COMPLETE: 'complete'
};

// Get user session
const getSession = (phoneNumber) => {
  const sessions = cache.get(SESSION_CACHE_KEY) || {};
  return sessions[phoneNumber];
};

// Save user session
const saveSession = (phoneNumber, sessionData) => {
  const sessions = cache.get(SESSION_CACHE_KEY) || {};
  sessions[phoneNumber] = sessionData;
  cache.put(SESSION_CACHE_KEY, sessions);
};

// Clear user session
const clearSession = (phoneNumber) => {
  const sessions = cache.get(SESSION_CACHE_KEY) || {};
  delete sessions[phoneNumber];
  cache.put(SESSION_CACHE_KEY, sessions);
};

const handleSmsWebhook = async (req, res) => {
  try {
    console.log('Received webhook request:', req.body);
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      ADVANTA_SMS_API_URL: process.env.ADVANTA_SMS_API_URL,
      ADVANTA_PARTNER_ID: process.env.ADVANTA_PARTNER_ID,
      ADVANTA_SHORTCODE: process.env.ADVANTA_SHORTCODE
    });
    
    const { phoneNumber: rawPhoneNumber, message } = req.body;
    
    // Normalize phone number
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
    console.log('Normalized phone number:', phoneNumber);
    
    await processUserInput(phoneNumber, message);
    
    res.json({ success: true, message: 'SMS processed successfully' });
  } catch (error) {
    console.error('Error handling SMS webhook:', {
      error: error.message,
      stack: error.stack,
      details: error.response?.data || error.response || error
    });
    res.status(500).json({ success: false, message: error.message || 'Failed to process SMS' });
  }
};

const processUserInput = async (phoneNumber, message) => {
  let session = getSession(phoneNumber) || {
    state: STATES.FIRST_NAME,
    data: {}
  };

  const input = message.trim();

  switch (session.state) {
    case STATES.FIRST_NAME:
      if (input.toLowerCase() === 'start') {
        await sendSms(phoneNumber, "Welcome to Yoma! What's your first name?");
      } else {
        session.data.firstName = input;
        session.state = STATES.SURNAME;
        saveSession(phoneNumber, session);
        await sendSms(phoneNumber, "Thanks! Now your surname?");
      }
      break;

    case STATES.SURNAME:
      session.data.surname = input;
      session.state = STATES.GENDER;
      saveSession(phoneNumber, session);
      await sendSms(phoneNumber, "Got it. What's your gender? Available options: Female, Male, Prefer not to say");
      break;

    case STATES.GENDER:
      const normalizedGender = normalizeGender(input);
      const genderId = getGenderId(normalizedGender);
      
      if (!genderId) {
        await sendSms(phoneNumber, "Invalid gender. Please choose from: Female, Male, Prefer not to say");
        return;
      }
      
      session.data.gender = genderId;
      session.state = STATES.EDUCATION;
      saveSession(phoneNumber, session);
      await sendSms(phoneNumber, "Now your education level? Available options: No formal education, Primary, Secondary, Tertiary");
      break;

    case STATES.EDUCATION:
      const normalizedEducation = normalizeEducation(input);
      const educationId = getEducationId(normalizedEducation);
      
      if (!educationId) {
        await sendSms(phoneNumber, "Invalid education level. Please choose from: No formal education, Primary, Secondary, Tertiary");
        return;
      }
      
      session.data.education = educationId;
      session.state = STATES.COMPLETE;
      saveSession(phoneNumber, session);

      try {
        await registerUser({
          firstName: session.data.firstName,
          surname: session.data.surname,
          phoneNumber: phoneNumber,
          genderId: session.data.gender,
          educationLevelId: session.data.education,
          countryCodeAlpha2: "KE"
        });
        
        await sendSms(phoneNumber, "Thank you for registering with Yoma!");
        clearSession(phoneNumber);
      } catch (error) {
        console.error('Registration error:', error);
        await sendSms(phoneNumber, error.message || "Sorry, there was an error during registration. Please try again later.");
        clearSession(phoneNumber);
      }
      break;

    default:
      await sendSms(phoneNumber, "Welcome to Yoma! What's your first name?");
      session.state = STATES.FIRST_NAME;
      saveSession(phoneNumber, session);
  }
};

module.exports = {
  handleSmsWebhook
}; 