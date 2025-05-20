import React from 'react';
import { Content } from '../../types';
import { Heart, Share, Bookmark, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface ContentCardProps {
  content: Content;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const { userProfile, saveContent, likeContent, shareContent } = useAppContext();
  
  const isSaved = userProfile?.savedContents?.includes(content.id) || false;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
      {content.isExternal && (
        <div className="bg-blue-100 px-4 py-1 text-xs text-blue-800 flex items-center">
          <span className="mr-1">🔄</span>
          External content from: {content.externalSource}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center mb-3">
          <img 
            src={content.userAvatar} 
            alt={content.username} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <p className="font-medium text-gray-900">{content.username}</p>
            <p className="text-xs text-gray-500">{formatDate(content.createdAt)}</p>
          </div>
        </div>
        
        <h3 className="text-lg font-bold mb-2">{content.title}</h3>
        <p className="text-gray-700 mb-4">{content.description}</p>
        
        {content.type !== 'text' && content.mediaUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {content.type === 'video' ? (
              <div className="relative bg-gray-100 h-64 flex items-center justify-center">
                <img src={content.mediaUrl} alt={content.title} className="max-h-full max-w-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center cursor-pointer">
                    <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-orange-500 ml-1"></div>
                  </div>
                </div>
              </div>
            ) : (
              <img 
                src={content.mediaUrl} 
                alt={content.title} 
                className="w-full max-h-96 object-cover"
              />
            )}
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          {content.tags.map((tag, index) => (
            <span key={index} className="mr-2 text-teal-600">#{tag}</span>
          ))}
        </div>
        
        <div className="flex items-center justify-between border-t pt-3">
          <button 
            onClick={() => likeContent(content.id)}
            className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
          >
            <Heart size={18} className="mr-1" />
            <span>{content.likes}</span>
          </button>
          
          <button 
            onClick={() => shareContent(content.id)}
            className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
          >
            <Share size={18} className="mr-1" />
            <span>{content.shares}</span>
          </button>
          
          <button className="flex items-center text-gray-600 hover:text-purple-500 transition-colors">
            <Send size={18} />
          </button>
          
          <button 
            onClick={() => saveContent(content.id)}
            className={`flex items-center transition-colors ${isSaved ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;