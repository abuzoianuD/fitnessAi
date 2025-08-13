// Domain Entity: User (Updated for Supabase)

import { FitnessGoal } from './FitnessGoal';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  goals?: FitnessGoal[];
  preferences?: UserPreferences;
  isActive: boolean;
}

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserPreferences {
  workoutTypes: string[];
  duration?: number; // in minutes
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  gymAccess?: boolean;
  availableEquipment: string[];
  communicationStyle?: 'motivational' | 'analytical' | 'casual' | 'professional' | 'tough_love';
  coachingFrequency?: 'high' | 'medium' | 'low';
  motivationStyle?: 'positive' | 'challenging' | 'educational' | 'minimal';
  privacyLevel: 'high' | 'medium' | 'low';
  dietaryRestrictions: string[];
}

export interface Injury {
  bodyPart: string;
  type: string;
  severity: 'minor' | 'moderate' | 'severe';
  date: Date;
  isActive: boolean;
  restrictions: string[];
}

// User utility functions
export class UserUtils {
  static createUser(
    id: string,
    email: string,
    profile?: Partial<UserProfile>
  ): User {
    return {
      id,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: profile as UserProfile,
      isActive: true,
    };
  }

  static isProfileComplete(user: User): boolean {
    return !!(
      user.profile?.name &&
      user.profile?.age &&
      user.profile?.fitnessLevel &&
      user.goals?.length &&
      user.preferences?.workoutTypes.length
    );
  }

  static getDisplayName(user: User): string {
    return user.profile?.name || user.email.split('@')[0];
  }

  static canReceivePersonalizedWorkouts(user: User): boolean {
    return this.isProfileComplete(user) && !!user.preferences?.workoutTypes.length;
  }

  static updateProfile(user: User, profileUpdates: Partial<UserProfile>): User {
    return {
      ...user,
      profile: {
        ...user.profile,
        ...profileUpdates,
      } as UserProfile,
      updatedAt: new Date(),
    };
  }

  static updatePreferences(user: User, preferencesUpdates: Partial<UserPreferences>): User {
    return {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferencesUpdates,
      } as UserPreferences,
      updatedAt: new Date(),
    };
  }

  static addGoal(user: User, goal: FitnessGoal): User {
    return {
      ...user,
      goals: [...(user.goals || []), goal],
      updatedAt: new Date(),
    };
  }

  static updateGoal(user: User, goalId: string, goalUpdates: Partial<FitnessGoal>): User {
    return {
      ...user,
      goals: user.goals?.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...goalUpdates }
          : goal
      ),
      updatedAt: new Date(),
    };
  }

  static removeGoal(user: User, goalId: string): User {
    return {
      ...user,
      goals: user.goals?.filter(goal => goal.id !== goalId),
      updatedAt: new Date(),
    };
  }
}