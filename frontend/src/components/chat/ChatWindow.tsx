import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const ChatWindow: React.FC = () => {
  const { selectedGroupId, groups, messages, loadMessages, isLoading, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  useEffect(() => {
    if (selectedGroupId) {
      loadMessages(selectedGroupId);
    }
  }, [selectedGroupId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Group not found</p>
          <p className="text-sm text-gray-500 mt-1">This group may have been deleted or you don't have access</p>
        </div>
      </div>
    );
  }

  const groupMessages = messages.filter(m => m.groupId === selectedGroupId);
  const onlineMembersCount = selectedGroup.memberIds.filter(id => onlineUsers.includes(id)).length;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/50 animate-fade-in">
      {/* Enhanced Header */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Group Avatar */}
            <div className="relative">
              <div className={`avatar avatar-lg ${
                selectedGroup.avatar 
                  ? '' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              } shadow-md ring-2 ring-white`}>
                {selectedGroup.avatar ? (
                  <img
                    className="w-full h-full object-cover"
                    src={selectedGroup.avatar}
                    alt={selectedGroup.name}
                  />
                ) : (
                  <span className="font-semibold text-lg">
                    {selectedGroup.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {onlineMembersCount > 0 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{onlineMembersCount}</span>
                </div>
              )}
            </div>
            
            {/* Group Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 gradient-text">
                {selectedGroup.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>{selectedGroup.memberIds.length} members</span>
                </div>
                {onlineMembersCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <span>{onlineMembersCount} online</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Group Actions */}
          <div className="flex items-center space-x-2">
            <button 
              className="btn btn-ghost btn-icon-only tooltip hover-lift"
              title="Video call"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              className="btn btn-ghost btn-icon-only tooltip hover-lift"
              title="Voice call"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button 
              className="btn btn-ghost btn-icon-only tooltip hover-lift"
              title="Group information"
              onClick={() => setShowGroupInfo(!showGroupInfo)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-4 relative bg-gradient-to-b from-transparent to-gray-50/30"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading messages...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your conversation</p>
            </div>
          </div>
        ) : groupMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto text-gray-300 mb-6">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 mb-6">Be the first to start the conversation in {selectedGroup.name}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="btn btn-primary hover-lift">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Send first message
                </button>
                <button className="btn btn-secondary hover-lift">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Invite members
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={groupMessages} currentUserId={user?.id || ''} />
        )}
        
        <div ref={messagesEndRef} />
        
        {/* Enhanced Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-6 right-6 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover-lift"
            style={{ zIndex: 10 }}
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Enhanced Message Input */}
      <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
        <MessageInput />
      </div>

      {/* Group Info Panel (slide-out) */}
      {showGroupInfo && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-50 animate-slide-in-right">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Group Information</h3>
              <button
                onClick={() => setShowGroupInfo(false)}
                className="btn btn-ghost btn-icon-only"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Group info content would go here */}
            <div className="text-sm text-gray-600">
              <p>Group details and member management coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
