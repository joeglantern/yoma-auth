/**
 * Controller for handling Advanta webhook requests
 */

const logger = require('../utils/logger');
const { createUser, getReferenceData } = require('../services/yomaService');
const { formatKenyanPhoneNumber } = require('../utils/phoneFormatter');
const { sendSMS } = require('../services/advantaSMSService');

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
      const welcomeMessage = `Welcome to Yoma! To register, send your details in this format:
Name, Age, Gender, Education Level
Example: John Doe, 25, Male, University

Available options:
Gender: ${referenceData.gender.map(g => g.name).join(', ')}
Education: ${referenceData.education.map(e => e.name).join(', ')}`;

      await sendSMS(formattedPhone, welcomeMessage);
      
      return res.json({ 
        success: true, 
        message: 'Welcome message sent' 
      });
    }

    // Check if this is a new conversation or restart
    if (!userConversations.has(formattedPhone) || message.toLowerCase().trim() === 'restart') {
      try {
        // Fetch education and gender options from Yoma
        logger.info('Fetching education and gender options for new conversation');
        const educationOptions = await getReferenceData('education');
        const genderOptions = await getReferenceData('gender');
        
        // Build instructions including all options
        let instructionsMessage = "Welcome to Yoma! Please provide your information in the following format:\n" +
          "firstName,surname,email,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2,education,gender[,phoneNumber]\n\n" +
          "Example: Liban,Joe,Libanjoe7@gmail.com,2003-08-03,KE,Secondary,Male\n\n" +
          "Note: phoneNumber is optional. If provided, it will be used for account registration; otherwise, no phone number will be associated with the account.\n\n" +
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
          "Note: phoneNumber is optional. If provided, it will be used for account registration; otherwise, no phone number will be associated with the account.";
          
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
        // Not enough information provided
        await sendResponseMessage(formattedPhone, 
          "Information incomplete. Please provide all required fields:\n" +
          "firstName,surname,email,displayName,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2[,phoneNumber]"
        );
        
        return res.status(200).json({
          success: true,
          message: 'Requested more information from user (fallback mode)'
        });
      } else if (!conversation.useFallback && parts.length < 8) {
        // Not enough information provided for full mode
        await sendResponseMessage(formattedPhone, 
          "Information incomplete. Please provide all required fields:\n" +
          "firstName,surname,email,displayName,dateOfBirth(YYYY-MM-DD),countryCodeAlpha2,education,gender[,phoneNumber]"
        );
        
        return res.status(200).json({
          success: true,
          message: 'Requested more information from user'
        });
      }
      
      // Extract basic information
      const [firstName, surname, email, dateOfBirth, countryCodeAlpha2] = parts;
      
      // Build user data object
      const userData = {
        firstName,
        surname,
        email,
        dateOfBirth,
        countryCodeAlpha2
      };
      
      // Handle education and gender IDs if not in fallback mode
      if (!conversation.useFallback) {
        const educationName = parts[5];
        const genderName = parts[6];
        
        // Check if a custom phone number was provided (7th element if present)
        if (parts.length >= 7 && parts[6] && parts[6].trim()) {
          // Format phone number before storing
          const providedPhone = formatKenyanPhoneNumber(parts[6].trim());
          userData.phoneNumber = providedPhone;
          logger.info(`Using provided phone number: ${userData.phoneNumber}`);
        }
        
        // Find education ID by name
        const educationOption = conversation.educationOptions.find(
          option => option.name.toLowerCase() === educationName.toLowerCase()
        );
        
        if (!educationOption) {
          await sendResponseMessage(formattedPhone, 
            "Invalid education option. Please use one of the available options exactly as provided."
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
          await sendResponseMessage(formattedPhone, 
            "Invalid gender option. Please use one of the available options exactly as provided."
          );
          
          return res.status(200).json({
            success: false,
            message: 'Invalid gender option'
          });
        }
        
        // Add validated IDs to user data
        userData.educationId = educationOption.id;
        userData.genderId = genderOption.id;
      } else {
        // Check if a custom phone number was provided (5th element if present)
        if (parts.length >= 5 && parts[4] && parts[4].trim()) {
          // Format phone number before storing
          const providedPhone = formatKenyanPhoneNumber(parts[4].trim());
          userData.phoneNumber = providedPhone;
          logger.info(`Using provided phone number: ${userData.phoneNumber}`);
        }
        
        // In fallback mode, use default IDs if available
        if (process.env.DEFAULT_EDUCATION_ID) {
          userData.educationId = process.env.DEFAULT_EDUCATION_ID;
        }
        
        if (process.env.DEFAULT_GENDER_ID) {
          userData.genderId = process.env.DEFAULT_GENDER_ID;
        }
      }
      
      logger.info('Creating user with data:', userData);
      
      try {
        // Create user in Yoma
        const yomaResponse = await createUser(userData);
        logger.info('User created in Yoma:', yomaResponse);
        
        // Send success message to user
        await sendResponseMessage(formattedPhone, 
          "Thank you! Your account has been created successfully. " +
          "You will receive a verification message for your first login to Yoma."
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
        // Log error details
        logger.error('Error creating user in Yoma:', error.response?.data || error.message);
        
        // Send error message to user
        await sendResponseMessage(formattedPhone, 
          "Sorry, we couldn't create your account. " + 
          "Please try again or contact support."
        );
        
        // Clear the conversation state
        userConversations.delete(formattedPhone);
        
        // Return error response
        return res.status(500).json({
          success: false,
          message: 'Error creating user in Yoma',
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