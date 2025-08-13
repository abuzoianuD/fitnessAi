-- Confirm existing test user's email
-- This is safer than deleting and recreating
-- Run this in Supabase Dashboard → SQL Editor

-- Update existing user to confirm email
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  raw_user_meta_data = '{"first_name": "Test", "last_name": "User", "full_name": "Test User"}'
WHERE email = 'test@fitai.app';

-- Make sure user exists in public.users table (if not already there)
INSERT INTO public.users (id, email, profile, created_at, updated_at)
SELECT 
  id, 
  email, 
  '{"onboarding_completed": true}',
  NOW(), 
  NOW()
FROM auth.users 
WHERE email = 'test@fitai.app' 
  AND id NOT IN (SELECT id FROM public.users);

-- Make sure user profile exists (if not already there)
INSERT INTO public.user_profiles (
  user_id,
  name,
  age,
  gender,
  height,
  weight,
  activity_level,
  fitness_level,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'Test User',
  30,
  'other',
  175.0,
  70.0,
  'moderately_active',
  'intermediate',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'test@fitai.app'
  AND au.id NOT IN (SELECT user_id FROM public.user_profiles);

-- Make sure fitness goal exists (if not already there)
INSERT INTO public.fitness_goals (
  user_id,
  type,
  description,
  priority,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'muscle_gain',
  'Build lean muscle mass',
  'high',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'test@fitai.app'
  AND au.id NOT IN (SELECT user_id FROM public.fitness_goals WHERE type = 'muscle_gain');

-- Verify the user is properly set up
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  au.raw_user_meta_data,
  pu.email as user_email,
  pu.profile,
  up.name,
  up.age,
  up.gender,
  fg.type as goal_type
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
LEFT JOIN public.user_profiles up ON au.id = up.user_id
LEFT JOIN public.fitness_goals fg ON au.id = fg.user_id
WHERE au.email = 'test@fitai.app';