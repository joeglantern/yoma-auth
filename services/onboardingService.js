const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Records a successfully onboarded user in the database
 * @param {Object} userData - The user data from Yoma
 * @returns {Promise<Object>} The created record
 */
async function recordOnboardedUser(userData) {
  try {
    // Validate required fields
    if (!userData.id || !userData.firstName || !userData.surname || !userData.email) {
      logger.error('Missing required fields for onboarded user:', userData);
      throw new Error('Missing required fields for onboarded user');
    }

    const { data, error } = await supabase
      .from('onboarded_users')
      .insert({
        yoma_user_id: userData.id,
        first_name: userData.firstName,
        surname: userData.surname,
        email: userData.email,
        display_name: userData.displayName,
        phone_number: userData.phoneNumber || null,
        country_code: userData.countryCodeAlpha2,
        education_id: userData.educationId || null,
        gender_id: userData.genderId || null,
        date_of_birth: userData.dateOfBirth
      })
      .select()
      .single();

    if (error) {
      logger.error('Error recording onboarded user:', error);
      throw error;
    }

    logger.info('Successfully recorded onboarded user:', data);
    return data;
  } catch (error) {
    logger.error('Failed to record onboarded user:', error);
    throw error;
  }
}

/**
 * Checks if a user is already onboarded
 * @param {string} email - The user's email
 * @param {string} phoneNumber - The user's phone number (optional)
 * @returns {Promise<boolean>} Whether the user is already onboarded
 */
async function isUserOnboarded(email, phoneNumber = null) {
  try {
    let query = supabase
      .from('onboarded_users')
      .select('id')
      .eq('email', email);

    if (phoneNumber) {
      query = query.or(`phone_number.eq.${phoneNumber}`);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error checking if user is onboarded:', error);
      throw error;
    }

    return data && data.length > 0;
  } catch (error) {
    logger.error('Failed to check if user is onboarded:', error);
    throw error;
  }
}

module.exports = {
  recordOnboardedUser,
  isUserOnboarded
}; 