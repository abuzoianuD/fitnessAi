import { WorkoutSession, ExerciseLog, PersonalRecord } from '@/src/domain/entities/Workout';
import { Result } from '@/src/shared/types/Result';

export interface WorkoutRepository {
  /**
   * Save a workout session to the database
   */
  saveWorkoutSession(session: Omit<WorkoutSession, 'id' | 'createdAt'>): Promise<Result<WorkoutSession, string>>;

  /**
   * Get workout history for a user
   */
  getWorkoutHistory(userId: string, limit?: number): Promise<Result<WorkoutSession[], string>>;

  /**
   * Update an existing workout session
   */
  updateWorkoutSession(
    id: string, 
    updates: Partial<Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Result<WorkoutSession, string>>;

  /**
   * Save a personal record
   */
  savePersonalRecord(record: Omit<PersonalRecord, 'id' | 'createdAt'>): Promise<Result<PersonalRecord, string>>;

  /**
   * Get personal records for a user
   */
  getPersonalRecords(userId: string, exerciseId?: string): Promise<Result<PersonalRecord[], string>>;
}