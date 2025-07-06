import React, { useState, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage, selectedGroupId } = useChatStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedGroupId) return;

    try {
      await sendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      
      if (inputRef.current) {
        inputRef.current.style.height = '48px';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = '48px';
      const scrollHeight = Math.min(inputRef.current.scrollHeight, 120);
      inputRef.current.style.height = `${scrollHeight}px`;
    }

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      // TODO: Send typing start event via WebSocket
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // TODO: Send typing stop event via WebSocket
    }, 1000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGroupId) return;

    try {
      // TODO: Implement file upload logic
      console.log('File upload not implemented yet:', file.name);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const quickEmojis = ['😀', '😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉'];

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 bg-white/95 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Enhanced File upload button */}
        <div className="flex-shrink-0 relative">
          <label className="btn btn-ghost btn-icon-only cursor-pointer tooltip hover-lift" title="Attach file">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
          </label>
        </div>

        {/* Enhanced Message input */}
        <div className="flex-1 relative">
          <div className="relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary-500 focus-within:bg-white transition-all duration-200 shadow-sm">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-24 bg-transparent border-none focus:outline-none resize-none min-h-[48px] max-h-[120px] text-gray-900 placeholder-gray-500"
              rows={1}
              style={{ height: '48px' }}
            />
            
            {/* Input actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {/* Emoji button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="btn btn-ghost btn-sm btn-icon-only hover-lift"
                  title="Add emoji"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* Quick emoji picker */}
                {showEmojiPicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowEmojiPicker(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20 animate-slide-in-up">
                      <div className="grid grid-cols-5 gap-2">
                        {quickEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Send button (only show when message is not empty) */}
              {message.trim() && (
                <button
                  type="submit"
                  className="btn btn-primary btn-sm btn-icon-only hover-lift animate-slide-in-right"
                  title="Send message"
                >
                  <svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="absolute -top-6 left-2 text-xs text-gray-500 animate-fade-in">
              Typing...
            </div>
          )}
        </div>

        {/* Voice message button (when no text) */}
        {!message.trim() && (
          <div className="flex-shrink-0">
            <button
              type="button"
              className="btn btn-primary btn-icon-only hover-lift"
              title="Voice message"
              onClick={() => console.log('Voice message not implemented yet')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        )}
      </form>

      {/* Message tips for first time users */}
      {!message && (
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
              <span>to send</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
              <span>for new line</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
