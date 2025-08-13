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
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { CustomWorkout, CustomExercise } from '@/src/domain/entities/AICoach';
import { SaveWorkoutUseCase } from '@/src/domain/usecases/SaveWorkoutUseCase';
import { SupabaseWorkoutRepository } from '@/src/infrastructure/repositories/SupabaseWorkoutRepository';
import { useWorkoutExecution } from '@/src/presentation/hooks/useRealtimeWorkout';
import { useAuth } from '@/src/shared/contexts/AuthContext';
import WorkoutSummaryScreen from './WorkoutSummaryScreen';

interface RealtimeWorkoutExecutionProps {
  workout: CustomWorkout;
  workoutSessionId?: string;
  onWorkoutComplete: (completedSets: number, totalTime: number) => void;
  onWorkoutExit: () => void;
}

interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  isCompleted: boolean;
}

export default function RealtimeWorkoutExecution({
  workout,
  workoutSessionId,
  onWorkoutComplete,
  onWorkoutExit,
}: RealtimeWorkoutExecutionProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutStartTime] = useState(Date.now());
  const [showSummary, setShowSummary] = useState(false);
  const [sessionId, setSessionId] = useState(workoutSessionId || '');
  
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

  // Real-time workout execution hooks
  const {
    workoutState,
    isConnected,
    updateWorkoutProgress,
    completeExercise,
    completeWorkout,
  } = useWorkoutExecution(sessionId, !!sessionId);

  // Initialize workout repository
  const workoutRepository = new SupabaseWorkoutRepository();
  const saveWorkoutUseCase = new SaveWorkoutUseCase(workoutRepository);

  // Create workout session if not provided
  useEffect(() => {
    if (!sessionId && user) {
      createWorkoutSession();
    }
  }, [user]);

  const createWorkoutSession = async () => {
    if (!user) return;

    const newSession = {
      userId: user.id,
      workoutName: workout.name,
      startedAt: new Date(),
      durationMinutes: 0,
      totalSets: workout.exercises.reduce((sum, ex) => sum + ex.sets, 0),
      totalReps: workout.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0),
      totalVolume: 0,
      status: 'in_progress' as const,
      exercises: [],
    };

    const result = await saveWorkoutUseCase.execute(newSession);
    if (result.success) {
      setSessionId(result.data.id);
      console.log('✅ Created workout session:', result.data.id);
    } else {
      console.error('❌ Failed to create workout session:', result.error);
    }
  };

  // Sync local state with real-time state
  useEffect(() => {
    if (workoutState.isActive) {
      // Update UI based on real-time state
      console.log('📡 Syncing with real-time state:', workoutState);
    }
  }, [workoutState]);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsCount = exerciseProgress.reduce((sum, ex) => sum + ex.completedSets, 0);
  const progress = (completedSetsCount / totalSets) * 100;

  // Timer effect for rest periods
  useEffect(() => {
    let interval: NodeJS.Timeout;
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

  const handleCompleteSet = async () => {
    const updatedProgress = [...exerciseProgress];
    const exerciseIndex = updatedProgress.findIndex(ex => ex.exerciseId === currentExercise.exerciseId);
    
    updatedProgress[exerciseIndex].completedSets += 1;
    
    // Check if exercise is completed
    if (updatedProgress[exerciseIndex].completedSets >= currentExercise.sets) {
      updatedProgress[exerciseIndex].isCompleted = true;
      
      // Broadcast exercise completion
      await completeExercise(currentExercise.name);
      
      // Move to next exercise or complete workout
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
      } else {
        // All exercises completed
        handleCompleteWorkout();
        return;
      }
    } else {
      setCurrentSet(currentSet + 1);
      // Start rest timer
      setIsResting(true);
      setRestTimer(currentExercise.rest);
    }

    setExerciseProgress(updatedProgress);

    // Broadcast workout progress update
    const newCompletedSets = updatedProgress.reduce((sum, ex) => sum + ex.completedSets, 0);
    await updateWorkoutProgress({
      currentExercise: currentExercise.name,
      currentSet: currentSet + 1,
      totalSets,
      completedSets: newCompletedSets,
      progress: (newCompletedSets / totalSets) * 100,
    });
  };

  const handleCompleteWorkout = async () => {
    const totalTime = Math.floor((Date.now() - workoutStartTime) / 1000 / 60);
    const completedSets = exerciseProgress.reduce((sum, ex) => sum + ex.completedSets, 0);

    setWorkoutStats({
      completedSets,
      totalTime,
    });

    // Broadcast workout completion
    await completeWorkout();
    
    // Save final workout session
    if (sessionId) {
      const finalSession = {
        userId: user?.id || '',
        workoutName: workout.name,
        startedAt: new Date(workoutStartTime),
        completedAt: new Date(),
        durationMinutes: totalTime,
        totalSets: completedSets,
        totalReps: workout.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0),
        totalVolume: 0,
        status: 'completed' as const,
        exercises: workout.exercises.map(ex => {
          const progress = exerciseProgress.find(p => p.exerciseId === ex.exerciseId);
          return {
            exerciseId: ex.exerciseId,
            exerciseName: ex.name,
            setsCompleted: progress?.completedSets || 0,
            targetSets: ex.sets,
            targetReps: ex.reps,
            actualReps: Array(progress?.completedSets || 0).fill(ex.reps),
            restTime: ex.rest,
            notes: ex.notes,
          };
        }),
      };

      await saveWorkoutUseCase.execute(finalSession);
    }

    setShowSummary(true);
    onWorkoutComplete(completedSets, totalTime);
  };

  const handleExitWorkout = () => {
    Alert.alert(
      'Exit Workout',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onWorkoutExit },
      ]
    );
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  if (showSummary && workoutStats) {
    return (
      <WorkoutSummaryScreen
        workout={workout}
        completedSets={workoutStats.completedSets}
        totalTime={workoutStats.totalTime}
        onClose={() => {
          setShowSummary(false);
          onWorkoutExit();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExitWorkout} style={styles.exitButton}>
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.workoutTitle}>{workout.name}</Text>
            <View style={styles.connectionStatus}>
              <View style={[styles.connectionDot, { backgroundColor: isConnected ? Colors.primary : AppColors.gray400 }]} />
              <Text style={styles.connectionText}>{isConnected ? 'Live' : 'Offline'}</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>

        {/* Current Exercise */}
        <View style={styles.exerciseContainer}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.setInfo}>
            Set {currentSet} of {currentExercise.sets}
          </Text>
          <Text style={styles.repsInfo}>
            {currentExercise.reps} reps
          </Text>
          
          {currentExercise.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Form Tips:</Text>
              <Text style={styles.notesText}>{currentExercise.notes}</Text>
            </View>
          )}
        </View>

        {/* Rest Timer */}
        {isResting && (
          <View style={styles.restContainer}>
            <Text style={styles.restLabel}>Rest Time</Text>
            <Text style={styles.restTimer}>{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</Text>
            <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
              <Text style={styles.skipButtonText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button */}
        {!isResting && (
          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteSet}>
            <Text style={styles.completeButtonText}>
              {currentSet >= currentExercise.sets ? 'Next Exercise' : 'Complete Set'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          <Text style={styles.listTitle}>Workout Overview</Text>
          {workout.exercises.map((exercise, index) => {
            const progress = exerciseProgress.find(ex => ex.exerciseId === exercise.exerciseId);
            const isActive = index === currentExerciseIndex;
            
            return (
              <View 
                key={exercise.exerciseId} 
                style={[
                  styles.exerciseItem,
                  isActive && styles.activeExerciseItem,
                  progress?.isCompleted && styles.completedExerciseItem
                ]}
              >
                <Text style={[
                  styles.exerciseItemName,
                  isActive && styles.activeExerciseItemText,
                  progress?.isCompleted && styles.completedExerciseItemText
                ]}>
                  {exercise.name}
                </Text>
                <Text style={[
                  styles.exerciseItemSets,
                  isActive && styles.activeExerciseItemText,
                  progress?.isCompleted && styles.completedExerciseItemText
                ]}>
                  {progress?.completedSets || 0}/{exercise.sets} sets
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  exitButton: {
    padding: 8,
  },
  exitText: {
    color: AppColors.gray400,
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.gray800,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  connectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 10,
    color: AppColors.gray300,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 6,
    backgroundColor: AppColors.gray800,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: AppColors.gray400,
    textAlign: 'center',
  },
  exerciseContainer: {
    backgroundColor: AppColors.gray900,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AppColors.gray800,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  setInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  repsInfo: {
    fontSize: 16,
    color: AppColors.gray300,
    marginBottom: 16,
    textAlign: 'center',
  },
  notesContainer: {
    backgroundColor: AppColors.gray800,
    borderRadius: 8,
    padding: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: AppColors.gray300,
    lineHeight: 20,
  },
  restContainer: {
    backgroundColor: AppColors.gray900,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  restLabel: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  skipButton: {
    backgroundColor: AppColors.gray700,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseList: {
    marginTop: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  exerciseItem: {
    backgroundColor: AppColors.gray900,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.gray800,
  },
  activeExerciseItem: {
    borderColor: Colors.primary,
    backgroundColor: AppColors.primary800,
  },
  completedExerciseItem: {
    borderColor: AppColors.gray600,
    backgroundColor: AppColors.gray800,
  },
  exerciseItemName: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  activeExerciseItemText: {
    color: Colors.primary,
  },
  completedExerciseItemText: {
    color: AppColors.gray400,
  },
  exerciseItemSets: {
    fontSize: 14,
    color: AppColors.gray400,
  },
});