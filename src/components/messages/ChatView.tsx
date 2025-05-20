import React, { useState, useRef, useEffect } from 'react';
import { Message, Content } from '../../types';
import { Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface ChatViewProps {
  conversationId: string;
  messages: Message[];
  content?: Content;
}

const ChatView: React.FC<ChatViewProps> = ({ conversationId, messages, content }) => {
  const { sendMessage, currentUser, markMessageAsRead } = useAppContext();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark unread messages as read
    messages.forEach(message => {
      if (!message.read && message.receiverId === currentUser.id) {
        markMessageAsRead(message.id, conversationId);
      }
    });
  }, [messages, conversationId, currentUser.id, markMessageAsRead]);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const receiverId = messages[0]?.senderId === currentUser.id 
      ? messages[0]?.receiverId 
      : messages[0]?.senderId;
    
    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatarUrl,
      receiverId,
      contentId: content?.id,
      topicId: content?.topicId,
      text: newMessage
    });
    
    setNewMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {content && (
        <div className="p-3 bg-gray-50 border-b">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {content.mediaUrl ? (
                <img 
                  src={content.mediaUrl} 
                  alt={content.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                  📝
                </div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-sm">{content.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{content.description}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser.id;
          
          return (
            <div 
              key={message.id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex max-w-[80%]">
                {!isCurrentUser && (
                  <img 
                    src={message.senderAvatar} 
                    alt={message.senderName} 
                    className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                  />
                )}
                
                <div>
                  <div 
                    className={`rounded-2xl p-3 ${
                      isCurrentUser 
                        ? 'bg-orange-500 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                    {isCurrentUser && (message.read ? ' ✓✓' : ' ✓')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t flex items-center">
        <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="w-full px-4 py-2 bg-transparent outline-none resize-none max-h-32"
            rows={1}
          />
        </div>
        <button 
          className="ml-2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatView;