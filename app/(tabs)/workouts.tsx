import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { useAuth } from '@/src/shared/contexts/AuthContext';
import { WorkoutSession } from '@/src/domain/entities/Workout';
import { GetWorkoutHistoryUseCase } from '@/src/domain/usecases/workout/GetWorkoutHistoryUseCase';
import { SupabaseWorkoutRepository } from '@/src/infrastructure/repositories/SupabaseWorkoutRepository';
import { WorkoutHistoryCard } from '@/src/presentation/components/workout/WorkoutHistoryCard';
import { WorkoutStats } from '@/src/presentation/components/workout/WorkoutStats';

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize use cases
  const workoutRepository = new SupabaseWorkoutRepository();
  const getWorkoutHistoryUseCase = new GetWorkoutHistoryUseCase(workoutRepository);

  const loadWorkouts = async (showRefreshIndicator = false) => {
    if (!user) return;

    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await getWorkoutHistoryUseCase.execute(user.id);
      
      if (result.success) {
        setWorkouts(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  const handleRefresh = () => {
    loadWorkouts(true);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>Sign in to view your workouts</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your workouts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Unable to load workouts</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Text style={styles.errorHint}>Pull down to retry</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (workouts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emoji}>🏋️‍♂️</Text>
            <Text style={styles.emptyStateTitle}>No workouts yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start your fitness journey by chatting with your AI Coach to generate your first workout!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Workouts</Text>
          <Text style={styles.subtitle}>Track your fitness progress</Text>
        </View>

        <WorkoutStats workouts={workouts} />

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {workouts.map((workout) => (
            <WorkoutHistoryCard
              key={workout.id}
              workout={workout}
              onPress={() => {
                // TODO: Navigate to workout details
                console.log('View workout details:', workout.id);
              }}
            />
          ))}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.gray400,
  },
  historySection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.gray400,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.red500,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: AppColors.gray400,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: AppColors.gray500,
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: AppColors.gray400,
    textAlign: 'center',
    lineHeight: 24,
  },
});