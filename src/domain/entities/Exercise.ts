// Exercise domain entities following fitness industry standards

export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques' | 'lower_back' | 'glutes' | 'quadriceps' 
  | 'hamstrings' | 'calves' | 'adductors' | 'abductors' | 'traps' | 'lats';

export type ExerciseType = 
  | 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric' | 'isometric';

export type ExerciseCategory = 
  | 'compound' | 'isolation' | 'bodyweight' | 'machine' | 'free_weight' | 'cable';

export type EquipmentType = 
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'resistance_band' | 'cable_machine'
  | 'pull_up_bar' | 'bench' | 'yoga_mat' | 'cardio_machine' | 'bodyweight' | 'none';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  type: ExerciseType;
  category: ExerciseCategory;
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
    demonstrations?: string[];
  };
  alternatives?: string[]; // Alternative exercise IDs
  progressions?: string[]; // Progression exercise IDs
  regressions?: string[]; // Regression exercise IDs
  tips: string[];
  commonMistakes: string[];
  safetyNotes: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  targetReps?: number;
  actualReps?: number;
  targetWeight?: number; // in kg
  actualWeight?: number; // in kg
  targetDuration?: number; // in seconds for time-based exercises
  actualDuration?: number; // in seconds
  targetDistance?: number; // in meters for cardio
  actualDistance?: number; // in meters
  restTime?: number; // in seconds
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
  completedAt?: Date;
  isCompleted: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'mixed' | 'flexibility' | 'sport_specific';
  targetMuscleGroups: MuscleGroup[];
  difficulty: DifficultyLevel;
  estimatedDuration: number; // in minutes
  equipment: EquipmentType[];
  exercises: WorkoutExercise[];
  restBetweenExercises?: number; // in seconds
  tags: string[];
  createdBy: 'ai' | 'user' | 'trainer';
  isPublic: boolean;
  rating?: number; // 1-5 stars
  timesUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  exerciseId: string;
  order: number;
  sets: number;
  reps?: number;
  weight?: number; // in kg
  duration?: number; // in seconds for time-based
  distance?: number; // in meters for cardio
  restBetweenSets: number; // in seconds
  notes?: string;
  superset?: {
    groupId: string;
    order: number;
  };
}

export interface Workout {
  id: string;
  userId: string;
  templateId?: string; // Reference to template if created from one
  name: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // actual duration in seconds
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  exercises: WorkoutExercise[];
  actualSets: ExerciseSet[];
  notes?: string;
  overallRating?: number; // 1-5 how the workout felt
  bodyWeight?: number; // user's weight on workout day
  location?: string;
  weather?: string; // for outdoor workouts
  mood?: 'energetic' | 'tired' | 'motivated' | 'stressed' | 'normal';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseProgress {
  userId: string;
  exerciseId: string;
  bestWeight?: number;
  bestReps?: number;
  bestDuration?: number;
  bestDistance?: number;
  totalVolume: number; // weight * reps * sets accumulated
  totalSets: number;
  totalReps: number;
  averageRpe?: number;
  lastPerformed?: Date;
  personalRecords: PersonalRecord[];
  progressHistory: ProgressEntry[];
  updatedAt: Date;
}

export interface PersonalRecord {
  id: string;
  type: 'max_weight' | 'max_reps' | 'max_duration' | 'max_distance' | 'max_volume';
  value: number;
  unit: 'kg' | 'reps' | 'seconds' | 'meters' | 'kg*reps';
  workoutId: string;
  achievedAt: Date;
  notes?: string;
}

export interface ProgressEntry {
  date: Date;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  volume?: number;
  rpe?: number;
  workoutId: string;
}

// Utility types for workout creation and tracking
export interface WorkoutSession {
  workoutId: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  startTime: Date;
  isActive: boolean;
  completedSets: ExerciseSet[];
  skipCount: number;
  pausedTime: number; // total paused time in seconds
}

export interface ExerciseStats {
  exerciseId: string;
  timesPerformed: number;
  averageWeight?: number;
  averageReps?: number;
  averageDuration?: number;
  lastWeight?: number;
  lastReps?: number;
  trend: 'improving' | 'stable' | 'declining';
  strengthScore: number; // calculated metric 0-100
}

// Domain business logic methods
export class ExerciseService {
  static calculateVolume(weight: number, reps: number, sets: number): number {
    return weight * reps * sets;
  }

  static calculateOneRepMax(weight: number, reps: number): number {
    if (reps === 1) return weight;
    // Epley formula: 1RM = weight * (1 + reps/30)
    return Math.round(weight * (1 + reps / 30));
  }

  static getIntensityZone(reps: number): string {
    if (reps >= 15) return 'endurance';
    if (reps >= 8) return 'hypertrophy';
    if (reps >= 3) return 'strength';
    return 'power';
  }

  static calculateRestTime(intensity: number, exerciseType: ExerciseType): number {
    // Default rest times in seconds based on intensity and type
    if (exerciseType === 'cardio') return 30;
    
    if (intensity >= 90) return 180; // High intensity: 3 minutes
    if (intensity >= 70) return 120; // Moderate intensity: 2 minutes
    return 60; // Low intensity: 1 minute
  }

  static isProgressionReady(stats: ExerciseStats): boolean {
    // Simple progression logic - can be enhanced with more sophisticated rules
    return stats.trend === 'improving' && stats.strengthScore > 75;
  }
}