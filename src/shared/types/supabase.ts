export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          profile: Json
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          profile?: Json
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          profile?: Json
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          age: number | null
          gender: 'male' | 'female' | 'other' | null
          height: number | null
          weight: number | null
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          fitness_level: 'beginner' | 'intermediate' | 'advanced' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | null
          created_at?: string
          updated_at?: string
        }
      }
      fitness_goals: {
        Row: {
          id: string
          user_id: string
          type: 'strength' | 'weight_loss' | 'muscle_gain' | 'endurance' | 'habit' | 'performance'
          description: string
          target: number | null
          current: number | null
          unit: string | null
          deadline: string | null
          priority: 'high' | 'medium' | 'low'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'strength' | 'weight_loss' | 'muscle_gain' | 'endurance' | 'habit' | 'performance'
          description: string
          target?: number | null
          current?: number | null
          unit?: string | null
          deadline?: string | null
          priority?: 'high' | 'medium' | 'low'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'strength' | 'weight_loss' | 'muscle_gain' | 'endurance' | 'habit' | 'performance'
          description?: string
          target?: number | null
          current?: number | null
          unit?: string | null
          deadline?: string | null
          priority?: 'high' | 'medium' | 'low'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          workout_types: string[]
          duration: number | null
          time_of_day: 'morning' | 'afternoon' | 'evening' | 'flexible' | null
          gym_access: boolean | null
          available_equipment: string[]
          communication_style: 'motivational' | 'analytical' | 'casual' | 'professional' | 'tough_love' | null
          coaching_frequency: 'high' | 'medium' | 'low' | null
          motivation_style: 'positive' | 'challenging' | 'educational' | 'minimal' | null
          dietary_restrictions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_types?: string[]
          duration?: number | null
          time_of_day?: 'morning' | 'afternoon' | 'evening' | 'flexible' | null
          gym_access?: boolean | null
          available_equipment?: string[]
          communication_style?: 'motivational' | 'analytical' | 'casual' | 'professional' | 'tough_love' | null
          coaching_frequency?: 'high' | 'medium' | 'low' | null
          motivation_style?: 'positive' | 'challenging' | 'educational' | 'minimal' | null
          dietary_restrictions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_types?: string[]
          duration?: number | null
          time_of_day?: 'morning' | 'afternoon' | 'evening' | 'flexible' | null
          gym_access?: boolean | null
          available_equipment?: string[]
          communication_style?: 'motivational' | 'analytical' | 'casual' | 'professional' | 'tough_love' | null
          coaching_frequency?: 'high' | 'medium' | 'low' | null
          motivation_style?: 'positive' | 'challenging' | 'educational' | 'minimal' | null
          dietary_restrictions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          instructions: string[]
          muscle_groups: string[]
          equipment: string[]
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          video_url: string | null
          image_urls: string[]
          tips: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          instructions?: string[]
          muscle_groups?: string[]
          equipment?: string[]
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category: string
          video_url?: string | null
          image_urls?: string[]
          tips?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          instructions?: string[]
          muscle_groups?: string[]
          equipment?: string[]
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          video_url?: string | null
          image_urls?: string[]
          tips?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration: number
          focus: string[]
          exercises: Json
          warmup: string[]
          cooldown: string[]
          is_public: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration: number
          focus?: string[]
          exercises: Json
          warmup?: string[]
          cooldown?: string[]
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: number
          focus?: string[]
          exercises?: Json
          warmup?: string[]
          cooldown?: string[]
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          name: string
          started_at: string
          completed_at: string | null
          duration: number | null
          status: 'planned' | 'in_progress' | 'completed' | 'skipped'
          exercises_data: Json
          notes: string | null
          satisfaction_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          name: string
          started_at?: string
          completed_at?: string | null
          duration?: number | null
          status?: 'planned' | 'in_progress' | 'completed' | 'skipped'
          exercises_data?: Json
          notes?: string | null
          satisfaction_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          name?: string
          started_at?: string
          completed_at?: string | null
          duration?: number | null
          status?: 'planned' | 'in_progress' | 'completed' | 'skipped'
          exercises_data?: Json
          notes?: string | null
          satisfaction_rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      exercise_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string
          exercise_id: string
          set_number: number
          reps: number | null
          weight: number | null
          duration: number | null
          distance: number | null
          rpe: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          exercise_id: string
          set_number: number
          reps?: number | null
          weight?: number | null
          duration?: number | null
          distance?: number | null
          rpe?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          exercise_id?: string
          set_number?: number
          reps?: number | null
          weight?: number | null
          duration?: number | null
          distance?: number | null
          rpe?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          record_type: '1rm' | 'max_reps' | 'max_volume' | 'max_duration' | 'max_distance'
          value: number
          unit: string
          achieved_at: string
          session_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          record_type: '1rm' | 'max_reps' | 'max_volume' | 'max_duration' | 'max_distance'
          value: number
          unit: string
          achieved_at: string
          session_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          record_type?: '1rm' | 'max_reps' | 'max_volume' | 'max_duration' | 'max_distance'
          value?: number
          unit?: string
          achieved_at?: string
          session_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      ai_coaches: {
        Row: {
          id: string
          user_id: string
          name: string
          personality: Json
          expertise: Json
          communication_style: 'motivational' | 'analytical' | 'casual' | 'professional' | 'tough_love'
          knowledge_base: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          personality: Json
          expertise: Json
          communication_style: 'motivational' | 'analytical' | 'casual' | 'professional' | 'tough_love'
          knowledge_base?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          personality?: Json
          expertise?: Json
          communication_style?: 'motivational' | 'analytical' | 'casual' | 'professional' | 'tough_love'
          knowledge_base?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coach_messages: {
        Row: {
          id: string
          coach_id: string
          user_id: string
          type: 'workout_suggestion' | 'nutrition_advice' | 'motivation' | 'correction' | 'progress_celebration' | 'goal_setting' | 'education' | 'reminder' | 'recovery_guidance' | 'form_feedback'
          trigger: 'workout_start' | 'workout_complete' | 'missed_workout' | 'plateau' | 'personal_record' | 'goal_achieved' | 'struggle_detected' | 'weekly_checkin' | 'user_question' | 'schedule_change' | 'injury_reported'
          content: Json
          context: string
          sentiment: 'positive' | 'neutral' | 'constructive' | 'celebratory'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          is_read: boolean
          user_response: Json | null
          effectiveness: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          user_id: string
          type: 'workout_suggestion' | 'nutrition_advice' | 'motivation' | 'correction' | 'progress_celebration' | 'goal_setting' | 'education' | 'reminder' | 'recovery_guidance' | 'form_feedback'
          trigger: 'workout_start' | 'workout_complete' | 'missed_workout' | 'plateau' | 'personal_record' | 'goal_achieved' | 'struggle_detected' | 'weekly_checkin' | 'user_question' | 'schedule_change' | 'injury_reported'
          content: Json
          context: string
          sentiment?: 'positive' | 'neutral' | 'constructive' | 'celebratory'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_read?: boolean
          user_response?: Json | null
          effectiveness?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          user_id?: string
          type?: 'workout_suggestion' | 'nutrition_advice' | 'motivation' | 'correction' | 'progress_celebration' | 'goal_setting' | 'education' | 'reminder' | 'recovery_guidance' | 'form_feedback'
          trigger?: 'workout_start' | 'workout_complete' | 'missed_workout' | 'plateau' | 'personal_record' | 'goal_achieved' | 'struggle_detected' | 'weekly_checkin' | 'user_question' | 'schedule_change' | 'injury_reported'
          content?: Json
          context?: string
          sentiment?: 'positive' | 'neutral' | 'constructive' | 'celebratory'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_read?: boolean
          user_response?: Json | null
          effectiveness?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      nutrition_logs: {
        Row: {
          id: string
          user_id: string
          logged_at: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
          food_items: Json
          total_calories: number | null
          total_protein: number | null
          total_carbs: number | null
          total_fat: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          logged_at: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
          food_items: Json
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          logged_at?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
          food_items?: Json
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      body_measurements: {
        Row: {
          id: string
          user_id: string
          measured_at: string
          weight: number | null
          body_fat_percentage: number | null
          muscle_mass: number | null
          measurements: Json
          photos: string[]
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          measured_at: string
          weight?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          measurements?: Json
          photos?: string[]
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          measured_at?: string
          weight?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          measurements?: Json
          photos?: string[]
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}