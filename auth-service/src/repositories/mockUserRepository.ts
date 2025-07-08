import { User, CreateUserRequest } from '../types';
import { IUserRepository } from './IUserRepository';
import { randomUUID } from 'crypto';
import { hashPassword } from '../utils/password';

// In-memory storage for development/demo mode
class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private usernameIndex: Map<string, string> = new Map();

  constructor() {
    // Initialize with some demo users for testing
    this.initializeDemoUsers();
  }

  private async initializeDemoUsers(): Promise<void> {
    try {
      const demoUsers = [
        {
          username: 'demo',
          email: 'demo@example.com',
          password: 'demo123',
        },
        {
          username: 'testuser',
          email: 'test@example.com',
          password: 'test123',
        },
        {
          username: 'alice',
          email: 'alice@example.com',
          password: 'alice123',
        },
        {
          username: 'bob',
          email: 'bob@example.com',
          password: 'bob123',
        }
      ];

      for (const userData of demoUsers) {
        const hashedPassword = await hashPassword(userData.password);
        const user: User = {
          id: randomUUID(),
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          isOnline: false,
          lastSeen: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.users.set(user.id, user);
        this.emailIndex.set(user.email, user.id);
        this.usernameIndex.set(user.username, user.id);
      }

      console.log(`✅ Mock repository initialized with ${demoUsers.length} demo users`);
    } catch (error) {
      console.error('❌ Error initializing demo users:', error);
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const userId = this.usernameIndex.get(username);
    return userId ? this.users.get(userId) || null : null;
  }

  async create(userData: CreateUserRequest): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      isOnline: false,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    this.emailIndex.set(userData.email, id);
    this.usernameIndex.set(userData.username, id);

    return user;
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async searchUsers(query: string): Promise<Omit<User, 'password'>[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const lowercaseQuery = query.toLowerCase().trim();
    
    return Array.from(this.users.values())
      .filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery)
      )
      .map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
  }
}

export const mockUserRepository = new MockUserRepository();
