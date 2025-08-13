import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors, AppColors } from "@/src/shared/constants/AppColors";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push("/onboarding/user-profile");
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
        <Text style={styles.emoji}>🏋️‍♂️</Text>
        <Text style={styles.title}>{t("onboarding.welcome")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.subtitle")}</Text>
        
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={handleGetStarted}
          activeOpacity={0.7}
        >
          <Text style={styles.getStartedButtonText}>
            {t("onboarding.getStarted")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A", // Same dark background as language selection
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.gray300,
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
