import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
};

// Enhanced password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation
export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  if (/^[_]/.test(username) || /[_]$/.test(username)) {
    errors.push('Username cannot start or end with underscore');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (email.length > 254) {
    errors.push('Email address is too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
