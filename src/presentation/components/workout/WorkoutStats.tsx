import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WorkoutSession } from '@/src/domain/entities/Workout';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';

interface WorkoutStatsProps {
  workouts: WorkoutSession[];
}

export function WorkoutStats({ workouts }: WorkoutStatsProps) {
  const calculateStats = () => {
    if (workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalTime: 0,
        averageDuration: 0,
        totalVolume: 0,
        thisWeek: 0
      };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalTime = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
    const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
    const thisWeek = workouts.filter(w => 
      w.completedAt && w.completedAt >= weekAgo
    ).length;

    return {
      totalWorkouts: workouts.length,
      totalTime,
      averageDuration: Math.round(totalTime / workouts.length),
      totalVolume: Math.round(totalVolume),
      thisWeek
    };
  };

  const stats = calculateStats();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatTime(stats.totalTime)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalVolume.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Volume (lbs)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: AppColors.gray900,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.gray800,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: AppColors.gray400,
    textAlign: 'center',
  },
});