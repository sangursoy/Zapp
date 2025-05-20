import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const menuItems = [
    { icon: Home, label: 'Ana Sayfa', path: '/' },
    { icon: Search, label: 'Keşfet', path: '/discover' },
    { icon: PlusCircle, label: 'Paylaş', path: '/share' },
    { icon: MessageCircle, label: 'Mesajlar', path: '/messages' },
    { icon: User, label: 'Profil', path: '/profile' }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-100 z-50">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                active ? 'text-orange-500' : 'text-gray-500'
              }`}
              onClick={() => navigate(item.path)}
            >
              <IconComponent size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;