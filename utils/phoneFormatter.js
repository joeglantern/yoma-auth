/**
 * Utility for formatting Kenyan phone numbers
 */

/**
 * Converts a Kenyan phone number to international format
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number in international format
 */
function formatKenyanPhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;
  
  // Remove all non-digit characters except the leading +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  let digits = cleaned.replace(/\D/g, '');
  
  // Handle international format already (+254...)
  if (cleaned.startsWith('+')) {
    // Return cleaned version if already in proper format
    if (cleaned.startsWith('+254') && digits.length >= 12) {
      return cleaned;
    }
  }
  
  // For 10-digit numbers starting with 0 (e.g., 0722123456)
  if (digits.length === 10 && digits.startsWith('0')) {
    return '+254' + digits.substring(1);
  }
  
  // For 9-digit numbers without prefix (e.g., 722123456)
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1') || digits.startsWith('2'))) {
    return '+254' + digits;
  }
  
  // For 12-digit numbers starting with 254 (e.g., 254722123456)
  if (digits.length === 12 && digits.startsWith('254')) {
    return '+' + digits;
  }
  
  // If no rules match, but length is right for a Kenyan number and starts with expected prefixes
  if (digits.length === 10 && (digits.startsWith('01') || digits.startsWith('07'))) {
    return '+254' + digits.substring(1);
  }
  
  // Return original if we couldn't recognize the format
  return phoneNumber;
}

module.exports = {
  formatKenyanPhoneNumber
}; 