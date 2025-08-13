import { WorkoutRepository } from '@/src/domain/repositories/WorkoutRepository';
import { WorkoutSession, ExerciseLog } from '@/src/domain/entities/Workout';
import { Result } from '@/src/shared/types/Result';
import { CustomWorkout, CustomExercise } from '@/src/domain/entities/AICoach';

export interface SaveWorkoutInput {
  workout: CustomWorkout;
  startedAt: Date;
  completedAt: Date;
  durationMinutes: number;
  exerciseProgress: Array<{
    exerciseId: string;
    completedSets: number;
    isCompleted: boolean;
  }>;
  notes?: string;
}

export class SaveWorkoutUseCase {
  constructor(private workoutRepository: WorkoutRepository) {}

  async execute(input: SaveWorkoutInput): Promise<Result<WorkoutSession, string>> {
    try {
      // Calculate workout metrics
      const totalSets = input.exerciseProgress.reduce((sum, progress) => sum + progress.completedSets, 0);
      
      // Calculate total reps based on completed sets
      const totalReps = input.workout.exercises.reduce((sum, exercise) => {
        const progress = input.exerciseProgress.find(p => p.exerciseId === exercise.exerciseId);
        if (progress) {
          return sum + (progress.completedSets * exercise.reps);
        }
        return sum;
      }, 0);

      // Calculate total volume (sets × reps × weight, defaulting weight to 0 for bodyweight)
      const totalVolume = totalReps; // For bodyweight exercises, volume = total reps

      // Create exercise logs
      const exercises: ExerciseLog[] = input.workout.exercises.map(exercise => {
        const progress = input.exerciseProgress.find(p => p.exerciseId === exercise.exerciseId);
        const completedSets = progress?.completedSets || 0;
        
        // Create array of actual reps for each completed set
        const actualReps = Array(completedSets).fill(exercise.reps);

        return {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          setsCompleted: completedSets,
          targetSets: exercise.sets,
          targetReps: exercise.reps,
          actualReps,
          restTime: exercise.rest,
          notes: exercise.notes,
        };
      });

      // Create workout session
      const workoutSession: Omit<WorkoutSession, 'id' | 'createdAt'> = {
        userId: '', // Will be set by the repository from auth
        workoutName: input.workout.name,
        workoutTemplateId: input.workout.templateId,
        startedAt: input.startedAt,
        completedAt: input.completedAt,
        durationMinutes: input.durationMinutes,
        totalSets,
        totalReps,
        totalVolume,
        notes: input.notes,
        status: 'completed',
        exercises,
      };

      return await this.workoutRepository.saveWorkoutSession(workoutSession);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save workout',
      };
    }
  }
}