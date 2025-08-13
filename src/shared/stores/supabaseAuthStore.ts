import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SupabaseAuthService, AuthUser, AuthError } from '@/src/infrastructure/services/SupabaseAuthService';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

interface AuthActions {
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: {
    email?: string;
    password?: string;
    data?: Record<string, any>;
  }) => Promise<{ success: boolean; error?: string }>;
  initialize: () => void;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AuthError | null) => void;
  clearError: () => void;
}

export const useSupabaseAuthStore = create<AuthState & AuthActions>()(
  immer((set, get) => ({
    // State
    user: null,
    session: null,
    loading: true,
    error: null,

    // Actions
    signUp: async (email: string, password: string) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      const { user, error } = await SupabaseAuthService.signUp(email, password);

      set((state) => {
        state.loading = false;
        if (error) {
          state.error = error;
        } else {
          state.user = user;
          state.error = null;
        }
      });

      return { success: !error, error: error?.message };
    },

    signIn: async (email: string, password: string) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      const { user, error } = await SupabaseAuthService.signIn(email, password);

      set((state) => {
        state.loading = false;
        if (error) {
          state.error = error;
        } else {
          state.user = user;
          state.error = null;
        }
      });

      return { success: !error, error: error?.message };
    },

    signOut: async () => {
      set((state) => {
        state.loading = true;
      });

      await SupabaseAuthService.signOut();

      set((state) => {
        state.user = null;
        state.session = null;
        state.loading = false;
        state.error = null;
      });
    },

    resetPassword: async (email: string) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      const { error } = await SupabaseAuthService.resetPassword(email);

      set((state) => {
        state.loading = false;
        if (error) {
          state.error = error;
        }
      });

      return { success: !error, error: error?.message };
    },

    updateUser: async (updates: {
      email?: string;
      password?: string;
      data?: Record<string, any>;
    }) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      const { user, error } = await SupabaseAuthService.updateUser(updates);

      set((state) => {
        state.loading = false;
        if (error) {
          state.error = error;
        } else if (user) {
          state.user = user;
        }
      });

      return { success: !error, error: error?.message };
    },

    initialize: () => {
      set((state) => {
        state.loading = true;
      });

      // Get initial session
      SupabaseAuthService.getCurrentSession().then((session) => {
        set((state) => {
          state.session = session;
          state.user = session?.user ? {
            id: session.user.id,
            email: session.user.email || '',
            emailVerified: !!session.user.email_confirmed_at,
            createdAt: session.user.created_at,
          } : null;
          state.loading = false;
        });
      });

      // Listen to auth changes
      SupabaseAuthService.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        set((state) => {
          state.session = session;
          state.user = session?.user ? {
            id: session.user.id,
            email: session.user.email || '',
            emailVerified: !!session.user.email_confirmed_at,
            createdAt: session.user.created_at,
          } : null;
          
          // Clear loading state on any auth change
          state.loading = false;

          // Handle specific events
          if (event === 'SIGNED_OUT') {
            state.error = null;
          } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            state.error = null;
          }
        });
      });
    },

    // Direct state setters for external use
    setUser: (user: AuthUser | null) => {
      set((state) => {
        state.user = user;
      });
    },

    setSession: (session: Session | null) => {
      set((state) => {
        state.session = session;
      });
    },

    setLoading: (loading: boolean) => {
      set((state) => {
        state.loading = loading;
      });
    },

    setError: (error: AuthError | null) => {
      set((state) => {
        state.error = error;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);

// Initialize auth store when imported
if (typeof window !== 'undefined') {
  useSupabaseAuthStore.getState().initialize();
}