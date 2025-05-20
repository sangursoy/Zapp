import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import SearchBar from '../components/common/SearchBar';
import TopicCategories from '../components/home/TopicCategories';
import TopicsGrid from '../components/home/TopicsGrid';
import BottomNavigation from '../components/common/BottomNavigation';
import { Category } from '../types';
import { useAppContext } from '../context/AppContext';
import { RefreshCw, Sparkles } from 'lucide-react';

const HomePage: React.FC = () => {
  const { topics, setCurrentTopic, refreshNews, generateAIContent, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality
  };
  
  const handleCategorySelect = (category: Category | 'all', subcategory: string | 'all') => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
  };
  
  const handleTopicSelect = (topic: any) => {
    setCurrentTopic(topic);
    navigate(`/topic/${topic.id}`);
  };

  const handleRefreshNews = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      await refreshNews();
    } catch (error) {
      console.error('Failed to refresh news:', error);
      setError('Failed to refresh news. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      await generateAIContent();
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate content. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Filter topics by category and subcategory
  const filteredTopics = topics.filter(topic => {
    if (activeTab === 'favorites') {
      const isFavorite = currentUser.favoriteSubcategories.some(
        fav => fav.category === topic.category
      );
      if (!isFavorite) return false;
    }

    if (selectedCategory === 'all') return true;
    if (topic.category !== selectedCategory) return false;
    if (selectedSubcategory === 'all') return true;
    return topic.subcategory === selectedSubcategory;
  });
  
  // Get trending topics
  const trendingTopics = filteredTopics.filter(topic => topic.trending);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Zapp" showSearch onSearch={handleSearch} />
      
      <main className="pb-20">
        <div className="px-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} placeholder="Konu ara..." />
            </div>
            <button
              onClick={handleRefreshNews}
              disabled={isRefreshing}
              className={`p-2 rounded-lg ${
                isRefreshing 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              <RefreshCw 
                size={20} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
            </button>
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className={`p-2 rounded-lg ${
                isGenerating 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              <Sparkles 
                size={20} 
                className={isGenerating ? 'animate-pulse' : ''} 
              />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex border-b mb-4">
            <button
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === 'all' 
                  ? 'text-orange-500 border-b-2 border-orange-500' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('all')}
            >
              Tüm Konular
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === 'favorites' 
                  ? 'text-orange-500 border-b-2 border-orange-500' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('favorites')}
            >
              Favoriler
            </button>
          </div>

          <TopicCategories 
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={handleCategorySelect}
          />
          
          {trendingTopics.length > 0 && (
            <TopicsGrid 
              topics={trendingTopics} 
              onTopicSelect={handleTopicSelect} 
              title="Trend Konular"
            />
          )}
          
          <TopicsGrid 
            topics={filteredTopics.filter(topic => !topic.trending)} 
            onTopicSelect={handleTopicSelect} 
            title={activeTab === 'favorites' ? 'Favori Konular' : 'Diğer Konular'}
          />
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;