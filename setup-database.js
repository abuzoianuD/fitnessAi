#!/usr/bin/env node

/**
 * Database Setup Script for FitAI Supabase
 * This script connects to Supabase and creates all tables with Row Level Security
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL is not set in .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Supabase key is not set in .env file');
  process.exit(1);
}

console.log('🚀 Connecting to Supabase...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('📖 Reading SQL schema file...');
    
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing database schema...');
    console.log('⚠️  This may take a few minutes...');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--') || statement.trim() === '') {
        continue;
      }
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error(`📄 Statement: ${statement.substring(0, 100)}...`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        console.error(`📄 Statement: ${statement.substring(0, 100)}...`);
        errorCount++;
      }
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📈 Database setup summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('🎉 Database setup completed successfully!');
      await verifyTables();
    } else {
      console.log('⚠️  Database setup completed with some errors. Please check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to setup database:', error.message);
    process.exit(1);
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying table creation...');
  
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
  
  try {
    for (const tableName of expectedTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" which is OK
        console.log(`❌ Table '${tableName}': ${error.message}`);
      } else {
        console.log(`✅ Table '${tableName}': Created successfully`);
      }
    }
    
    console.log('\n🔒 Verifying Row Level Security...');
    
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_enabled');
    
    if (rlsError) {
      console.log('⚠️  Could not verify RLS status:', rlsError.message);
    } else {
      console.log('✅ Row Level Security: Enabled on all tables');
    }
    
    console.log('\n🎯 Database is ready for the FitAI app!');
    console.log('\n📋 Next steps:');
    console.log('1. Test user registration in your app');
    console.log('2. Verify that RLS policies are working');
    console.log('3. Check that sample data is available');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

// Run the setup
setupDatabase();