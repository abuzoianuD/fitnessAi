#!/usr/bin/env node

/**
 * Debug the network connectivity and auth configuration
 * This will help identify why you're getting "Network request failed"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase Configuration\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
console.log(`   EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   EXPO_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}\n`);

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Disable persistence for testing
    detectSessionInUrl: false,
  },
});

async function debugConnection() {
  try {
    console.log('2️⃣ Testing Basic Connectivity:');
    
    // Test 1: Basic HTTP connectivity
    console.log('   📡 Testing direct HTTP request...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('   ✅ Direct HTTP request successful');
    } else {
      console.log('   ❌ Direct HTTP request failed');
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 200)}...`);
    }

    console.log('\n3️⃣ Testing Supabase Client:');
    
    // Test 2: Supabase client connectivity
    console.log('   🔌 Testing client connection...');
    const { data, error } = await supabase
      .from('exercises')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Client connection failed: ${error.message}`);
      console.log(`   Error details:`, error);
    } else {
      console.log('   ✅ Client connection successful');
    }

    console.log('\n4️⃣ Testing Auth Endpoints:');
    
    // Test 3: Auth endpoint connectivity
    console.log('   🔐 Testing auth endpoint...');
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log(`   ❌ Auth endpoint error: ${sessionError.message}`);
      } else {
        console.log('   ✅ Auth endpoint accessible');
        console.log(`   Current session: ${session.session ? 'Active' : 'None'}`);
      }
    } catch (authError) {
      console.log(`   ❌ Auth endpoint exception: ${authError.message}`);
    }

    console.log('\n5️⃣ Testing Authentication:');
    
    // Test 4: Test authentication with known working credentials
    console.log('   🔑 Testing login with debug user...');
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'debug@fitai.app',
        password: 'DebugPassword123!',
      });

      if (loginError) {
        console.log(`   ❌ Login failed: ${loginError.message}`);
        
        if (loginError.message.includes('Invalid login credentials')) {
          console.log('   💡 This is expected if user doesn\'t exist or isn\'t confirmed');
        } else if (loginError.message.includes('Network request failed')) {
          console.log('   🚨 Network issue detected!');
          console.log('   Possible causes:');
          console.log('   - Firewall blocking the request');
          console.log('   - VPN interfering with connection');
          console.log('   - Network proxy configuration');
          console.log('   - DNS resolution issues');
        }
      } else {
        console.log('   ✅ Login successful!');
        console.log(`   User: ${loginData.user.email}`);
        
        // Clean up - sign out
        await supabase.auth.signOut();
      }
    } catch (networkError) {
      console.log(`   ❌ Network exception: ${networkError.message}`);
      console.log('   🚨 This suggests a network connectivity issue');
    }

    console.log('\n6️⃣ Configuration Summary:');
    console.log(`   Supabase URL: ${supabaseUrl}`);
    console.log(`   URL format: ${supabaseUrl.startsWith('https://') ? '✅ HTTPS' : '❌ Not HTTPS'}`);
    console.log(`   Domain: ${new URL(supabaseUrl).hostname}`);
    console.log(`   Key length: ${supabaseAnonKey.length} chars`);
    console.log(`   Key format: ${supabaseAnonKey.startsWith('eyJ') ? '✅ JWT format' : '❌ Invalid format'}`);

  } catch (error) {
    console.error('❌ Debug failed with error:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

debugConnection();