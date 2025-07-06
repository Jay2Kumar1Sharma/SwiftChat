export const validateEnv = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  // Optional environment variables with defaults
  const optionalEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'FRONTEND_URL'
  ];

  const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:', missingRequired);
    console.error('Please check your .env file');
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }

  // Validate JWT secrets length
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (jwtSecret && jwtSecret.length < 32) {
    console.warn('⚠️ JWT_SECRET should be at least 32 characters for security');
  }

  if (jwtRefreshSecret && jwtRefreshSecret.length < 32) {
    console.warn('⚠️ JWT_REFRESH_SECRET should be at least 32 characters for security');
  }

  const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn('⚠️ Missing optional environment variables (using defaults):', missingOptional);
  }

  // Set defaults
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.AUTH_SERVICE_PORT = process.env.AUTH_SERVICE_PORT || '4002';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://chat_user:chat_password@localhost:5432/chat_db';
    console.log('🎮 Using default DATABASE_URL for development');
  }
  
  if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = 'redis://localhost:6379';
    console.log('🎮 Using default REDIS_URL for development');
  }

  console.log('✅ Environment variables validated successfully');
};
