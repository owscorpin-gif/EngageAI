import React, { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Youtube,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export const LoginPage: React.FC = () => {
  const { currentUser, signIn, signUp, isMockMode } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inProgressRef = useRef(false);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inProgressRef.current) return;

    setError(null);
    setSuccessMsg(null);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    inProgressRef.current = true;
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate('/');
      } else {
        await signUp(email, password);
        // In real Supabase: user may need to confirm email first
        if (isMockMode) {
          navigate('/');
        } else {
          setSuccessMsg('Account created! Check your email to confirm your address, then sign in.');
          switchMode('signin');
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';

      // Clean up Supabase error messages for end users
      if (message.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else if (message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in.');
      } else if (message.includes('Too many requests') || message.includes('rate limit')) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      inProgressRef.current = false;
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Decorative gradient blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 md:w-[500px] h-80 md:h-[500px] bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-[100px] md:blur-[140px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 md:w-[500px] h-80 md:h-[500px] bg-accent-500/20 dark:bg-accent-500/10 rounded-full blur-[100px] md:blur-[140px] pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />

      {/* Card */}
      <div className="w-full max-w-md relative z-10 glass-panel rounded-3xl shadow-2xl p-8 md:p-10 animate-slide-in">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center justify-center relative">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/25">
              <Youtube className="w-9 h-9" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-lg bg-amber-400 text-slate-950 shadow-md animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signin'
              ? 'Sign in to manage your YouTube comments with AI.'
              : 'Start automating your YouTube engagement with AI.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 mb-8">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            id="tab-signin"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            id="tab-signup"
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-sm"
          >
            {error.includes('replay') || error.includes('nonce') || error.includes('quickly') || error.includes('attempts')
              ? <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{error}</span>
          </div>
        )}

        {/* Success alert */}
        {successMsg && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm"
          >
            <span>✓ {successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                disabled={loading}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password (sign up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            id="auth-submit-btn"
            className="w-full mt-2 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-semibold text-primary-500 hover:text-primary-400 cursor-pointer transition-colors"
          >
            {mode === 'signin' ? 'Sign up for free' : 'Sign in'}
          </button>
        </p>

        <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-600">
          Your data is protected by Supabase's enterprise-grade security.
        </p>
      </div>
    </div>
  );
};
