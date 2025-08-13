// Workout Program and Routine entities for structured fitness plans

import { DifficultyLevel, MuscleGroup, EquipmentType } from './Exercise';

export type ProgramType = 
  | 'strength_building' | 'muscle_building' | 'fat_loss' | 'endurance'
  | 'powerlifting' | 'bodybuilding' | 'crossfit' | 'general_fitness'
  | 'rehabilitation' | 'sport_specific';

export type ProgramDuration = 
  | '4_weeks' | '6_weeks' | '8_weeks' | '12_weeks' | '16_weeks' | 'ongoing';

export interface FitnessProgram {
  id: string;
  name: string;
  description: string;
  type: ProgramType;
  difficulty: DifficultyLevel;
  duration: ProgramDuration;
  daysPerWeek: number;
  targetMuscleGroups: MuscleGroup[];
  requiredEquipment: EquipmentType[];
  goals: string[];
  phases: ProgramPhase[];
  guidelines: ProgramGuidelines;
  createdBy: 'ai' | 'trainer' | 'system';
  rating?: number;
  completionRate?: number; // percentage of users who complete it
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramPhase {
  id: string;
  name: string;
  description: string;
  weekStart: number;
  weekEnd: number;
  focus: string; // e.g., "Base Building", "Intensification", "Peak"
  intensity: number; // 1-10 scale
  volume: number; // 1-10 scale
  weeks: ProgramWeek[];
}

export interface ProgramWeek {
  weekNumber: number;
  description?: string;
  workouts: ProgramWorkout[];
  deloadWeek?: boolean;
  testWeek?: boolean;
  notes?: string[];
}

export interface ProgramWorkout {
  dayOfWeek: number; // 1-7 (Monday = 1)
  workoutTemplateId: string;
  name: string;
  focus: string; // e.g., "Upper Body Push", "Lower Body"
  estimatedDuration: number;
  intensity: number; // 1-10
  optional?: boolean;
  alternatives?: string[]; // alternative workout template IDs
}

export interface ProgramGuidelines {
  warmupDuration: number; // minutes
  cooldownDuration: number; // minutes
  progressionStrategy: ProgressionStrategy;
  restDayGuidelines: string[];
  nutritionTips?: string[];
  recoveryTips?: string[];
  supplementGuidelines?: string[];
}

export interface ProgressionStrategy {
  type: 'linear' | 'periodized' | 'autoregulated' | 'wave';
  weightIncrease: {
    percentage?: number;
    absoluteKg?: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  volumeProgression: {
    setsIncrease?: number;
    repsIncrease?: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  deloadFrequency: number; // every X weeks
  testingFrequency?: number; // every X weeks for 1RM tests
}

export interface UserProgram {
  id: string;
  userId: string;
  programId: string;
  startDate: Date;
  currentWeek: number;
  currentPhase: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  customizations?: ProgramCustomization[];
  progress: UserProgramProgress;
  completedWorkouts: string[]; // workout IDs
  skippedWorkouts: SkippedWorkout[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramCustomization {
  type: 'exercise_substitution' | 'weight_adjustment' | 'rep_adjustment' | 'rest_adjustment';
  workoutTemplateId: string;
  exerciseId?: string;
  originalValue: any;
  customValue: any;
  reason: string;
  appliedAt: Date;
}

export interface UserProgramProgress {
  weeklyStats: WeeklyProgramStats[];
  overallProgress: {
    adherenceRate: number; // percentage of workouts completed
    strengthGains: StrengthGain[];
    bodyComposition?: BodyCompositionChange[];
    measurements?: MeasurementChange[];
  };
  milestones: ProgramMilestone[];
}

export interface WeeklyProgramStats {
  weekNumber: number;
  workoutsPlanned: number;
  workoutsCompleted: number;
  totalVolume: number;
  averageIntensity: number;
  averageRpe: number;
  bodyWeight?: number;
  notes?: string;
  weekStartDate: Date;
}

export interface StrengthGain {
  exerciseId: string;
  exerciseName: string;
  startWeight: number;
  currentWeight: number;
  gainPercentage: number;
  gainKg: number;
  measuredAt: Date;
}

export interface BodyCompositionChange {
  metric: 'body_fat_percentage' | 'muscle_mass' | 'total_weight';
  startValue: number;
  currentValue: number;
  change: number;
  changePercentage: number;
  measuredAt: Date;
}

export interface MeasurementChange {
  bodyPart: 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs' | 'neck';
  startValue: number; // in cm
  currentValue: number;
  change: number;
  measuredAt: Date;
}

export interface ProgramMilestone {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'endurance' | 'body_composition' | 'habit' | 'completion';
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
  completedAt?: Date;
  reward?: string;
}

export interface SkippedWorkout {
  workoutId: string;
  scheduledDate: Date;
  reason: 'sick' | 'injured' | 'busy' | 'tired' | 'unmotivated' | 'travel' | 'other';
  notes?: string;
  makeupScheduled?: Date;
  skippedAt: Date;
}

// Recovery and wellness tracking
export interface RecoveryMetrics {
  userId: string;
  date: Date;
  sleepQuality: number; // 1-10
  sleepHours: number;
  stressLevel: number; // 1-10
  soreness: number; // 1-10
  energy: number; // 1-10
  motivation: number; // 1-10
  heartRateVariability?: number;
  restingHeartRate?: number;
  readinessScore?: number; // calculated composite score
  notes?: string;
}

// Business logic for program management
export class ProgramService {
  static calculateAdherenceRate(planned: number, completed: number): number {
    return planned > 0 ? Math.round((completed / planned) * 100) : 0;
  }

  static isDeloadWeekNeeded(
    consecutiveWeeks: number, 
    averageRpe: number, 
    recoveryScore: number
  ): boolean {
    return consecutiveWeeks >= 4 || averageRpe >= 8.5 || recoveryScore <= 5;
  }

  static calculateProgramIntensity(
    currentWeek: number, 
    totalWeeks: number, 
    phaseType: string
  ): number {
    // Simplified intensity calculation based on program phase
    const progressRatio = currentWeek / totalWeeks;
    
    switch (phaseType) {
      case 'base_building':
        return Math.min(5 + (progressRatio * 2), 7);
      case 'intensification':
        return Math.min(6 + (progressRatio * 3), 9);
      case 'peak':
        return Math.min(8 + (progressRatio * 2), 10);
      default:
        return Math.min(4 + (progressRatio * 4), 8);
    }
  }

  static shouldProgressWeight(
    currentRpe: number, 
    targetRpe: number, 
    consecutiveSuccessfulSessions: number
  ): boolean {
    return currentRpe <= targetRpe && consecutiveSuccessfulSessions >= 2;
  }

  static calculateReadinessScore(metrics: RecoveryMetrics): number {
    const weights = {
      sleepQuality: 0.25,
      stressLevel: -0.20, // negative because higher stress = lower readiness
      soreness: -0.15,    // negative because more soreness = lower readiness
      energy: 0.20,
      motivation: 0.15,
      sleepHours: 0.15
    };

    const normalizedSleepHours = Math.min(metrics.sleepHours / 8, 1) * 10;
    
    const score = 
      (metrics.sleepQuality * weights.sleepQuality) +
      (metrics.stressLevel * weights.stressLevel) +
      (metrics.soreness * weights.soreness) +
      (metrics.energy * weights.energy) +
      (metrics.motivation * weights.motivation) +
      (normalizedSleepHours * weights.sleepHours);

    return Math.max(0, Math.min(10, Math.round(score)));
  }
}