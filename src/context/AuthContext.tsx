import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase, getCurrentUser } from '../services/supabaseService';
import { User, Session } from '@supabase/supabase-js';
import useGoogleAuth from '../services/googleAuthService';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  createSessionFromUrl: (url: string) => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { signInWithGoogle: googleSignIn, createSessionFromUrl: googleCreateSessionFromUrl } = useGoogleAuth();

  const refreshSession = async () => {
    try {
      setLoading(true);
      console.log('Refreshing auth session...');
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('Session refresh result:', currentSession ? 'Session found' : 'No session');
      setSession(currentSession);
      setUser(currentSession?.user || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      await refreshSession();
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);
      setUser(newSession?.user || null);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await googleSignIn();
      console.log('Google sign-in result:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Google sign in failed');
      }
      
      // Force refresh the session
      await refreshSession();
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Authentication Error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  };

  const createSessionFromUrl = async (url: string) => {
    try {
      return await googleCreateSessionFromUrl(url);
    } catch (error) {
      console.error('Error creating session from URL:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signInWithGoogle, 
      signOut,
      refreshSession,
      createSessionFromUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};