# 🚀 FitAI Database Setup Instructions

## Step 1: Access Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your project: `stxrrrcfwlnmjwtugcvv`

## Step 2: Open SQL Editor
1. In your project dashboard, click **SQL Editor** in the left sidebar
2. Click **New query** to open a new SQL editor tab

## Step 3: Execute Database Schema
1. Open the file `supabase-schema.sql` in your project
2. **Copy the entire contents** of the file (all ~700+ lines)
3. **Paste it into the SQL Editor** in Supabase
4. Click **Run** button (or press Ctrl/Cmd + Enter)

⏳ **This will take 1-2 minutes to complete**

## Step 4: Verify Setup
Once the schema execution is complete, you should see:
- ✅ Tables created successfully
- ✅ Indexes created
- ✅ Row Level Security enabled
- ✅ Sample data inserted

## Step 5: Test the Setup
Run the verification script:
```bash
node verify-database.js
```

## What Gets Created

### 🗄️ Tables (11 total):
1. **users** - Main user accounts
2. **user_profiles** - Personal info (name, age, etc.)
3. **fitness_goals** - User objectives
4. **user_preferences** - Workout preferences
5. **exercises** - Exercise library
6. **workout_templates** - Workout plans
7. **workout_sessions** - Individual workouts
8. **exercise_logs** - Set/rep tracking
9. **personal_records** - PR tracking
10. **ai_coaches** - AI coach personalities
11. **coach_messages** - AI chat history
12. **nutrition_logs** - Food tracking
13. **body_measurements** - Progress photos

### 🔒 Security Features:
- **Row Level Security** on all tables
- **User data isolation** (users can only see their own data)
- **Secure authentication** integration
- **Admin policies** for public data (exercises)

### ⚡ Performance Features:
- **Strategic indexes** for fast queries
- **JSONB fields** for flexible data
- **Foreign key relationships** for data integrity
- **Automatic timestamps** with triggers

### 🤖 AI-Ready Features:
- **Coach personality storage** as JSON
- **Message categorization** for different AI responses
- **Context tracking** for personalized coaching
- **Effectiveness tracking** for AI improvement

## Sample Data Included

The schema includes sample data for immediate testing:
- **4 basic exercises** (squats, push-ups, plank, glute bridges)
- **1 workout template** (Foundation Builder)
- **Exercise instructions** and form tips

## Troubleshooting

### If you see errors during execution:
1. **Check that you're using the SQL Editor** (not the Dashboard)
2. **Make sure you copied the entire file** (including the last line)
3. **Verify you have admin access** to the project
4. **Try executing smaller sections** if the full script fails

### Common issues:
- **Extensions not enabled**: Some SQL might fail if extensions aren't available
- **Permissions errors**: Make sure you're the project owner
- **Timeout errors**: Large schemas can take time - wait for completion

## Next Steps After Setup

1. **Test user registration** in your React Native app
2. **Verify RLS is working** (users can't see other users' data)
3. **Check sample data** (exercises should be visible)
4. **Test workout creation** through the app

## 🎉 Success!

Once setup is complete, your app will have:
- ✅ Production-ready database schema
- ✅ Secure user authentication
- ✅ Complete fitness tracking capabilities
- ✅ AI coaching system ready
- ✅ Real-time data synchronization
- ✅ Offline-first architecture support

Your FitAI app is now ready for development and testing! 🚀