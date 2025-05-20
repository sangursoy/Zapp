import React from 'react';
import { Topic } from '../../types';
import { Bell, BellOff } from 'lucide-react';

interface TopicHeaderProps {
  topic: Topic;
}

const TopicHeader: React.FC<TopicHeaderProps> = ({ topic }) => {
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  
  return (
    <div className="relative mb-4">
      <div className="h-40 w-full relative rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent/40 z-10"></div>
        <img 
          src={topic.imageUrl} 
          alt={topic.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center mb-1 space-x-2">
              <span className="bg-orange-500 text-xs px-2 py-1 rounded-full">
                {topic.category}
              </span>
              {topic.trending && (
                <span className="bg-red-500 text-xs px-2 py-1 rounded-full flex items-center">
                  <span className="mr-1">🔥</span> Trend
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{topic.title}</h1>
            <div className="flex items-center text-sm mt-1">
              <span className="mr-3">📍 {topic.location}</span>
              <span>{topic.contentCount} içerik</span>
            </div>
          </div>
          
          <button 
            className={`rounded-full p-2 ${isSubscribed ? 'bg-orange-500' : 'bg-white/20 backdrop-blur-sm'}`}
            onClick={() => setIsSubscribed(!isSubscribed)}
          >
            {isSubscribed ? (
              <BellOff size={20} className="text-white" />
            ) : (
              <Bell size={20} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicHeader;