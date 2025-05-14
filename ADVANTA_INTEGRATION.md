# Advanta Integration Guide

This document provides the essentials for Advanta to connect to the Yoma Auth webhook.

## Integration Details

### Webhook Endpoint
- **URL**: `https://yoma-auth-le50.onrender.com/advanta-webhook`
- **Method**: POST
- **Content-Type**: application/json

### Authentication
All requests must include this header:
```
X-Advanta-Token: xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=
```

### Request Format
```json
{
  "shortcode": "22317",
  "mobile": "+254758009278",
  "message": "User's message text"
}
```

### Integration Instructions
1. Forward all SMS messages received on the shortcode to our webhook endpoint
2. Include the authentication header with each request
3. Our service will handle the registration process:
   - When a user first texts the shortcode, we'll respond with instructions and options
   - The user will send back all their information in a single message in the format: `firstName,surname,email,displayName,dateOfBirth,countryCodeAlpha2,education,gender`
   - For education and gender, users should provide the text values (e.g., "College/University", "Male") not numeric IDs
   - We'll process the registration and send a confirmation message
4. All response messages for the user will be sent back in our webhook responses

## Testing
Test the connection with:
```
curl -X POST https://yoma-auth-le50.onrender.com/advanta-webhook \
  -H "Content-Type: application/json" \
  -H "X-Advanta-Token: xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=" \
  -d '{
    "shortcode": "22317",
    "mobile": "+254758009278",
    "message": "hello"
  }'
```

## Support
For integration issues, contact:
- Email: Libanjoe7@gmail.com
- Phone: +254758009278
 