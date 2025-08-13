-- Confirm the debug@fitai.app user that was created earlier
-- Run this in Supabase Dashboard → SQL Editor

-- Update the debug user to confirm email
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'debug@fitai.app';

-- Add to public.users if not exists
INSERT INTO public.users (id, email, profile, created_at, updated_at)
SELECT 
  id, 
  email, 
  '{"onboarding_completed": true}',
  NOW(), 
  NOW()
FROM auth.users 
WHERE email = 'debug@fitai.app' 
  AND id NOT IN (SELECT id FROM public.users);

-- Verify the debug user
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  au.raw_user_meta_data,
  pu.email as user_email,
  pu.profile
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'debug@fitai.app';