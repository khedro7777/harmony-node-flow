
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';

// Mock the supabase client
jest.mock('./lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signUp: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

// Mock the web3 connectWallet function
jest.mock('@/lib/web3', () => ({
    connectWallet: jest.fn()
}));

const TestComponent = () => {
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    try {
      await signUp('test@example.com', 'password123');
      alert('Sign-up successful');
    } catch (error) {
      alert('Sign-up failed');
    }
  };

  return <button onClick={handleSignUp}>Sign Up</button>;
};

describe('AuthProvider', () => {
  beforeAll(() => {
    // Mock window.alert
    window.alert = jest.fn();
  });

  it('should sign up a new user using Supabase', async () => {
    const { supabase } = require('./lib/supabaseClient.js');
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(getByText('Sign Up'));

    await waitFor(() => expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    }));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Sign-up successful'));
  });
});
