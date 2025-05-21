/**
 * Controller for handling Advanta webhook requests
 */

const logger = require('../utils/logger');
const { createUser, getReferenceData } = require('../services/yomaService');
const { formatKenyanPhoneNumber } = require('../utils/phoneFormatter');
const { sendSMS } = require('../services/advantaSMSService');
const onboardingService = require('../services/onboardingService');

// Store conversation state for users
const userConversations = new Map();

/**
 * Sends a response message back to the user via Advanta API
 * @param {string} mobile - The user's phone number
 * @param {string} message - The message to send
 */
async function sendResponseMessage(mobile, message) {
  try {
    // Check if ADVANTA_SMS_API_URL and ADVANTA_SMS_API_KEY are defined
    if (!process.env.ADVANTA_SMS_API_URL || !process.env.ADVANTA_SMS_API_KEY) {
      logger.error('Missing Advanta SMS API configuration');
      return;
    }

    // Send message using Advanta SMS API
    await sendSMS(mobile, message);
    
    logger.info(`Response message sent to ${mobile}`);
  } catch (error) {
    logger.error('Error sending response message:', error);
  }
}

/**
 * Process webhook data from Advanta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processWebhook = async (req, res) => {
  try {
    const { shortcode, mobile, message } = req.body;
    
    // Validate required fields
    if (!shortcode || !mobile || !message) {
      logger.error('Missing required fields', { body: req.body });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Format phone number
    const formattedPhone = formatKenyanPhoneNumber(mobile);
    
    // Get reference data
    const referenceData = await getReferenceData("education");
    
    // Check if this is a new user
    if (message.toLowerCase() === 'start' || message.toLowerCase() === 'hi') {
      try {
        // Fetch education and gender options from Yoma
        logger.info('Fetching education and gender options for new conversation');
        const educationOptions = await getReferenceData('education');
        const genderOptions = await getReferenceData('gender');
        
        // Build instructions including all options
        let instructionsMessage = "Welcome to Yoma Kenya! Please provide your information in the following format:\n" +
          "firstName,surname,email,displayName,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2,education,gender[,phoneNumber]\n\n" +
          "Example: John,Doe,john.doe@example.com,John Doe,2003-08-03,KE,College/University,Male\n\n" +
          "Note: For displayName, you can leave it empty by using two commas (,,) and we'll use your first and last name.\n\n" +
          "Available Education Options (use the exact name):\n";
          
        educationOptions.forEach((option) => {
          instructionsMessage += `${option.name}\n`;
        });
        
        instructionsMessage += "\nAvailable Gender Options (use the exact name):\n";
        genderOptions.forEach((option) => {
          instructionsMessage += `${option.name}\n`;
        });
        
        // Store options in conversation state for later validation
        userConversations.set(formattedPhone, { 
          state: 'awaiting_all_info',
          timestamp: Date.now(),
          educationOptions,
          genderOptions
        });
        
        // Send instructions to user
        await sendResponseMessage(formattedPhone, instructionsMessage);
        
        return res.json({ success: true, message: 'Welcome message sent' });
      } catch (error) {
        logger.error('Error fetching options:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch education and gender options' 
        });
      }
    }

    // Check if this is a new conversation or restart
    if (!userConversations.has(formattedPhone) || message.toLowerCase().trim() === 'restart') {
      try {
        // Fetch education and gender options from Yoma
        logger.info('Fetching education and gender options for new conversation');
        const educationOptions = await getReferenceData('education');
        const genderOptions = await getReferenceData('gender');
        
        // Build instructions including all options
        let instructionsMessage = "Welcome to Yoma Kenya! Please provide your information in the following format:\n" +
          "firstName,surname,email,Username,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2,education,gender\n\n" +
          "Example: John,Doe,john@example.com,John Doe,2003-08-03,KE,Secondary,Male\n\n" +
          "Available Education Options (use the exact name):\n";
          
        educationOptions.forEach((option) => {
          instructionsMessage += `${option.name}\n`;
        });
        
        // Store options in conversation state for later validation
        userConversations.set(formattedPhone, { 
          state: 'awaiting_all_info',
          timestamp: Date.now(),
          educationOptions,
          genderOptions
        });
        
        // Send instructions to user
        await sendResponseMessage(formattedPhone, instructionsMessage);
        
        // Respond to Advanta that we're handling it
        return res.status(200).json({
          success: true,
          message: 'Instructions sent to user'
        });
      } catch (error) {
        logger.error('Error fetching options:', error);
        
        // If we can't fetch options, send basic instructions
        const fallbackInstructions = 
          "Welcome to Yoma! Please provide your information in the following format:\n" +
          "firstName,surname,email,displayName,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2[,phoneNumber]\n\n" +
          "Example: Liban,Joe,Libanjoe7@gmail.com,Liban Joe,2003-08-03,KE\n\n" +
          "Note: displayName can be left empty by using two commas (,,). phoneNumber is optional. If provided, it will be used for account registration; otherwise, no phone number will be associated with the account.";
          
        // Store in conversation state
        userConversations.set(formattedPhone, { 
          state: 'awaiting_all_info',
          timestamp: Date.now(),
          useFallback: true
        });
        
        // Send fallback instructions
        await sendResponseMessage(formattedPhone, fallbackInstructions);
        
        return res.status(200).json({
          success: true,
          message: 'Fallback instructions sent to user'
        });
      }
    }

    // Get the current conversation state
    const conversation = userConversations.get(formattedPhone);
    
    // Handle the complete info submission
    if (conversation.state === 'awaiting_all_info') {
      // Parse the message containing user information
      const parts = message.split(',').map(part => part.trim());
      
      // Check if we're using fallback mode (no education/gender IDs)
      if (conversation.useFallback && parts.length < 6) {
        // Resend fallback instructions
        let fallbackInstructions =
          "Information incomplete. Please provide all required fields in the following format:\n" +
          "firstName,surname,email,displayName,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2[,phoneNumber]\n" +
          "Example: Liban,Joe,Libanjoe7@gmail.com,Liban Joe,2003-08-03,KE";
        await sendResponseMessage(formattedPhone, fallbackInstructions);
        return res.status(200).json({
          success: true,
          message: 'Requested more information from user (fallback mode)'
        });
      } else if (!conversation.useFallback && parts.length < 7) {
        // Resend full instructions with options
        let instructionsMessage = "Information incomplete. Please provide all required fields in the following format:\n" +
          "firstName,surname,email,displayName,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2,education,gender[,phoneNumber]\n\n" +
          "Example: John,Doe,john.doe@example.com,John Doe,2003-08-03,KE,Secondary,Male\n\n" +
          "Note: For displayName, you can leave it empty by using two commas (,,) and we'll use your first and last name.\n\n" +
          "Available Education Options (use the exact name):\n";
        conversation.educationOptions.forEach((option) => {
          instructionsMessage += `${option.name}\n`;
        });
        instructionsMessage += "\nAvailable Gender Options (use the exact name):\n";
        conversation.genderOptions.forEach((option) => {
          instructionsMessage += `${option.name}\n`;
        });
        await sendResponseMessage(formattedPhone, instructionsMessage);
        return res.status(200).json({
          success: true,
          message: 'Requested more information from user'
        });
      }
      
      // Extract basic information
      const [firstName, surname, email, displayName, dateOfBirth, countryCodeAlpha2, educationName, genderName, phoneNumber] = parts;
      
      // Build user data object
      const userData = {
        firstName,
        surname,
        email,
        displayName: (displayName && displayName.trim()) ? displayName : `${firstName} ${surname}`,
        dateOfBirth,
        countryCodeAlpha2
      };
      
      // Log the options stored for this user
      logger.info('Education options for user:', JSON.stringify(conversation.educationOptions));
      logger.info('Gender options for user:', JSON.stringify(conversation.genderOptions));
      logger.info('User input for educationName:', educationName);
      logger.info('User input for genderName:', genderName);
      
      // Handle education and gender IDs if not in fallback mode
      if (!conversation.useFallback) {
        // Find education ID by name
        const educationOption = conversation.educationOptions.find(
          option => option.name.toLowerCase() === educationName.toLowerCase()
        );
        if (!educationOption) {
          const availableOptions = conversation.educationOptions.map(opt => opt.name).join('\n');
          await sendResponseMessage(formattedPhone, 
            "Invalid education option. Please use one of these exact options:\n" + availableOptions
          );
          return res.status(200).json({
            success: false,
            message: 'Invalid education option'
          });
        }
        // Find gender ID by name
        const genderOption = conversation.genderOptions.find(
          option => option.name.toLowerCase() === genderName.toLowerCase()
        );
        if (!genderOption) {
          const availableOptions = conversation.genderOptions.map(opt => opt.name).join('\n');
          await sendResponseMessage(formattedPhone, 
            "Invalid gender option. Please use one of these exact options:\n" + availableOptions
          );
          return res.status(200).json({
            success: false,
            message: 'Invalid gender option'
          });
        }
        // Add validated IDs to user data
        userData.educationId = educationOption.id;
        userData.genderId = genderOption.id;
        logger.info('Using education ID:', educationOption.id, 'and gender ID:', genderOption.id);
        
        // If phone number is provided (8th field), use it
        if (phoneNumber && phoneNumber.trim()) {
          const providedPhone = formatKenyanPhoneNumber(phoneNumber.trim());
          userData.phoneNumber = providedPhone;
          logger.info(`Using provided phone number: ${userData.phoneNumber}`);
        }
      } else {
        // In fallback mode, we don't use education or gender IDs
        logger.info('Using fallback mode - no education or gender IDs will be sent');
        
        // Check if a custom phone number was provided (5th element if present)
        if (parts.length >= 5 && parts[4] && parts[4].trim()) {
          // Format phone number before storing
          const providedPhone = formatKenyanPhoneNumber(parts[4].trim());
          userData.phoneNumber = providedPhone;
          logger.info(`Using provided phone number: ${userData.phoneNumber}`);
        }
      }
      
      logger.info('Creating user with data:', userData);
      
      try {
        // Create user in Yoma
        const yomaResponse = await createUser(userData);
        logger.info('User created in Yoma:', yomaResponse);
        
        // Validate Yoma response before saving to Supabase
        if (!yomaResponse || !yomaResponse.id) {
          throw new Error('Invalid response from Yoma API');
        }

        // Only save to Supabase if Yoma registration was successful
        await onboardingService.recordOnboardedUser(yomaResponse);
        
        // Send success message to user
        await sendResponseMessage(formattedPhone, 
          "Registration successful! Welcome to Yoma. You can now log in to your account."
        );
        
        // Clear the conversation state
        userConversations.delete(formattedPhone);
        
        // Return success response
    return res.status(200).json({
      success: true,
          message: 'User created successfully',
      data: {
            original: { shortcode, mobile, message },
            yomaFormat: userData,
            yomaResponse
          }
        });
      } catch (error) {
        // Log error details with full Yoma API response if available
        if (error.response && error.response.data) {
          logger.error('Error creating user in Yoma:', error.response.data);
        } else {
          logger.error('Error creating user:', error.message || error);
        }
        // Check if user already exists
        if (error.response?.data?.message?.includes('already exists')) {
          await sendResponseMessage(formattedPhone,
            "This email or phone number is already registered. Please use different credentials."
          );
          return res.status(200).json({
            success: false,
            message: 'User already exists'
          });
        }
        // Send error message to user
        await sendResponseMessage(formattedPhone,
          "Sorry, there was an error creating your account. Please try again later."
        );
        return res.status(500).json({
          success: false,
          message: 'Error creating user',
          error: error.response?.data || error.message
        });
      }
    }

    // If we get here, something unexpected happened
    return res.status(400).json({
      success: false,
      message: 'Invalid conversation state'
    });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Health check endpoint handler
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 */
function healthCheck(req, res) {
  res.status(200).json({ 
    status: 'UP', 
    message: 'Service is running',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  processWebhook,
  healthCheck,
  userConversations
}; 