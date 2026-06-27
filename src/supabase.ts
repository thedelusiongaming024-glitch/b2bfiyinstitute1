import { createClient } from '@supabase/supabase-js';

// Read keys from Vite environment variables (Vercel-ready)
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Automatically detect if Supabase integration is active
export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

if (isSupabaseEnabled) {
  console.log('🔌 Supabase Database Integration Enabled! Using Supabase for backend persistent storage.');
} else {
  console.log('🔥 Supabase credentials not found. Defaulting to Firestore as active database.');
}

export const supabase = isSupabaseEnabled 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;
