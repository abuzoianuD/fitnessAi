import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { CustomWorkout } from '@/src/domain/entities/AICoach';

interface WorkoutSummaryScreenProps {
  workout: CustomWorkout;
  completedSets: number;
  totalTime: number;
  exerciseProgress: Array<{
    exerciseId: string;
    completedSets: number;
    isCompleted: boolean;
  }>;
  onContinue: () => void;
  onSaveWorkout?: () => void;
}

export default function WorkoutSummaryScreen({
  workout,
  completedSets,
  totalTime,
  exerciseProgress,
  onContinue,
  onSaveWorkout,
}: WorkoutSummaryScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const totalPossibleSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completionPercentage = totalPossibleSets > 0 ? Math.round((completedSets / totalPossibleSets) * 100) : 0;
  
  const totalReps = workout.exercises.reduce((sum, exercise) => {
    const progress = exerciseProgress.find(p => p.exerciseId === exercise.exerciseId);
    return sum + ((progress?.completedSets || 0) * exercise.reps);
  }, 0);

  const getPerformanceMessage = (): string => {
    if (completionPercentage >= 100) return "Outstanding! You completed every single set! 🔥";
    if (completionPercentage >= 80) return "Excellent work! You pushed through most of the workout! 💪";
    if (completionPercentage >= 60) return "Good effort! You made solid progress today! 👍";
    if (completionPercentage >= 40) return "Nice start! Every step counts on your fitness journey! 🌟";
    return "You showed up and that's what matters! Keep building! 🚀";
  };

  const getPerformanceColor = (): string => {
    if (completionPercentage >= 80) return Colors.primary;
    if (completionPercentage >= 60) return Colors.primarySoft;
    return AppColors.gray300;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.congratsText}>🎉 Workout Complete!</Text>
          <Text style={styles.workoutName}>{workout.name}</Text>
        </View>

        {/* Performance Overview */}
        <View style={styles.performanceCard}>
          <View style={styles.completionCircle}>
            <Text style={[styles.completionPercentage, { color: getPerformanceColor() }]}>
              {completionPercentage}%
            </Text>
            <Text style={styles.completionLabel}>Complete</Text>
          </View>
          
          <Text style={[styles.performanceMessage, { color: getPerformanceColor() }]}>
            {getPerformanceMessage()}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalTime}</Text>
            <Text style={styles.metricLabel}>Minutes</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{completedSets}</Text>
            <Text style={styles.metricLabel}>Sets</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalReps}</Text>
            <Text style={styles.metricLabel}>Reps</Text>
          </View>
        </View>

        {/* Exercise Breakdown */}
        <View style={styles.exerciseBreakdown}>
          <Text style={styles.breakdownTitle}>Exercise Summary</Text>
          
          {workout.exercises.map((exercise, index) => {
            const progress = exerciseProgress[index];
            const exerciseCompletion = progress ? Math.round((progress.completedSets / exercise.sets) * 100) : 0;
            
            return (
              <View key={exercise.exerciseId} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>
                    {progress?.isCompleted ? '✅' : '🔄'} {exercise.name}
                  </Text>
                  <Text style={styles.exerciseCompletion}>{exerciseCompletion}%</Text>
                </View>
                
                <View style={styles.exerciseProgressBar}>
                  <View 
                    style={[
                      styles.exerciseProgressFill,
                      { 
                        width: `${exerciseCompletion}%`,
                        backgroundColor: progress?.isCompleted ? Colors.primary : AppColors.gray600
                      }
                    ]} 
                  />
                </View>
                
                <Text style={styles.exerciseStats}>
                  {progress?.completedSets || 0} of {exercise.sets} sets • {exercise.reps} reps each
                </Text>
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>🏆 Today's Achievements</Text>
          <View style={styles.achievementsList}>
            {completionPercentage >= 100 && (
              <Text style={styles.achievementItem}>💯 Perfect Completion</Text>
            )}
            {totalTime >= 20 && (
              <Text style={styles.achievementItem}>⏱️ Endurance Builder</Text>
            )}
            {completedSets >= 10 && (
              <Text style={styles.achievementItem}>🔥 Volume Master</Text>
            )}
            {exerciseProgress.filter(p => p.isCompleted).length >= 3 && (
              <Text style={styles.achievementItem}>🎯 Exercise Variety</Text>
            )}
            <Text style={styles.achievementItem}>💪 Consistency Champion</Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          <Text style={styles.nextStepsText}>
            Great job today! Your workout has been saved to "My Workouts" where you can track your progress over time. 
            Consider having some protein and staying hydrated for optimal recovery.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {onSaveWorkout && (
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={onSaveWorkout}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>📊 View My Workouts</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue to AI Coach</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.white,
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  completionCircle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  completionPercentage: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
  completionLabel: {
    fontSize: 14,
    color: AppColors.gray400,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  performanceMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: AppColors.gray400,
    fontWeight: '600',
  },
  exerciseBreakdown: {
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 16,
  },
  exerciseItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.white,
    flex: 1,
  },
  exerciseCompletion: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  exerciseProgressBar: {
    height: 4,
    backgroundColor: AppColors.gray800,
    borderRadius: 2,
    marginBottom: 8,
  },
  exerciseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  exerciseStats: {
    fontSize: 14,
    color: AppColors.gray400,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 12,
  },
  achievementsList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  achievementItem: {
    fontSize: 16,
    color: Colors.primarySoft,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  nextStepsSection: {
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 12,
  },
  nextStepsText: {
    fontSize: 16,
    color: AppColors.gray300,
    lineHeight: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: AppColors.gray800,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  saveButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
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
  continueButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});