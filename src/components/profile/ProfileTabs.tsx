import React, { useState } from 'react';
import { Content } from '../../types';
import ContentCard from '../common/ContentCard';

interface ProfileTabsProps {
  savedContents: Content[];
  contributedContents: Content[];
}

type TabType = 'saved' | 'contributed';

const ProfileTabs: React.FC<ProfileTabsProps> = ({ savedContents, contributedContents }) => {
  const [activeTab, setActiveTab] = useState<TabType>('saved');
  
  return (
    <div>
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-center font-medium text-sm ${
            activeTab === 'saved' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium text-sm ${
            activeTab === 'contributed' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('contributed')}
        >
          Contributed
        </button>
      </div>
      
      <div className="p-4 pb-24">
        {activeTab === 'saved' && (
          savedContents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No saved content yet</p>
            </div>
          ) : (
            savedContents.map(content => (
              <ContentCard key={content.id} content={content} />
            ))
          )
        )}
        
        {activeTab === 'contributed' && (
          contributedContents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No contributed content yet</p>
            </div>
          ) : (
            contributedContents.map(content => (
              <ContentCard key={content.id} content={content} />
            ))
          )
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;