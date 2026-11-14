import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function initializeClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabasePublishableKey) return null;
  try {
    return createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch {
    return null;
  }
}

export const supabase = initializeClient();
export const accountConfigurationError = supabase
  ? null
  : 'Customer accounts are unavailable because this website’s account settings are missing or invalid. The site owner needs to configure Supabase and rebuild the website.';
