import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isMockAuth } from '../supabase/config';
import { safeParseStorage, MockUserProfileSchema } from '../utils/validation';
import {
  enforceHttps,
  bootstrapSession,
  teardownSession,
  isSessionExpired,
  checkAndRecordLoginAttempt,
  getCsrfToken,
} from '../utils/authSecurity';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  creatorSettings?: {
    youtubeComments: boolean;
    youtubeStats: boolean;
    autoReply: boolean;
    personality: string;
  };
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  csrfToken: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Converts a Supabase user into our internal UserProfile shape.
function userToProfile(user: SupabaseUser): UserProfile {
  const metadata = user.user_metadata ?? {};
  return {
    uid: user.id,
    displayName: metadata.full_name ?? metadata.name ?? user.email?.split('@')[0] ?? null,
    email: user.email ?? null,
    photoURL: metadata.avatar_url ?? null,
    creatorSettings: {
      youtubeComments: true,
      youtubeStats: true,
      autoReply: false,
      personality: 'Professional',
    },
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // ─── HTTPS enforcement ───────────────────────────────────────────────────────
  useEffect(() => {
    enforceHttps();
  }, []);

  // ─── Session expiry watcher (mock mode only) ─────────────────────────────────
  useEffect(() => {
    if (!isMockAuth) return;
    const interval = setInterval(() => {
      if (currentUser && isSessionExpired()) {
        teardownSession();
        localStorage.removeItem('engage_ai_mock_user');
        setCurrentUser(null);
        setCsrfToken(null);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // ─── Auth state initialization ────────────────────────────────────────────────
  useEffect(() => {
    if (isMockAuth) {
      const storedUser = safeParseStorage(
        'engage_ai_mock_user',
        MockUserProfileSchema,
        null
      );
      if (storedUser) {
        if (isSessionExpired()) {
          teardownSession();
          localStorage.removeItem('engage_ai_mock_user');
        } else {
          setCurrentUser(storedUser);
          setCsrfToken(getCsrfToken());
        }
      }
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Restore session on mount, then subscribe to changes
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(userToProfile(session.user));
          setCsrfToken(getCsrfToken() ?? bootstrapSession().csrfToken);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[Engage AI] Failed to restore Supabase session:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setCurrentUser(userToProfile(session.user));
          setCsrfToken(getCsrfToken() ?? bootstrapSession().csrfToken);
        } else {
          setCurrentUser(null);
          setCsrfToken(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Sign Up ─────────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string) => {
    if (!checkAndRecordLoginAttempt()) {
      throw new Error('Too many requests. Please wait a moment.');
    }

    if (isMockAuth) {
      // Mock mode: auto sign in after "sign up"
      const mockUser: UserProfile = {
        uid: 'mock-user-' + Math.random().toString(36).slice(2, 8),
        displayName: email.split('@')[0],
        email,
        photoURL: null,
        creatorSettings: {
          youtubeComments: true,
          youtubeStats: true,
          autoReply: false,
          personality: 'Professional',
        },
      };
      await new Promise(r => setTimeout(r, 600));
      const { csrfToken: newToken } = bootstrapSession();
      setCsrfToken(newToken);
      localStorage.setItem('engage_ai_mock_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      return;
    }

    if (!supabase) throw new Error('Supabase client is not initialized.');

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // onAuthStateChange handles setting the user after email confirmation
    // or immediately if email confirmations are disabled in Supabase
  };

  // ─── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    if (!checkAndRecordLoginAttempt()) {
      throw new Error('Too many requests. Please wait a moment.');
    }

    if (isMockAuth) {
      const mockUser: UserProfile = {
        uid: 'mock-user-123',
        displayName: email.split('@')[0],
        email,
        photoURL: null,
        creatorSettings: {
          youtubeComments: true,
          youtubeStats: true,
          autoReply: false,
          personality: 'Professional',
        },
      };
      await new Promise(r => setTimeout(r, 600));
      const { csrfToken: newToken } = bootstrapSession();
      setCsrfToken(newToken);
      localStorage.setItem('engage_ai_mock_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      return;
    }

    if (!supabase) throw new Error('Supabase client is not initialized.');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange handles setting the user
  };

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    setLoading(true);
    teardownSession();
    setCsrfToken(null);

    if (isMockAuth) {
      await new Promise(r => setTimeout(r, 400));
      localStorage.removeItem('engage_ai_mock_user');
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    csrfToken,
    signUp,
    signIn,
    logout,
    isMockMode: isMockAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
