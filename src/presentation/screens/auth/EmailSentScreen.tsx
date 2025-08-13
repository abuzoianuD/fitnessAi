import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { useAuth } from '@/src/shared/contexts/AuthContext';

export default function EmailSentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { resendConfirmation } = useAuth();

  const handleResendEmail = async () => {
    // For now, we'll show an alert. In a real app, we'd need to store the email
    // or get it from route params
    console.log('Resend email functionality would go here');
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const handleCheckEmail = () => {
    // This could open the default email app
    console.log('Open email app');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.emailIcon}>📧</Text>
        </View>

        <Text style={styles.title}>Check Your Email!</Text>
        
        <Text style={styles.message}>
          We've sent you a confirmation link. Please check your email and click the link to activate your account.
        </Text>

        <Text style={styles.note}>
          If you don't see the email, check your spam folder or try resending.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCheckEmail}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Open Email App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResendEmail}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Resend Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Having trouble? 
          </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.footerLink}> Try signing in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  emailIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: AppColors.gray300,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    maxWidth: 300,
  },
  note: {
    fontSize: 14,
    color: AppColors.gray500,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 280,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: AppColors.gray400,
    fontSize: 16,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});