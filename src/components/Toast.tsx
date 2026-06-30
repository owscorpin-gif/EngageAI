import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
    info: <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/20 dark:border-emerald-500/30',
    error: 'border-rose-500/20 dark:border-rose-500/30',
    info: 'border-indigo-500/20 dark:border-indigo-500/30',
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 flex items-center gap-3.5 p-4 rounded-2xl shadow-xl border glass-panel max-w-md transition-all duration-300 animate-slide-in z-50 ${borderStyles[type]}`}
      id="toast-notification"
      role="alert"
    >
      <div className="flex-shrink-0 p-1 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">{icons[type]}</div>
      <div className="flex-grow text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed pr-2">
        {message}
      </div>
      <button 
        onClick={onClose} 
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
        id="toast-close-btn"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
