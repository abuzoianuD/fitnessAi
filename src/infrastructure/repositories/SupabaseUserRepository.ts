import { supabase } from '@/src/shared/utils/supabase';
import { UserRepository } from '@/src/domain/repositories/UserRepository';
import { User, UserProfile, UserPreferences } from '@/src/domain/entities/User';
import { FitnessGoal } from '@/src/domain/entities/FitnessGoal';
import { Result } from '@/src/shared/types/Result';

export class SupabaseUserRepository implements UserRepository {
  // Create or update user
  async saveUser(user: User): Promise<Result<User, string>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          profile: user.profile || {},
          is_active: user.isActive,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: `Failed to save user: ${error.message}` };
      }

      // Save user profile if it exists
      if (user.profile) {
        const profileResult = await this.saveUserProfile(user.id, user.profile);
        if (!profileResult.success) {
          return profileResult as any;
        }
      }

      return { success: true, data: this.mapToUser(data) };
    } catch (err: any) {
      return { success: false, error: `Failed to save user: ${err.message}` };
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<Result<User | null, string>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles(*),
          fitness_goals(*),
          user_preferences(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null }; // User not found
        }
        return { success: false, error: `Failed to get user: ${error.message}` };
      }

      return { success: true, data: this.mapToUserWithRelations(data) };
    } catch (err: any) {
      return { success: false, error: `Failed to get user: ${err.message}` };
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<Result<User | null, string>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles(*),
          fitness_goals(*),
          user_preferences(*)
        `)
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null }; // User not found
        }
        return { success: false, error: `Failed to get user: ${error.message}` };
      }

      return { success: true, data: this.mapToUserWithRelations(data) };
    } catch (err: any) {
      return { success: false, error: `Failed to get user: ${err.message}` };
    }
  }

  // Save user profile
  async saveUserProfile(userId: string, profile: UserProfile): Promise<Result<UserProfile, string>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          activity_level: profile.activityLevel,
          fitness_level: profile.fitnessLevel,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: `Failed to save profile: ${error.message}` };
      }

      return { success: true, data: this.mapToUserProfile(data) };
    } catch (err: any) {
      return { success: false, error: `Failed to save profile: ${err.message}` };
    }
  }

  // Save fitness goals
  async saveFitnessGoals(userId: string, goals: FitnessGoal[]): Promise<Result<FitnessGoal[], string>> {
    try {
      // First, deactivate existing goals
      await supabase
        .from('fitness_goals')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Then insert new goals
      const goalsToInsert = goals.map(goal => ({
        user_id: userId,
        type: goal.type,
        description: goal.description,
        target: goal.target,
        current: goal.current,
        unit: goal.unit,
        deadline: goal.deadline?.toISOString(),
        priority: goal.priority,
        is_active: goal.isActive,
      }));

      const { data, error } = await supabase
        .from('fitness_goals')
        .insert(goalsToInsert)
        .select();

      if (error) {
        return { success: false, error: `Failed to save goals: ${error.message}` };
      }

      const savedGoals = data.map(this.mapToFitnessGoal);
      return { success: true, data: savedGoals };
    } catch (err: any) {
      return { success: false, error: `Failed to save goals: ${err.message}` };
    }
  }

  // Save user preferences
  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<Result<UserPreferences, string>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          workout_types: preferences.workoutTypes,
          duration: preferences.duration,
          time_of_day: preferences.timeOfDay,
          gym_access: preferences.gymAccess,
          available_equipment: preferences.availableEquipment,
          communication_style: preferences.communicationStyle,
          coaching_frequency: preferences.coachingFrequency,
          motivation_style: preferences.motivationStyle,
          dietary_restrictions: preferences.dietaryRestrictions,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: `Failed to save preferences: ${error.message}` };
      }

      return { success: true, data: this.mapToUserPreferences(data) };
    } catch (err: any) {
      return { success: false, error: `Failed to save preferences: ${err.message}` };
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<Result<void, string>> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        return { success: false, error: `Failed to delete user: ${error.message}` };
      }

      return { success: true, data: undefined };
    } catch (err: any) {
      return { success: false, error: `Failed to delete user: ${err.message}` };
    }
  }

  // Helper methods to map database records to domain entities
  private mapToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      profile: data.profile || undefined,
      isActive: data.is_active,
    };
  }

  private mapToUserWithRelations(data: any): User {
    const user = this.mapToUser(data);
    
    if (data.user_profiles && data.user_profiles.length > 0) {
      user.profile = this.mapToUserProfile(data.user_profiles[0]);
    }

    if (data.fitness_goals) {
      user.goals = data.fitness_goals
        .filter((goal: any) => goal.is_active)
        .map(this.mapToFitnessGoal);
    }

    if (data.user_preferences && data.user_preferences.length > 0) {
      user.preferences = this.mapToUserPreferences(data.user_preferences[0]);
    }

    return user;
  }

  private mapToUserProfile(data: any): UserProfile {
    return {
      name: data.name,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      activityLevel: data.activity_level,
      fitnessLevel: data.fitness_level,
    };
  }

  private mapToFitnessGoal(data: any): FitnessGoal {
    return {
      id: data.id,
      type: data.type,
      description: data.description,
      target: data.target,
      current: data.current,
      unit: data.unit,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      priority: data.priority,
      strategies: [], // Will be enhanced later
      isActive: data.is_active,
    };
  }

  private mapToUserPreferences(data: any): UserPreferences {
    return {
      workoutTypes: data.workout_types || [],
      duration: data.duration,
      timeOfDay: data.time_of_day,
      gymAccess: data.gym_access,
      availableEquipment: data.available_equipment || [],
      communicationStyle: data.communication_style,
      coachingFrequency: data.coaching_frequency,
      motivationStyle: data.motivation_style,
      privacyLevel: 'medium', // Default value
      dietaryRestrictions: data.dietary_restrictions || [],
    };
  }
}