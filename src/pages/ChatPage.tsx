import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ChatView from '../components/messages/ChatView';
import { useAppContext } from '../context/AppContext';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversations, messages, contents } = useAppContext();
  
  // Find conversation by id
  const conversation = conversations.find(c => c.id === id);
  
  // Get messages for this conversation
  const conversationMessages = id ? messages[id] || [] : [];
  
  // Get content if this conversation is about a specific content
  const contentId = conversationMessages[0]?.contentId;
  const content = contentId ? contents.find(c => c.id === contentId) : undefined;
  
  // Get other participant's name
  const otherParticipantName = conversation?.lastMessage.senderName;
  
  useEffect(() => {
    if (!conversation) {
      navigate('/messages');
    }
  }, [conversation, navigate]);
  
  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={otherParticipantName} showBack />
      
      <main className="flex-1 overflow-hidden">
        <ChatView 
          conversationId={id || ''} 
          messages={conversationMessages} 
          content={content} 
        />
      </main>
    </div>
  );
};

export default ChatPage;