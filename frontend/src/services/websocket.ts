import { io, Socket } from 'socket.io-client';
import { Message, User } from '../types';
import toast from 'react-hot-toast';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || 
                       process.env.NODE_ENV === 'development'; // Default to demo in development

  connect(token: string) {
    // Skip WebSocket connection in demo mode
    if (this.isDemoMode) {
      console.log('🎮 Demo mode: Skipping WebSocket connection');
      return;
    }

    if (!token) {
      console.error('No auth token available for WebSocket connection');
      return;
    }

    const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://chat-websocket.onrender.com' 
        : 'http://localhost:4001');
    
    this.socket = io(WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (this.isDemoMode) {
        console.log('🎮 Demo mode: Ignoring connect event');
        return;
      }
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      toast.success('Connected to chat server');
    });

    this.socket.on('disconnect', (reason) => {
      if (this.isDemoMode) {
        console.log('🎮 Demo mode: Ignoring disconnect event');
        return;
      }
      console.log('Disconnected from WebSocket server:', reason);
      toast.error('Disconnected from chat server');
    });

    this.socket.on('connect_error', (error) => {
      if (this.isDemoMode) {
        console.log('🎮 Demo mode: Ignoring connection error');
        return;
      }
      console.error('WebSocket connection error:', error);
      this.handleReconnection();
    });

    this.socket.on('auth_error', (error) => {
      if (this.isDemoMode) {
        console.log('🎮 Demo mode: Ignoring auth error');
        return;
      }
      console.error('WebSocket authentication error:', error);
      toast.error('Authentication failed');
    });

    this.socket.on('error', (error) => {
      if (this.isDemoMode) {
        console.log('🎮 Demo mode: Ignoring socket error');
        return;
      }
      console.error('WebSocket error:', error);
      toast.error(error.message || 'WebSocket error occurred');
    });
  }

  private handleReconnection() {
    // Skip reconnection logic in demo mode
    if (this.isDemoMode) {
      console.log('🎮 Demo mode: Skipping reconnection attempt');
      return;
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        // Reconnection logic would go here
      }, delay);
    } else {
      toast.error('Failed to reconnect to chat server');
    }
  }

  disconnect() {
    if (this.isDemoMode) {
      console.log('🎮 Demo mode: Skipping WebSocket disconnect');
      return;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Message events
  onNewMessage(callback: (message: Message) => void) {
    if (this.isDemoMode) return;
    this.socket?.on('new_message', callback);
  }

  onMessageRead(callback: (data: { messageId: string; userId: string }) => void) {
    if (this.isDemoMode) return;
    this.socket?.on('message_read', callback);
  }

  onMessageDelivered(callback: (data: { messageId: string; userId: string }) => void) {
    if (this.isDemoMode) return;
    this.socket?.on('message_delivered', callback);
  }

  // Sending events
  sendMessage(message: Partial<Message>) {
    if (this.isDemoMode) return;
    this.socket?.emit('send_message', message);
  }

  joinRoom(roomId: string) {
    if (this.isDemoMode) return;
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string) {
    if (this.isDemoMode) return;
    this.socket?.emit('leave_room', roomId);
  }

  startTyping(roomId: string) {
    if (this.isDemoMode) return;
    this.socket?.emit('typing_start', { roomId });
  }

  stopTyping(roomId: string) {
    if (this.isDemoMode) return;
    this.socket?.emit('typing_stop', { roomId });
  }

  // Typing events
  onTypingStart(callback: (data: { userId: string; username: string; roomId: string }) => void) {
    if (this.isDemoMode) return;
    this.socket?.on('typing_start', callback);
  }

  onTypingStop(callback: (data: { userId: string; username: string; roomId: string }) => void) {
    if (this.isDemoMode) return;
    this.socket?.on('typing_stop', callback);
  }

  // User status events
  onUserOnline(callback: (user: User) => void) {
    if (this.isDemoMode) return;
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (user: User) => void) {
    if (this.isDemoMode) return;
    this.socket?.on('user_offline', callback);
  }

  isConnected(): boolean {
    if (this.isDemoMode) return true; // Always return true in demo mode
    return this.socket?.connected || false;
  }

  removeAllListeners() {
    if (this.isDemoMode) return;
    this.socket?.removeAllListeners();
  }
}

export const webSocketService = new WebSocketService();
export const websocketService = webSocketService; // For compatibility
export default webSocketService;
