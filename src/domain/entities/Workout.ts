/**
 * Domain entities for workout tracking and progress
 */

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutName: string;
  workoutTemplateId?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMinutes: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  notes?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  exercises: ExerciseLog[];
  createdAt: Date;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  targetSets: number;
  targetReps: number;
  actualReps: number[];
  weight?: number;
  restTime: number;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseName: string;
  exerciseId: string;
  recordType: 'weight' | 'reps' | 'time' | 'distance' | 'volume';
  value: number;
  unit: string;
  achievedAt: Date;
  notes?: string;
  createdAt: Date;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  focus: string[];
  exercises: WorkoutExercise[];
  warmup: string[];
  cooldown: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'strength' | 'cardio' | 'flexibility' | 'balance';
  tips: string[];
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
}