import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import TopicHeader from '../components/topic/TopicHeader';
import ContentList from '../components/topic/ContentList';
import BottomNavigation from '../components/common/BottomNavigation';
import { useAppContext } from '../context/AppContext';

const TopicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { topics, setCurrentTopic, currentTopic } = useAppContext();
  
  useEffect(() => {
    // Find topic by id
    const topic = topics.find(t => t.id === id);
    
    if (topic) {
      setCurrentTopic(topic);
    } else {
      // If topic not found, redirect to home
      navigate('/');
    }
    
    // Cleanup
    return () => {
      setCurrentTopic(null);
    };
  }, [id, topics, setCurrentTopic, navigate]);
  
  if (!currentTopic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBack showMore />
      
      <main className="pb-20">
        <TopicHeader topic={currentTopic} />
        <ContentList topicId={currentTopic.id} />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default TopicPage;