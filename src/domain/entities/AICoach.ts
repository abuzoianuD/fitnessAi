// AI Coach entities for personalized fitness guidance

import { DifficultyLevel, MuscleGroup } from "./Exercise";
import { ProgramType } from "./Program";
import { ActivityLevel, DietaryRestriction } from "./Nutrition";

export type CoachingStyle =
  | "motivational"
  | "analytical"
  | "casual"
  | "professional"
  | "tough_love";

export type MessageType =
  | "workout_suggestion"
  | "nutrition_advice"
  | "motivation"
  | "correction"
  | "progress_celebration"
  | "goal_setting"
  | "education"
  | "reminder"
  | "recovery_guidance"
  | "form_feedback";

export type InteractionTrigger =
  | "workout_start"
  | "workout_complete"
  | "missed_workout"
  | "plateau"
  | "personal_record"
  | "goal_achieved"
  | "struggle_detected"
  | "weekly_checkin"
  | "user_question"
  | "schedule_change"
  | "injury_reported";

export interface AICoach {
  id: string;
  userId: string;
  name: string;
  personality: CoachPersonality;
  expertise: CoachExpertise;
  communicationStyle: CoachingStyle;
  knowledgeBase: string[]; // Topics the coach specializes in
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoachPersonality {
  enthusiasm: number; // 1-10
  patience: number; // 1-10
  directness: number; // 1-10
  empathy: number; // 1-10
  humor: number; // 1-10
  strictness: number; // 1-10
  supportiveness: number; // 1-10
  technicalDepth: number; // 1-10
}

export interface CoachExpertise {
  strength: number; // 1-10
  cardio: number; // 1-10
  flexibility: number; // 1-10
  nutrition: number; // 1-10
  recovery: number; // 1-10
  injury_prevention: number; // 1-10
  sport_specific: number; // 1-10
  beginners: number; // 1-10
}

export interface CoachingContext {
  userId: string;
  currentProgram?: string;
  recentWorkouts: WorkoutSummary[];
  recentNutrition: NutritionSummary[];
  userProgress: ProgressSummary;
  userProfile: UserFitnessProfile;
  currentGoals: FitnessGoal[];
  strugglingAreas: string[];
  strengths: string[];
  preferences: UserPreferences;
  lastInteraction?: Date;
  conversationHistory: CoachMessage[];
}

export interface WorkoutSummary {
  date: Date;
  name: string;
  duration: number;
  completionRate: number;
  averageRpe: number;
  personalRecords: number;
  struggledExercises: string[];
  notes?: string;
}

export interface NutritionSummary {
  date: Date;
  calorieAdherence: number;
  proteinTarget: number;
  proteinActual: number;
  hydrationGlasses: number;
  mealsMissed: number;
  cravingsLevel: number;
}

export interface ProgressSummary {
  strengthGains: { [exerciseId: string]: number };
  bodyComposition: BodyCompositionTrend;
  consistency: ConsistencyMetrics;
  milestones: RecentMilestone[];
  plateaus: PlateauArea[];
}

export interface BodyCompositionTrend {
  weight: { current: number; change: number; trend: "up" | "down" | "stable" };
  bodyFat?: {
    current: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  muscleMass?: {
    current: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
}

export interface ConsistencyMetrics {
  workoutAdherence: number; // 0-100
  nutritionAdherence: number; // 0-100
  sleepConsistency: number; // 0-100
  streak: { current: number; longest: number; type: string };
}

export interface RecentMilestone {
  type: "strength" | "endurance" | "body_composition" | "habit";
  description: string;
  achievedAt: Date;
  value: number;
  unit: string;
}

export interface PlateauArea {
  area: "strength" | "weight" | "endurance" | "motivation";
  duration: number; // weeks
  lastImprovement: Date;
  strategies: string[];
}

export interface UserFitnessProfile {
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  height: number;
  fitnessLevel: DifficultyLevel;
  activityLevel: ActivityLevel;
  injuries: Injury[];
  limitations: string[];
  preferences: UserPreferences;
}

export interface Injury {
  bodyPart: string;
  type: string;
  severity: "minor" | "moderate" | "severe";
  date: Date;
  isActive: boolean;
  restrictions: string[];
}

export interface UserPreferences {
  workoutTypes: string[];
  duration: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "flexible";
  musicGenre?: string[];
  coachingFrequency: "high" | "medium" | "low";
  motivationStyle: "positive" | "challenging" | "educational" | "minimal";
  privacyLevel: "high" | "medium" | "low";
  dietaryRestrictions: DietaryRestriction[];
}

export interface FitnessGoal {
  id: string;
  type:
    | "strength"
    | "weight_loss"
    | "muscle_gain"
    | "endurance"
    | "habit"
    | "performance";
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  priority: "high" | "medium" | "low";
  strategies: string[];
  isActive: boolean;
}

export interface CoachMessage {
  id: string;
  coachId: string;
  userId: string;
  type: MessageType;
  trigger: InteractionTrigger;
  content: MessageContent;
  context: string; // What prompted this message
  sentiment: "positive" | "neutral" | "constructive" | "celebratory";
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  userResponse?: UserResponse;
  effectiveness?: number; // 1-10, how helpful was this message
  timestamp: Date;
}

export interface MessageContent {
  text: string;
  title?: string;
  actionItems?: ActionItem[];
  tips?: string[];
  workoutSuggestion?: WorkoutSuggestion;
  nutritionAdvice?: NutritionAdvice;
  mediaUrls?: string[];
  quickReplies?: string[];
}

export interface ActionItem {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime: number; // minutes
  category: "workout" | "nutrition" | "recovery" | "education";
  dueDate?: Date;
  isCompleted: boolean;
}

export interface WorkoutSuggestion {
  templateId?: string;
  customWorkout?: CustomWorkout;
  reason: string;
  difficulty: DifficultyLevel;
  estimatedDuration: number;
  focus: MuscleGroup[];
  alternatives: string[];
}

export interface CustomWorkout {
  name: string;
  templateId?: string;
  exercises: CustomExercise[];
  warmup: string[];
  cooldown: string[];
}

export interface CustomExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest: number;
  notes?: string;
}

export interface NutritionAdvice {
  type:
    | "meal_suggestion"
    | "macro_adjustment"
    | "hydration"
    | "timing"
    | "supplement";
  advice: string;
  recipes?: string[]; // recipe IDs
  macroTargets?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  implementationTips: string[];
}

export interface UserResponse {
  type: "rating" | "text" | "action_taken" | "dismissed";
  rating?: number; // 1-5
  text?: string;
  actionsTaken?: string[];
  timestamp: Date;
}

export interface CoachingSession {
  id: string;
  userId: string;
  coachId: string;
  type: "checkin" | "goal_review" | "program_adjustment" | "problem_solving";
  startTime: Date;
  endTime?: Date;
  messages: CoachMessage[];
  outcomes: SessionOutcome[];
  userSatisfaction?: number; // 1-10
  nextSessionDate?: Date;
}

export interface SessionOutcome {
  type:
    | "goal_set"
    | "program_changed"
    | "habit_formed"
    | "issue_resolved"
    | "education_provided";
  description: string;
  impact: "high" | "medium" | "low";
  measurable?: boolean;
  followUpRequired?: boolean;
}

export interface CoachingInsight {
  userId: string;
  insight: string;
  category:
    | "progress"
    | "behavior"
    | "preference"
    | "challenge"
    | "opportunity";
  confidence: number; // 0-100
  evidence: string[];
  actionable: boolean;
  suggestedActions: string[];
  validUntil?: Date;
  createdAt: Date;
}

// AI Coach business logic
export class AICoachService {
  static generateMessage(
    context: CoachingContext,
    trigger: InteractionTrigger,
    coachPersonality: CoachPersonality
  ): CoachMessage {
    // This would integrate with AI service to generate personalized messages
    // For now, return a basic structure
    return {
      id: `msg_${Date.now()}`,
      coachId: "ai_coach_1",
      userId: context.userId,
      type: this.getMessageType(trigger),
      trigger,
      content: {
        text: this.generateMessageText(trigger, context, coachPersonality),
        quickReplies: this.getQuickReplies(trigger),
      },
      context: this.getContextDescription(trigger, context),
      sentiment: this.getSentiment(trigger),
      priority: this.getPriority(trigger),
      isRead: false,
      timestamp: new Date(),
    };
  }

