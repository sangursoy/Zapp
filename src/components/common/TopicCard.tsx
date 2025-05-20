import React from 'react';
import { Topic } from '../../types';
import { Clock, MapPin } from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  onClick: (topic: Topic) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  return (
    <div 
      className={`relative rounded-xl overflow-hidden shadow-md cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        topic.isOfficial ? 'border-l-4 border-orange-500' : ''
      }`}
      onClick={() => onClick(topic)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
      <img 
        src={topic.imageUrl} 
        alt={topic.title} 
        className="w-full h-40 object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            topic.isOfficial 
              ? 'bg-orange-500' 
              : 'bg-gray-500/50 backdrop-blur-sm'
          }`}>
            {topic.category}
          </span>
          {topic.trending && (
            <span className="bg-red-500 text-xs px-2 py-1 rounded-full flex items-center">
              <span className="mr-1">🔥</span> Trend
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold line-clamp-2">{topic.title}</h3>
        <div className="flex items-center text-xs mt-2 text-gray-200">
          <span className="flex items-center mr-3">
            <MapPin size={12} className="mr-1" />
            {topic.location}
          </span>
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            {topic.contentCount} içerik
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;