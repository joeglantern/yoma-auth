# Advanta Integration Guide

This document provides instructions for Advanta to integrate with the Yoma Auth webhook.

## Webhook Details

- **Endpoint URL**: `https://yoma-auth.onrender.com/advanta-webhook`
- **Method**: POST
- **Content-Type**: application/json

## Authentication

All requests must include the following header:
```
X-Advanta-Token: xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=
```

## Request Format

The webhook expects a JSON payload with the following structure:

```json
{
  "firstName": "String",          // Required
  "surname": "String",            // Required
  "email": "String",              // Required if phoneNumber not provided
  "phoneNumber": "String",        // Required if email not provided
  "countryCodeAlpha2": "String",  // Required (2-letter country code)
  "dateOfBirth": "YYYY-MM-DD",    // Optional
  "educationId": "String",        // Required, obtained from /lookup/education
  "genderId": "String"            // Required, obtained from /lookup/gender
}
```

### Field Requirements:
- **firstName**: Required, the user's first name
- **surname**: Required, the user's last name
- **email** or **phoneNumber**: At least one contact method is required
- **countryCodeAlpha2**: Required, ISO 3166-1 alpha-2 country code (e.g., "KE" for Kenya)
- **dateOfBirth**: Optional, format must be YYYY-MM-DD
- **educationId**: Required, ID obtained from the `/lookup/education` endpoint
- **genderId**: Required, ID obtained from the `/lookup/gender` endpoint

## Response Formats

### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "Data received successfully",
  "data": {
    "firstName": "String",
    "surname": "String",
    "email": "String",
    "phoneNumber": "String",
    "countryCodeAlpha2": "String",
    "dateOfBirth": "YYYY-MM-DD"
  }
}
```

### Error Responses

#### Authentication Error (401 Unauthorized)
```json
{
  "success": false,
  "error": "Authentication failed: Invalid token"
}
```

#### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation failed: Missing required fields"
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Internal server error occurred while processing the request"
}
```

## Implementation Steps for Advanta

To integrate your shortcode service with the Yoma Auth webhook, please follow these steps:

1. **Set up shortcode service**:
   - Register a shortcode with local telecom providers
   - Configure the shortcode to receive user data via SMS

2. **Build data collection flow**:
   - Create SMS prompts to collect required user information (first name, surname, email/phone, country, DOB, education, gender)
   - Implement logic to handle multi-message conversations if needed
   - Store partially collected data until submission is complete

3. **Develop webhook client**:
   - Create code to format collected user data into the JSON structure specified above
   - Implement HTTP POST requests to our webhook endpoint
   - Add the authentication header with the provided token
   - Build error handling and retry logic (recommended: 3 retries with exponential backoff)

4. **Implement response handling**:
   - Parse response JSON from the webhook
   - Send confirmation SMS to users upon successful data receipt
   - Notify users of any errors that need correction

5. **Use Lookup Endpoints**:
   - Before sending data, query the `/lookup/education` and `/lookup/gender` endpoints to obtain the correct IDs.
   - Include these IDs in the webhook request payload.

## Testing

For testing purposes, you can use the provided token and send a request with valid data:

```
curl -X POST https://yoma-auth.onrender.com/advanta-webhook \
  -H "Content-Type: application/json" \
  -H "X-Advanta-Token: xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=" \
  -d '{
    "shortcode": "12345",
    "mobile": "+254758009278",
    "message": "firstName:Liban,surname:Joe,email:Libanjoe7@gmail.com,displayName:Liban Joe,educationId:3fa85f64-5717-4562-b3fc-2c963f66afa6,genderId:3fa85f64-5717-4562-b3fc-2c963f66afa6,dateOfBirth:2003-08-03,countryCodeAlpha2:KE",
    "firstName": "Liban",
    "surname": "Joe",
    "email": "Libanjoe7@gmail.com",
    "phoneNumber": "+254758009278",
    "countryCodeAlpha2": "KE",
    "dateOfBirth": "2003-08-03",
    "educationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "genderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }'
```

## Support

For any issues or questions regarding this integration, please contact Libanjoe7@gmail.com or +254758009278.
 