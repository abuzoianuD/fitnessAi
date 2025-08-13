import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors, AppColors } from "@/src/shared/constants/AppColors";

const workoutTypes = [
  { id: 'strength', emoji: '💪', labelKey: 'preferences.workoutTypes.strength' },
  { id: 'cardio', emoji: '❤️', labelKey: 'preferences.workoutTypes.cardio' },
  { id: 'flexibility', emoji: '🧘', labelKey: 'preferences.workoutTypes.flexibility' },
  { id: 'sports', emoji: '⚽', labelKey: 'preferences.workoutTypes.sports' },
  { id: 'bodyweight', emoji: '🤸', labelKey: 'preferences.workoutTypes.bodyweight' },
];

const workoutDurations = [
  { id: 15, emoji: '⚡', labelKey: 'preferences.duration.quick', minutes: 15 },
  { id: 30, emoji: '🏃', labelKey: 'preferences.duration.standard', minutes: 30 },
  { id: 45, emoji: '💪', labelKey: 'preferences.duration.intensive', minutes: 45 },
  { id: 60, emoji: '🔥', labelKey: 'preferences.duration.extended', minutes: 60 },
  { id: 90, emoji: '🏋️', labelKey: 'preferences.duration.marathon', minutes: 90 },
];

const equipment = [
  { id: 'dumbbells', emoji: '🏋️', labelKey: 'preferences.equipment.dumbbells' },
  { id: 'barbell', emoji: '🏋️‍♂️', labelKey: 'preferences.equipment.barbell' },
  { id: 'resistance_bands', emoji: '🔗', labelKey: 'preferences.equipment.resistanceBands' },
  { id: 'pull_up_bar', emoji: '🤸‍♂️', labelKey: 'preferences.equipment.pullUpBar' },
  { id: 'kettlebells', emoji: '⚫', labelKey: 'preferences.equipment.kettlebells' },
  { id: 'yoga_mat', emoji: '🧘‍♀️', labelKey: 'preferences.equipment.yogaMat' },
  { id: 'cardio_machine', emoji: '🏃‍♂️', labelKey: 'preferences.equipment.cardioMachine' },
  { id: 'none', emoji: '🚫', labelKey: 'preferences.equipment.none' },
];

const coachingStyles = [
  { 
    id: 'motivational', 
    emoji: '🔥', 
    titleKey: 'preferences.coaching.motivational.title',
    descKey: 'preferences.coaching.motivational.desc'
  },
  { 
    id: 'analytical', 
    emoji: '📊', 
    titleKey: 'preferences.coaching.analytical.title',
    descKey: 'preferences.coaching.analytical.desc'
  },
  { 
    id: 'casual', 
    emoji: '😊', 
    titleKey: 'preferences.coaching.casual.title',
    descKey: 'preferences.coaching.casual.desc'
  },
  { 
    id: 'professional', 
    emoji: '🎯', 
    titleKey: 'preferences.coaching.professional.title',
    descKey: 'preferences.coaching.professional.desc'
  },
];

