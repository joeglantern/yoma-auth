/**
 * Environment Setup Script for Advanta-Yoma Integration
 * 
 * This script creates a .env file with the appropriate configuration
 * based on whether you're setting up for development, staging, or production.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Development environment configuration
const devEnvContent = `# Server configuration
PORT=3000

# Advanta Authentication
ADVANTA_TOKEN=development-token-123456

# Yoma API configuration
YOMA_API_URL=https://api.yoma.world/api/v3
YOMA_AUTH_URL=https://yoma.world/auth/realms/yoma

# Yoma OAuth credentials
YOMA_CLIENT_ID=dev-client-id
YOMA_CLIENT_SECRET=dev-client-secret

# Environment settings
NODE_ENV=development

# Logging
LOG_LEVEL=info
`;

// Staging environment configuration
const stagingEnvContent = `# Server configuration
PORT=3000

# Advanta Authentication
ADVANTA_TOKEN=staging-advanta-token

# Yoma API configuration
YOMA_API_URL=https://api.yoma.world/api/v3
YOMA_AUTH_URL=https://yoma.world/auth/realms/yoma

# Yoma OAuth credentials
YOMA_CLIENT_ID=your_staging_client_id_here
YOMA_CLIENT_SECRET=your_staging_client_secret_here

# Environment settings
NODE_ENV=staging
DATABASE_SCHEMA=advanta_staging

# Logging
LOG_LEVEL=info
`;

// Production environment configuration
const prodEnvContent = `# Server configuration
PORT=3000

# Advanta Authentication
ADVANTA_TOKEN=xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=

# Yoma API configuration
YOMA_API_URL=https://api.yoma.world/api/v3
YOMA_AUTH_URL=https://yoma.world/auth/realms/yoma

# Yoma OAuth credentials
YOMA_CLIENT_ID=your_real_client_id_here
YOMA_CLIENT_SECRET=your_real_client_secret_here

# Environment settings
NODE_ENV=production

# Logging
LOG_LEVEL=info
`;

console.log('🚀 Advanta-Yoma Integration Environment Setup');
console.log('---------------------------------------------');
console.log('This script will create a .env file for your environment.\n');

rl.question('Which environment are you setting up? (dev/staging/prod): ', (environment) => {
  let envContent;
  
  if (environment.toLowerCase() === 'prod' || environment.toLowerCase() === 'production') {
    console.log('\nSetting up for PRODUCTION environment...');
    envContent = prodEnvContent;
    
    // For production, we'll ask for the real values
    rl.question('\nEnter your Advanta token (press Enter to use generated secure token): ', (advantaToken) => {
      if (advantaToken) {
        envContent = envContent.replace('xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=', advantaToken);
      }
      
      rl.question('Enter your Yoma client ID: ', (clientId) => {
        if (clientId) {
          envContent = envContent.replace('your_real_client_id_here', clientId);
        }
        
        rl.question('Enter your Yoma client secret: ', (clientSecret) => {
          if (clientSecret) {
            envContent = envContent.replace('your_real_client_secret_here', clientSecret);
          }
          
          writeEnvFile(envContent);
          rl.close();
        });
      });
    });
  } else if (environment.toLowerCase() === 'staging') {
    console.log('\nSetting up for STAGING environment...');
    envContent = stagingEnvContent;
    
    rl.question('\nEnter your staging Advanta token (press Enter to use default): ', (advantaToken) => {
      if (advantaToken) {
        envContent = envContent.replace('staging-advanta-token', advantaToken);
      }
      
      rl.question('Enter your staging Yoma client ID: ', (clientId) => {
        if (clientId) {
          envContent = envContent.replace('your_staging_client_id_here', clientId);
        }
        
        rl.question('Enter your staging Yoma client secret: ', (clientSecret) => {
          if (clientSecret) {
            envContent = envContent.replace('your_staging_client_secret_here', clientSecret);
          }
          
          writeEnvFile(envContent);
          rl.close();
        });
      });
    });
  } else {
    console.log('\nSetting up for DEVELOPMENT environment...');
    envContent = devEnvContent;
    writeEnvFile(envContent);
    rl.close();
  }
});

function writeEnvFile(content) {
  try {
    const envPath = path.join(__dirname, '.env');
    
    // Check if file already exists
    if (fs.existsSync(envPath)) {
      console.log('\n⚠️  A .env file already exists!');
      rl.question('Do you want to overwrite it? (yes/no): ', (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          fs.writeFileSync(envPath, content);
          console.log('\n✅ .env file created successfully!');
        } else {
          console.log('\n❌ Operation cancelled. Existing .env file was not modified.');
        }
        rl.close();
      });
    } else {
      fs.writeFileSync(envPath, content);
      console.log('\n✅ .env file created successfully!');
      rl.close();
    }
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
    rl.close();
  }
}

rl.on('close', () => {
  console.log('\n📝 Next steps:');
  console.log('1. Review your .env file and make any necessary changes');
  console.log('2. Run "npm install" to install dependencies');
  console.log('3. Start the server with "npm run dev" for development or "npm start" for production');
  console.log('\nGood luck with your deployment! 👍');
  process.exit(0);
}); 