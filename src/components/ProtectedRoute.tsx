import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          {/* Outer glowing ring */}
          <div className="absolute w-24 h-24 rounded-full border-4 border-primary-500/10 border-t-primary-500 animate-spin"></div>
          {/* Inner reverse spinning ring */}
          <div className="absolute w-16 h-16 rounded-full border-4 border-accent-500/10 border-b-accent-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          {/* Center pulse dot */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 animate-pulse"></div>
        </div>
        
        <div className="mt-8 text-center">
          <h2 className="text-xl font-heading font-semibold text-slate-800 dark:text-slate-200">
            Checking session
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 animate-pulse">
            Connecting securely...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
