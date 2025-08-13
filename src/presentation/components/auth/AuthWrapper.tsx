import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/src/shared/contexts/AuthContext';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { session, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isAuthRoute = pathname.startsWith('/auth');
      const isOnboardingRoute = pathname.startsWith('/onboarding');
      
      if (!session) {
        // User is not authenticated
        if (!isAuthRoute) {
          // Redirect to login if not already on auth route
          router.replace('/auth/login');
        }
      } else {
        // User is authenticated
        if (isAuthRoute) {
          // Redirect authenticated users away from auth pages
          // Check if user has completed onboarding
          if (user?.user_metadata?.onboarding_completed) {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        }
      }
    }
  }, [session, loading, pathname, router, user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
});