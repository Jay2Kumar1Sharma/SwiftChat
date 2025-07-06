import React from 'react';
import { useChatStore } from '../../stores/chatStore';

export const UserList: React.FC = () => {
  const { users, onlineUsers } = useChatStore();

  const startDirectMessage = (userId: string) => {
    // TODO: Implement direct message functionality
    console.log('Direct message not implemented yet for user:', userId);
  };

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">No users found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user) => {
        const isOnline = onlineUsers.includes(user.id);
        
        return (
          <div
            key={user.id}
            onClick={() => startDirectMessage(user.id)}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.username}
                    />
                  ) : (
                    <span className="text-gray-600 text-lg font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Online status indicator */}
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-400">
                  {isOnline ? 'Online' : user.lastSeen ? `Last seen ${new Date(user.lastSeen).toLocaleDateString()}` : 'Offline'}
                </p>
              </div>

              {/* Action button */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startDirectMessage(user.id);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
