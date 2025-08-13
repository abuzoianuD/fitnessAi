import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/src/shared/contexts/AuthContext';
import { RealtimeWorkoutService, WorkoutUpdate } from '@/src/infrastructure/services/RealtimeWorkoutService';

interface UseRealtimeWorkoutOptions {
  workoutSessionId?: string;
  onWorkoutUpdate?: (update: WorkoutUpdate) => void;
  enabled?: boolean;
}

export function useRealtimeWorkout({
  workoutSessionId,
  onWorkoutUpdate,
  enabled = true
}: UseRealtimeWorkoutOptions = {}) {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<WorkoutUpdate | null>(null);
  const serviceRef = useRef<RealtimeWorkoutService>(new RealtimeWorkoutService());
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !user) {
      return;
    }

    const service = serviceRef.current;

    const handleUpdate = (update: WorkoutUpdate) => {
      setLastUpdate(update);
      onWorkoutUpdate?.(update);
    };

    // Subscribe to specific workout session or all user workouts
    if (workoutSessionId) {
      unsubscribeRef.current = service.subscribeToWorkoutSession(workoutSessionId, handleUpdate);
    } else {
      unsubscribeRef.current = service.subscribeToUserWorkouts(user.id, handleUpdate);
    }

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus(service.getConnectionStatus());
    }, 1000);

    return () => {
      unsubscribeRef.current?.();
      clearInterval(statusInterval);
    };
  }, [user, workoutSessionId, enabled, onWorkoutUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      serviceRef.current.cleanup();
    };
  }, []);

  const broadcastUpdate = async (update: WorkoutUpdate) => {
    if (!enabled) return;
    await serviceRef.current.broadcastWorkoutUpdate(update);
  };

  return {
    connectionStatus,
    lastUpdate,
    broadcastUpdate,
    isConnected: connectionStatus === 'joined',
  };
}

// Hook specifically for workout execution screens
export function useWorkoutExecution(workoutSessionId: string, enabled = true) {
  const [workoutState, setWorkoutState] = useState({
    isActive: false,
    currentExercise: '',
    currentSet: 0,
    totalSets: 0,
    completedSets: 0,
    progress: 0,
  });

  const { connectionStatus, lastUpdate, broadcastUpdate, isConnected } = useRealtimeWorkout({
    workoutSessionId,
    enabled,
    onWorkoutUpdate: (update) => {
      switch (update.type) {
        case 'workout_started':
          setWorkoutState(prev => ({
            ...prev,
            isActive: true,
          }));
          break;
        
        case 'workout_updated':
          if (update.data.currentExercise || update.data.currentSet !== undefined) {
            setWorkoutState(prev => ({
              ...prev,
              currentExercise: update.data.currentExercise || prev.currentExercise,
              currentSet: update.data.currentSet ?? prev.currentSet,
              totalSets: update.data.totalSets ?? prev.totalSets,
              completedSets: update.data.completedSets ?? prev.completedSets,
              progress: update.data.progress ?? prev.progress,
            }));
          }
          break;

        case 'workout_completed':
          setWorkoutState(prev => ({
            ...prev,
            isActive: false,
            progress: 100,
          }));
          break;

        case 'exercise_completed':
          setWorkoutState(prev => ({
            ...prev,
            completedSets: prev.completedSets + 1,
            progress: Math.round((prev.completedSets + 1) / prev.totalSets * 100),
          }));
          break;
      }
    }
  });

  const updateWorkoutProgress = async (data: {
    currentExercise?: string;
    currentSet?: number;
    totalSets?: number;
    completedSets?: number;
    progress?: number;
  }) => {
    await broadcastUpdate({
      type: 'workout_updated',
      workoutSessionId,
      data,
      timestamp: new Date(),
    });
  };

  const completeExercise = async (exerciseName: string) => {
    await broadcastUpdate({
      type: 'exercise_completed',
      workoutSessionId,
      data: {
        currentExercise: exerciseName,
      },
      timestamp: new Date(),
    });
  };

  const completeWorkout = async () => {
    await broadcastUpdate({
      type: 'workout_completed',
      workoutSessionId,
      data: {
        progress: 100,
      },
      timestamp: new Date(),
    });
  };

  return {
    workoutState,
    connectionStatus,
    lastUpdate,
    isConnected,
    updateWorkoutProgress,
    completeExercise,
    completeWorkout,
  };
}