import React from 'react';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../common/SearchBar';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showMore?: boolean;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  showSearch = false, 
  showMore = false,
  onSearch = () => {}
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm px-4 py-3">
      <div className="flex items-center">
        {showBack && (
          <button 
            className="mr-3 text-gray-700" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {title && !showSearch && (
          <h1 className="text-xl font-semibold flex-1">{title}</h1>
        )}
        
        {showSearch && (
          <div className="flex-1">
            <SearchBar onSearch={onSearch} />
          </div>
        )}
        
        {showMore && (
          <button className="ml-3 text-gray-700">
            <MoreVertical size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;