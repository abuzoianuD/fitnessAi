import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="email-sent" 
        options={{
          headerShown: false,
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}