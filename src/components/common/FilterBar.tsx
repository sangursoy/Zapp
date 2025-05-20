import React from 'react';
import { FilterOptions, Category } from '../../types';
import { Filter } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filterOptions, onFilterChange }) => {
  const { categories } = useAppContext();
  
  const contentTypes = [
    { value: 'all', label: 'Tümü' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Görsel' },
    { value: 'text', label: 'Yazı' }
  ];
  
  return (
    <div className="bg-white shadow-sm sticky top-0 z-40 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">İçerikler</h2>
        <button className="flex items-center text-gray-600 text-sm">
          <Filter size={16} className="mr-1" />
          Filtrele
        </button>
      </div>
      
      <div className="overflow-x-auto py-1">
        <div className="flex space-x-2 min-w-max">
          {/* Content Type Filter */}
          {contentTypes.map((type) => (
            <button
              key={type.value}
              className={`px-3 py-1 rounded-full text-sm ${
                filterOptions.contentType === type.value 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onFilterChange({ ...filterOptions, contentType: type.value as any })}
            >
              {type.label}
            </button>
          ))}
          
          {/* Category Filter - Only show when on home or discover */}
          {(filterOptions.category !== undefined) && (
            <>
              <div className="border-l border-gray-200 mx-1 h-6 self-center"></div>
              
              <button
                key="all-categories"
                className={`px-3 py-1 rounded-full text-sm ${
                  filterOptions.category === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onFilterChange({ ...filterOptions, category: 'all' })}
              >
                Tüm Kategoriler
              </button>
              
              {categories.map((categoryObj) => (
                <button
                  key={categoryObj.category}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    filterOptions.category === categoryObj.category 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => onFilterChange({ ...filterOptions, category: categoryObj.category })}
                >
                  <span className="mr-1">{categoryObj.icon}</span>
                  {categoryObj.category}
                </button>
              ))}
            </>
          )}
          
          {/* Location Based Filter */}
          <div className="border-l border-gray-200 mx-1 h-6 self-center"></div>
          
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filterOptions.nearby 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onFilterChange({ ...filterOptions, nearby: !filterOptions.nearby })}
          >
            Yakınımdakiler
          </button>
          
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filterOptions.trending 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onFilterChange({ ...filterOptions, trending: !filterOptions.trending })}
          >
            Trend Olanlar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;