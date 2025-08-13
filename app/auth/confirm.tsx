import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { useAuth } from '@/src/shared/contexts/AuthContext';
import { supabase } from '@/src/shared/utils/supabase';

export default function ConfirmScreen() {
  const router = useRouter();
  const { token, type } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      if (!token || !type) {
        setError('Invalid confirmation link');
        setLoading(false);
        return;
      }

      try {
        if (type === 'signup') {
          // Handle email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token as string,
            type: 'email',
          });

          if (error) {
            setError(error.message);
          } else if (data.user) {
            setConfirmed(true);
            
            // Send welcome email (this would typically be done via a Supabase Edge Function)
            console.log('User confirmed, would send welcome email');
            
            // Wait a moment then redirect to onboarding
            setTimeout(() => {
              router.replace('/onboarding');
            }, 3000);
          }
        } else if (type === 'recovery') {
          // Handle password recovery
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token as string,
            type: 'recovery',
          });

          if (error) {
            setError(error.message);
          } else {
            // Redirect to password reset screen
            router.replace('/auth/reset-password');
          }
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [token, type, router]);

  const handleRetry = () => {
    router.push('/auth/login');
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Confirming your account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Confirmation Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (confirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Account Confirmed!</Text>
          <Text style={styles.successMessage}>
            Welcome to FitAI! Your account has been successfully confirmed. 
            You'll be redirected to complete your profile setup.
          </Text>
          
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.replace('/onboarding')}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue Setup</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.gray300,
    marginTop: 16,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: AppColors.gray300,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: AppColors.gray300,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});