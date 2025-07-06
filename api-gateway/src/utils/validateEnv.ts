export const validateEnv = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET'
  ];

  // Optional environment variables with defaults
  const optionalEnvVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT', 
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'REDIS_HOST',
    'REDIS_PORT',
  ];

  const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:', missingRequired);
    console.error('Please check your .env file');
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }

  const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn('⚠️ Missing optional environment variables (using defaults):', missingOptional);
  }

  // Validate port numbers
  const ports = {
    API_GATEWAY_PORT: process.env.API_GATEWAY_PORT || process.env.PORT || '4000',
    WEBSOCKET_GATEWAY_PORT: process.env.WEBSOCKET_GATEWAY_PORT || '4001',
    AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT || '4002',
    CHAT_SERVICE_PORT: process.env.CHAT_SERVICE_PORT || '4003',
    NOTIFICATION_SERVICE_PORT: process.env.NOTIFICATION_SERVICE_PORT || '4004',
    POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
  };

  for (const [name, value] of Object.entries(ports)) {
    const port = parseInt(value, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error(`❌ Invalid port number for ${name}: ${value}`);
      throw new Error(`Invalid port number for ${name}: ${value}`);
    }
  }

  console.log('✅ Environment variables validated successfully');
};
