import { WorkoutSession } from '@/src/domain/entities/Workout';
import { WorkoutRepository } from '@/src/domain/repositories/WorkoutRepository';
import { Result } from '@/src/shared/types/Result';

export class GetWorkoutHistoryUseCase {
  constructor(private workoutRepository: WorkoutRepository) {}

  async execute(userId: string, limit?: number): Promise<Result<WorkoutSession[], string>> {
    try {
      const result = await this.workoutRepository.getWorkoutHistory(userId, limit);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Sort by completion date (most recent first)
      const sortedWorkouts = result.data.sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return b.completedAt.getTime() - a.completedAt.getTime();
      });

      return { success: true, data: sortedWorkouts };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workout history'
      };
    }
  }
}