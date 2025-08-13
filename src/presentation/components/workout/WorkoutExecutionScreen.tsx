import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { CustomWorkout, CustomExercise } from '@/src/domain/entities/AICoach';
import { SaveWorkoutUseCase } from '@/src/domain/usecases/SaveWorkoutUseCase';
import { SupabaseWorkoutRepository } from '@/src/infrastructure/repositories/SupabaseWorkoutRepository';
import WorkoutSummaryScreen from './WorkoutSummaryScreen';

interface WorkoutExecutionScreenProps {
  workout: CustomWorkout;
  onWorkoutComplete: (completedSets: number, totalTime: number) => void;
  onWorkoutExit: () => void;
}

interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  isCompleted: boolean;
}

export default function WorkoutExecutionScreen({
  workout,
  onWorkoutComplete,
  onWorkoutExit,
}: WorkoutExecutionScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutStartTime] = useState(Date.now());
  const [showSummary, setShowSummary] = useState(false);
  const [workoutStats, setWorkoutStats] = useState<{
    completedSets: number;
    totalTime: number;
  } | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>(
    workout.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      completedSets: 0,
      isCompleted: false,
    }))
  );

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const isLastSet = currentSet === currentExercise.sets;

  // Rest timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const handleSetComplete = () => {
    // Update exercise progress
    setExerciseProgress(prev => 
      prev.map(progress => 
        progress.exerciseId === currentExercise.exerciseId
          ? { ...progress, completedSets: progress.completedSets + 1 }
          : progress
      )
    );

    if (isLastSet) {
      // Exercise completed
      setExerciseProgress(prev => 
        prev.map(progress => 
          progress.exerciseId === currentExercise.exerciseId
            ? { ...progress, isCompleted: true }
            : progress
        )
      );

      if (isLastExercise) {
        // Workout completed!
        handleWorkoutComplete();
      } else {
        // Move to next exercise
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        startRestTimer();
      }
    } else {
      // Next set
      setCurrentSet(prev => prev + 1);
      startRestTimer();
    }
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRestTimer(currentExercise.rest);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  const handleWorkoutComplete = async () => {
    const totalTime = Math.floor((Date.now() - workoutStartTime) / 1000 / 60); // minutes
    const totalCompletedSets = exerciseProgress.reduce((sum, progress) => sum + progress.completedSets, 0);
    
    // Save workout stats and show summary screen
    setWorkoutStats({ completedSets: totalCompletedSets, totalTime });
    
    try {
      // Save workout to Supabase in background
      const workoutRepository = new SupabaseWorkoutRepository();
      const saveWorkoutUseCase = new SaveWorkoutUseCase(workoutRepository);
      
      await saveWorkoutUseCase.execute({
        workout,
        startedAt: new Date(workoutStartTime),
        completedAt: new Date(),
        durationMinutes: totalTime,
        exerciseProgress,
        notes: `Completed ${totalCompletedSets} sets in ${totalTime} minutes`,
      });
    } catch (error) {
      console.warn('Failed to save workout:', error);
    }
    
    setShowSummary(true);
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Workout?',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onWorkoutExit },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOverallProgress = (): number => {
    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completedSets = exerciseProgress.reduce((sum, progress) => sum + progress.completedSets, 0);
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  const handleSummaryViewMyWorkouts = () => {
    // Navigate to My Workouts screen (to be implemented)
    onWorkoutComplete(workoutStats?.completedSets || 0, workoutStats?.totalTime || 0);
  };

  const handleSummaryContinue = () => {
    onWorkoutComplete(workoutStats?.completedSets || 0, workoutStats?.totalTime || 0);
  };

  // Show summary screen if workout is complete
  if (showSummary && workoutStats) {
    return (
      <WorkoutSummaryScreen
        workout={workout}
        completedSets={workoutStats.completedSets}
        totalTime={workoutStats.totalTime}
        exerciseProgress={exerciseProgress}
        onContinue={handleSummaryContinue}
        onSaveWorkout={handleSummaryViewMyWorkouts}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${getOverallProgress()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(getOverallProgress())}%
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Exercise */}
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            Set {currentSet} of {currentExercise.sets} • {currentExercise.reps} reps
          </Text>
          
          {currentExercise.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>💡 Tip:</Text>
              <Text style={styles.notesText}>{currentExercise.notes}</Text>
            </View>
          )}

          {/* Rest Timer */}
          {isResting && (
            <View style={styles.restContainer}>
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
              <TouchableOpacity onPress={skipRest} style={styles.skipRestButton}>
                <Text style={styles.skipRestText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button */}
          {!isResting && (
            <TouchableOpacity
              style={styles.completeSetButton}
              onPress={handleSetComplete}
              activeOpacity={0.8}
            >
              <Text style={styles.completeSetButtonText}>
                {isLastSet && isLastExercise 
                  ? '🎉 Complete Workout' 
                  : isLastSet 
                    ? 'Next Exercise →' 
                    : 'Set Complete ✓'
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          <Text style={styles.exerciseListTitle}>Workout Overview</Text>
          {workout.exercises.map((exercise, index) => {
            const progress = exerciseProgress[index];
            const isCurrent = index === currentExerciseIndex;
            
            return (
              <View 
                key={exercise.exerciseId} 
                style={[
                  styles.exerciseListItem,
                  isCurrent && styles.exerciseListItemCurrent,
                  progress.isCompleted && styles.exerciseListItemCompleted,
                ]}
              >
                <Text style={[
                  styles.exerciseListName,
                  isCurrent && styles.exerciseListNameCurrent,
                  progress.isCompleted && styles.exerciseListNameCompleted,
                ]}>
                  {progress.isCompleted ? '✅' : isCurrent ? '🔄' : '⏸️'} {exercise.name}
                </Text>
                <Text style={[
                  styles.exerciseListDetails,
                  isCurrent && styles.exerciseListDetailsCurrent,
                ]}>
                  {progress.completedSets}/{exercise.sets} sets • {exercise.reps} reps
                </Text>
              </View>
            );
          })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray800,
  },
  exitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
  },
  progressText: {
    fontSize: 14,
    color: AppColors.gray400,
    marginTop: 2,
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: AppColors.gray800,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  exerciseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseDetails: {
    fontSize: 16,
    color: Colors.primarySoft,
    textAlign: 'center',
    marginBottom: 16,
  },
  notesContainer: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: AppColors.gray200,
    lineHeight: 20,
  },
  restContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  restTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.gray300,
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
  },
  skipRestButton: {
    backgroundColor: AppColors.gray700,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipRestText: {
    color: AppColors.gray300,
    fontSize: 14,
    fontWeight: '600',
  },
  completeSetButton: {
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
  completeSetButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  exerciseList: {
    marginTop: 24,
    marginBottom: 32,
  },
  exerciseListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 16,
  },
  exerciseListItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  exerciseListItemCurrent: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark,
  },
  exerciseListItemCompleted: {
    backgroundColor: AppColors.gray800,
  },
  exerciseListName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.white,
    marginBottom: 4,
  },
  exerciseListNameCurrent: {
    color: AppColors.white,
  },
  exerciseListNameCompleted: {
    color: AppColors.gray400,
  },
  exerciseListDetails: {
    fontSize: 14,
    color: AppColors.gray400,
  },
  exerciseListDetailsCurrent: {
    color: Colors.primarySoft,
  },
});