import { supabase } from '@/src/shared/utils/supabase';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export class SupabaseAuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string): Promise<{
    user: AuthUser | null;
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // We'll handle email verification separately if needed
        }
      });

      if (error) {
        return {
          user: null,
          error: { code: error.message, message: error.message }
        };
      }

      const user = data.user;
      if (!user) {
        return {
          user: null,
          error: { code: 'no-user', message: 'No user returned after signup' }
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email || email,
          emailVerified: !!user.email_confirmed_at,
          createdAt: user.created_at,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: { code: 'unknown', message: err.message || 'Unknown error occurred' }
      };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{
    user: AuthUser | null;
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          user: null,
          error: { code: error.message, message: error.message }
        };
      }

      const user = data.user;
      if (!user) {
        return {
          user: null,
          error: { code: 'no-user', message: 'No user returned after sign in' }
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email || email,
          emailVerified: !!user.email_confirmed_at,
          createdAt: user.created_at,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: { code: 'unknown', message: err.message || 'Unknown error occurred' }
      };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: { code: error.message, message: error.message } };
      }

      return { error: null };
    } catch (err: any) {
      return { error: { code: 'unknown', message: err.message || 'Unknown error occurred' } };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email || '',
      emailVerified: !!user.email_confirmed_at,
      createdAt: user.created_at,
    };
  }

  // Get current session
  static async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Listen to auth changes
  static onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { data: { subscription: any } } {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // Adjust for your app's deep link
      });

      if (error) {
        return { error: { code: error.message, message: error.message } };
      }

      return { error: null };
    } catch (err: any) {
      return { error: { code: 'unknown', message: err.message || 'Unknown error occurred' } };
    }
  }

  // Update user profile
  static async updateUser(updates: {
    email?: string;
    password?: string;
    data?: Record<string, any>;
  }): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.updateUser(updates);

      if (error) {
        return {
          user: null,
          error: { code: error.message, message: error.message }
        };
      }

      const user = data.user;
      if (!user) {
        return {
          user: null,
          error: { code: 'no-user', message: 'No user returned after update' }
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email || '',
          emailVerified: !!user.email_confirmed_at,
          createdAt: user.created_at,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: { code: 'unknown', message: err.message || 'Unknown error occurred' }
      };
    }
  }
}