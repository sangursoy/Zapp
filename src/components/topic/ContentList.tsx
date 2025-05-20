import React from 'react';
import { Content } from '../../types';
import ContentCard from '../common/ContentCard';
import FilterBar from '../common/FilterBar';
import { useAppContext } from '../../context/AppContext';

interface ContentListProps {
  topicId: string;
}

const ContentList: React.FC<ContentListProps> = ({ topicId }) => {
  const { contents, filterOptions, setFilterOptions } = useAppContext();
  
  // Filter contents by topic and filter options
  const filteredContents = contents.filter(content => {
    if (content.topicId !== topicId) return false;
    
    if (filterOptions.contentType !== 'all' && content.type !== filterOptions.contentType) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div>
      <FilterBar 
        filterOptions={filterOptions} 
        onFilterChange={setFilterOptions} 
      />
      
      <div className="p-4 pb-24">
        {filteredContents.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Bu kriterlere uygun içerik bulunamadı.</p>
          </div>
        ) : (
          filteredContents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))
        )}
      </div>
    </div>
  );
};

export default ContentList;