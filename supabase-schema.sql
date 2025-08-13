-- =====================================================
-- FitAI App - Complete Supabase Database Schema
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    profile JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

-- User profiles table
CREATE TABLE public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    age INTEGER CHECK (age > 0 AND age < 150),
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    height DECIMAL(5,2) CHECK (height > 0), -- in cm
    weight DECIMAL(5,2) CHECK (weight > 0), -- in kg
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Fitness goals table
CREATE TABLE public.fitness_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('strength', 'weight_loss', 'muscle_gain', 'endurance', 'habit', 'performance')) NOT NULL,
    description TEXT NOT NULL,
    target DECIMAL(10,2),
    current DECIMAL(10,2) DEFAULT 0,
    unit TEXT,
    deadline TIMESTAMPTZ,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User preferences table
CREATE TABLE public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    workout_types TEXT[] DEFAULT '{}',
    duration INTEGER CHECK (duration > 0), -- in minutes
    time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'flexible')),
    gym_access BOOLEAN,
    available_equipment TEXT[] DEFAULT '{}',
    communication_style TEXT CHECK (communication_style IN ('motivational', 'analytical', 'casual', 'professional', 'tough_love')),
    coaching_frequency TEXT CHECK (coaching_frequency IN ('high', 'medium', 'low')) DEFAULT 'medium',
    motivation_style TEXT CHECK (motivation_style IN ('positive', 'challenging', 'educational', 'minimal')) DEFAULT 'positive',
    dietary_restrictions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- =====================================================
-- EXERCISES & WORKOUT TEMPLATES
-- =====================================================

-- Exercises master table
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT[] DEFAULT '{}',
    muscle_groups TEXT[] DEFAULT '{}',
    equipment TEXT[] DEFAULT '{}',
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    category TEXT NOT NULL,
    video_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    tips TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workout templates table
CREATE TABLE public.workout_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
    focus TEXT[] DEFAULT '{}', -- muscle groups or fitness aspects
    exercises JSONB NOT NULL DEFAULT '[]', -- structured exercise data
    warmup TEXT[] DEFAULT '{}',
    cooldown TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- WORKOUT SESSIONS & EXERCISE LOGS
-- =====================================================

-- Workout sessions table
CREATE TABLE public.workout_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.workout_templates(id),
    name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    duration INTEGER, -- actual duration in minutes
    status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')) DEFAULT 'planned',
    exercises_data JSONB DEFAULT '{}', -- snapshot of exercises with user modifications
    notes TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Exercise logs table (individual sets)
CREATE TABLE public.exercise_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
    set_number INTEGER NOT NULL CHECK (set_number > 0),
    reps INTEGER CHECK (reps >= 0),
    weight DECIMAL(6,2) CHECK (weight >= 0), -- in kg
    duration INTEGER CHECK (duration >= 0), -- in seconds for time-based exercises
    distance DECIMAL(8,2) CHECK (distance >= 0), -- in meters
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Personal records table
CREATE TABLE public.personal_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
    record_type TEXT CHECK (record_type IN ('1rm', 'max_reps', 'max_volume', 'max_duration', 'max_distance')) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL,
    session_id UUID REFERENCES public.workout_sessions(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, exercise_id, record_type)
);

-- =====================================================
-- AI COACH SYSTEM
-- =====================================================

-- AI coaches table
CREATE TABLE public.ai_coaches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    personality JSONB NOT NULL DEFAULT '{}', -- enthusiasm, patience, directness, etc.
    expertise JSONB NOT NULL DEFAULT '{}', -- strength, cardio, nutrition levels
    communication_style TEXT CHECK (communication_style IN ('motivational', 'analytical', 'casual', 'professional', 'tough_love')) DEFAULT 'motivational',
    knowledge_base TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Coach messages table
