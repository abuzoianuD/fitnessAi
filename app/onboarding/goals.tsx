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

const fitnessGoals = [
  {
    id: 'lose_weight',
    emoji: '⚖️',
    titleKey: 'goals.loseWeight.title',
    descKey: 'goals.loseWeight.desc',
    color: '#FF6B6B',
  },
  {
    id: 'build_muscle',
    emoji: '💪',
    titleKey: 'goals.buildMuscle.title', 
    descKey: 'goals.buildMuscle.desc',
    color: '#4ECDC4',
  },
  {
    id: 'get_stronger',
    emoji: '🏋️',
    titleKey: 'goals.getStronger.title',
    descKey: 'goals.getStronger.desc', 
    color: '#45B7D1',
  },
  {
    id: 'improve_endurance',
    emoji: '🏃',
    titleKey: 'goals.improveEndurance.title',
    descKey: 'goals.improveEndurance.desc',
    color: '#96CEB4',
  },
  {
    id: 'general_fitness',
    emoji: '✨',
    titleKey: 'goals.generalFitness.title',
    descKey: 'goals.generalFitness.desc',
    color: '#FFEAA7',
  },
];

const fitnessLevels = [
  {
    id: 'beginner',
    emoji: '🌱',
    titleKey: 'fitnessLevel.beginner.title',
    descKey: 'fitnessLevel.beginner.desc',
  },
  {
    id: 'intermediate', 
    emoji: '🔥',
    titleKey: 'fitnessLevel.intermediate.title',
    descKey: 'fitnessLevel.intermediate.desc',
  },
  {
    id: 'advanced',
    emoji: '⚡',
    titleKey: 'fitnessLevel.advanced.title',
    descKey: 'fitnessLevel.advanced.desc',
  },
];

const workoutFrequencies = [
  { id: 1, emoji: '1️⃣', labelKey: 'workoutFrequency.once' },
  { id: 2, emoji: '2️⃣', labelKey: 'workoutFrequency.twice' },
  { id: 3, emoji: '3️⃣', labelKey: 'workoutFrequency.three' },
  { id: 4, emoji: '4️⃣', labelKey: 'workoutFrequency.four' },
  { id: 5, emoji: '5️⃣', labelKey: 'workoutFrequency.five' },
  { id: 6, emoji: '6️⃣', labelKey: 'workoutFrequency.six' },
  { id: 7, emoji: '7️⃣', labelKey: 'workoutFrequency.daily' },
];

