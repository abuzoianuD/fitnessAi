import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { WorkoutUpdate } from '@/src/infrastructure/services/RealtimeWorkoutService';

interface LiveWorkoutBannerProps {
  lastUpdate: WorkoutUpdate | null;
  onPress?: () => void;
}

export function LiveWorkoutBanner({ lastUpdate, onPress }: LiveWorkoutBannerProps) {
  if (!lastUpdate || lastUpdate.type === 'workout_completed') {
    return null;
  }

  const getStatusText = () => {
    switch (lastUpdate.type) {
      case 'workout_started':
        return 'Workout started';
      case 'workout_updated':
        const { currentExercise, currentSet, progress } = lastUpdate.data;
        if (currentExercise) {
          return `${currentExercise}${currentSet ? ` - Set ${currentSet}` : ''}`;
        }
        if (progress !== undefined) {
          return `${progress}% complete`;
        }
        return 'Workout in progress';
      case 'exercise_completed':
        return `Completed: ${lastUpdate.data.exerciseLog?.exerciseName}`;
      case 'set_completed':
        return 'Set completed';
      default:
        return 'Workout active';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.indicator}>
          <View style={styles.pulseDot} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <Text style={styles.timeText}>{formatTime(lastUpdate.timestamp)}</Text>
        </View>
        <Text style={styles.liveLabel}>LIVE</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.gray900,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  indicator: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    opacity: 1,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    color: AppColors.gray400,
  },
  liveLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: AppColors.gray800,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});