CREATE TABLE public.coach_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.ai_coaches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('workout_suggestion', 'nutrition_advice', 'motivation', 'correction', 'progress_celebration', 'goal_setting', 'education', 'reminder', 'recovery_guidance', 'form_feedback')) NOT NULL,
    trigger TEXT CHECK (trigger IN ('workout_start', 'workout_complete', 'missed_workout', 'plateau', 'personal_record', 'goal_achieved', 'struggle_detected', 'weekly_checkin', 'user_question', 'schedule_change', 'injury_reported')) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    context TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'constructive', 'celebratory')) DEFAULT 'positive',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    user_response JSONB,
    effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- NUTRITION TRACKING
-- =====================================================

-- Nutrition logs table
CREATE TABLE public.nutrition_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')) NOT NULL,
    food_items JSONB NOT NULL DEFAULT '[]',
    total_calories DECIMAL(8,2) CHECK (total_calories >= 0),
    total_protein DECIMAL(6,2) CHECK (total_protein >= 0),
    total_carbs DECIMAL(6,2) CHECK (total_carbs >= 0),
    total_fat DECIMAL(6,2) CHECK (total_fat >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- BODY MEASUREMENTS & PROGRESS
-- =====================================================

-- Body measurements table
CREATE TABLE public.body_measurements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    measured_at TIMESTAMPTZ NOT NULL,
    weight DECIMAL(5,2) CHECK (weight > 0),
    body_fat_percentage DECIMAL(4,1) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
    muscle_mass DECIMAL(5,2) CHECK (muscle_mass > 0),
    measurements JSONB DEFAULT '{}', -- chest, waist, hips, etc.
    photos TEXT[] DEFAULT '{}', -- photo URLs
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User-based queries
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_fitness_goals_user_id ON public.fitness_goals(user_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_exercise_logs_user_id ON public.exercise_logs(user_id);
CREATE INDEX idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX idx_ai_coaches_user_id ON public.ai_coaches(user_id);
CREATE INDEX idx_coach_messages_user_id ON public.coach_messages(user_id);
CREATE INDEX idx_nutrition_logs_user_id ON public.nutrition_logs(user_id);
CREATE INDEX idx_body_measurements_user_id ON public.body_measurements(user_id);

-- Date-based queries
CREATE INDEX idx_workout_sessions_started_at ON public.workout_sessions(started_at);
CREATE INDEX idx_exercise_logs_created_at ON public.exercise_logs(created_at);
CREATE INDEX idx_coach_messages_created_at ON public.coach_messages(created_at);
CREATE INDEX idx_nutrition_logs_logged_at ON public.nutrition_logs(logged_at);
CREATE INDEX idx_body_measurements_measured_at ON public.body_measurements(measured_at);

-- Session-based queries
CREATE INDEX idx_exercise_logs_session_id ON public.exercise_logs(session_id);

-- Exercise-based queries
CREATE INDEX idx_exercise_logs_exercise_id ON public.exercise_logs(exercise_id);
CREATE INDEX idx_personal_records_exercise_id ON public.personal_records(exercise_id);

-- Status and filtering
CREATE INDEX idx_workout_sessions_status ON public.workout_sessions(status);
CREATE INDEX idx_exercises_is_active ON public.exercises(is_active);
CREATE INDEX idx_fitness_goals_is_active ON public.fitness_goals(is_active);
CREATE INDEX idx_coach_messages_is_read ON public.coach_messages(is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);

-- Fitness goals policies
CREATE POLICY "Users can manage own goals" ON public.fitness_goals FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Exercises policies (public read, admin write)
CREATE POLICY "Everyone can view active exercises" ON public.exercises FOR SELECT USING (is_active = true);

-- Workout templates policies
CREATE POLICY "Users can view public templates and own templates" ON public.workout_templates FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can manage own templates" ON public.workout_templates FOR ALL USING (created_by = auth.uid());

-- Workout sessions policies
CREATE POLICY "Users can manage own sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);

-- Exercise logs policies
CREATE POLICY "Users can manage own exercise logs" ON public.exercise_logs FOR ALL USING (auth.uid() = user_id);

-- Personal records policies
CREATE POLICY "Users can manage own records" ON public.personal_records FOR ALL USING (auth.uid() = user_id);

-- AI coaches policies
CREATE POLICY "Users can manage own AI coach" ON public.ai_coaches FOR ALL USING (auth.uid() = user_id);

-- Coach messages policies
CREATE POLICY "Users can view own coach messages" ON public.coach_messages FOR ALL USING (auth.uid() = user_id);

-- Nutrition logs policies
CREATE POLICY "Users can manage own nutrition logs" ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);

-- Body measurements policies
CREATE POLICY "Users can manage own measurements" ON public.body_measurements FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_fitness_goals_updated_at BEFORE UPDATE ON public.fitness_goals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON public.workout_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_coaches_updated_at BEFORE UPDATE ON public.ai_coaches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_coach_messages_updated_at BEFORE UPDATE ON public.coach_messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_nutrition_logs_updated_at BEFORE UPDATE ON public.nutrition_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Create default AI coach for new user
  INSERT INTO public.ai_coaches (user_id, name, personality, expertise, communication_style)
  VALUES (
    NEW.id,
    'Alex - AI Coach',
    '{"enthusiasm": 8, "patience": 7, "directness": 6, "empathy": 8, "humor": 7, "strictness": 4, "supportiveness": 9, "technicalDepth": 6}',
    '{"strength": 8, "cardio": 7, "flexibility": 6, "nutrition": 7, "recovery": 6, "injury_prevention": 7, "sport_specific": 5, "beginners": 9}',
    'motivational'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Insert sample exercises
INSERT INTO public.exercises (name, description, instructions, muscle_groups, equipment, difficulty, category, tips) VALUES
('Bodyweight Squats', 'Basic lower body exercise', ARRAY['Stand with feet shoulder-width apart', 'Lower body as if sitting back into a chair', 'Keep chest up and knees tracking over toes', 'Return to standing position'], ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY[]::text[], 'beginner', 'strength', ARRAY['Focus on depth and control', 'Keep weight in your heels']),
('Push-ups', 'Upper body pushing exercise', ARRAY['Start in plank position', 'Lower chest to floor', 'Push back up to starting position'], ARRAY['chest', 'shoulders', 'triceps'], ARRAY[]::text[], 'beginner', 'strength', ARRAY['Modify on knees if needed', 'Keep body in straight line']),
('Plank', 'Core stability exercise', ARRAY['Start in push-up position', 'Hold position with straight body', 'Engage core muscles'], ARRAY['core', 'shoulders'], ARRAY[]::text[], 'beginner', 'strength', ARRAY['Hold steady, breathe normally', 'Keep hips level']),
('Glute Bridges', 'Lower body posterior chain exercise', ARRAY['Lie on back with knees bent', 'Lift hips up by squeezing glutes', 'Hold briefly at top', 'Lower back down'], ARRAY['glutes', 'hamstrings'], ARRAY[]::text[], 'beginner', 'strength', ARRAY['Squeeze at the top', 'Focus on glute activation']);

-- Insert sample workout template
INSERT INTO public.workout_templates (name, description, difficulty, duration, focus, exercises, warmup, cooldown, is_public) VALUES
('Foundation Builder', 'Perfect starter workout for building fundamental movement patterns', 'beginner', 25, ARRAY['quadriceps', 'chest', 'abs', 'glutes'], 
'[
  {"exerciseId": "1", "name": "Bodyweight Squats", "sets": 3, "reps": 12, "rest": 60, "notes": "Focus on depth and control"},
  {"exerciseId": "2", "name": "Push-ups", "sets": 3, "reps": 8, "rest": 60, "notes": "Knee push-ups are perfectly fine!"},
  {"exerciseId": "3", "name": "Plank", "sets": 3, "reps": 30, "rest": 60, "notes": "Hold steady, breathe normally"},
  {"exerciseId": "4", "name": "Glute Bridges", "sets": 3, "reps": 15, "rest": 60, "notes": "Squeeze at the top"}
]',
ARRAY['5 minutes light walking or marching in place', 'Arm circles and leg swings', 'Joint mobility movements'],
ARRAY['5 minutes gentle stretching', 'Deep breathing exercises', 'Hydrate and celebrate your effort!'],
true);

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;