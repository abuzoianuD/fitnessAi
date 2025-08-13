#!/usr/bin/env node

/**
 * Quick script to create a test user in Supabase
 * Run with: node create-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Required variables:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (get from Supabase Dashboard → Settings → API)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('🚀 Creating test user...');
  
  const testEmail = 'test@fitai.app'; // Change this to your email
  const testPassword = 'TestPassword123!';
  
  try {
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      return;
    }

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('🆔 User ID:', data.user.id);
    console.log('\n🎉 You can now login to the app with these credentials!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createTestUser();