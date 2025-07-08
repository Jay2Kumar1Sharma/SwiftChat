import { userRepository } from '../repositories';
import { hashPassword, comparePassword, validatePassword, validateUsername, validateEmail } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { CreateUserRequest, LoginRequest, AuthResponse, User } from '../types';
import { redis } from '../config/database';

export class AuthService {
  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    // Validate input data
    const emailValidation = validateEmail(userData.email);
    if (!emailValidation.isValid) {
      throw new Error(`Email validation failed: ${emailValidation.errors.join(', ')}`);
    }

    const usernameValidation = validateUsername(userData.username);
    if (!usernameValidation.isValid) {
      throw new Error(`Username validation failed: ${usernameValidation.errors.join(', ')}`);
    }

    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await userRepository.create({
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Store refresh token in Redis with error handling
    try {
      await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
    } catch (error) {
      console.warn('⚠️ Redis setex failed during registration:', error);
      // Continue without Redis - token will still work but won't be stored for refresh
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
    };
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(credentials.password, user.password!);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update online status
    await userRepository.updateOnlineStatus(user.id, true);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Store refresh token in Redis with error handling
    try {
      await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
    } catch (error) {
      console.warn('⚠️ Redis setex failed during login:', error);
      // Continue without Redis - token will still work but won't be stored for refresh
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: { ...userWithoutPassword, isOnline: true },
      token: accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      
      // Check if refresh token exists in Redis with error handling
      let storedToken = null;
      try {
        storedToken = await redis.get(`refresh_token:${payload.userId}`);
      } catch (error) {
        console.warn('⚠️ Redis get failed during refresh token check:', error);
        // Continue without Redis verification - allow refresh if JWT is valid
      }
      
      if (storedToken && storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      // Store new refresh token with error handling
      try {
        await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, newRefreshToken);
      } catch (error) {
        console.warn('⚠️ Redis setex failed during refresh token update:', error);
        // Continue without Redis - token will still work but won't be stored for refresh
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token: accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Update online status
    await userRepository.updateOnlineStatus(userId, false);
    
    // Remove refresh token from Redis with error handling
    try {
      await redis.del(`refresh_token:${userId}`);
    } catch (error) {
      console.warn('⚠️ Redis del failed during logout:', error);
      // Continue without Redis - user will still be logged out
    }
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
