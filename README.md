# Yoma SMS Authentication Service

This service handles SMS-based user registration for the Yoma platform using the Advanta SMS gateway.

## Features

- SMS webhook endpoint for receiving user messages
- Step-by-step user registration flow
- Integration with Yoma External Partner API
- Integration with Advanta SMS Gateway

## Prerequisites

- Node.js >= 18.0.0
- npm

## Environment Variables

The following environment variables are required:

```env
YOMA_API_URL=
YOMA_CLIENT_ID=
YOMA_CLIENT_SECRET=
ADVANTA_API_KEY=
ADVANTA_API_URL=
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/joeglantern/yoma-auth.git
cd yoma-auth
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the required environment variables

4. Start the development server:
```bash
npm run dev
```

## Deployment

This service is configured for deployment on Render. The deployment configuration is specified in `render.yaml`.

To deploy:

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your forked repository
4. Add the required environment variables in the Render dashboard
5. Deploy! 