import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/src/shared/utils/supabase';
import { WorkoutSession, ExerciseLog } from '@/src/domain/entities/Workout';

export interface WorkoutUpdate {
  type: 'workout_started' | 'workout_updated' | 'workout_completed' | 'exercise_completed' | 'set_completed';
  workoutSessionId: string;
  data: {
    currentExercise?: string;
    currentSet?: number;
    totalSets?: number;
    completedSets?: number;
    progress?: number;
    exerciseLog?: ExerciseLog;
    session?: Partial<WorkoutSession>;
  };
  timestamp: Date;
}

export interface WorkoutUpdateListener {
  (update: WorkoutUpdate): void;
}

export class RealtimeWorkoutService {
  private channel: RealtimeChannel | null = null;
  private listeners: Map<string, WorkoutUpdateListener[]> = new Map();

  /**
   * Subscribe to real-time updates for a specific workout session
   */
  subscribeToWorkoutSession(workoutSessionId: string, listener: WorkoutUpdateListener): () => void {
    // Add listener to the map
    if (!this.listeners.has(workoutSessionId)) {
      this.listeners.set(workoutSessionId, []);
    }
    this.listeners.get(workoutSessionId)!.push(listener);

    // Create channel if it doesn't exist
    if (!this.channel) {
      this.setupRealtimeChannel();
    }

    // Return unsubscribe function
    return () => {
      const sessionListeners = this.listeners.get(workoutSessionId);
      if (sessionListeners) {
        const index = sessionListeners.indexOf(listener);
        if (index > -1) {
          sessionListeners.splice(index, 1);
        }
        
        // Clean up if no more listeners
        if (sessionListeners.length === 0) {
          this.listeners.delete(workoutSessionId);
        }
      }

      // Cleanup channel if no more listeners
      if (this.listeners.size === 0) {
        this.cleanup();
      }
    };
  }

  /**
   * Broadcast a workout update to all subscribers
   */
  async broadcastWorkoutUpdate(update: WorkoutUpdate): Promise<void> {
    try {
      if (!this.channel) {
        this.setupRealtimeChannel();
      }

      const message = {
        type: 'workout_update',
        payload: update,
      };

      const result = await this.channel?.send(message);
      console.log('📡 Broadcasted workout update:', result);
    } catch (error) {
      console.error('❌ Failed to broadcast workout update:', error);
    }
  }

  /**
   * Subscribe to all workout updates for the current user
   */
  subscribeToUserWorkouts(userId: string, listener: WorkoutUpdateListener): () => void {
    const channelName = `user-workouts-${userId}`;
    
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, []);
    }
    this.listeners.get(channelName)!.push(listener);

    // Create dedicated channel for user workouts
    const userChannel = supabase.channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workout_sessions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.handleDatabaseChange('workout_sessions', payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'exercise_logs',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.handleDatabaseChange('exercise_logs', payload);
      })
      .subscribe();

    // Return unsubscribe function
    return () => {
      const channelListeners = this.listeners.get(channelName);
      if (channelListeners) {
        const index = channelListeners.indexOf(listener);
        if (index > -1) {
          channelListeners.splice(index, 1);
        }
      }

      userChannel.unsubscribe();
      this.listeners.delete(channelName);
    };
  }

  /**
   * Setup the main realtime channel for workout updates
   */
  private setupRealtimeChannel(): void {
    this.channel = supabase.channel('workout-updates')
      .on('broadcast', { event: 'workout_update' }, (payload) => {
        const update = payload.payload as WorkoutUpdate;
        this.notifyListeners(update.workoutSessionId, update);
      })
      .subscribe((status) => {
        console.log('📡 Realtime channel status:', status);
      });
  }

  /**
   * Handle database changes from Postgres triggers
   */
  private handleDatabaseChange(table: string, payload: any): void {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      let update: WorkoutUpdate;
      
      if (table === 'workout_sessions') {
        if (eventType === 'INSERT' && newRecord.status === 'in_progress') {
          update = {
            type: 'workout_started',
            workoutSessionId: newRecord.id,
            data: {
              session: {
                id: newRecord.id,
                workoutName: newRecord.workout_name,
                startedAt: new Date(newRecord.started_at),
                status: newRecord.status,
              }
            },
            timestamp: new Date()
          };
        } else if (eventType === 'UPDATE' && newRecord.status === 'completed') {
          update = {
            type: 'workout_completed',
            workoutSessionId: newRecord.id,
            data: {
              session: {
                completedAt: new Date(newRecord.completed_at),
                durationMinutes: newRecord.duration_minutes,
                totalSets: newRecord.total_sets,
                totalVolume: newRecord.total_volume,
                status: newRecord.status,
              }
            },
            timestamp: new Date()
          };
        } else {
          update = {
            type: 'workout_updated',
            workoutSessionId: newRecord.id,
            data: { session: newRecord },
            timestamp: new Date()
          };
        }
      } else if (table === 'exercise_logs') {
        update = {
          type: eventType === 'INSERT' ? 'exercise_completed' : 'set_completed',
          workoutSessionId: newRecord.workout_session_id,
          data: {
            exerciseLog: {
              exerciseId: newRecord.exercise_id,
              exerciseName: newRecord.exercise_name,
              setsCompleted: newRecord.sets_completed,
              targetSets: newRecord.target_sets,
              targetReps: newRecord.target_reps,
              actualReps: newRecord.actual_reps || [],
              weight: newRecord.weight,
              restTime: newRecord.rest_time,
              notes: newRecord.notes,
            }
          },
          timestamp: new Date()
        };
      } else {
        return; // Unknown table
      }

      // Notify all relevant listeners
      this.notifyListeners(update.workoutSessionId, update);
      
    } catch (error) {
      console.error('❌ Error handling database change:', error);
    }
  }

  /**
   * Notify all listeners for a specific workout session
   */
  private notifyListeners(workoutSessionId: string, update: WorkoutUpdate): void {
    const sessionListeners = this.listeners.get(workoutSessionId);
    if (sessionListeners) {
      sessionListeners.forEach(listener => {
        try {
          listener(update);
        } catch (error) {
          console.error('❌ Error in workout update listener:', error);
        }
      });
    }
  }

  /**
   * Cleanup realtime subscriptions
   */
  cleanup(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.listeners.clear();
  }

  /**
   * Get the current status of the realtime connection
   */
  getConnectionStatus(): string {
    return this.channel?.state || 'disconnected';
  }
}