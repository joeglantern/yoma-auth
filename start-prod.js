/**
 * Production startup script for Advanta-Yoma Integration Service
 * 
 * This script ensures environment variables are properly set and starts
 * the server in production mode.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Ensure NODE_ENV is set to production
process.env.NODE_ENV = 'production';

// Check if .env file exists
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: .env file not found!');
  console.error('Please run "npm run setup" to create your environment configuration.');
  process.exit(1);
}

// Check for required environment variables in .env file
const requiredVars = [
  'ADVANTA_TOKEN',
  'YOMA_CLIENT_ID',
  'YOMA_CLIENT_SECRET'
];

// Load .env file and check variables
const envContent = fs.readFileSync(envFile, 'utf8');
const missingVars = [];

requiredVars.forEach(varName => {
  if (!envContent.includes(varName + '=') || 
      envContent.includes(varName + '=your_real_') ||
      envContent.includes(varName + '=dev-')) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing or invalid environment variables!');
  console.error('The following variables need to be properly set in your .env file:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('Please run "npm run setup" and choose the production environment.');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ Environment validation passed!');
console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Advanta-Yoma Integration Service in production mode...');

// Start the app
const server = spawn('node', ['index.js'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error('\x1b[31m%s\x1b[0m', `Server process exited with code ${code}`);
    process.exit(code);
  }
}); 