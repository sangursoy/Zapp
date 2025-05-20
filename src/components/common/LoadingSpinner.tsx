import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = true,
  message = 'Loading...',
  className = ''
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;