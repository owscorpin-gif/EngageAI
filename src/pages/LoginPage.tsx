import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Youtube, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { currentUser, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If already logged in, redirect straight to Dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Decorative gradient background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 md:w-[450px] h-80 md:h-[450px] bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 md:w-[450px] h-80 md:h-[450px] bg-accent-500/20 dark:bg-accent-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '-3s' }}></div>

      {/* Main glassmorphism card */}
      <div className="w-full max-w-md relative z-10 glass-panel rounded-3xl shadow-2xl p-8 md:p-10 text-center animate-slide-in">
        {/* Application Logo Placeholder */}
        <div className="inline-flex items-center justify-center relative mb-8">
          <div className="p-4.5 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/20 relative z-10">
            <Youtube className="w-10 h-10" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 p-1 rounded-lg bg-amber-400 text-slate-950 shadow-md animate-pulse z-20">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl tracking-tight text-slate-900 dark:text-white">
          AI YouTube <br />
          <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            Comment Manager
          </span>
        </h1>
        <p className="mt-4 text-base text-slate-500 dark:text-slate-400 font-medium">
          Manage and automate YouTube engagement with AI.
        </p>

        {/* Error notification */}
        {error && (
          <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-sm text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Large Continue with Google button */}
        <div className="mt-8">
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none`}
            id="google-signin-btn"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                {/* Standard SVG Google Icon */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-10 pt-6 border-t border-slate-200/50 dark:border-slate-800/30 text-xs text-slate-400">
          Secure sign-in powered by Firebase Authentication.
        </div>
      </div>
    </div>
  );
};
