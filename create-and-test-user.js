#!/usr/bin/env node

/**
 * Create a test user and immediately test login
 * This script will create a user with a known password and then test login
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Required variables:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testEmail = 'debug@fitai.app';
const testPassword = 'DebugPassword123!';

async function createAndTestUser() {
  console.log('🚀 Creating and testing user authentication...\n');
  
  try {
    // Step 1: Try to sign up the user
    console.log('1️⃣ Creating user via signUp...');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Debug',
          last_name: 'User',
          full_name: 'Debug User'
        }
      }
    });

    if (signUpError) {
      console.log(`⚠️ SignUp error (might already exist): ${signUpError.message}`);
    } else {
      console.log('✅ User created successfully!');
      console.log(`👤 User ID: ${signUpData.user?.id}`);
      console.log(`📧 Email: ${signUpData.user?.email}`);
      console.log(`✉️ Confirmation required: ${!signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}`);
    }

    // Step 2: Wait a moment then try to sign in
    console.log('\n2️⃣ Waiting 2 seconds then testing login...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // First, sign out any existing session
    await supabase.auth.signOut();
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log(`❌ Login failed: ${signInError.message}`);
      
      if (signInError.message.includes('Email not confirmed')) {
        console.log('\n💡 Email confirmation required. Solutions:');
        console.log('   1. Check your email for confirmation link');
        console.log('   2. Or manually confirm in Supabase Dashboard:');
        console.log('      - Go to Authentication → Users');
        console.log('      - Find the user and click on them');
        console.log('      - Set "Email Confirmed" to true');
        console.log('   3. Or run this to resend confirmation:');
        console.log(`      const { error } = await supabase.auth.resend({ type: 'signup', email: '${testEmail}' })`);
      }
      
      return;
    }

    console.log('✅ Login successful!');
    console.log(`👤 User ID: ${signInData.user.id}`);
    console.log(`📧 Email: ${signInData.user.email}`);
    console.log(`📅 Created: ${signInData.user.created_at}`);
    console.log(`✉️ Email confirmed: ${signInData.user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
    
    if (signInData.user.user_metadata) {
      console.log(`📝 Metadata:`, signInData.user.user_metadata);
    }

    // Step 3: Test sign out
    console.log('\n3️⃣ Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log(`❌ Sign out failed: ${signOutError.message}`);
    } else {
      console.log('✅ Sign out successful!');
    }

    console.log('\n🎉 Authentication test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If email confirmation is required, check your dashboard');
    console.log('2. Use these credentials in your app:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('3. Test the login in your actual app now');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n🔍 Debug info:');
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`);
  }
}

createAndTestUser();