import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { Sidebar } from './chat/Sidebar';
import { ChatWindow } from './chat/ChatWindow';
import { websocketService } from '../services/websocket';

export const Chat: React.FC = () => {
  const { user, token } = useAuthStore();
  const { selectedGroupId, loadGroups, loadUsers } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      
      try {
        // Skip WebSocket connection in demo mode
        const isDemoMode = true; // Enable demo mode
        if (token && !isDemoMode) {
          websocketService.connect(token);
        }

        // Load initial data
        await Promise.all([
          loadGroups(),
          loadUsers()
        ]);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      // Skip cleanup in demo mode
      const isDemoMode = true;
      if (!isDemoMode) {
        websocketService.disconnect();
      }
    };
  }, [token, loadGroups, loadUsers]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {!user ? 'Authenticating...' : 'Loading Chat...'}
          </h2>
          <p className="text-gray-600">
            {!user ? 'Please wait while we verify your credentials' : 'Preparing your conversations'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-primary-50 overflow-hidden">
      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-center text-sm font-medium">
        🎮 Demo Mode - No backend connection required | All data is simulated
      </div>
      
      {/* Main Chat Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div 
          className={`${
            isSidebarOpen ? 'w-80' : 'w-0 lg:w-20'
          } transition-all duration-300 ease-in-out overflow-hidden bg-white/80 backdrop-blur-sm border-r border-gray-200/50 shadow-lg`}
        >
          <Sidebar 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            isCollapsed={!isSidebarOpen}
          />
        </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="btn btn-ghost btn-icon-only"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {selectedGroupId ? 'Chat' : 'Messages'}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {selectedGroupId ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md mx-auto animate-fade-in">
              {/* Welcome illustration */}
              <div className="mx-auto h-32 w-32 text-gray-300 mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full opacity-20 animate-pulse"></div>
                <svg
                  className="relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 gradient-text">
                Welcome to ChatApp
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Select a conversation from the sidebar to start chatting with your friends and colleagues.
              </p>
              
              {/* Quick actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  className="btn btn-primary hover-lift"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start New Chat
                </button>
                <button className="btn btn-secondary hover-lift">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Chat;
