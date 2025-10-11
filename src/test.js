import 'dotenv/config';
import { signUpWithEmail, updateUserWallet, supabase } from './lib/supabaseClient.js';

async function runTest() {
  try {
    // Test user registration
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Attempting to sign up with email: ${email}`);
    const newUser = await signUpWithEmail(email, password);
    console.log('User signed up successfully:', newUser);

    // Test updating user wallet
    if (newUser && newUser.user) {
      console.log(`Attempting to update wallet for user ID: ${newUser.user.id}`);
      const updatedUser = await updateUserWallet(newUser.user.id, '0x1234567890abcdef');
      console.log('User wallet updated successfully:', updatedUser);
    } else {
      console.error('Could not get user from sign up response');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // End the Supabase session to allow the script to exit
    supabase.auth.signOut();
  }
}

runTest();
