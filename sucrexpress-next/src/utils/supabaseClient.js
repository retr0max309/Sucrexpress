import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gryoztwdzigjjleazknk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeW96dHdkemlnampsZWF6a25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTY2MjEsImV4cCI6MjA3NjM5MjYyMX0.PFHz68q2t3mByoJM7GpwsJiFG4jH9aFNk_4yZSa-zgE";

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las credenciales de Supabase son necesarias');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);
