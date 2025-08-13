import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WorkoutSession } from '@/src/domain/entities/Workout';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';

interface WorkoutHistoryCardProps {
  workout: WorkoutSession;
  onPress?: () => void;
}

export function WorkoutHistoryCard({ workout, onPress }: WorkoutHistoryCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {workout.workoutName}
          </Text>
          <Text style={styles.date}>
            {workout.completedAt ? formatDate(workout.completedAt) : 'In Progress'}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: workout.status === 'completed' ? Colors.primary : AppColors.orange500 }]} />
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(workout.durationMinutes)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{workout.exercises.length}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{workout.totalSets}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{workout.totalVolume.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Volume (lbs)</Text>
        </View>
      </View>

      {workout.exercises.length > 0 && (
        <View style={styles.exercisePreview}>
          <Text style={styles.exercisePreviewText}>
            {workout.exercises.slice(0, 3).map(ex => ex.exerciseName).join(' • ')}
            {workout.exercises.length > 3 && ` • +${workout.exercises.length - 3} more`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.gray900,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.gray800,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: AppColors.gray400,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.gray400,
  },
  exercisePreview: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.gray800,
  },
  exercisePreviewText: {
    fontSize: 14,
    color: AppColors.gray300,
    lineHeight: 20,
  },
});