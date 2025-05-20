import React from 'react';
import { Topic } from '../../types';
import TopicCard from '../common/TopicCard';

interface TopicsGridProps {
  topics: Topic[];
  onTopicSelect: (topic: Topic) => void;
  title: string;
}

const TopicsGrid: React.FC<TopicsGridProps> = ({ topics, onTopicSelect, title }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {topics.map(topic => (
          <TopicCard 
            key={topic.id} 
            topic={topic} 
            onClick={onTopicSelect} 
          />
        ))}
      </div>
    </div>
  );
};

export default TopicsGrid;