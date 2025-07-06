import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // In demo mode, start with no user so login works properly
      user: DEMO_MODE ? null : null,
      token: DEMO_MODE ? null : null,
      refreshToken: DEMO_MODE ? null : null,
      isAuthenticated: DEMO_MODE ? false : false,
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });
          
          console.log('🔐 Starting login process...', DEMO_MODE ? '(Demo Mode)' : '(Production Mode)');
          console.log('🔐 Credentials:', { email: credentials.email, passwordLength: credentials.password?.length });
          
          const response: AuthResponse = await authAPI.login(credentials);
          
          console.log('🔐 Login response received:', response);
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          const message = DEMO_MODE ? 'Demo login successful!' : 'Login successful!';
          console.log('✅', message);
          toast.success(message);
        } catch (error: any) {
          console.error('❌ Login error:', error);
          set({ isLoading: false });
          const message = DEMO_MODE ? 'Demo login failed - please try again' : (error.message || 'Login failed');
          toast.error(message);
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true });
          const response: AuthResponse = await authAPI.register(userData);
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        toast.success('Logged out successfully');
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
