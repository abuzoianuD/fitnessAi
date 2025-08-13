#!/usr/bin/env node

/**
 * Test script to verify authentication is working
 * Run with: node test-auth.js
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

async function testLogin() {
  console.log('🔍 Testing authentication...');
  
  // Replace with your test user credentials
  const testEmail = 'test@fitai.app'; // This matches the SQL script
  const testPassword = 'TestPassword123!';
  
  try {
    console.log(`📧 Attempting login with: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 Check that:');
        console.log('   - Email matches exactly');
        console.log('   - Password is correct');
        console.log('   - User exists in Supabase Dashboard → Authentication → Users');
      }
      return;
    }

    console.log('✅ Login successful!');
    console.log('👤 User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);
    console.log('📅 Created:', data.user.created_at);
    console.log('✉️ Email confirmed:', data.user.email_confirmed_at ? '✅ Yes' : '❌ No');
    
    if (data.user.user_metadata) {
      console.log('📝 User metadata:', data.user.user_metadata);
    }
    
    // Test sign out
    await supabase.auth.signOut();
    console.log('👋 Sign out successful');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testLogin();