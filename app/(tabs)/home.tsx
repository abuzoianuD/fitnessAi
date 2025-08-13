import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning! 👋</Text>
          <Text style={styles.subtitle}>Ready to crush your fitness goals?</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          
          <TouchableOpacity 
            style={styles.primaryCard}
            onPress={() => router.push('/(tabs)/ai-coach')}
            activeOpacity={0.8}  
          >
            <Text style={styles.cardEmoji}>🤖</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Chat with AI Coach</Text>
              <Text style={styles.cardDescription}>
                Get personalized workout plans and nutrition advice
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.cardRow}>
            <TouchableOpacity 
              style={styles.secondaryCard}  
              onPress={() => router.push('/(tabs)/workouts')}
              activeOpacity={0.8}
            >
              <Text style={styles.smallCardEmoji}>💪</Text>
              <Text style={styles.smallCardTitle}>Start Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryCard}
              onPress={() => router.push('/(tabs)/progress')}
              activeOpacity={0.8}
            >
              <Text style={styles.smallCardEmoji}>📊</Text>
              <Text style={styles.smallCardTitle}>View Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>🎯 Welcome to FitAI!</Text>
            <Text style={styles.planDescription}>
              Start by chatting with your AI coach to get your first personalized workout plan.
            </Text>
            <TouchableOpacity 
              style={styles.planButton}
              onPress={() => router.push('/(tabs)/ai-coach')}
            >
              <Text style={styles.planButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>-</Text>
              <Text style={styles.statLabel}>Next Goal</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.gray400,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 16,
  },
  primaryCard: {
    backgroundColor: Colors.primaryDark,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.primarySoft,
    lineHeight: 20,
  },
  cardArrow: {
    fontSize: 20,
    color: AppColors.white,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  smallCardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  smallCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: AppColors.gray400,
    lineHeight: 20,
    marginBottom: 16,
  },
  planButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  planButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.gray400,
    textAlign: 'center',
  },
});