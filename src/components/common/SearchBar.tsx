import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Konu, içerik veya kişi ara...' }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full"
    >
      <Search size={18} className="text-gray-500 mr-2" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent outline-none border-none flex-grow text-gray-800"
      />
      {query && (
        <button 
          type="button" 
          onClick={clearSearch}
          className="text-gray-500"
        >
          <X size={18} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;