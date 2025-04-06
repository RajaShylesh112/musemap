/**
 * Supabase Client Configuration
 * Sets up and exports the Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get Supabase client instance
 * @returns {Object} Supabase client instance
 */
export function getSupabase() {
    return supabase;
}