  private static getMessageType(trigger: InteractionTrigger): MessageType {
    const triggerToType: Record<InteractionTrigger, MessageType> = {
      workout_start: "motivation",
      workout_complete: "progress_celebration",
      missed_workout: "motivation",
      plateau: "workout_suggestion",
      personal_record: "progress_celebration",
      goal_achieved: "progress_celebration",
      struggle_detected: "correction",
      weekly_checkin: "goal_setting",
      user_question: "education",
      schedule_change: "workout_suggestion",
      injury_reported: "recovery_guidance",
    };

    return triggerToType[trigger];
  }

  private static generateMessageText(
    trigger: InteractionTrigger,
    context: CoachingContext,
    personality: CoachPersonality
  ): string {
    // Simplified message generation - in reality this would be AI-powered
    const enthusiasmLevel = personality.enthusiasm;
    const messages: Record<InteractionTrigger, string> = {
      workout_start: enthusiasmLevel > 7
        ? "🔥 Let's crush this workout! You've got this!"
        : "Time to get moving! Let's start your workout.",
      workout_complete: enthusiasmLevel > 7
        ? "🔥 Incredible work today! You crushed that workout!"
        : "Nice job completing your workout today. Keep it up!",
      missed_workout: "No worries! Let's get back on track. When can you squeeze in a quick session?",
      plateau: "I've noticed your progress has slowed. Let's try a new approach.",
      personal_record: "🎉 New personal record! You're getting stronger every day!",
      goal_achieved: "🎉 Congratulations! You've achieved your goal! What's next?",
      struggle_detected: "I see you're having a tough time. Remember, progress isn't always linear. You've got this!",
      weekly_checkin: "How are you feeling about your progress this week? Let's check in!",
      user_question: "Great question! I'm here to help you succeed.",
      schedule_change: "Let's adjust your schedule to better fit your lifestyle.",
      injury_reported: "⚠️ Your safety comes first. Let's modify your plan while you recover.",
    };

    return messages[trigger] || "Keep up the great work!";
  }

