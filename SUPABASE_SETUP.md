# 🗄️ Supabase Database Setup Guide

## Overview
This guide walks you through setting up the complete Supabase database for the FitAI fitness app.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `fitai-app`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Environment Configuration

1. Copy your project details from Supabase dashboard:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: Your public anon key

2. Update `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Database Schema Setup

1. Go to your Supabase dashboard
2. Navigate to "SQL Editor"
3. Copy the entire content from `supabase-schema.sql`
4. Paste and run the SQL script

This will create:
- **11 main tables** with complete schema
- **Row Level Security (RLS)** policies
- **Indexes** for performance
- **Triggers** for auto-updating timestamps
- **Sample data** for development

## 4. Database Tables Created

### Core Tables
- **users** - Main user accounts (extends auth.users)
- **user_profiles** - User personal information
- **fitness_goals** - User fitness objectives
- **user_preferences** - Workout and coaching preferences

### Exercise & Workout Tables
- **exercises** - Master exercise library
- **workout_templates** - Reusable workout plans
- **workout_sessions** - Individual workout instances
- **exercise_logs** - Individual set/rep tracking
- **personal_records** - PR tracking

### AI Coach Tables
- **ai_coaches** - AI coach personalities per user
- **coach_messages** - AI chat conversation history

### Progress Tracking Tables
- **nutrition_logs** - Food and macro tracking
- **body_measurements** - Weight, body fat, photos

## 5. Key Features

### 🔐 Security
- **Row Level Security** enabled on all tables
- **User isolation** - users can only access their own data
- **Public exercise library** with admin controls
- **Secure authentication** with Supabase Auth

### 📊 Performance
- **Strategic indexes** on all major query patterns
- **Optimized for mobile** with efficient queries
- **JSONB fields** for flexible structured data
- **Proper foreign key relationships**

### 🤖 AI Integration Ready
- **Coach personality storage** as JSONB
- **Message type categorization** for different AI responses
- **Context tracking** for personalized AI coaching
- **Effectiveness tracking** for AI improvement

### 📱 Mobile Optimized
- **Offline-first ready** with Supabase local storage
- **Real-time subscriptions** for live data updates
- **Efficient pagination** for large datasets
- **Flexible schema** for rapid feature development

## 6. Authentication Setup

The schema includes automatic user creation triggers:
- When a user signs up via Supabase Auth, a record is automatically created in the `users` table
- A default AI coach is automatically assigned
- User can then complete their profile through the app onboarding

## 7. Sample Data Included

The schema includes sample data for development:
- **4 basic exercises** (squats, push-ups, plank, glute bridges)
- **1 workout template** (Foundation Builder)
- **Complete exercise instructions** and tips

## 8. Next Steps

After running the schema:

1. **Test Authentication**: Try signing up a test user
2. **Verify Tables**: Check that all tables were created in Supabase dashboard
3. **Test Queries**: Run some basic SELECT queries to verify data
4. **Configure RLS**: Verify Row Level Security is working
5. **Connect App**: Update your app's environment variables

## 9. Development vs Production

### Development
- Use the provided sample data
- Test with the anon key
- RLS policies allow development flexibility

### Production
- Remove or modify sample data
- Use service role key for admin operations
- Verify all RLS policies are properly restrictive
- Set up proper backup and monitoring

## 10. Useful SQL Queries

### Check User Setup
```sql
SELECT u.email, up.name, uc.name as coach_name
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id  
LEFT JOIN ai_coaches uc ON u.id = uc.user_id
WHERE u.email = 'your-test-email@example.com';
```

### Verify Workout Data
```sql
SELECT ws.name, ws.status, COUNT(el.*) as total_sets
FROM workout_sessions ws
LEFT JOIN exercise_logs el ON ws.id = el.session_id
WHERE ws.user_id = 'user-id-here'
GROUP BY ws.id, ws.name, ws.status;
```

### Check AI Coach Messages
```sql
SELECT cm.type, cm.content->>'text' as message, cm.created_at
FROM coach_messages cm
WHERE cm.user_id = 'user-id-here'
ORDER BY cm.created_at DESC
LIMIT 10;
```

## 🎉 Setup Complete!

Your Supabase database is now ready for the FitAI app with:
- ✅ Complete schema with 11 tables
- ✅ Row Level Security configured
- ✅ Performance indexes in place
- ✅ AI coach system ready
- ✅ Sample data for development
- ✅ TypeScript types generated

The app can now handle user registration, profile creation, workout tracking, AI coaching, and progress monitoring with a production-ready database structure.