import React, { useState } from 'react';
import { Category, CategoryWithSubcategories } from '../../types';
import { ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface TopicCategoriesProps {
  selectedCategory: Category | 'all';
  selectedSubcategory: string | 'all';
  onCategorySelect: (category: Category | 'all', subcategory: string | 'all') => void;
}

const categoryIcons: Record<Category, string> = {
  'Sports': '⚽',
  'Finance': '💰',
  'Health': '🏥',
  'Culture': '🎭',
  'Technology': '💻',
  'Education': '📚',
  'Entertainment': '🎬',
  'Politics': '🏛️',
  'Science': '🔬'
};

const TopicCategories: React.FC<TopicCategoriesProps> = ({ 
  selectedCategory, 
  selectedSubcategory,
  onCategorySelect 
}) => {
  const { categories = [], toggleFavoriteSubcategory, currentUser } = useAppContext();
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(
    selectedCategory !== 'all' ? selectedCategory : null
  );

  const handleCategoryClick = (category: Category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
      onCategorySelect('all', 'all');
    } else {
      setExpandedCategory(category);
      onCategorySelect(category, 'all');
    }
  };

  const handleSubcategoryClick = (category: Category, subcategory: string) => {
    onCategorySelect(category, subcategory);
  };

  const isFavorite = (category: Category, subcategory: string) => {
    return currentUser?.favoriteSubcategories?.some(
      fav => fav.category === category && fav.subcategory === subcategory
    ) ?? false;
  };

  if (!Array.isArray(categories)) {
    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-3">Kategoriler</h2>
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-3">Kategoriler</h2>
      
      <div className="flex overflow-x-auto pb-2 space-x-3">
        <div 
          className={`flex-shrink-0 flex flex-col items-center w-16 p-2 rounded-lg cursor-pointer ${
            selectedCategory === 'all' 
              ? 'bg-orange-100 text-orange-500 border-2 border-orange-500' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => {
            setExpandedCategory(null);
            onCategorySelect('all', 'all');
          }}
        >
          <span className="text-2xl mb-1">🌐</span>
          <span className="text-xs text-center">Tümü</span>
        </div>
        
        {categories.map(({ category, subcategories }) => (
          <div 
            key={category}
            className={`flex-shrink-0 flex flex-col items-center w-16 p-2 rounded-lg cursor-pointer ${
              selectedCategory === category 
                ? 'bg-orange-100 text-orange-500 border-2 border-orange-500' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            <span className="text-2xl mb-1">{categoryIcons[category]}</span>
            <span className="text-xs text-center">{category}</span>
            {expandedCategory === category ? (
              <ChevronUp size={16} className="mt-1" />
            ) : (
              <ChevronDown size={16} className="mt-1" />
            )}
          </div>
        ))}
      </div>

      {/* Subcategories */}
      {expandedCategory && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {categories
            .find(c => c.category === expandedCategory)
            ?.subcategories?.map(subcategory => (
              <div
                key={subcategory}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  selectedSubcategory === subcategory
                    ? 'bg-orange-100 text-orange-500'
                    : 'bg-gray-50 text-gray-700'
                }`}
                onClick={() => handleSubcategoryClick(expandedCategory, subcategory)}
              >
                <span className="text-sm">{subcategory}</span>
                <button
                  className="p-1 rounded-full hover:bg-white/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteSubcategory(expandedCategory, subcategory);
                  }}
                >
                  <Heart
                    size={16}
                    className={isFavorite(expandedCategory, subcategory) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                  />
                </button>
              </div>
            )) ?? []}
        </div>
      )}
    </div>
  );
};

export default TopicCategories;