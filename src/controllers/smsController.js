const { sendSms } = require('../services/advantaSmsService');
const { getGenderId, getEducationId, registerUser } = require('../services/yomaService');
const { STATES, getSession, saveSession, clearSession } = require('../services/sessionService');

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

const handleSmsWebhook = async (req, res) => {
  try {
    // Enhanced request logging
    console.log('\n=== INCOMING SMS WEBHOOK REQUEST ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Content-Type:', req.headers['content-type']);
    console.log('X-Advanta-Token:', req.headers['x-advanta-token']);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query params:', JSON.stringify(req.query, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('================================\n');

    // Check webhook token if provided
    const webhookToken = req.headers['x-advanta-token'];
                        
    if (process.env.ADVANTA_WEBHOOK_TOKEN && 
        webhookToken !== process.env.ADVANTA_WEBHOOK_TOKEN) {
      console.log('Invalid webhook token received:', webhookToken);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid webhook token' 
      });
    }

    let rawPhoneNumber, message;

    // Handle GET requests (Advanta's format)
    if (req.method === 'GET') {
      // Non-interactive format
      if (req.query.mobile && req.query.message) {
        rawPhoneNumber = req.query.mobile;
        message = req.query.message;
        console.log('Non-interactive SMS received:', {
          shortcode: req.query.shortcode || process.env.ADVANTA_SHORTCODE,
          mobile: rawPhoneNumber,
          message
        });
      }
      // Interactive format
      else if (req.query.msisdn && req.query.message) {
        rawPhoneNumber = req.query.msisdn;
        message = req.query.message;
        console.log('Interactive SMS received:', {
          shortcode: req.query.shortcode || process.env.ADVANTA_SHORTCODE,
          msisdn: rawPhoneNumber,
          message,
          partnerId: req.query.partnerId || process.env.ADVANTA_PARTNER_ID
        });
      }
    }
    // Handle POST requests (Advanta's format)
    else if (req.method === 'POST') {
      // Non-interactive format
      if (req.body.mobile && req.body.message) {
        rawPhoneNumber = req.body.mobile;
        message = req.body.message;
        console.log('Non-interactive SMS received:', {
          shortcode: req.body.shortcode || process.env.ADVANTA_SHORTCODE,
          mobile: rawPhoneNumber,
          message
        });
      }
      // Interactive format
      else if (req.body.msisdn && req.body.message) {
        rawPhoneNumber = req.body.msisdn;
        message = req.body.message;
        console.log('Interactive SMS received:', {
          shortcode: req.body.shortcode || process.env.ADVANTA_SHORTCODE,
          msisdn: rawPhoneNumber,
          message,
          partnerId: req.body.partnerId || process.env.ADVANTA_PARTNER_ID
        });
      }
    }

    if (!rawPhoneNumber || !message) {
      console.log('Invalid request format. Expected format:', {
        method: 'GET or POST',
        format1: { shortcode: '22317', mobile: '2547XXXXXXXX', message: 'text' },
        format2: { shortcode: '22317', msisdn: '2547XXXXXXXX', message: 'text', partnerId: '13540' }
      });
      throw new Error('Invalid request format: Missing phone number or message');
    }

    // Normalize phone number
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
    console.log('Normalized phone number:', phoneNumber);
    
    await processUserInput(phoneNumber, message);
    
    // Return success response within 15 seconds as per Advanta's docs
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
  console.log('Processing input for', phoneNumber, ':', message);
  
  let session = getSession(phoneNumber) || {
    state: STATES.FIRST_NAME,
    data: {}
  };

  console.log('Current session state:', session.state);
  const input = message.trim();

  switch (session.state) {
    case STATES.FIRST_NAME:
      if (input.toLowerCase() === 'start') {
        console.log('Received START command, sending welcome message');
        await sendSms(phoneNumber, "Welcome to Yoma! What's your first name?");
        session.state = STATES.FIRST_NAME;
        saveSession(phoneNumber, session);
      } else {
        console.log('Received first name:', input);
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
        
        // Send a friendly success message with next steps
        const successMessage = "🎉 Congratulations! You've successfully registered with Yoma!\n\n" +
          "📱 Check your WhatsApp for an activation link from Yoma. Important: The link is only valid for 12 hours, so please activate your account soon!\n\n" +
          "💫 Tell your friends about Yoma - together we can discover amazing youth opportunities!\n\n" +
          "🌟 Welcome to the Yoma family!";
        
        await sendSms(phoneNumber, successMessage);
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