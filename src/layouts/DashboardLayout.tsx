import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { 
  LayoutDashboard, 
  Video, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Youtube,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true, disabled: false },
    { name: 'Analyze Video', icon: Video, active: false, disabled: false },
    { name: 'History', icon: History, active: false, disabled: true, tooltip: 'Coming in Phase 2' },
    { name: 'Settings', icon: Settings, active: false, disabled: true, tooltip: 'Coming in Phase 2' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile sliding drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 border-r border-slate-200/80 dark:border-slate-800/60 flex flex-col z-50 transition-transform duration-300 transform glass-panel lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/20">
              <Youtube className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Engage AI
            </span>
          </div>
          <button 
            className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 dark:text-slate-600 select-none opacity-60 relative group"
                  title={item.tooltip}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500">
                    Muted
                  </span>
                </div>
              );
            }

            return (
              <button
                key={index}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  item.active 
                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 shadow-sm shadow-primary-500/5' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 border border-transparent'
                }`}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.name === 'Analyze Video') {
                    document.getElementById('analyzer-card')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-primary-500 dark:text-primary-400' : ''}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Profile & Logout */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/60 space-y-3">
          {currentUser && (
            <div className="flex items-center gap-3 px-2 py-1.5">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || "User avatar"} 
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.displayName || 'Creator'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.email || 'creator@example.com'}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60 hover:bg-rose-50 hover:border-rose-100 dark:hover:bg-rose-950/20 dark:hover:border-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-medium transition-all cursor-pointer"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-slate-200/80 dark:border-slate-800/60 glass-nav sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden md:block font-heading font-semibold text-lg text-slate-800 dark:text-slate-200">
              AI YouTube Comment Manager
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>

            {/* Profile badge */}
            {currentUser && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200/80 dark:border-slate-800/60">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.displayName || 'Creator'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal truncate max-w-[150px]">
                    {currentUser.email}
                  </p>
                </div>
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || "User Profile"} 
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-500/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 ring-2 ring-primary-500/20">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
