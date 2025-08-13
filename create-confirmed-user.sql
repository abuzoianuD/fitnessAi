-- Create a test user that's already email-confirmed
-- Run this in Supabase Dashboard → SQL Editor

-- First, clean up any existing test user
DELETE FROM public.fitness_goals WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@fitai.app');
DELETE FROM public.user_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@fitai.app');
DELETE FROM public.users WHERE email = 'test@fitai.app';
DELETE FROM auth.users WHERE email = 'test@fitai.app';

-- Now create the user in auth.users with confirmed email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@fitai.app',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Test", "last_name": "User", "full_name": "Test User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Then create the corresponding user in public.users table
INSERT INTO public.users (
  id,
  email,
  profile,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@fitai.app'),
  'test@fitai.app',
  '{"onboarding_completed": true}',
  NOW(),
  NOW()
);

-- Create user profile
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
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@fitai.app'),
  'Test User',
  30,
  'other',
  175.0,
  70.0,
  'moderately_active',
  'intermediate',
  NOW(),
  NOW()
);

-- Create a fitness goal for the user
INSERT INTO public.fitness_goals (
  user_id,
  type,
  description,
  priority,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@fitai.app'),
  'muscle_gain',
  'Build lean muscle mass',
  'high',
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.raw_user_meta_data,
  pu.email as user_email,
  up.name,
  up.age,
  up.gender,
  fg.type as goal_type
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
LEFT JOIN public.user_profiles up ON au.id = up.user_id
LEFT JOIN public.fitness_goals fg ON au.id = fg.user_id
WHERE au.email = 'test@fitai.app';