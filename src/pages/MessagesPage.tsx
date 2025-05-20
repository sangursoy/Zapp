import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNavigation from '../components/common/BottomNavigation';
import ConversationList from '../components/messages/ConversationList';
import SearchBar from '../components/common/SearchBar';
import { useAppContext } from '../context/AppContext';

const MessagesPage: React.FC = () => {
  const { conversations, currentUser } = useAppContext();
  const navigate = useNavigate();
  
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mesajlar" />
      
      <main className="pb-20">
        <div className="p-4">
          <SearchBar onSearch={handleSearch} placeholder="Mesajlarda ara..." />
        </div>
        
        <ConversationList 
          conversations={conversations} 
          currentUserId={currentUser.id} 
        />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default MessagesPage;