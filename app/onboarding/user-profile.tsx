import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors, AppColors } from "@/src/shared/constants/AppColors";

const genderOptions = [
  { id: "male", emoji: "👨", labelKey: "userProfile.gender.male" },
  { id: "female", emoji: "👩", labelKey: "userProfile.gender.female" },
  { id: "other", emoji: "🧑", labelKey: "userProfile.gender.other" },
  {
    id: "prefer-not-to-say",
    emoji: "🚫",
    labelKey: "userProfile.gender.preferNotToSay",
  },
];

const activityLevels = [
  {
    id: "sedentary",
    emoji: "🪑",
    labelKey: "userProfile.activity.sedentary.title",
    descKey: "userProfile.activity.sedentary.desc",
  },
  {
    id: "lightly_active",
    emoji: "🚶",
    labelKey: "userProfile.activity.lightlyActive.title",
    descKey: "userProfile.activity.lightlyActive.desc",
  },
  {
    id: "moderately_active",
    emoji: "🏃",
    labelKey: "userProfile.activity.moderatelyActive.title",
    descKey: "userProfile.activity.moderatelyActive.desc",
  },
  {
    id: "very_active",
    emoji: "💪",
    labelKey: "userProfile.activity.veryActive.title",
    descKey: "userProfile.activity.veryActive.desc",
  },
  {
    id: "extremely_active",
    emoji: "🏋️",
    labelKey: "userProfile.activity.extremelyActive.title",
    descKey: "userProfile.activity.extremelyActive.desc",
  },
];