  private static getQuickReplies(trigger: InteractionTrigger): string[] {
    const replies: Record<InteractionTrigger, string[]> = {
      workout_start: ["Let's do this!", "I'm ready", "Start"],
      workout_complete: ["How did it feel?", "Rate difficulty", "Schedule next"],
      missed_workout: ["Reschedule", "I'll try today", "Plan tomorrow"],
      plateau: ["I'm interested", "Not now", "Tell me more"],
      personal_record: ["Amazing!", "Thanks coach", "What's next?"],
      goal_achieved: ["So proud!", "Next goal?", "Celebrate"],
      struggle_detected: ["Help me", "I can do this", "Need tips"],
      weekly_checkin: ["I'm on track", "I'm struggling", "Need help"],
      user_question: ["Thanks!", "More info", "Got it"],
      schedule_change: ["Sounds good", "Prefer different time", "Flexible"],
      injury_reported: ["Need guidance", "See doctor", "Rest advice"],
    };

    return replies[trigger] || ["Thanks!", "Got it"];
  }

  private static getContextDescription(
    trigger: InteractionTrigger,
    context: CoachingContext
  ): string {
    return `Triggered by ${trigger} for user with ${context.recentWorkouts.length} recent workouts`;
  }

  private static getSentiment(
    trigger: InteractionTrigger
  ): "positive" | "neutral" | "constructive" | "celebratory" {
    const triggerSentiments: Record<InteractionTrigger, "positive" | "neutral" | "constructive" | "celebratory"> = {
      workout_start: "positive",
      workout_complete: "celebratory",
      missed_workout: "constructive",
      plateau: "constructive",
      personal_record: "celebratory",
      goal_achieved: "celebratory",
      struggle_detected: "constructive",
      weekly_checkin: "neutral",
      user_question: "positive",
      schedule_change: "neutral",
      injury_reported: "constructive",
    };

    return triggerSentiments[trigger] || "neutral";
  }

  private static getPriority(
    trigger: InteractionTrigger
  ): "low" | "medium" | "high" | "urgent" {
    const triggerPriorities: Record<InteractionTrigger, "low" | "medium" | "high" | "urgent"> = {
      workout_start: "medium",
      workout_complete: "low",
      missed_workout: "medium",
      plateau: "medium",
      personal_record: "high",
      goal_achieved: "high",
      struggle_detected: "medium",
      weekly_checkin: "low",
      user_question: "medium",
      schedule_change: "medium",
      injury_reported: "urgent",
    };

    return triggerPriorities[trigger] || "medium";
  }

  static calculateEngagement(messages: CoachMessage[]): number {
    if (messages.length === 0) return 0;

    const responses = messages.filter((m) => m.userResponse);
    const responseRate = responses.length / messages.length;
    const avgEffectiveness =
      responses.reduce((sum, msg) => sum + (msg.effectiveness || 5), 0) /
      responses.length;

    return Math.round(
      (responseRate * 0.6 + (avgEffectiveness / 10) * 0.4) * 100
    );
  }

  static shouldSendMessage(
    lastInteraction: Date,
    userPreferences: UserPreferences,
    trigger: InteractionTrigger
  ): boolean {
    const now = new Date();
    const hoursSinceLastMessage =
      (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

    const frequencySettings = {
      high: 4, // every 4 hours
      medium: 12, // every 12 hours
      low: 24, // daily
    };

    const minHours = frequencySettings[userPreferences.coachingFrequency];
    const urgentTriggers = [
      "injury_reported",
      "goal_achieved",
      "personal_record",
    ];

    return (
      hoursSinceLastMessage >= minHours || urgentTriggers.includes(trigger)
    );
  }
}
