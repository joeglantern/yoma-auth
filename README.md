# Advanta-Yoma Integration Service

A Node.js backend service that receives webhook notifications from Advanta and registers users with the Yoma B2B API.

## Features

- Secure webhook endpoint (`/advanta-webhook`) for receiving SMS data from Advanta
- Conversational SMS flow to guide users through the registration process
- Data validation for required information
- Secure authentication using API keys
- Integration with Yoma's B2B API to register users
- Comprehensive error handling and logging
- Ready for deployment on platforms like Heroku, Render, or Vercel

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Yoma API client credentials (provided by Yoma SRE team)
- Advanta API token for authentication

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/joeglantern/yoma-auth
   cd yoma-auth
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment:
   ```
   npm run setup
   ```
   This interactive script will create a `.env` file with either development or production settings.
   
   For development, it will use placeholder values.
   
   For production, it will prompt you for your real Advanta token and Yoma API credentials.

## Configuration

The following environment variables can be configured in your `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port number for the server | 3000 |
| `ADVANTA_TOKEN` | API token for authenticating Advanta requests | - |
| `YOMA_API_URL` | Base URL for Yoma's API | https://api.yoma.world/api/v3 |
| `YOMA_AUTH_URL` | Auth URL for Yoma's token endpoint | https://yoma.world/auth/realms/yoma |
| `YOMA_CLIENT_ID` | Yoma API client ID | - |
| `YOMA_CLIENT_SECRET` | Yoma API client secret | - |
| `NODE_ENV` | Environment (development/production) | development |
| `LOG_LEVEL` | Logging level (info, error, debug) | info |

## Usage

### Starting the Server

Development mode with auto-reload:
```
npm run dev
```

Production mode:
```
npm run prod
```

> Note: For production mode, you need to set up your environment variables with real credentials.
> See the [Deployment Guide](DEPLOYMENT.md) for more information.

### Webhook Endpoint

**Endpoint**: `POST /advanta-webhook`

**Headers**:
- `Content-Type: application/json`
- `X-Advanta-Token: your_advanta_api_token`

**Request Body Example**:
```json
{
  "shortcode": "22317",
  "mobile": "+254758009278",
  "message": "User's message text"
}
```

**Required Fields**:
- `shortcode`
- `mobile`
- `message`

**Optional Fields**:
- `firstName`
- `surname`
- `email`
- `displayName`
- `dateOfBirth`
- `countryCodeAlpha2`

### Health Check

The service includes a health check endpoint:
```
GET /health
```

## SMS Signup Flow

The service implements a simple, one-step flow to collect user information:

1. **Initiation**: 
   - User sends any message to the Advanta shortcode
   - The service responds with comprehensive instructions including:
     - The required information format
     - List of available education options with names
     - List of available gender options with names

2. **Complete Information Submission**:
   - User sends a single message with all required information in the format:
     `firstName,surname,email,displayName,dateOfBirth,countryCodeAlpha2,education,gender[,phoneNumber]`
   - Example: `Liban,Joe,Libanjoe7@gmail.com,Liban Joe,2003-08-03,KE,Secondary,Male`
   - Note: phoneNumber is optional. If not provided, the sender's number will be used automatically.
   - The education and gender values should match the options list provided in step 1

3. **Registration**:
   - The service validates the provided information
   - The user is registered with Yoma's B2B API
   - The user receives a confirmation SMS

4. **First Login**:
   - When the user first logs in to Yoma:
     - They will receive an OTP via SMS to verify their phone number
     - They will be prompted to create a new password

For more details on the user experience, refer to the [User Guide](USER_GUIDE.md).

## Advanta Integration Requirements

### What Advanta Needs to Provide

1. **Shortcode Information**:
   - The shortcode number that users will text to
   - Confirmation of shortcode registration with telecom providers

2. **Integration Confirmation**:
   - Confirmation that they've configured the shortcode to collect required user information
   - Confirmation that they'll format the data according to our webhook requirements
   - Confirmation that they'll send the data to our webhook endpoint with the authentication token

3. **Testing Schedule**:
   - A proposed date for testing the integration end-to-end

### What We Provide to Advanta

1. **Webhook Endpoint**:
   - URL: `https://yoma-auth.onrender.com/advanta-webhook`
   - Authentication token: `xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=`

2. **Documentation**:
   - [Advanta Integration Guide](ADVANTA_INTEGRATION.md) with all technical details
   - This README with setup instructions
   - [User Guide](USER_GUIDE.md) for understanding the user experience

3. **Support**:
   - Contact: Libanjoe7@gmail.com or +254758009278
   - Technical support for integration issues

## Documentation

- [B2B API Documentation](B2B.md) - Official Yoma API documentation
- [Advanta Integration Guide](ADVANTA_INTEGRATION.md) - Detailed integration instructions for Advanta

## Error Handling

The service returns appropriate HTTP status codes for different error scenarios:
- `400`: Invalid request payload
- `401`: Missing or invalid authentication token
- `500`: Server-side errors

## License

MIT 