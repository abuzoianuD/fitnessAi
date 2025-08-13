#!/usr/bin/env node

/**
 * Manually confirm a user's email using the service role key
 * This bypasses the email confirmation process for testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need to add this to .env

if (!supabaseUrl) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL in .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env file');
  console.log('\n📝 To get your service role key:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Go to Settings → API');
  console.log('3. Copy the "service_role" key (starts with "eyJ...")');
  console.log('4. Add it to your .env file as:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for testing
const supabase = createClient(supabaseUrl, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function confirmUserAndTest() {
  const testEmail = 'debug@fitai.app'; // Change this to match your user
  const testPassword = 'DebugPassword123!';
  
  console.log('🔐 Confirming user email and testing login...\n');
  
  try {
    // Step 1: Get the user by email
    console.log(`1️⃣ Finding user with email: ${testEmail}`);
    
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('❌ Error getting users:', getUserError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === testEmail);
    
    if (!user) {
      console.log('❌ User not found. Available users:');
      users.users.forEach(u => console.log(`   - ${u.email} (${u.id})`));
      return;
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`📧 Currently confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
    
    // Step 2: Confirm the email if not already confirmed
    if (!user.email_confirmed_at) {
      console.log('\n2️⃣ Confirming email...');
      
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { 
          email_confirm: true,
          user_metadata: {
            ...user.user_metadata,
            first_name: 'Debug',
            last_name: 'User',
            full_name: 'Debug User'
          }
        }
      );
      
      if (updateError) {
        console.error('❌ Error confirming email:', updateError.message);
        return;
      }
      
      console.log('✅ Email confirmed successfully!');
    } else {
      console.log('✅ Email already confirmed!');
    }
    
    // Step 3: Test login
    console.log('\n3️⃣ Testing login...');
    
    // Make sure no existing session
    await supabase.auth.signOut();
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log(`❌ Login still failed: ${signInError.message}`);
      return;
    }

    console.log('🎉 Login successful!');
    console.log(`👤 User ID: ${signInData.user.id}`);
    console.log(`📧 Email: ${signInData.user.email}`);
    console.log(`✉️ Email confirmed: ${signInData.user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
    
    // Step 4: Test sign out
    console.log('\n4️⃣ Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log(`❌ Sign out failed: ${signOutError.message}`);
    } else {
      console.log('✅ Sign out successful!');
    }
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📱 Ready to test in your app with:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

confirmUserAndTest();