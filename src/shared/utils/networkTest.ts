/**
 * Network connectivity test utility
 * Use this to debug network issues in React Native
 */

export const testNetworkConnectivity = async () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔍 Testing Network Connectivity...');
  console.log('📍 Supabase URL:', supabaseUrl?.substring(0, 30) + '...');
  console.log('🔑 Has Key:', !!supabaseKey);

  try {
    // Test 1: Basic fetch to Supabase
    console.log('1️⃣ Testing basic HTTP connectivity...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey!,
        'Content-Type': 'application/json',
        'User-Agent': 'FitAI-ReactNative-Test/1.0'
      },
    });
    
    console.log('📊 Response status:', response.status, response.statusText);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      console.log('✅ Basic connectivity: SUCCESS');
    } else {
      console.log('❌ Basic connectivity: FAILED');
      const errorText = await response.text();
      console.log('📄 Error response:', errorText);
    }

    // Test 2: Auth endpoint
    console.log('\n2️⃣ Testing auth endpoint...');
    
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey!,
        'Content-Type': 'application/json',
        'User-Agent': 'FitAI-ReactNative-Test/1.0'
      },
    });

    console.log('🔐 Auth endpoint status:', authResponse.status, authResponse.statusText);

    if (authResponse.ok) {
      console.log('✅ Auth endpoint: SUCCESS');
      const settings = await authResponse.json();
      console.log('⚙️ Auth settings:', settings);
    } else {
      console.log('❌ Auth endpoint: FAILED');
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Network test failed:', error);
    
    if (error instanceof Error) {
      console.error('📝 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 300)
      });
    }
    
    // Common network issues in React Native
    if (error?.message?.includes('Network request failed')) {
      console.log('\n💡 Network Request Failed - Common causes:');
      console.log('   🔸 Device not connected to internet');
      console.log('   🔸 Corporate firewall blocking requests');
      console.log('   🔸 VPN interfering with connections');
      console.log('   🔸 Expo/Metro bundler network issues');
      console.log('   🔸 iOS simulator network restrictions');
      console.log('   🔸 Android emulator network proxy issues');
    }
    
    return { success: false, error };
  }
};

// Auto-run network test when imported (in development)
if (__DEV__) {
  console.log('🚀 Running network connectivity test...');
  testNetworkConnectivity();
}