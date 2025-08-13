import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Supabase Client Config:', {
  url: supabaseUrl?.substring(0, 30) + '...',
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'fitai-app',
      'User-Agent': 'FitAI-ReactNative/1.0',
    },
    fetch: (url, options = {}) => {
      console.log('🌐 Supabase Fetch:', url);
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.error('❌ Network Fetch Error:', {
          url,
          error: error.message,
          options
        });
        throw error;
      });
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Export types for easy access
export type { Database } from '../types/supabase';