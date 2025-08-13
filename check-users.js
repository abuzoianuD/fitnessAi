#!/usr/bin/env node

/**
 * Check what users exist in the Supabase database
 * Run with: node check-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  console.log('🔍 Checking Supabase connection...');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...');
  
  try {
    // Try to query the users table in the public schema (if accessible)
    console.log('\n📋 Checking public.users table...');
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, email, created_at, updated_at')
      .limit(5);
      
    if (publicError) {
      console.log('❌ Cannot access public.users table:', publicError.message);
    } else {
      console.log(`✅ Found ${publicUsers?.length || 0} users in public.users table`);
      if (publicUsers && publicUsers.length > 0) {
        publicUsers.forEach(user => {
          console.log(`   - ID: ${user.id}`);
          console.log(`     Email: ${user.email}`);
          console.log(`     Created: ${user.created_at}`);
        });
      }
    }

    // Try to get current session info
    console.log('\n🔐 Checking auth status...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('📱 Current session:', sessionData.session ? 'Active' : 'None');
      if (sessionData.session) {
        console.log('👤 User ID:', sessionData.session.user.id);
        console.log('📧 Email:', sessionData.session.user.email);
      }
    }

    // Test basic connectivity
    console.log('\n🌐 Testing basic connectivity...');
    const { data: testData, error: testError } = await supabase
      .from('exercises')  // Try to access a table we know exists
      .select('count')
      .limit(1);
      
    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
    } else {
      console.log('✅ Connection test successful');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkUsers();