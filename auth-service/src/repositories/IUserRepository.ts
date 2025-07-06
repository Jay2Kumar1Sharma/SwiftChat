import { User, CreateUserRequest } from '../types';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(userData: CreateUserRequest): Promise<User>;
  updateOnlineStatus(userId: string, isOnline: boolean): Promise<void>;
  getAllUsers(): Promise<Omit<User, 'password'>[]>;
}
