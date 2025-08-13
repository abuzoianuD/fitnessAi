import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/src/shared/utils/supabase';
import { testNetworkConnectivity } from '@/src/shared/utils/networkTest';
import { USE_MOCK_AUTH, mockSignIn, mockSignUp } from '@/src/shared/utils/mockAuth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('🔐 Initial session error:', error);
      // For mock auth, start with no session
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        console.log('User signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery initiated');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      console.log('📝 AuthContext: Starting signUp process...');
      console.log('📧 Email:', email);
      
      // Use mock signup in development when network fails
      if (USE_MOCK_AUTH) {
        console.log('🧪 Using Mock SignUp (network bypass)');
        const result = await mockSignUp(email, password, metadata);
        
        if (!result.error && result.data) {
          setSession(result.data.session as Session);
          setUser(result.data.user as User);
          setLoading(false);
        }
        
        return { error: result.error };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          // Remove email confirmation requirement
        },
      });

      if (error) {
        console.error('🚨 SignUp failed:', error.message);
        
        // Fallback to mock auth for network issues in development
        if (error.message.includes('Network request failed') && __DEV__) {
          console.log('🧪 Falling back to Mock SignUp due to network issues');
          const mockResult = await mockSignUp(email, password, metadata);
          
          if (!mockResult.error && mockResult.data) {
            setSession(mockResult.data.session as Session);
            setUser(mockResult.data.user as User);
            setLoading(false);
          }
          
          return { error: mockResult.error };
        }
        
        return { error };
      }

      console.log('✅ SignUp successful, sending welcome email...');
      
      // Send welcome email immediately after successful signup
      try {
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: { 
            record: {
              id: data.user?.id,
              email: data.user?.email,
              email_confirmed_at: new Date().toISOString(), // Mark as confirmed
              user_metadata: data.user?.user_metadata || metadata
            }
          }
        });

        if (emailError) {
          console.error('⚠️ Welcome email failed:', emailError.message);
          // Don't fail signup if email fails
        } else {
          console.log('📧 Welcome email sent successfully');
        }
      } catch (emailErr) {
        console.error('⚠️ Welcome email exception:', emailErr);
        // Don't fail signup if email fails
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting signIn process...');
      console.log('📧 Email:', email);
      console.log('🌐 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
      
      // Use mock auth in development when network fails
      if (USE_MOCK_AUTH) {
        console.log('🧪 Using Mock Authentication (network bypass)');
        const result = await mockSignIn(email, password);
        
        if (!result.error && result.data) {
          // Set the session and user manually
          console.log('🔄 Setting mock session and user');
          setSession(result.data.session as Session);
          setUser(result.data.user as User);
          setLoading(false);
        }
        
        return { error: result.error };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('🚨 AuthContext: Sign in failed:', error.message);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Run network test if we get a network error
        if (error.message.includes('Network request failed')) {
          console.log('🔍 Running network connectivity test...');
          await testNetworkConnectivity();
          
          // Fallback to mock auth for network issues in development
          if (__DEV__) {
            console.log('🧪 Falling back to Mock Authentication due to network issues');
            const mockResult = await mockSignIn(email, password);
            
            if (!mockResult.error && mockResult.data) {
              setSession(mockResult.data.session as Session);
              setUser(mockResult.data.user as User);
            }
            
            return { error: mockResult.error };
          }
        }
      } else {
        console.log('✅ AuthContext: Sign in successful');
        console.log('👤 User:', data.user?.email);
      }

      return { error };
    } catch (error) {
      console.error('❌ AuthContext: Sign in exception:', error);
      console.error('Exception details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack?.substring(0, 200) : 'No stack'
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.fitai.app://auth/reset-password',
      });

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'com.fitai.app://auth/confirm',
        },
      });

      return { error };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}