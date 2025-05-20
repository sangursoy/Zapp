import React, { useState } from 'react';
import { Topic, Category } from '../../types';
import { Upload, Image, FileText, X } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';

interface ContentFormProps {
  topics: Topic[];
  onSubmit: (formData: any) => void;
}

const ContentForm: React.FC<ContentFormProps> = ({ topics, onSubmit }) => {
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  const contentTypes = [
    { value: 'text', label: 'Yazı', icon: FileText },
    { value: 'image', label: 'Görsel', icon: Image },
    { value: 'video', label: 'Video', icon: Upload }
  ];
  
  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !selectedTopic) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }
    
    if ((contentType === 'image' || contentType === 'video') && !mediaPreview) {
      alert('Lütfen bir medya yükleyin');
      return;
    }
    
    // Create form data
    const formData = {
      title,
      description,
      contentType,
      topicId: selectedTopic,
      tags,
      mediaUrl: mediaPreview
    };
    
    onSubmit(formData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTags([]);
    setSelectedTopic('');
    setMediaPreview(null);
  };
  
  // Filter topics by selected category if any
  const filteredTopics = topics;
  
  return (
    <form onSubmit={handleSubmit} className="p-4 pb-24">
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          İçerik Türü
        </label>
        <div className="flex space-x-2">
          {contentTypes.map(type => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                className={`flex items-center justify-center px-4 py-2 rounded-lg border ${
                  contentType === type.value 
                    ? 'bg-orange-100 border-orange-500 text-orange-700' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
                onClick={() => setContentType(type.value as any)}
              >
                <IconComponent size={18} className="mr-2" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-2">
          Başlık <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="İçerik başlığı"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
          Açıklama <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="İçerik açıklaması"
          rows={4}
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="topic" className="block text-gray-700 text-sm font-medium mb-2">
          Konu <span className="text-red-500">*</span>
        </label>
        <select
          id="topic"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        >
          <option value="">Konu seçin</option>
          {filteredTopics.map(topic => (
            <option key={topic.id} value={topic.id}>
              {topic.title} ({topic.category})
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Etiketler
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full flex items-center"
            >
              #{tag}
              <button 
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Etiket ekle"
          />
          <button
            type="button"
            onClick={handleTagAdd}
            className="bg-gray-100 px-4 rounded-r-lg border border-gray-300 border-l-0 text-gray-700"
          >
            Ekle
          </button>
        </div>
      </div>
      
      {(contentType === 'image' || contentType === 'video') && (
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {contentType === 'image' ? 'Görsel' : 'Video'} Yükle <span className="text-red-500">*</span>
          </label>
          
          {mediaPreview ? (
            <div className="mb-2 relative">
              <img 
                src={mediaPreview} 
                alt="Preview" 
                className="max-h-64 rounded-lg object-contain bg-gray-100 w-full"
              />
              <button
                type="button"
                onClick={() => setMediaPreview(null)}
                className="absolute top-2 right-2 bg-white/70 p-1 rounded-full text-gray-700 hover:bg-white"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100">
              <input
                type="file"
                id="media"
                accept={contentType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleMediaChange}
                className="hidden"
              />
              <label htmlFor="media" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload size={36} className="text-gray-400 mb-2" />
                  <p className="text-gray-700 font-medium">
                    {contentType === 'image' ? 'Görsel' : 'Video'} yüklemek için tıklayın
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    veya sürükleyip bırakın
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}
      
      <button
        type="submit"
        className="w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
      >
        Paylaş
      </button>
    </form>
  );
};

export default ContentForm;