export default function FitnessGoalsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);
  
  // Form data
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [workoutFrequency, setWorkoutFrequency] = useState<number | null>(null);

  const steps = [
    { key: 'primary-goal', title: 'goals.steps.primaryGoal' },
    { key: 'secondary-goals', title: 'goals.steps.secondaryGoals' },
    { key: 'fitness-level', title: 'goals.steps.fitnessLevel' },
    { key: 'frequency', title: 'goals.steps.frequency' },
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

  const handleSaveAndContinue = () => {
    // TODO: Save fitness profile to Firebase
    console.log('Saving fitness goals:', {
      primaryGoal,
      secondaryGoals,
      fitnessLevel,
      workoutFrequency,
    });
    
    router.push('/onboarding/preferences');
  };

  const toggleSecondaryGoal = (goalId: string) => {
    if (goalId === primaryGoal) return; // Can't select primary goal as secondary
    
    setSecondaryGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return primaryGoal !== '';
      case 1: return true; // Secondary goals are optional
      case 2: return fitnessLevel !== '';
      case 3: return workoutFrequency !== null;
      default: return false;
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    switch (step.key) {
      case 'primary-goal':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('goals.steps.primaryGoal')}</Text>
            <Text style={styles.stepSubtitle}>{t('goals.primaryGoalSubtitle')}</Text>
            
            <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
              {fitnessGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    primaryGoal === goal.id && styles.selectedGoalCard,
                  ]}
                  onPress={() => setPrimaryGoal(goal.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.goalColorIndicator, { backgroundColor: goal.color }]} />
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={[
                      styles.goalTitle,
                      primaryGoal === goal.id && styles.selectedGoalTitle,
                    ]}>
                      {t(goal.titleKey)}
                    </Text>
                    <Text style={[
                      styles.goalDesc,
                      primaryGoal === goal.id && styles.selectedGoalDesc,
                    ]}>
                      {t(goal.descKey)}
                    </Text>
                  </View>
                  {primaryGoal === goal.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
        
      case 'secondary-goals':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('goals.steps.secondaryGoals')}</Text>
            <Text style={styles.stepSubtitle}>{t('goals.secondaryGoalsSubtitle')}</Text>
            
            <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
              {fitnessGoals
                .filter(goal => goal.id !== primaryGoal)
                .map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    secondaryGoals.includes(goal.id) && styles.selectedGoalCard,
                  ]}
                  onPress={() => toggleSecondaryGoal(goal.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.goalColorIndicator, { backgroundColor: goal.color }]} />
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={[
                      styles.goalTitle,
                      secondaryGoals.includes(goal.id) && styles.selectedGoalTitle,
                    ]}>
                      {t(goal.titleKey)}
                    </Text>
                    <Text style={[
                      styles.goalDesc,
                      secondaryGoals.includes(goal.id) && styles.selectedGoalDesc,
                    ]}>
                      {t(goal.descKey)}
                    </Text>
                  </View>
                  {secondaryGoals.includes(goal.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
        
      case 'fitness-level':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('goals.steps.fitnessLevel')}</Text>
            <Text style={styles.stepSubtitle}>{t('goals.fitnessLevelSubtitle')}</Text>
            
            <View style={styles.levelsList}>
              {fitnessLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelCard,
                    fitnessLevel === level.id && styles.selectedLevelCard,
                  ]}
                  onPress={() => setFitnessLevel(level.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.levelEmoji}>{level.emoji}</Text>
                  <View style={styles.levelInfo}>
                    <Text style={[
                      styles.levelTitle,
                      fitnessLevel === level.id && styles.selectedLevelTitle,
                    ]}>
                      {t(level.titleKey)}
                    </Text>
                    <Text style={[
                      styles.levelDesc,
                      fitnessLevel === level.id && styles.selectedLevelDesc,
                    ]}>
                      {t(level.descKey)}
                    </Text>
                  </View>
                  {fitnessLevel === level.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 'frequency':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('goals.steps.frequency')}</Text>
            <Text style={styles.stepSubtitle}>{t('goals.frequencySubtitle')}</Text>
            
            <View style={styles.frequencyGrid}>
              {workoutFrequencies.map((freq) => (
                <TouchableOpacity
                  key={freq.id}
                  style={[
                    styles.frequencyCard,
                    workoutFrequency === freq.id && styles.selectedFrequencyCard,
                  ]}
                  onPress={() => setWorkoutFrequency(freq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.frequencyEmoji}>{freq.emoji}</Text>
                  <Text style={[
                    styles.frequencyText,
                    workoutFrequency === freq.id && styles.selectedFrequencyText,
                  ]}>
                    {t(freq.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              {currentStep === steps.length - 1 ? t('common.continue') : t('common.next')}
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
  goalsList: {
    flex: 1,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    position: 'relative',
  },
  selectedGoalCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  goalColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
    position: 'absolute',
    left: 0,
  },
  goalEmoji: {
    fontSize: 32,
    marginLeft: 16,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 4,
  },
  selectedGoalTitle: {
    color: AppColors.white,
    fontWeight: '700',
  },
  goalDesc: {
    fontSize: 14,
    color: AppColors.gray400,
    lineHeight: 20,
  },
  selectedGoalDesc: {
    color: Colors.primarySoft,
  },
  levelsList: {
    gap: 16,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
  },
  selectedLevelCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  levelEmoji: {
    fontSize: 40,
    marginRight: 20,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 6,
  },
  selectedLevelTitle: {
    color: AppColors.white,
    fontWeight: '700',
  },
  levelDesc: {
    fontSize: 14,
    color: AppColors.gray400,
    lineHeight: 20,
  },
  selectedLevelDesc: {
    color: Colors.primarySoft,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  frequencyCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedFrequencyCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  frequencyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
    textAlign: 'center',
  },
  selectedFrequencyText: {
    color: AppColors.white,
    fontWeight: '700',
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