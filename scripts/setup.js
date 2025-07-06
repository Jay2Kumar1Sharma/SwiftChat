const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Distributed Chat Application...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📄 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Services to install dependencies for
const services = [
  'frontend',
  'api-gateway',
  'websocket-gateway',
  'auth-service',
  'chat-service',
  'notification-service'
];

console.log('📦 Installing dependencies for all services...\n');

for (const service of services) {
  const servicePath = path.join(__dirname, '..', service);
  
  if (fs.existsSync(servicePath)) {
    console.log(`Installing dependencies for ${service}...`);
    try {
      execSync('npm install', { 
        cwd: servicePath, 
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      });
      console.log(`✅ ${service} dependencies installed\n`);
    } catch (error) {
      console.error(`❌ Failed to install dependencies for ${service}:`, error.message);
    }
  } else {
    console.log(`⚠️  Service directory not found: ${service}\n`);
  }
}

console.log('🐳 Setting up development infrastructure...\n');

try {
  console.log('Starting PostgreSQL and Redis containers...');
  execSync('docker-compose -f docker-compose.dev.yml up -d', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Development infrastructure started\n');
} catch (error) {
  console.error('❌ Failed to start development infrastructure:', error.message);
  console.log('💡 Make sure Docker is installed and running\n');
}

console.log('🎉 Setup complete!\n');
console.log('📋 Next steps:');
console.log('1. Start development: npm run dev');
console.log('2. Check services: npm run status');
console.log('3. View logs: npm run logs');
console.log('4. Stop services: npm run stop\n');

console.log('🌐 Application URLs:');
console.log('- Frontend: http://localhost:3000');
console.log('- API Gateway: http://localhost:4000');
console.log('- WebSocket: http://localhost:4001');
console.log('- pgAdmin: http://localhost:5050');
console.log('- Redis Commander: http://localhost:8081\n');

console.log('📖 Documentation:');
console.log('- Quick Start: ./QUICK_START.md');
console.log('- API Docs: ./docs/API.md');
console.log('- Development: ./docs/DEVELOPMENT.md');
