import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-500',
      icon: XCircle
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-500',
      icon: Info
    }
  };

  const { bg, icon: Icon } = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`${bg} text-white p-4 rounded-lg shadow-lg flex items-center max-w-md w-full`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="ml-3 flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-4 flex-shrink-0 hover:opacity-75 transition-opacity"
      >
        <XCircle className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </button>
    </motion.div>
  );
};

const ToastContainer: React.FC<{
  toasts: Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>;
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;