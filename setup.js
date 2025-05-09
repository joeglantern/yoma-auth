const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Define the content for the .env file
const envContent = `# Server configuration
PORT=3000

# Advanta Authentication
ADVANTA_TOKEN=development-token-123456

# Yoma API configuration
YOMA_API_URL=https://api.yoma.world/api/v3
YOMA_AUTH_URL=https://yoma.world/auth/realms/yoma

# Yoma OAuth credentials
YOMA_CLIENT_ID=dev-client-id
YOMA_CLIENT_SECRET=dev-client-secret

# Logging
LOG_LEVEL=info
`;

console.log('🚀 Setting up Advanta-Yoma Integration Service...');

// Create .env file
try {
  console.log('📝 Creating .env file...');
  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  console.log('✅ .env file created successfully!');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

// Install dependencies
try {
  console.log('📦 Installing dependencies...');
  console.log('This may take a moment...');
  
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\nTo start the server in development mode, run:');
console.log('npm run dev');
console.log('\nTo start the server in production mode, run:');
console.log('npm start');
console.log('\nNote: Update the .env file with your actual credentials before deploying to production.'); 