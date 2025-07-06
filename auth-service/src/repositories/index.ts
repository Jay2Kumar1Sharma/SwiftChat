import { UserRepository } from './userRepository';
import { mockUserRepository } from './mockUserRepository';
import { IUserRepository } from './IUserRepository';

// Determine which repository to use based on environment
const shouldUseMockRepository = (): boolean => {
  // Use mock repository if:
  // 1. We're in development mode AND
  // 2. No real database URL is provided OR database URL points to localhost
  const isDevMode = process.env.NODE_ENV === 'development';
  const databaseUrl = process.env.DATABASE_URL || '';
  
  // Consider it a real database if:
  // - Contains postgresql:// protocol
  // - AND (doesn't contain localhost OR is specifically configured for real use)
  const hasRealDatabase = databaseUrl.includes('postgresql://') && 
    (!databaseUrl.includes('localhost') || process.env.USE_REAL_LOCAL_DB === 'true');
  
  console.log(`🔍 Database detection: NODE_ENV=${process.env.NODE_ENV}, DATABASE_URL=${databaseUrl ? 'set' : 'not set'}, hasRealDatabase=${hasRealDatabase}`);
  
  return isDevMode && !hasRealDatabase;
};

// Create repository instance
const createUserRepository = (): IUserRepository => {
  if (shouldUseMockRepository()) {
    console.log('🎮 Using mock user repository for development');
    return mockUserRepository;
  } else {
    console.log('🗄️ Using PostgreSQL user repository');
    return new UserRepository();
  }
};

export const userRepository = createUserRepository();
