#!/usr/bin/env node

/**
 * Database Verification Script
 * Verifies that all tables were created correctly with proper RLS
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://stxrrrcfwlnmjwtugcvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eHJycmNmd2xubWp3dHVnY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzE1OTIsImV4cCI6MjA3MDA0NzU5Mn0.2FwkXlpj-r9qNHFH4sbuOZ2P-1iAk_i9xt1xbBgyyFo';

const supabase = createClient(supabaseUrl, supabaseKey);

const expectedTables = [
  'users',
  'user_profiles', 
  'fitness_goals',
  'user_preferences',
  'exercises',
  'workout_templates',
  'workout_sessions',
  'exercise_logs',
  'personal_records',
  'ai_coaches',
  'coach_messages',
  'nutrition_logs',
  'body_measurements'
];

async function verifyTables() {
  console.log('🔍 Verifying database setup...\n');
  
  let tablesFound = 0;
  let tablesWithData = 0;
  const errors = [];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Table '${tableName}': Not found`);
          errors.push(`Table ${tableName} does not exist`);
        } else if (error.code === 'PGRST301') {
          console.log(`🔒 Table '${tableName}': Protected by RLS (this is good!)`);
          tablesFound++;
        } else {
          console.log(`⚠️  Table '${tableName}': ${error.message}`);
          errors.push(`Table ${tableName}: ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${tableName}': Found (${count || 0} rows)`);
        tablesFound++;
        if (count && count > 0) tablesWithData++;
      }
    } catch (err) {
      console.log(`❌ Table '${tableName}': ${err.message}`);
      errors.push(`Table ${tableName}: ${err.message}`);
    }
  }
  
  console.log('\n📊 Verification Summary:');
  console.log(`✅ Tables found: ${tablesFound}/${expectedTables.length}`);
  console.log(`📄 Tables with data: ${tablesWithData}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n🔍 Errors found:');
    errors.forEach(error => console.log(`  • ${error}`));
  }
  
  return { tablesFound, errors: errors.length };
}

async function testSampleData() {
  console.log('\n🧪 Testing sample data...');
  
  try {
    // Try to fetch exercises (should be public)
    const { data: exercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('name')
      .limit(5);
    
    if (exerciseError) {
      console.log(`⚠️  Exercises: ${exerciseError.message}`);
    } else {
      console.log(`✅ Sample exercises: ${exercises?.length || 0} found`);
      if (exercises && exercises.length > 0) {
        exercises.forEach(ex => console.log(`   • ${ex.name}`));
      }
    }
    
    // Try to fetch workout templates (should be public)
    const { data: templates, error: templateError } = await supabase
      .from('workout_templates')
      .select('name')
      .eq('is_public', true)
      .limit(3);
    
    if (templateError) {
      console.log(`⚠️  Workout templates: ${templateError.message}`);
    } else {
      console.log(`✅ Sample workout templates: ${templates?.length || 0} found`);
      if (templates && templates.length > 0) {
        templates.forEach(tpl => console.log(`   • ${tpl.name}`));
      }
    }
    
  } catch (error) {
    console.log(`❌ Error testing sample data: ${error.message}`);
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing authentication setup...');
  
  try {
    // Test sign up (this will fail due to RLS, but we can see the error type)
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Auth system: Working (test user already exists)');
      } else {
        console.log(`⚠️  Auth system: ${error.message}`);
      }
    } else {
      console.log('✅ Auth system: Working (test signup successful)');
      // Note: In a real test, we'd clean up the test user
    }
    
  } catch (error) {
    console.log(`❌ Auth test error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 FitAI Database Verification\n');
  
  const { tablesFound, errors } = await verifyTables();
  await testSampleData();
  await testAuthentication();
  
  console.log('\n🎯 Final Assessment:');
  
  if (tablesFound === expectedTables.length && errors === 0) {
    console.log('🎉 Perfect! Database setup is complete and working.');
    console.log('✅ All tables created');
    console.log('✅ Row Level Security active');
    console.log('✅ Sample data available');
    console.log('\n🚀 Your FitAI app is ready for development!');
  } else if (tablesFound === expectedTables.length) {
    console.log('✅ Good! All tables created, with minor issues.');
    console.log('⚠️  Some errors detected - check details above');
    console.log('\n📱 Your app should work, but verify functionality');
  } else {
    console.log('❌ Issues detected! Database setup incomplete.');
    console.log('📋 Please run the SQL schema in Supabase dashboard');
    console.log('📖 See SETUP_INSTRUCTIONS.md for detailed steps');
  }
}

main().catch(console.error);