export default function WorkoutPreferencesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);
  
  // Form data
  const [preferredWorkoutTypes, setPreferredWorkoutTypes] = useState<string[]>([]);
  const [workoutDuration, setWorkoutDuration] = useState<number | null>(null);
  const [gymAccess, setGymAccess] = useState<boolean | null>(null);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [communicationStyle, setCommunicationStyle] = useState('');

  const steps = [
    { key: 'workout-types', title: 'preferences.steps.workoutTypes' },
    { key: 'duration', title: 'preferences.steps.duration' },
    { key: 'gym-access', title: 'preferences.steps.gymAccess' },
    { key: 'equipment', title: 'preferences.steps.equipment' },
    { key: 'coaching', title: 'preferences.steps.coaching' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      transitionToStep(currentStep + 1);
    } else {
      handleSaveAndContinue();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      transitionToStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const transitionToStep = (newStep: number) => {
    setIsTransitioning(true);
    Keyboard.dismiss();
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: newStep > currentStep ? -50 : 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsTransitioning(false);
    });
    
    setCurrentStep(newStep);
  };

  const handleSaveAndContinue = async () => {
    const completeProfile = {
      preferredWorkoutTypes,
      workoutDuration,
      gymAccess,
      availableEquipment,
      communicationStyle,
      coachingPreferences: {
        encouragementLevel: 'medium', // Default values
        detailLevel: 'detailed',
        reminderFrequency: 'moderate',
      },
      onboarding_completed: true,
    };
    
    console.log('Saving complete fitness profile:', completeProfile);
    
    // Update user metadata in Supabase to mark onboarding as completed
    try {
      const { supabase } = await import('@/src/shared/utils/supabase');
      const { error } = await supabase.auth.updateUser({
        data: completeProfile
      });
      
      if (error) {
        console.error('Error saving onboarding data:', error);
      } else {
        console.log('Onboarding data saved successfully');
      }
    } catch (error) {
      console.error('Error updating user metadata:', error);
    }
    
    // Navigate to main app  
    router.replace('/(tabs)');
  };

  const toggleWorkoutType = (typeId: string) => {
    setPreferredWorkoutTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleEquipment = (equipmentId: string) => {
    if (equipmentId === 'none') {
      setAvailableEquipment(['none']);
      return;
    }
    
    setAvailableEquipment(prev => {
      const newEquipment = prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev.filter(id => id !== 'none'), equipmentId];
      return newEquipment;
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return preferredWorkoutTypes.length > 0;
      case 1: return workoutDuration !== null;
      case 2: return gymAccess !== null;
      case 3: return availableEquipment.length > 0;
      case 4: return communicationStyle !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    switch (step.key) {
      case 'workout-types':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('preferences.steps.workoutTypes')}</Text>
            <Text style={styles.stepSubtitle}>{t('preferences.workoutTypesSubtitle')}</Text>
            
            <View style={styles.optionsGrid}>
              {workoutTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionCard,
                    preferredWorkoutTypes.includes(type.id) && styles.selectedOptionCard,
                  ]}
                  onPress={() => toggleWorkoutType(type.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{type.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    preferredWorkoutTypes.includes(type.id) && styles.selectedOptionText,
                  ]}>
                    {t(type.labelKey)}
                  </Text>
                  {preferredWorkoutTypes.includes(type.id) && (
                    <Text style={styles.miniCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 'duration':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('preferences.steps.duration')}</Text>
            <Text style={styles.stepSubtitle}>{t('preferences.durationSubtitle')}</Text>
            
            <View style={styles.durationList}>
              {workoutDurations.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.durationCard,
                    workoutDuration === duration.id && styles.selectedDurationCard,
                  ]}
                  onPress={() => setWorkoutDuration(duration.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.durationEmoji}>{duration.emoji}</Text>
                  <View style={styles.durationInfo}>
                    <Text style={[
                      styles.durationText,
                      workoutDuration === duration.id && styles.selectedDurationText,
                    ]}>
                      {t(duration.labelKey)}
                    </Text>
                    <Text style={[
                      styles.durationMinutes,
                      workoutDuration === duration.id && styles.selectedDurationMinutes,
                    ]}>
                      {duration.minutes} {t('common.minutes')}
                    </Text>
                  </View>
                  {workoutDuration === duration.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 'gym-access':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('preferences.steps.gymAccess')}</Text>
            <Text style={styles.stepSubtitle}>{t('preferences.gymAccessSubtitle')}</Text>
            
            <View style={styles.gymAccessContainer}>
              <TouchableOpacity
                style={[
                  styles.gymAccessCard,
                  gymAccess === true && styles.selectedGymAccessCard,
                ]}
                onPress={() => setGymAccess(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.gymAccessEmoji}>🏋️‍♂️</Text>
                <Text style={[
                  styles.gymAccessText,
                  gymAccess === true && styles.selectedGymAccessText,
                ]}>
                  {t('preferences.gymAccess.yes')}
                </Text>
                <Text style={[
                  styles.gymAccessDesc,
                  gymAccess === true && styles.selectedGymAccessDesc,
                ]}>
                  {t('preferences.gymAccess.yesDesc')}
                </Text>
                {gymAccess === true && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.gymAccessCard,
                  gymAccess === false && styles.selectedGymAccessCard,
                ]}
                onPress={() => setGymAccess(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.gymAccessEmoji}>🏠</Text>
                <Text style={[
                  styles.gymAccessText,
                  gymAccess === false && styles.selectedGymAccessText,
                ]}>
                  {t('preferences.gymAccess.no')}
                </Text>
                <Text style={[
                  styles.gymAccessDesc,
                  gymAccess === false && styles.selectedGymAccessDesc,
                ]}>
                  {t('preferences.gymAccess.noDesc')}
                </Text>
                {gymAccess === false && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'equipment':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('preferences.steps.equipment')}</Text>
            <Text style={styles.stepSubtitle}>{t('preferences.equipmentSubtitle')}</Text>
            
            <ScrollView style={styles.equipmentList} showsVerticalScrollIndicator={false}>
              <View style={styles.equipmentGrid}>
                {equipment.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.equipmentCard,
                      availableEquipment.includes(item.id) && styles.selectedEquipmentCard,
                    ]}
                    onPress={() => toggleEquipment(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.equipmentEmoji}>{item.emoji}</Text>
                    <Text style={[
                      styles.equipmentText,
                      availableEquipment.includes(item.id) && styles.selectedEquipmentText,
                    ]}>
                      {t(item.labelKey)}
                    </Text>
                    {availableEquipment.includes(item.id) && (
                      <Text style={styles.miniCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );
        
      case 'coaching':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('preferences.steps.coaching')}</Text>
            <Text style={styles.stepSubtitle}>{t('preferences.coachingSubtitle')}</Text>
            
            <ScrollView style={styles.coachingList} showsVerticalScrollIndicator={false}>
              {coachingStyles.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.coachingCard,
                    communicationStyle === style.id && styles.selectedCoachingCard,
                  ]}
                  onPress={() => setCommunicationStyle(style.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.coachingEmoji}>{style.emoji}</Text>
                  <View style={styles.coachingInfo}>
                    <Text style={[
                      styles.coachingTitle,
                      communicationStyle === style.id && styles.selectedCoachingTitle,
                    ]}>
                      {t(style.titleKey)}
                    </Text>
                    <Text style={[
                      styles.coachingDesc,
                      communicationStyle === style.id && styles.selectedCoachingDesc,
                    ]}>
                      {t(style.descKey)}
                    </Text>
                  </View>
                  {communicationStyle === style.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {steps.length}
          </Text>
        </View>

        {/* Step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.nextButton,
              !isStepValid() && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!isStepValid() || isTransitioning}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.nextButtonText,
              !isStepValid() && styles.disabledButtonText,
            ]}>
              {currentStep === steps.length - 1 ? t('preferences.meetYourAI') : t('common.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  progressContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: AppColors.gray800,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: AppColors.gray400,
    fontWeight: '500',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: AppColors.gray300,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    flex: 1,
    position: 'relative',
  },
  selectedOptionCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: AppColors.white,
    fontWeight: '700',
  },
  miniCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 12,
    color: AppColors.white,
    fontWeight: "bold",
  },
  durationList: {
    gap: 12,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
  },
  selectedDurationCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  durationEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  durationInfo: {
    flex: 1,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.white,
  },
  selectedDurationText: {
    color: AppColors.white,
    fontWeight: '700',
  },
  durationMinutes: {
    fontSize: 14,
    color: AppColors.gray400,
    marginTop: 2,
  },
  selectedDurationMinutes: {
    color: Colors.primarySoft,
  },
  gymAccessContainer: {
    gap: 16,
  },
  gymAccessCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  selectedGymAccessCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  gymAccessEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  gymAccessText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 8,
  },
  selectedGymAccessText: {
    color: AppColors.white,
    fontWeight: '700',
  },
  gymAccessDesc: {
    fontSize: 14,
    color: AppColors.gray400,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedGymAccessDesc: {
    color: Colors.primarySoft,
  },
  equipmentList: {
    flex: 1,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  equipmentCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    flex: 1,
    position: 'relative',
  },
  selectedEquipmentCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  equipmentEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.white,
    textAlign: 'center',
  },
  selectedEquipmentText: {
    color: AppColors.white,
    fontWeight: '700',
  },
  coachingList: {
    flex: 1,
  },
  coachingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  selectedCoachingCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  coachingEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  coachingInfo: {
    flex: 1,
  },
  coachingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 4,
  },
  selectedCoachingTitle: {
    color: AppColors.white,
    fontWeight: '700',
  },
  coachingDesc: {
    fontSize: 14,
    color: AppColors.gray400,
    lineHeight: 20,
  },
  selectedCoachingDesc: {
    color: Colors.primarySoft,
  },
  checkmark: {
    fontSize: 20,
    color: AppColors.white,
    fontWeight: "bold",
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: AppColors.gray600,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  backButtonText: {
    color: AppColors.gray300,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: AppColors.gray700,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButtonText: {
    color: AppColors.gray500,
  },
});