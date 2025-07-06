import React from 'react';
import { useChatStore } from '../../stores/chatStore';
import { Group } from '../../types';

export const GroupList: React.FC = () => {
  const { groups, selectedGroupId, setSelectedGroup, onlineUsers, messages } = useChatStore();

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(messageDate);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(messageDate);
    }
  };

  const getOnlineMembersCount = (group: Group) => {
    return group.memberIds.filter(id => onlineUsers.includes(id)).length;
  };

  const getLastMessage = (groupId: string) => {
    const groupMessages = messages.filter(msg => msg.groupId === groupId);
    return groupMessages[groupMessages.length - 1];
  };

  const getUnreadCount = (groupId: string) => {
    // Mock unread count - in real app this would be calculated based on last read timestamp
    return Math.floor(Math.random() * 5);
  };

  if (groups.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto w-16 h-16 text-gray-300 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">No groups yet</p>
        <p className="text-xs text-gray-500">Create a group to start chatting with your team</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200/50">
      {groups.map((group) => {
        const lastMessage = getLastMessage(group.id);
        const unreadCount = getUnreadCount(group.id);
        const onlineCount = getOnlineMembersCount(group);
        const isSelected = selectedGroupId === group.id;
        
        return (
          <div
            key={group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={`relative p-4 cursor-pointer transition-all duration-200 hover-lift ${
              isSelected 
                ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-r-3 border-primary-500' 
                : 'hover:bg-gray-50/80'
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Group Avatar */}
              <div className="flex-shrink-0 relative">
                <div className={`avatar avatar-lg ${
                  group.avatar 
                    ? '' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                } shadow-md ${isSelected ? 'ring-2 ring-primary-300' : ''}`}>
                  {group.avatar ? (
                    <img
                      className="w-full h-full object-cover"
                      src={group.avatar}
                      alt={group.name}
                    />
                  ) : (
                    <span className="font-semibold">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Online indicator */}
                {onlineCount > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{onlineCount}</span>
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-semibold truncate ${
                    isSelected ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {group.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <div className="badge badge-primary text-xs font-bold min-w-[20px] h-5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {lastMessage ? (
                      <p className="text-sm text-gray-600 truncate">
                        <span className="font-medium">{lastMessage.senderUsername}: </span>
                        {lastMessage.messageType === 'text' ? lastMessage.content : '📷 Image'}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Group meta info */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span>{group.memberIds.length}</span>
                    </div>
                    {onlineCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        <span>{onlineCount} online</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupList;
