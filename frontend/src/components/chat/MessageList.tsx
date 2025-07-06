import React from 'react';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  const formatDate = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    }
  };

  const shouldShowDateDivider = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  };

  const shouldGroupMessage = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return false;
    
    const timeDiff = new Date(currentMessage.timestamp).getTime() - new Date(previousMessage.timestamp).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (
      currentMessage.senderId === previousMessage.senderId &&
      timeDiff < fiveMinutes
    );
  };

  return (
    <div className="space-y-1 animate-fade-in">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : undefined;
        const isOwnMessage = message.senderId === currentUserId;
        const showDateDivider = shouldShowDateDivider(message, previousMessage);
        const isGrouped = shouldGroupMessage(message, previousMessage);

        return (
          <div key={message.id} className="animate-slide-in-up">
            {/* Enhanced Date Divider */}
            {showDateDivider && (
              <div className="flex items-center justify-center my-6">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-full shadow-sm">
                  {formatDate(message.timestamp)}
                </div>
              </div>
            )}

            {/* Enhanced Message */}
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'} group`}>
              {/* Avatar for others (only first in group) */}
              {!isOwnMessage && !isGrouped && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-3 shadow-md">
                  <span className="text-xs font-semibold text-white">
                    {message.senderUsername.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Message container */}
              <div className={`max-w-xs lg:max-w-md ${!isOwnMessage && isGrouped ? 'ml-11' : ''}`}>
                {/* Sender name (only for others' messages and first in group) */}
                {!isOwnMessage && !isGrouped && (
                  <div className="text-xs font-medium text-gray-600 mb-1 px-1">
                    {message.senderUsername}
                  </div>
                )}

                {/* Enhanced Message bubble */}
                <div
                  className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white ml-auto'
                      : 'bg-white border border-gray-200 text-gray-900'
                  } ${
                    isGrouped
                      ? isOwnMessage
                        ? 'rounded-tr-md'
                        : 'rounded-tl-md'
                      : ''
                  }`}
                >
                  {/* Message content */}
                  {message.messageType === 'text' ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  ) : message.messageType === 'image' ? (
                    <div>
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={message.fileUrl}
                          alt="Shared image"
                          className="max-w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                          loading="lazy"
                        />
                      </div>
                      {message.content && (
                        <div className="text-sm mt-3 leading-relaxed">
                          {message.content}
                        </div>
                      )}
                    </div>
                  ) : message.messageType === 'file' ? (
                    <div className={`flex items-center space-x-3 p-2 rounded-lg ${
                      isOwnMessage ? 'bg-white/10' : 'bg-gray-50'
                    }`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        isOwnMessage ? 'bg-white/20' : 'bg-primary-100'
                      }`}>
                        <svg className={`w-5 h-5 ${isOwnMessage ? 'text-white' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{message.fileName}</p>
                        <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                          {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : 'File'}
                        </p>
                      </div>
                      <button className={`flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors ${
                        isOwnMessage ? 'text-white' : 'text-gray-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm italic leading-relaxed">
                      {message.content}
                    </div>
                  )}

                  {/* Enhanced Message metadata */}
                  <div className={`flex items-center justify-between mt-2 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                    <span className="text-xs font-medium">
                      {formatTime(message.timestamp)}
                    </span>
                    {isOwnMessage && (
                      <div className="flex items-center space-x-1">
                        {message.isDelivered && (
                          <div className="tooltip" title="Delivered">
                            <svg className="w-3 h-3 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {message.isRead && (
                          <div className="tooltip" title="Read">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message tail for speech bubble effect */}
                  {!isGrouped && (
                    <div className={`absolute top-0 ${
                      isOwnMessage 
                        ? 'right-0 transform translate-x-1 text-primary-500' 
                        : 'left-0 transform -translate-x-1 text-white'
                    }`}>
                      <svg className="w-3 h-4" viewBox="0 0 12 16" fill="currentColor">
                        {isOwnMessage ? (
                          <path d="M12 0H0v16l6-6 6 6V0z" />
                        ) : (
                          <path d="M0 0h12v16l-6-6-6 6V0z" />
                        )}
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Spacer for own messages to maintain alignment */}
              {isOwnMessage && !isGrouped && (
                <div className="w-8 h-8 flex-shrink-0 ml-3" />
              )}
            </div>

            {/* Hover actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center mt-1">
              <div className="flex items-center space-x-1 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors" title="React">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors" title="Reply">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors" title="More">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
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
