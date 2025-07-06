import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { Sidebar } from './chat/Sidebar';
import { ChatWindow } from './chat/ChatWindow';
import { websocketService } from '../services/websocket';

export const Chat: React.FC = () => {
  const { user, token } = useAuthStore();
  const { selectedGroupId, loadGroups, loadUsers } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      
      try {
        // Check if demo mode is enabled
        const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';
        
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
      const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';
      if (!isDemoMode) {
        websocketService.disconnect();
      }
    };
  }, [token, loadGroups, loadUsers]);

  if (isLoading || !user) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Demo Mode Notice */}
      {process.env.REACT_APP_DEMO_MODE === 'true' && (
        <div className="demo-notice">
          🎮 Demo Mode - Experience the chat app with sample data
          {process.env.REACT_APP_SHOW_DEMO_CREDENTIALS === 'true' && (
            <div className="demo-credentials">
              Demo login: demo@example.com / demo123
            </div>
          )}
        </div>
      )}
      
      <div className="chat-container">
        {/* Sidebar */}
        <Sidebar onToggle={() => {}} />
        
        {/* Main Chat Area */}
        <div className="chat-main">
          {selectedGroupId ? (
            <ChatWindow />
          ) : (
            <div className="welcome-screen">
              <div className="welcome-icon">
                💬
              </div>
              <h2 className="welcome-title">WhatsApp Web</h2>
              <p className="welcome-subtitle">
                Send and receive messages without keeping your phone online.<br />
                Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Default export for better compatibility
export default Chat;