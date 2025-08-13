import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/shared/contexts/AuthContext';
import { Colors } from '@/src/shared/constants/AppColors';

export default function IndexScreen() {
  const { session, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 IndexScreen useEffect:', {
      loading,
      hasSession: !!session,
      hasUser: !!user,
      onboardingCompleted: user?.user_metadata?.onboarding_completed,
      userEmail: user?.email
    });

    if (!loading) {
      if (!session) {
        // User is not authenticated, redirect to login
        console.log('🔄 Redirecting to login (no session)');
        router.replace('/auth/login');
      } else {
        // User is authenticated, check if they've completed onboarding
        if (user?.user_metadata?.onboarding_completed) {
          console.log('🔄 Redirecting to main app (onboarding completed)');
          router.replace('/(tabs)');
        } else {
          console.log('🔄 Redirecting to onboarding (not completed)');
          router.push('/onboarding/user-info');
        }
      }
    }
  }, [session, loading, user, router]);

  // Show loading spinner while determining where to navigate
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
});