
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: { uid: '123', email: 'test@example.com' },
  }),
  sendEmailVerification: jest.fn().mockResolvedValue(undefined),
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
  it('should sign up a new user and send a verification email', async () => {
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(getByText('Sign Up'));

    await waitFor(() => expect(require('firebase/auth').createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object), // This is the auth object
      'test@example.com',
      'password123'
    ));

    await waitFor(() => expect(require('firebase/auth').sendEmailVerification).toHaveBeenCalled());
  });
});
