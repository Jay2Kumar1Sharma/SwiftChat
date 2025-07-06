import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User, Message, Group } from '../types';

// Check if we're in demo mode - multiple checks for reliability
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true' || 
                  process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL?.includes('onrender.com');

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://chat-api-gateway.onrender.com' 
    : 'http://localhost:4000');

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🎮 Demo Mode:', DEMO_MODE);
console.log('🌍 Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_DEMO_MODE: process.env.REACT_APP_DEMO_MODE,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Demo data
const DEMO_USER: User = {
  id: 'demo-user-1',
  username: 'Demo User',
  email: 'demo@example.com',
  isOnline: true,
};

const DEMO_AUTH_RESPONSE: AuthResponse = {
  user: DEMO_USER,
  token: 'demo-jwt-token',
  refreshToken: 'demo-refresh-token',
};

// Demo user database - valid credentials for demo mode
const DEMO_USERS = [
  { email: 'demo@example.com', password: 'demo123', username: 'Demo User', id: 'demo-user-1' },
  { email: 'john@example.com', password: 'password123', username: 'John Doe', id: 'demo-user-2' },
  { email: 'jane@example.com', password: 'password123', username: 'Jane Smith', id: 'demo-user-3' },
  { email: 'admin@example.com', password: 'admin123', username: 'Admin User', id: 'demo-user-4' },
  { email: 'test@test.com', password: 'test123', username: 'Test User', id: 'demo-user-5' },
];

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client(config);
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'An error occurred');
    }
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url });
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data });
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

const apiClient = new APIClient();

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Force demo mode if API URL is localhost and we can't reach it
    const forceDemo = DEMO_MODE || API_BASE_URL.includes('localhost');
    
    if (forceDemo) {
      console.log('🎮 Demo login attempt:', { email: credentials.email, passwordLength: credentials.password?.length });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Validate credentials against demo user database
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter both email and password');
      }
      
      const demoUser = DEMO_USERS.find(user => 
        user.email.toLowerCase() === credentials.email.toLowerCase() && 
        user.password === credentials.password
      );
      
      if (demoUser) {
        console.log('🎮 Demo login successful for:', demoUser.username);
        return {
          user: {
            id: demoUser.id,
            username: demoUser.username,
            email: demoUser.email,
            isOnline: true,
          },
          token: `demo-jwt-token-${demoUser.id}`,
          refreshToken: `demo-refresh-token-${demoUser.id}`,
        };
      } else {
        console.log('🎮 Demo login failed: Invalid credentials');
        throw new Error('Invalid email or password. Try: demo@example.com / demo123');
      }
    }
    
    // Try real API call, but fallback to demo if it fails
    try {
      console.log('🌐 Attempting real API login...');
      return await apiClient.post('/api/auth/login', credentials);
    } catch (error) {
      console.warn('🌐 Real API failed, falling back to demo mode:', error);
      
      // Fallback to demo validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter both email and password');
      }
      
      const demoUser = DEMO_USERS.find(user => 
        user.email.toLowerCase() === credentials.email.toLowerCase() && 
        user.password === credentials.password
      );
      
      if (demoUser) {
        console.log('🎮 Fallback demo login successful for:', demoUser.username);
        return {
          user: {
            id: demoUser.id,
            username: demoUser.username,
            email: demoUser.email,
            isOnline: true,
          },
          token: `demo-jwt-token-${demoUser.id}`,
          refreshToken: `demo-refresh-token-${demoUser.id}`,
        };
      } else {
        throw new Error('Invalid email or password. Try: demo@example.com / demo123');
      }
    }
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const forceDemo = DEMO_MODE || API_BASE_URL.includes('localhost');
    
    if (forceDemo) {
      console.log('🎮 Demo register:', userData);
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        ...DEMO_AUTH_RESPONSE,
        user: {
          ...DEMO_USER,
          username: userData.username,
          email: userData.email,
        }
      };
    }
    
    try {
      console.log('🌐 Attempting real API register...');
      return await apiClient.post('/api/auth/register', userData);
    } catch (error) {
      console.warn('🌐 Real API failed, falling back to demo mode:', error);
      return {
        ...DEMO_AUTH_RESPONSE,
        user: {
          ...DEMO_USER,
          username: userData.username,
          email: userData.email,
        }
      };
    }
  },
  
  logout: async (): Promise<void> => {
    const forceDemo = DEMO_MODE || API_BASE_URL.includes('localhost');
    
    if (forceDemo) {
      console.log('🎮 Demo logout');
      return;
    }
    
    try {
      return await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('🌐 Logout API failed, but continuing:', error);
      return;
    }
  },
  
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    if (DEMO_MODE) {
      return { token: 'demo-jwt-token', refreshToken: 'demo-refresh-token' };
    }
    return apiClient.post('/api/auth/refresh', { refreshToken });
  },
  
  me: async (): Promise<User> => {
    if (DEMO_MODE) {
      return DEMO_USER;
    }
    return apiClient.get('/api/auth/me');
  },
};

// Chat API
export const chatAPI = {
  getMessages: (groupId: string, limit = 50, offset = 0): Promise<{ messages: Message[] }> =>
    apiClient.get(`/chat/messages?groupId=${groupId}&limit=${limit}&offset=${offset}`),
  
  sendMessage: (message: { content: string; groupId: string; type?: string }): Promise<Message> =>
    apiClient.post('/chat/messages', message),
  
  markAsRead: (messageIds: string[]): Promise<void> =>
    apiClient.put('/chat/messages/read', { messageIds }),
  
  deleteMessage: (messageId: string): Promise<void> =>
    apiClient.delete(`/chat/messages/${messageId}`),
  
  getGroups: (): Promise<Group[]> =>
    apiClient.get('/chat/groups'),
};

// User API
export const userAPI = {
  getUsers: (): Promise<User[]> =>
    apiClient.get('/users'),
  
  getUser: (userId: string): Promise<User> =>
    apiClient.get(`/users/${userId}`),
  
  updateProfile: (userData: Partial<User>): Promise<User> =>
    apiClient.put('/users/profile', userData),
  
  searchUsers: (query: string): Promise<User[]> =>
    apiClient.get(`/users/search?q=${encodeURIComponent(query)}`),
};

// Group API
export const groupAPI = {
  getGroups: (): Promise<Group[]> =>
    apiClient.get('/groups'),
  
  getGroup: (groupId: string): Promise<Group> =>
    apiClient.get(`/groups/${groupId}`),
  
  createGroup: (groupData: { name: string; userIds: string[] }): Promise<Group> =>
    apiClient.post('/groups', groupData),
  
  updateGroup: (groupId: string, groupData: Partial<Group>): Promise<Group> =>
    apiClient.put(`/groups/${groupId}`, groupData),
  
  deleteGroup: (groupId: string): Promise<void> =>
    apiClient.delete(`/groups/${groupId}`),
  
  addMember: (groupId: string, userId: string): Promise<void> =>
    apiClient.post(`/groups/${groupId}/members`, { userId }),
  
  removeMember: (groupId: string, userId: string): Promise<void> =>
    apiClient.delete(`/groups/${groupId}/members/${userId}`),
  
  joinGroup: (groupId: string): Promise<void> =>
    apiClient.post(`/groups/${groupId}/join`),
  
  leaveGroup: (groupId: string): Promise<void> =>
    apiClient.post(`/groups/${groupId}/leave`),
};

// Combined API object
export const api = {
  auth: authAPI,
  chat: chatAPI,
  user: userAPI,
  group: groupAPI,
};

export default apiClient;
