import { pool } from '../config/database';
import { User, CreateUserRequest } from '../types';
import { IUserRepository } from './IUserRepository';
import { randomUUID } from 'crypto';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password, is_online, last_seen, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password, is_online, last_seen, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    
    try {
      const result = await pool.query(query, [email]);
      if (result.rows.length === 0) return null;
      
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password, is_online, last_seen, created_at, updated_at
      FROM users 
      WHERE username = $1
    `;
    
    try {
      const result = await pool.query(query, [username]);
      if (result.rows.length === 0) return null;
      
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  async create(userData: CreateUserRequest): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    
    const query = `
      INSERT INTO users (id, username, email, password, is_online, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email, password, is_online, last_seen, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [
        id,
        userData.username,
        userData.email,
        userData.password,
        false,
        now,
        now
      ]);
      
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const query = `
      UPDATE users 
      SET is_online = $1, last_seen = $2, updated_at = $3
      WHERE id = $4
    `;
    
    try {
      await pool.query(query, [isOnline, new Date(), new Date(), userId]);
    } catch (error) {
      console.error('Error updating user online status:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const query = `
      SELECT id, username, email, is_online, last_seen, created_at, updated_at
      FROM users 
      ORDER BY username ASC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows.map(row => this.mapRowToUser(row, false));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  private mapRowToUser(row: any, includePassword: boolean = true): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      ...(includePassword && { password: row.password }),
      isOnline: row.is_online,
      lastSeen: row.last_seen,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const userRepository = new UserRepository();
