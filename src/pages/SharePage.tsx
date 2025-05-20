import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ContentForm from '../components/share/ContentForm';
import BottomNavigation from '../components/common/BottomNavigation';
import { useAppContext } from '../context/AppContext';

const SharePage: React.FC = () => {
  const { topics } = useAppContext();
  const navigate = useNavigate();
  
  const handleSubmit = (formData: any) => {
    console.log('Form submitted:', formData);
    // Here you would normally save the content to the database
    // For demo purposes, just navigate back to home
    alert('İçerik başarıyla paylaşıldı!');
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="İçerik Paylaş" showBack />
      
      <main className="pb-20">
        <ContentForm 
          topics={topics} 
          onSubmit={handleSubmit} 
        />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default SharePage;