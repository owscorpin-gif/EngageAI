import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, isMockAuth } from '../firebase/config';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isMockAuth) {
      // Mock Mode: retrieve user session from localStorage if present
      const storedUser = localStorage.getItem('engage_ai_mock_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('engage_ai_mock_user');
        }
      }
      setLoading(false);
      return;
    }

    // Firebase live mode
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    if (isMockAuth) {
      // Simulate network response latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockUser: UserProfile = {
        uid: 'mock-user-123',
        displayName: 'Demo Creator',
        email: 'creator@example.com',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      };
      localStorage.setItem('engage_ai_mock_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      setLoading(false);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Authentication Sign-In failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isMockAuth) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.removeItem('engage_ai_mock_user');
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Authentication Logout failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    logout,
    isMockMode: isMockAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
