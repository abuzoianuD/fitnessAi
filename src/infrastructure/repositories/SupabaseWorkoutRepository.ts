import { createClient } from '@supabase/supabase-js';
import { WorkoutRepository } from '@/src/domain/repositories/WorkoutRepository';
import { WorkoutSession, ExerciseLog, PersonalRecord } from '@/src/domain/entities/Workout';
import { Result } from '@/src/shared/types/Result';
import { Database } from '@/src/shared/types/supabase';

export class SupabaseWorkoutRepository implements WorkoutRepository {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  async saveWorkoutSession(session: Omit<WorkoutSession, 'id' | 'createdAt'>): Promise<Result<WorkoutSession, string>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Insert workout session
      const { data: workoutData, error: workoutError } = await this.supabase
        .from('workout_sessions')
        .insert({
          user_id: user.user.id,
          workout_name: session.workoutName,
          workout_template_id: session.workoutTemplateId,
          started_at: session.startedAt.toISOString(),
          completed_at: session.completedAt?.toISOString(),
          duration_minutes: session.durationMinutes,
          total_sets: session.totalSets,
          total_reps: session.totalReps,
          total_volume: session.totalVolume,
          notes: session.notes,
          status: session.status,
        })
        .select()
        .single();

      if (workoutError) {
        return { success: false, error: workoutError.message };
      }

      // Insert exercise logs if completed
      if (session.exercises && session.exercises.length > 0) {
        const exerciseLogsData = session.exercises.map(exercise => ({
          workout_session_id: workoutData.id,
          user_id: user.user.id,
          exercise_name: exercise.exerciseName,
          exercise_id: exercise.exerciseId,
          sets_completed: exercise.setsCompleted,
          target_sets: exercise.targetSets,
          target_reps: exercise.targetReps,
          actual_reps: exercise.actualReps,
          weight: exercise.weight,
          rest_time: exercise.restTime,
          notes: exercise.notes,
        }));

        const { error: logsError } = await this.supabase
          .from('exercise_logs')
          .insert(exerciseLogsData);

        if (logsError) {
          console.warn('Failed to save exercise logs:', logsError.message);
        }
      }

      const savedSession: WorkoutSession = {
        id: workoutData.id,
        userId: workoutData.user_id,
        workoutName: workoutData.workout_name,
        workoutTemplateId: workoutData.workout_template_id,
        startedAt: new Date(workoutData.started_at),
        completedAt: workoutData.completed_at ? new Date(workoutData.completed_at) : undefined,
        durationMinutes: workoutData.duration_minutes,
        totalSets: workoutData.total_sets,
        totalReps: workoutData.total_reps,
        totalVolume: workoutData.total_volume,
        notes: workoutData.notes,
        status: workoutData.status as 'in_progress' | 'completed' | 'cancelled',
        exercises: session.exercises,
        createdAt: new Date(workoutData.created_at),
      };

      return { success: true, data: savedSession };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save workout session' 
      };
    }
  }

  async getWorkoutHistory(userId: string, limit?: number): Promise<Result<WorkoutSession[], string>> {
    try {
      let query = this.supabase
        .from('workout_sessions')
        .select(`
          *,
          exercise_logs (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      const sessions: WorkoutSession[] = data.map(session => ({
        id: session.id,
        userId: session.user_id,
        workoutName: session.workout_name,
        workoutTemplateId: session.workout_template_id,
        startedAt: new Date(session.started_at),
        completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
        durationMinutes: session.duration_minutes,
        totalSets: session.total_sets,
        totalReps: session.total_reps,
        totalVolume: session.total_volume,
        notes: session.notes,
        status: session.status as 'in_progress' | 'completed' | 'cancelled',
        exercises: session.exercise_logs?.map((log: any) => ({
          exerciseId: log.exercise_id,
          exerciseName: log.exercise_name,
          setsCompleted: log.sets_completed,
          targetSets: log.target_sets,
          targetReps: log.target_reps,
          actualReps: log.actual_reps || [],
          weight: log.weight,
          restTime: log.rest_time,
          notes: log.notes,
        })) || [],
        createdAt: new Date(session.created_at),
      }));

      return { success: true, data: sessions };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get workout history' 
      };
    }
  }

  async updateWorkoutSession(
    id: string, 
    updates: Partial<Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Result<WorkoutSession, string>> {
    try {
      const { data, error } = await this.supabase
        .from('workout_sessions')
        .update({
          workout_name: updates.workoutName,
          completed_at: updates.completedAt?.toISOString(),
          duration_minutes: updates.durationMinutes,
          total_sets: updates.totalSets,
          total_reps: updates.totalReps,
          total_volume: updates.totalVolume,
          notes: updates.notes,
          status: updates.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const updatedSession: WorkoutSession = {
        id: data.id,
        userId: data.user_id,
        workoutName: data.workout_name,
        workoutTemplateId: data.workout_template_id,
        startedAt: new Date(data.started_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        durationMinutes: data.duration_minutes,
        totalSets: data.total_sets,
        totalReps: data.total_reps,
        totalVolume: data.total_volume,
        notes: data.notes,
        status: data.status as 'in_progress' | 'completed' | 'cancelled',
        exercises: updates.exercises || [],
        createdAt: new Date(data.created_at),
      };

      return { success: true, data: updatedSession };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update workout session' 
      };
    }
  }

  async savePersonalRecord(record: Omit<PersonalRecord, 'id' | 'createdAt'>): Promise<Result<PersonalRecord, string>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await this.supabase
        .from('personal_records')
        .insert({
          user_id: user.user.id,
          exercise_name: record.exerciseName,
          exercise_id: record.exerciseId,
          record_type: record.recordType,
          value: record.value,
          unit: record.unit,
          achieved_at: record.achievedAt.toISOString(),
          notes: record.notes,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const savedRecord: PersonalRecord = {
        id: data.id,
        userId: data.user_id,
        exerciseName: data.exercise_name,
        exerciseId: data.exercise_id,
        recordType: data.record_type,
        value: data.value,
        unit: data.unit,
        achievedAt: new Date(data.achieved_at),
        notes: data.notes,
        createdAt: new Date(data.created_at),
      };

      return { success: true, data: savedRecord };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save personal record' 
      };
    }
  }

  async getPersonalRecords(userId: string, exerciseId?: string): Promise<Result<PersonalRecord[], string>> {
    try {
      let query = this.supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (exerciseId) {
        query = query.eq('exercise_id', exerciseId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      const records: PersonalRecord[] = data.map(record => ({
        id: record.id,
        userId: record.user_id,
        exerciseName: record.exercise_name,
        exerciseId: record.exercise_id,
        recordType: record.record_type,
        value: record.value,
        unit: record.unit,
        achievedAt: new Date(record.achieved_at),
        notes: record.notes,
        createdAt: new Date(record.created_at),
      }));

      return { success: true, data: records };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get personal records' 
      };
    }
  }
}