export default function UserProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  // Form data
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const steps = [
    { key: "name", title: "userProfile.steps.name.title" },
    { key: "basic", title: "userProfile.steps.basic.title" },
    { key: "physical", title: "userProfile.steps.physical.title" },
    { key: "activity", title: "userProfile.steps.activity.title" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      transitionToStep(currentStep + 1);
    } else {
      // Save profile and continue to goals
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

  const handleBackgroundPress = () => {
    Keyboard.dismiss();
  };

  const transitionToStep = (newStep: number) => {
    setIsTransitioning(true);
    Keyboard.dismiss(); // Dismiss keyboard when transitioning

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
    // TODO: Save to Firebase user profile
    console.log("Saving profile:", {
      displayName,
      age: parseInt(age),
      gender,
      height: parseInt(height),
      weight: parseInt(weight),
      activityLevel,
    });

    router.push("/onboarding/goals");
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return displayName.trim().length > 0;
      case 1:
        return age && gender;
      case 2:
        return height && weight;
      case 3:
        return activityLevel;
      default:
        return false;
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.key) {
      case "name":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t("userProfile.steps.name.title")}
            </Text>
            <Text style={styles.stepSubtitle}>
              {t("userProfile.steps.name.subtitle")}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={t("userProfile.steps.name.placeholder")}
                placeholderTextColor={AppColors.gray400}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={dismissKeyboard}
                autoCorrect={false}
                autoCapitalize="words"
                textContentType="name"
              />
            </View>
          </View>
        );

      case "basic":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t("userProfile.steps.basic.title")}
            </Text>
            <Text style={styles.stepSubtitle}>
              {t("userProfile.steps.basic.subtitle")}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("userProfile.age")}</Text>
              <TextInput
                style={styles.numberInput}
                placeholder="25"
                placeholderTextColor={AppColors.gray400}
                value={age}
                onChangeText={(text) => {
                  setAge(text);
                  // Auto-dismiss keyboard when user enters 2 digits for age
                  if (text.length === 2) {
                    setTimeout(() => Keyboard.dismiss(), 100);
                  }
                }}
                keyboardType="numeric"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={dismissKeyboard}
                autoCorrect={false}
                textContentType="none"
              />
            </View>

            <View style={styles.optionsContainer}>
              <Text style={styles.inputLabel}>
                {t("userProfile.gender.title")}
              </Text>
              <View style={styles.optionsGrid}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      gender === option.id && styles.selectedOptionCard,
                    ]}
                    onPress={() => setGender(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        gender === option.id && styles.selectedOptionText,
                      ]}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case "physical":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t("userProfile.steps.physical.title")}
            </Text>
            <Text style={styles.stepSubtitle}>
              {t("userProfile.steps.physical.subtitle")}
            </Text>

            <View style={styles.physicalInputsContainer}>
              <View style={styles.physicalInputGroup}>
                <Text style={styles.inputLabel}>
                  {t("userProfile.height")} (cm)
                </Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="175"
                  placeholderTextColor={AppColors.gray400}
                  value={height}
                  onChangeText={(text) => {
                    setHeight(text);
                    // Auto-dismiss keyboard when user enters 3 digits for height
                    if (text.length === 3) {
                      setTimeout(() => Keyboard.dismiss(), 100);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  returnKeyType="next"
                  onSubmitEditing={dismissKeyboard}
                  autoCorrect={false}
                  textContentType="none"
                />
              </View>

              <View style={styles.physicalInputGroup}>
                <Text style={styles.inputLabel}>
                  {t("userProfile.weight")} (kg)
                </Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="70"
                  placeholderTextColor={AppColors.gray400}
                  value={weight}
                  onChangeText={(text) => {
                    setWeight(text);
                    // Auto-dismiss keyboard when user enters 3 digits for weight
                    if (text.length === 3) {
                      setTimeout(() => Keyboard.dismiss(), 100);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  returnKeyType="done"
                  onSubmitEditing={dismissKeyboard}
                  autoCorrect={false}
                  textContentType="none"
                />
              </View>
            </View>
          </View>
        );

      case "activity":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {t("userProfile.steps.activity.title")}
            </Text>
            <Text style={styles.stepSubtitle}>
              {t("userProfile.steps.activity.subtitle")}
            </Text>

            <ScrollView
              style={styles.activityList}
              showsVerticalScrollIndicator={false}
            >
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.activityCard,
                    activityLevel === level.id && styles.selectedActivityCard,
                  ]}
                  onPress={() => setActivityLevel(level.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activityEmoji}>{level.emoji}</Text>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[
                        styles.activityTitle,
                        activityLevel === level.id &&
                          styles.selectedActivityTitle,
                      ]}
                    >
                      {t(level.labelKey)}
                    </Text>
                    <Text
                      style={[
                        styles.activityDesc,
                        activityLevel === level.id &&
                          styles.selectedActivityDesc,
                      ]}
                    >
                      {t(level.descKey)}
                    </Text>
                  </View>
                  {activityLevel === level.id && (
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={handleBackgroundPress} accessible={false}>
        <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / steps.length) * 100}%` },
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
                {currentStep === 0 ? t("common.skip") : t("common.back")}
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
              <Text
                style={[
                  styles.nextButtonText,
                  !isStepValid() && styles.disabledButtonText,
                ]}
              >
                {currentStep === steps.length - 1
                  ? t("common.continue")
                  : t("common.next")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A", // Same dark background as language selection
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  progressContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: AppColors.gray800,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: AppColors.gray400,
    fontWeight: "500",
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
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.white,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: AppColors.white,
    fontWeight: "500",
  },
  numberInput: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: AppColors.white,
    fontWeight: "500",
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minWidth: "45%",
    flex: 1,
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
    fontWeight: "600",
    color: AppColors.white,
    textAlign: "center",
  },
  selectedOptionText: {
    color: AppColors.white,
    fontWeight: "700",
  },
  physicalInputsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  physicalInputGroup: {
    flex: 1,
  },
  activityList: {
    flex: 1,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  selectedActivityCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  activityEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.white,
    marginBottom: 4,
  },
  selectedActivityTitle: {
    color: AppColors.white,
    fontWeight: "700",
  },
  activityDesc: {
    fontSize: 14,
    color: AppColors.gray400,
    lineHeight: 20,
  },
  selectedActivityDesc: {
    color: Colors.primarySoft,
  },
  checkmark: {
    fontSize: 20,
    color: AppColors.white,
    fontWeight: "bold",
  },
  navigationContainer: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: AppColors.gray600,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  backButtonText: {
    color: AppColors.gray300,
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
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
    fontWeight: "700",
  },
  disabledButtonText: {
    color: AppColors.gray500,
  },
});
