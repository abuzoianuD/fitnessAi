// Color palette based on oklch(0.696 0.17 162.48) - #00A86B
export const AppColors = {
  // Base color variations
  primary50: '#E6F9F2',   // Very light
  primary100: '#CCF2E5',  // Light
  primary200: '#99E6CB',  // Light-medium
  primary300: '#66D9B1',  // Medium-light
  primary400: '#33CD97',  // Medium
  primary500: '#00A86B',  // Base color - oklch(0.696 0.17 162.48)
  primary600: '#009357',  // Medium-dark
  primary700: '#007E43',  // Dark
  primary800: '#00692F',  // Very dark
  primary900: '#00541B',  // Darkest

  // Neutral colors for text and backgrounds
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Status colors
  red500: '#EF4444',
  orange500: '#F97316',
} as const;

// Semantic color names for easier usage
export const Colors = {
  // Primary brand colors
  primary: AppColors.primary500,
  primaryLight: AppColors.primary300,
  primaryDark: AppColors.primary700,
  primarySoft: AppColors.primary100,
  primaryBg: AppColors.primary50,

  // Background colors
  background: AppColors.white,
  backgroundSecondary: AppColors.gray50,
  backgroundAccent: AppColors.primary50,

  // Text colors
  text: AppColors.gray900,
  textSecondary: AppColors.gray600,
  textLight: AppColors.gray500,
  textOnPrimary: AppColors.white,

  // Border colors
  border: AppColors.gray300,
  borderLight: AppColors.gray200,
  borderFocus: AppColors.primary500,

  // Interactive states
  success: AppColors.primary500,
  disabled: AppColors.gray300,
  shadow: AppColors.gray200,
} as const;