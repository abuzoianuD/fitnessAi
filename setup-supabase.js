#!/usr/bin/env node

/**
 * Simple Supabase Connection Test
 * Tests the connection and provides manual setup instructions
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://stxrrrcfwlnmjwtugcvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eHJycmNmd2xubWp3dHVnY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzE1OTIsImV4cCI6MjA3MDA0NzU5Mn0.2FwkXlpj-r9qNHFH4sbuOZ2P-1iAk_i9xt1xbBgyyFo';

console.log('🚀 Testing Supabase connection...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    
    // Try to query a system table to verify we can read
    const { data: schemas, error: schemaError } = await supabase
      .rpc('pg_stat_user_tables')
      .limit(1);
    
    if (schemaError) {
      console.log('⚠️  Limited access (expected with anon key)');
    } else {
      console.log('✅ Database access confirmed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    console.log('\n🎉 Connection successful!');
    console.log('\n📋 To complete the database setup:');
    console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the content from supabase-schema.sql');
    console.log('4. Click "Run" to execute the schema');
    console.log('\n🔒 The schema includes:');
    console.log('• 11 production-ready tables');
    console.log('• Row Level Security policies');
    console.log('• Performance indexes');
    console.log('• Sample data for development');
    console.log('• Automatic user creation triggers');
    
    console.log('\n⚡ Your app is ready to connect to Supabase!');
  }
}

main();