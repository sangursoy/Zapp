import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import TopicCard from '../components/common/TopicCard';
import BottomNavigation from '../components/common/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import { RefreshCw, Sparkles } from 'lucide-react';

const DiscoverPage: React.FC = () => {
  const { topics, setCurrentTopic, filterOptions, setFilterOptions, refreshNews, generateAIContent } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
  
  // Filter topics based on filter options and search query
  const filteredTopics = topics.filter(topic => {
    // Filter by category if selected
    if (filterOptions.category !== 'all' && filterOptions.category !== undefined && topic.category !== filterOptions.category) {
      return false;
    }
    
    // Filter by trending if selected
    if (filterOptions.trending && !topic.trending) {
      return false;
    }
    
    // Filter by nearby if selected (in a real app, this would use geolocation)
    if (filterOptions.nearby && topic.location !== 'Istanbul') {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !topic.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Keşfet" />
      
      <main className="pb-20">
        <div className="p-4">
          <div className="flex items-center gap-2">
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
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
        
        <FilterBar 
          filterOptions={{ ...filterOptions, category: filterOptions.category || 'all' }} 
          onFilterChange={setFilterOptions} 
        />
        
        <div className="p-4 grid grid-cols-2 gap-4">
          {filteredTopics.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-500">
              <p>Bu kriterlere uygun konu bulunamadı.</p>
            </div>
          ) : (
            filteredTopics.map(topic => (
              <TopicCard 
                key={topic.id} 
                topic={topic} 
                onClick={handleTopicSelect} 
              />
            ))
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DiscoverPage;