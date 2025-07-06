import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Message, Group, User, Typing } from '../types';
import { api } from '../services/api';
import { websocketService } from '../services/websocket';

interface ChatState {
  // Messages
  messages: Message[];
  selectedGroupId: string | null;
  
  // Groups
  groups: Group[];
  
  // Users
  users: User[];
  onlineUsers: string[];
  
  // Typing indicators
  typingUsers: Typing[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedGroup: (groupId: string | null) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  loadMessages: (groupId: string, offset?: number) => Promise<void>;
  loadGroups: () => Promise<void>;
  loadUsers: () => Promise<void>;
  createGroup: (name: string, userIds: string[]) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  addTyping: (typing: Typing) => void;
  removeTyping: (userId: string, groupId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  clearError: () => void;
  
  // WebSocket event handlers
  handleNewMessage: (message: Message) => void;
  handleUserJoined: (userId: string, groupId: string) => void;
  handleUserLeft: (userId: string, groupId: string) => void;
  handleTypingStart: (typing: Typing) => void;
  handleTypingStop: (userId: string, groupId: string) => void;
  handleUserOnline: (userId: string) => void;
  handleUserOffline: (userId: string) => void;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state with mock data for demo
    messages: [
      {
        id: '1',
        content: 'Welcome to the chat! This is a demo message.',
        senderId: 'demo-user',
        senderUsername: 'Demo User',
        groupId: 'general',
        timestamp: new Date(Date.now() - 60000),
        messageType: 'text',
        isDelivered: true,
        isRead: true,
      },
      {
        id: '2',
        content: 'You can send messages and see them appear here in real-time.',
        senderId: 'demo-user',
        senderUsername: 'Demo User',
        groupId: 'general',
        timestamp: new Date(Date.now() - 30000),
        messageType: 'text',
        isDelivered: true,
        isRead: true,
      },
    ],
    selectedGroupId: 'general',
    groups: [
      {
        id: 'general',
        name: 'General',
        description: 'General discussion',
        members: [],
        memberIds: ['current-user', 'demo-user'],
        adminIds: ['current-user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'random',
        name: 'Random',
        description: 'Random chat',
        members: [],
        memberIds: ['current-user'],
        adminIds: ['current-user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    users: [
      {
        id: 'current-user',
        username: 'You',
        email: 'you@example.com',
        isOnline: true,
      },
      {
        id: 'demo-user',
        username: 'Demo User',
        email: 'demo@example.com',
        isOnline: true,
      },
      {
        id: 'offline-user',
        username: 'Offline User',
        email: 'offline@example.com',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
      },
    ],
    onlineUsers: ['current-user', 'demo-user'],
    typingUsers: [],
    isLoading: false,
    error: null,

    // Actions
    setSelectedGroup: (groupId) => {
      set({ selectedGroupId: groupId });
      if (groupId) {
        get().loadMessages(groupId);
      }
    },

    sendMessage: async (content, type = 'text') => {
      const { selectedGroupId } = get();
      if (!selectedGroupId) return;

      try {
        set({ isLoading: true, error: null });
        
        // Create a mock message for demo purposes
        const mockMessage = {
          id: Date.now().toString(),
          content,
          senderId: 'current-user',
          senderUsername: 'You',
          groupId: selectedGroupId,
          timestamp: new Date(),
          messageType: type as 'text' | 'image' | 'file',
          isDelivered: true,
          isRead: false,
        };

        // Add message to store immediately for demo
        set((state) => ({
          messages: [...state.messages, mockMessage],
        }));

        // TODO: Replace with actual API call when backend is ready
        // const message = await api.chat.sendMessage({
        //   content,
        //   groupId: selectedGroupId,
        //   type,
        // });
        
        // websocketService.sendMessage(message);
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    loadMessages: async (groupId, offset = 0) => {
      try {
        set({ isLoading: true, error: null });
        
        const response = await api.chat.getMessages(groupId, 50, offset);
        
        set((state) => ({
          messages: offset === 0 
            ? response.messages 
            : [...response.messages, ...state.messages],
        }));
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    loadGroups: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const groups = await api.chat.getGroups();
        set({ groups });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    loadUsers: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const users = await api.user.getUsers();
        set({ users });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    createGroup: async (name, userIds) => {
      try {
        set({ isLoading: true, error: null });
        
        const group = await api.group.createGroup({ name, userIds });
        
        set((state) => ({
          groups: [...state.groups, group],
          selectedGroupId: group.id,
        }));
        
        // Load messages for the new group
        get().loadMessages(group.id);
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    joinGroup: async (groupId) => {
      try {
        set({ isLoading: true, error: null });
        
        await api.group.joinGroup(groupId);
        
        // Reload groups to get updated membership
        await get().loadGroups();
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    leaveGroup: async (groupId) => {
      try {
        set({ isLoading: true, error: null });
        
        await api.group.leaveGroup(groupId);
        
        set((state) => ({
          groups: state.groups.filter(g => g.id !== groupId),
          selectedGroupId: state.selectedGroupId === groupId ? null : state.selectedGroupId,
        }));
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    addTyping: (typing) => {
      set((state) => {
        const existing = state.typingUsers.find(
          t => t.userId === typing.userId && t.groupId === typing.groupId
        );
        
        if (existing) return state;
        
        return {
          typingUsers: [...state.typingUsers, typing],
        };
      });
    },

    removeTyping: (userId, groupId) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter(
          t => !(t.userId === userId && t.groupId === groupId)
        ),
      }));
    },

    setOnlineUsers: (userIds) => {
      set({ onlineUsers: userIds });
    },

    clearError: () => {
      set({ error: null });
    },

    // WebSocket event handlers
    handleNewMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    },

    handleUserJoined: (userId, groupId) => {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId
            ? { ...group, memberIds: [...group.memberIds, userId] }
            : group
        ),
      }));
    },

    handleUserLeft: (userId, groupId) => {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId
            ? { ...group, memberIds: group.memberIds.filter(id => id !== userId) }
            : group
        ),
      }));
    },

    handleTypingStart: (typing) => {
      get().addTyping(typing);
    },

    handleTypingStop: (userId, groupId) => {
      get().removeTyping(userId, groupId);
    },

    handleUserOnline: (userId) => {
      set((state) => ({
        onlineUsers: [...new Set([...state.onlineUsers, userId])],
      }));
    },

    handleUserOffline: (userId) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter(id => id !== userId),
      }));
    },
  }))
);

// Setup WebSocket event listeners (commented out for demo)
// TODO: Uncomment and fix when WebSocket service is implemented
/*
websocketService.onConnect(() => {
  console.log('WebSocket connected');
});

websocketService.onDisconnect(() => {
  console.log('WebSocket disconnected');
});

websocketService.onMessage((message) => {
  useChatStore.getState().handleNewMessage(message);
});

websocketService.onUserJoined((data) => {
  useChatStore.getState().handleUserJoined(data.userId, data.groupId);
});

websocketService.onUserLeft((data) => {
  useChatStore.getState().handleUserLeft(data.userId, data.groupId);
});

websocketService.onTypingStart((typing) => {
  useChatStore.getState().handleTypingStart(typing);
});

websocketService.onTypingStop((data) => {
  useChatStore.getState().handleTypingStop(data.userId, data.groupId);
});

websocketService.onUserOnline((data) => {
  useChatStore.getState().handleUserOnline(data.userId);
});

websocketService.onUserOffline((data) => {
  useChatStore.getState().handleUserOffline(data.userId);
});
*/
