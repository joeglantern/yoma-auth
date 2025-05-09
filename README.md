# Advanta-Yoma Integration Service

A Node.js backend service that receives webhook notifications from Advanta and registers users with the Yoma B2B API.

## Features

- Secure webhook endpoint (`/advanta-webhook`) for receiving JSON data from Advanta
- Data validation for required fields: `firstName`, `surname`, `countryCodeAlpha2`, and either `phoneNumber` or `email`
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
   git clone <repository-url>
   cd advanta-yoma-integration
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
  "firstName": "Liban",
  "surname": "Joe",
  "phoneNumber": "+254758009278",
  "email": "Libanjoe7@gmail.com",
  "countryCodeAlpha2": "KE",
  "displayName": "Liban Joe",
  "dateOfBirth": "2003-08-03"
}
```

**Required Fields**:
- `firstName`
- `surname`
- `countryCodeAlpha2`
- Either `phoneNumber` or `email` (or both)

**Optional Fields**:
- `displayName`
- `educationId`
- `genderId`
- `dateOfBirth`

### Health Check

The service includes a health check endpoint:
```
GET /health
```

## SMS Signup Flow

When a user is registered through this service:

1. Their information is sent to Yoma's B2B API
2. Yoma creates the user account with a temporary password
3. The phone number is initially unconfirmed
4. When the user first logs in to Yoma:
   - They will receive an OTP via SMS to verify their phone number
   - They will be prompted to create a new password

For more details on the user experience, refer to the [User Guide](USER_GUIDE.md).

## Documentation

- [Deployment Guide](DEPLOYMENT.md) - General instructions for deploying to production
- [Render Deployment Guide](DEPLOYMENT_RENDER.md) - Specific instructions for deploying to Render
- [Testing Guide](TESTING_DEPLOYMENT.md) - How to test your deployment
- [User Guide](USER_GUIDE.md) - Guide for end-users on the SMS signup process
- [B2B API Documentation](B2B.md) - Official Yoma API documentation

## Deployment

### Heroku Deployment

```
heroku create
git push heroku main
heroku config:set ADVANTA_TOKEN=your_advanta_token
heroku config:set YOMA_CLIENT_ID=your_client_id
heroku config:set YOMA_CLIENT_SECRET=your_client_secret
```

### Render Deployment

1. Connect your repository to Render
2. Create a new Web Service
3. Set the environment variables in the Render dashboard
4. Deploy the service

## Error Handling

The service returns appropriate HTTP status codes for different error scenarios:
- `400`: Invalid request payload
- `401`: Missing or invalid authentication token
- `500`: Server-side errors

## License

MIT 