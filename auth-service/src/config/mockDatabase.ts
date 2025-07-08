// Mock PostgreSQL client for development/fallback
class MockClient {
  async query(text: string, params?: any[]): Promise<any> {
    console.log(`🎮 Mock DB Query: ${text}`);
    
    // Return mock responses based on query type
    if (text.includes('SELECT 1')) {
      return { rows: [{ '?column?': 1 }] };
    }
    
    if (text.includes('SELECT') && text.includes('users')) {
      // Mock users database
      const mockUsers = [
        { 
          id: 'demo-user-1', 
          username: 'demo', 
          email: 'demo@swiftchat.com',
          password: '$2b$10$hashedpassword',
          is_online: true,
          last_seen: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        { 
          id: 'demo-user-2', 
          username: 'john', 
          email: 'john@swiftchat.com',
          password: '$2b$10$hashedpassword',
          is_online: false,
          last_seen: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        { 
          id: 'demo-user-3', 
          username: 'jane', 
          email: 'jane@swiftchat.com',
          password: '$2b$10$hashedpassword',
          is_online: true,
          last_seen: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      // Handle search queries
      if (text.includes('ILIKE') && params?.[0]) {
        const searchTerm = params[0].replace(/%/g, '').toLowerCase();
        const filtered = mockUsers.filter(user => 
          user.username.toLowerCase().includes(searchTerm) || 
          user.email.toLowerCase().includes(searchTerm)
        );
        return { rows: filtered };
      }
      
      // Handle user by ID
      if (text.includes('WHERE id = $1') && params?.[0]) {
        const user = mockUsers.find(u => u.id === params[0]);
        return { rows: user ? [user] : [] };
      }
      
      // Handle user by email
      if (text.includes('WHERE email = $1') && params?.[0]) {
        const user = mockUsers.find(u => u.email === params[0]);
        return { rows: user ? [user] : [] };
      }
      
      // Handle user by username
      if (text.includes('WHERE username = $1') && params?.[0]) {
        const user = mockUsers.find(u => u.username === params[0]);
        return { rows: user ? [user] : [] };
      }
      
      // Return all users
      return { rows: mockUsers };
    }
    
    if (text.includes('INSERT') && text.includes('users')) {
      const newUser = {
        id: params?.[0] || `user-${Date.now()}`,
        username: params?.[1] || 'user',
        email: params?.[2] || 'user@swiftchat.com',
        password: params?.[3] || '$2b$10$hashedpassword',
        is_online: params?.[4] || false,
        last_seen: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
      return { rows: [newUser] };
    }
    
    if (text.includes('UPDATE') && text.includes('users')) {
      return { rows: [] };
    }
    
    return { rows: [] };
  }

  release(): void {
    // Mock release - no action needed
  }
}

class MockPool {
  async connect(): Promise<MockClient> {
    return new MockClient();
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.connect();
    const result = await client.query(text, params);
    client.release();
    return result;
  }

  end(): void {
    console.log('🎮 Mock PostgreSQL pool ended');
  }
}

export const mockPool = new MockPool();
