// Mock PostgreSQL client for development/fallback
class MockClient {
  async query(text: string, params?: any[]): Promise<any> {
    console.log(`🎮 Mock DB Query: ${text}`);
    
    // Return mock responses based on query type
    if (text.includes('SELECT 1')) {
      return { rows: [{ '?column?': 1 }] };
    }
    
    if (text.includes('SELECT') && text.includes('users')) {
      return { 
        rows: [
          { id: 1, username: 'demo', email: 'demo@swiftchat.com' }
        ] 
      };
    }
    
    if (text.includes('INSERT') && text.includes('users')) {
      return { 
        rows: [{ id: Date.now(), username: params?.[0] || 'user', email: params?.[1] || 'user@swiftchat.com' }] 
      };
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
