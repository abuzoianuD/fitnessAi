// Fitness goals and target tracking

export type FitnessGoalType = 
  | 'strength'
  | 'weight_loss'
  | 'muscle_gain'
  | 'endurance'
  | 'habit'
  | 'performance';

export type GoalPriority = 'high' | 'medium' | 'low';

export interface FitnessGoal {
  id: string;
  type: FitnessGoalType;
  description: string;
  target?: number;
  current?: number;
  unit?: string;
  deadline?: Date;
  priority: GoalPriority;
  strategies: string[];
  isActive: boolean;
}

export interface GoalProgress {
  goalId: string;
  progressPercentage: number;
  trend: 'improving' | 'stable' | 'declining';
  recentChanges: GoalChange[];
  projectedCompletion?: Date;
}

export interface GoalChange {
  date: Date;
  previousValue: number;
  newValue: number;
  changeAmount: number;
  changePercentage: number;
  note?: string;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  description: string;
  targetValue: number;
  achievedAt?: Date;
  isCompleted: boolean;
}

// Goal utilities
export class FitnessGoalUtils {
  static calculateProgress(goal: FitnessGoal): number {
    if (!goal.target || !goal.current) return 0;
    
    return Math.min((goal.current / goal.target) * 100, 100);
  }

  static isGoalAchieved(goal: FitnessGoal): boolean {
    if (!goal.target || !goal.current) return false;
    
    return goal.current >= goal.target;
  }

  static getDaysUntilDeadline(goal: FitnessGoal): number | null {
    if (!goal.deadline) return null;
    
    const now = new Date();
    const diffTime = goal.deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getGoalUrgency(goal: FitnessGoal): 'high' | 'medium' | 'low' {
    const daysLeft = this.getDaysUntilDeadline(goal);
    
    if (daysLeft === null) return goal.priority;
    
    if (daysLeft <= 7) return 'high';
    if (daysLeft <= 30) return 'medium';
    return 'low';
  }

  static createDefaultGoals(): FitnessGoal[] {
    return [
      {
        id: 'default_strength',
        type: 'strength',
        description: 'Build functional strength',
        priority: 'high',
        strategies: ['Progressive overload', 'Compound movements', 'Consistent training'],
        isActive: false,
      },
      {
        id: 'default_weight_loss',
        type: 'weight_loss',
        description: 'Achieve healthy weight',
        unit: 'kg',
        priority: 'high',
        strategies: ['Calorie deficit', 'Regular cardio', 'Strength training'],
        isActive: false,
      },
      {
        id: 'default_habit',
        type: 'habit',
        description: 'Exercise regularly',
        target: 3,
        current: 0,
        unit: 'days per week',
        priority: 'medium',
        strategies: ['Schedule workouts', 'Start small', 'Track progress'],
        isActive: false,
      },
    ];
  }
}