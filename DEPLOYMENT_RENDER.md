# Deploying to Render

This guide explains how to deploy the Advanta-Yoma Integration Service to Render.

## Why Render?

[Render](https://render.com) is a modern cloud platform that makes it easy to deploy applications without managing infrastructure. Benefits include:

- Automatic HTTPS/SSL
- Built-in CI/CD
- Free tier available
- Global CDN
- Simple scaling

## Prerequisites

Before deploying to Render, ensure you have:

1. A [GitHub](https://github.com) account with your project repository
2. A [Render](https://render.com) account (free tier works for testing)
3. Your Yoma API credentials (client ID and client secret)
4. Your Advanta authentication token

## Preparing Your Environment

Before deployment, set up your environment variables:

1. Run the setup script and choose "prod" when prompted:
   ```bash
   npm run setup
   ```

2. Enter your real credentials when prompted:
   - Advanta Token
   - Yoma Client ID
   - Yoma Client Secret

3. Review your `.env` file to ensure all variables are correctly set.

## Deployment Options

There are two ways to deploy to Render: using a Blueprint or manual setup.

### Option 1: Blueprint Deployment (Recommended)

This project includes a `render.yaml` file that defines the infrastructure needed for your application.

1. **Prepare Your Repository**
   - Fork or push this repository to your GitHub account
   - Make sure the `render.yaml` file is in the root directory

2. **Create a Blueprint Instance**
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Navigate to "Blueprints" from the sidebar
   - Click "New Blueprint Instance"
   - Connect your GitHub account if you haven't already
   - Select the repository containing this project
   - Render will automatically detect the `render.yaml` file and show resources to be created
   - Click "Apply" to create the web service

3. **Configure Secret Environment Variables**
   - Once the service is created, select it from your dashboard
   - Go to the "Environment" tab
   - Add the following secret environment variables:
     - `ADVANTA_TOKEN=your_real_advanta_token`
     - `YOMA_CLIENT_ID=your_real_client_id`
     - `YOMA_CLIENT_SECRET=your_real_client_secret`
   - Click "Save Changes"

4. **Verify Deployment**
   - Your service will automatically redeploy with the new environment variables
   - Once deployed, verify it's working by visiting the `/health` endpoint
   - The webhook will be available at: `https://advanta-yoma-integration.onrender.com/advanta-webhook`

### Option 2: Manual Deployment

1. **Prepare Your Repository**
   - Push your code to GitHub

2. **Create a New Web Service**
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Click "New" and select "Web Service"
   - Connect your GitHub account and select your repository

3. **Configure the Service**
   - Set the following options:
     - **Name**: advanta-yoma-integration (or your preferred name)
     - **Environment**: Node
     - **Region**: Choose the region closest to your users
     - **Branch**: main (or your preferred branch)
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Health Check Path**: `/health`
     - **Plan**: Free (or select a paid plan for production)

4. **Set Environment Variables**
   - Scroll down to the "Environment Variables" section
   - Add the following:
     - `NODE_ENV=production`
     - `PORT=3000`
     - `YOMA_API_URL=https://api.yoma.world/api/v3`
     - `YOMA_AUTH_URL=https://yoma.world/auth/realms/yoma`
     - `ADVANTA_TOKEN=your_real_advanta_token`
     - `YOMA_CLIENT_ID=your_real_client_id`
     - `YOMA_CLIENT_SECRET=your_real_client_secret`

5. **Create Web Service**
   - Click "Create Web Service"
   - Render will build and deploy your application
   - Once deployed, your webhook will be available at: `https://your-service-name.onrender.com/advanta-webhook`

## Monitoring and Maintenance

Render provides several tools to help you monitor and maintain your application:

### Logging
- View real-time logs by clicking on your service and selecting the "Logs" tab
- Filter logs by type (e.g., build logs, runtime logs)
- Search for specific log messages

### Metrics
- View CPU and memory usage in the "Metrics" tab
- Monitor request counts and response times

### Health Checks
- Render automatically checks the `/health` endpoint
- Configure custom alerts based on health check results

### Updates and Redeployment
- Render automatically deploys when you push changes to your repository
- You can also trigger manual deployments from the dashboard

## Production Considerations

For production environments, consider the following:

1. **Upgrade Your Plan**
   - Free tier has limitations on usage and goes to sleep after inactivity
   - For production, upgrade to at least the "Individual" or "Team" plan

2. **Custom Domain**
   - Set up a custom domain for your webhook in the "Settings" tab
   - Render provides free SSL certificates for custom domains

3. **IP Allowlisting**
   - Consider using Render's IP allowlisting feature to only accept requests from Advanta's IP addresses

4. **Environment Groups**
   - Use Render's Environment Groups for managing variables across multiple services

## Troubleshooting

If you encounter issues with your Render deployment:

1. **Build Failures**
   - Check the build logs for errors
   - Verify your package.json file is correct
   - Make sure all dependencies are properly listed

2. **Runtime Errors**
   - Check the runtime logs for error messages
   - Verify all environment variables are correctly set

3. **Health Check Failures**
   - Make sure your `/health` endpoint is working correctly
   - Check for any errors in the application logs

4. **Webhook Not Receiving Data**
   - Verify the webhook URL is correct and accessible
   - Check that the authentication token matches what Advanta is sending
   - Use a tool like Postman to manually test the webhook 