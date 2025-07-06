// Mock Redis client for development
class MockRedis {
  private data: Map<string, string> = new Map();
  private expirations: Map<string, number> = new Map();

  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.data.set(key, value);
    this.expirations.set(key, Date.now() + (seconds * 1000));
  }

  async get(key: string): Promise<string | null> {
    const expiration = this.expirations.get(key);
    if (expiration && Date.now() > expiration) {
      this.data.delete(key);
      this.expirations.delete(key);
      return null;
    }
    return this.data.get(key) || null;
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
    this.expirations.delete(key);
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  disconnect(): void {
    this.data.clear();
    this.expirations.clear();
  }
}

export const mockRedis = new MockRedis();
