import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { useAuth } from '@/src/shared/contexts/AuthContext';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateFirstName = (firstName: string): boolean => {
    if (!firstName.trim()) {
      setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
      return false;
    }
    if (firstName.length < 2) {
      setErrors(prev => ({ ...prev, firstName: 'First name must be at least 2 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, firstName: '' }));
    return true;
  };

  const validateLastName = (lastName: string): boolean => {
    if (!lastName.trim()) {
      setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
      return false;
    }
    if (lastName.length < 2) {
      setErrors(prev => ({ ...prev, lastName: 'Last name must be at least 2 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, lastName: '' }));
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setErrors(prev => ({ ...prev, password: 'Password must contain uppercase, lowercase, and number' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      return false;
    }
    if (confirmPassword !== formData.password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return false;
    }
    setErrors(prev => ({ ...prev, confirmPassword: '' }));
    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (errors[field as keyof typeof errors]) {
      switch (field) {
        case 'firstName':
          validateFirstName(value);
          break;
        case 'lastName':
          validateLastName(value);
          break;
        case 'email':
          validateEmail(value);
          break;
        case 'password':
          validatePassword(value);
          // Re-validate confirm password if it exists
          if (formData.confirmPassword) {
            validateConfirmPassword(formData.confirmPassword);
          }
          break;
        case 'confirmPassword':
          validateConfirmPassword(value);
          break;
      }
    }
  };

  const handleSignUp = async () => {
    // Validate all fields
    const isFirstNameValid = validateFirstName(formData.firstName);
    const isLastNameValid = validateLastName(formData.lastName);
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid = validateConfirmPassword(formData.confirmPassword);

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        'Terms Required',
        'Please accept the Terms of Service and Privacy Policy to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        formData.email.toLowerCase().trim(),
        formData.password,
        {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        }
      );

      if (error) {
        if (error.message.includes('already registered')) {
          Alert.alert(
            'Account Exists',
            'An account with this email already exists. Would you like to sign in instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign In', onPress: () => router.push('/auth/login') }
            ]
          );
        } else {
          Alert.alert(
            'Sign Up Error',
            error.message || 'An unexpected error occurred. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Success - show confirmation screen
        Alert.alert(
          '📧 Check Your Email!',
          'We\'ve sent you a confirmation link. Please check your email and click the link to activate your account.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/auth/email-sent')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Network Error',
        'Unable to connect. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = () => {
    router.push('/auth/login');
  };

  const isFormValid = 
    formData.firstName.length > 0 &&
    formData.lastName.length > 0 &&
    formData.email.length > 0 &&
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    !Object.values(errors).some(error => error.length > 0) &&
    acceptedTerms;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join FitAI and start your personalized fitness journey</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.firstName ? styles.inputError : null,
                ]}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                onBlur={() => validateFirstName(formData.firstName)}
                placeholder="Enter your first name"
                placeholderTextColor={AppColors.gray500}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading && !authLoading}
              />
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.lastName ? styles.inputError : null,
                ]}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                onBlur={() => validateLastName(formData.lastName)}
                placeholder="Enter your last name"
                placeholderTextColor={AppColors.gray500}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading && !authLoading}
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email ? styles.inputError : null,
                ]}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                onBlur={() => validateEmail(formData.email)}
                placeholder="Enter your email"
                placeholderTextColor={AppColors.gray500}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !authLoading}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.password ? styles.inputError : null,
                ]}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                onBlur={() => validatePassword(formData.password)}
                placeholder="Enter your password"
                placeholderTextColor={AppColors.gray500}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !authLoading}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword ? styles.inputError : null,
                ]}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                onBlur={() => validateConfirmPassword(formData.confirmPassword)}
                placeholder="Confirm your password"
                placeholderTextColor={AppColors.gray500}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !authLoading}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading || authLoading}
            >
              <View style={[styles.checkbox, acceptedTerms ? styles.checkboxChecked : null]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I accept the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                !isFormValid || loading || authLoading ? styles.signUpButtonDisabled : null,
              ]}
              onPress={handleSignUp}
              disabled={!isFormValid || loading || authLoading}
              activeOpacity={0.8}
            >
              {loading || authLoading ? (
                <ActivityIndicator color={AppColors.white} size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={handleLoginPress}
              disabled={loading || authLoading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.gray400,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: AppColors.gray800,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.white,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: AppColors.gray600,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.gray400,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  signUpButton: {
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
  signUpButtonDisabled: {
    backgroundColor: AppColors.gray700,
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: AppColors.gray400,
    fontSize: 16,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});