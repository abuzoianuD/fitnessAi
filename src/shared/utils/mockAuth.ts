/**
 * Mock Authentication for Development
 * Use this when network connectivity issues prevent real authentication
 */

export interface MockUser {
  id: string;
  email: string;
  email_confirmed_at: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    onboarding_completed?: boolean;
  };
}

export const createMockSession = (email: string): { user: MockUser; session: any } => {
  const mockUser: MockUser = {
    id: 'mock-user-' + Date.now(),
    email,
    email_confirmed_at: new Date().toISOString(),
    user_metadata: {
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
      onboarding_completed: true, // Set to false if you want to test onboarding
    }
  };

  const mockSession = {
    access_token: 'mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Date.now() + 3600 * 1000,
    refresh_token: 'mock-refresh',
    user: mockUser,
  };

  return { user: mockUser, session: mockSession };
};

export const mockSignIn = async (email: string, password: string) => {
  console.log('🧪 Using Mock Authentication for development');
  console.log('📧 Email:', email);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Validate credentials (for development)
  const validCredentials = [
    { email: 'debug@fitai.app', password: 'DebugPassword123!' },
    { email: 'test@fitai.app', password: 'TestPassword123!' },
  ];
  
  const isValid = validCredentials.some(
    cred => cred.email === email && cred.password === password
  );
  
  if (!isValid) {
    return { 
      error: { 
        message: 'Invalid login credentials',
        name: 'AuthError',
        status: 400 
      } 
    };
  }
  
  const { user, session } = createMockSession(email);
  
  console.log('✅ Mock authentication successful');
  console.log('👤 Mock user:', user.email);
  
  return { data: { user, session }, error: null };
};

export const mockSignUp = async (email: string, password: string, metadata?: object) => {
  console.log('🧪 Using Mock SignUp for development');
  console.log('📧 Email:', email);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const { user, session } = createMockSession(email);
  
  // Simulate welcome email
  console.log('📧 Mock: Welcome email would be sent to', email);
  console.log('✅ Mock signup successful - user can login immediately');
  
  return { data: { user, session }, error: null };
};

// Development flag - set to true to use mock auth
export const USE_MOCK_AUTH = __DEV__ && true; // Change to false when network is fixed