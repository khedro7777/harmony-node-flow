import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_URL;
const supabaseAnonKey = import.meta.env.VITE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anonymous key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
