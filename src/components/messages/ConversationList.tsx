import React from 'react';
import { Conversation } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, currentUserId }) => {
  const navigate = useNavigate();
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getOtherParticipant = (conversation: Conversation) => {
    const { participants, lastMessage } = conversation;
    return lastMessage.senderId === currentUserId ? lastMessage.receiverId : lastMessage.senderId;
  };
  
  const goToChat = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };
  
  return (
    <div className="divide-y divide-gray-100">
      {conversations.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>Henüz bir mesajlaşmanız bulunmuyor.</p>
        </div>
      ) : (
        conversations.map((conversation) => {
          const { lastMessage, unreadCount } = conversation;
          const isCurrentUserSender = lastMessage.senderId === currentUserId;
          
          return (
            <div 
              key={conversation.id} 
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => goToChat(conversation.id)}
            >
              <img 
                src={isCurrentUserSender ? lastMessage.senderAvatar : lastMessage.senderAvatar} 
                alt={isCurrentUserSender ? lastMessage.senderName : lastMessage.senderName} 
                className="w-12 h-12 rounded-full object-cover"
              />
              
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">
                    {isCurrentUserSender ? lastMessage.receiverId : lastMessage.senderName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatTime(lastMessage.timestamp)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-sm ${unreadCount > 0 && !isCurrentUserSender ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {isCurrentUserSender && 'Sen: '}{lastMessage.text.length > 30 ? lastMessage.text.substring(0, 30) + '...' : lastMessage.text}
                  </p>
                  
                  {unreadCount > 0 && !isCurrentUserSender && (
                    <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;