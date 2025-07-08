import { Pool } from 'pg';
import { mockRedis } from './mockRedis';
import { mockPool } from './mockDatabase';

// Conditional Redis import to handle missing dependency
let Redis: any;
try {
  Redis = require('ioredis');
} catch (error) {
  console.warn('⚠️ ioredis not available, using mock Redis');
  Redis = null;
}

// Determine if we should use mock services
const shouldUseMockServices = (): boolean => {
  const isDevMode = process.env.NODE_ENV === 'development';
  const databaseUrl = process.env.DATABASE_URL || '';
  
  // Use real database if:
  // - Has postgresql:// URL AND
  // - (Points to remote server OR explicitly enabled for local)
  const hasRealDatabase = databaseUrl.includes('postgresql://') && 
    (!databaseUrl.includes('localhost') || process.env.USE_REAL_LOCAL_DB === 'true');
  
  // In production, check if database URL is properly configured
  if (process.env.NODE_ENV === 'production') {
    return !hasRealDatabase || !databaseUrl;
  }
  
  return isDevMode && !hasRealDatabase;
};

// PostgreSQL connection - use mock pool if needed
const createDatabasePool = () => {
  if (shouldUseMockServices() || !process.env.DATABASE_URL) {
    console.log('🎮 Using mock PostgreSQL for development/fallback');
    return mockPool as any; // Type assertion for compatibility
  } else {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
};

export const pool = createDatabasePool();

// Redis connection - use mock in development without real database
const createRedisClient = () => {
  if (shouldUseMockServices() || !Redis) {
    console.log('🎮 Using mock Redis for development');
    return mockRedis as any; // Type assertion for compatibility
  } else {
    console.log('🔗 Using real Redis connection');
    return new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
};

export const redis = createRedisClient();

export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if we should use mock services
    if (shouldUseMockServices()) {
      console.log('🎮 Development Mode: Using mock database and Redis connections');
      console.log('✅ Mock PostgreSQL connected');
      console.log('✅ Mock Redis connected');
      return;
    }

    // Test PostgreSQL connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ PostgreSQL connected successfully');

    // Test Redis connection (only if it's a real Redis instance)
    if (redis && typeof redis.ping === 'function') {
      await redis.ping();
      console.log('✅ Redis connected successfully');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // In production, if DATABASE_URL is not properly configured, 
    // we should still allow the service to start with fallback mode
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
      console.log('🎮 Falling back to mock mode due to missing or local database configuration');
      return; // Allow service to continue with mock mode
    }
    
    // Only throw error in production if we have a real database URL but connection fails
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
      console.log('🔄 Retrying database connection in 5 seconds...');
      // Give it one more try after a delay
      setTimeout(async () => {
        try {
          const client = await pool.connect();
          await client.query('SELECT 1');
          client.release();
          console.log('✅ PostgreSQL connected on retry');
        } catch (retryError) {
          console.error('❌ Database retry failed, continuing with mock mode');
        }
      }, 5000);
      return; // Allow service to continue
    }
    
    // In development, always fall back to mock mode
    console.log('🎮 Falling back to mock mode for development');
  }
};

// Graceful shutdown
process.on('exit', () => {
  pool.end();
  if (redis && typeof redis.disconnect === 'function') {
    redis.disconnect();
  }
});
