
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function updateUserWallet(userId, walletAddress) {
  const { data, error } = await supabase
    .from('users')
    .update({ wallet: walletAddress })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error updating wallet:', error);
    throw error;
  }
  return data;
}
