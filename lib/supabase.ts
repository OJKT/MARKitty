import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Safe initialization with fallback
let supabase: ReturnType<typeof createClient> | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      // Add error handling and retries
      db: {
        schema: 'public',
      },
    });
  } else {
    console.warn('Supabase credentials not available');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

// Helper function to check if Supabase is available
export const isSupabaseAvailable = async () => {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Helper function to safely execute Supabase queries
export async function safeQuery<T>(
  queryFn: (supabaseClient: NonNullable<typeof supabase>) => Promise<T>,
  fallback: T
): Promise<T> {
  if (!supabase) return fallback;
  try {
    return await queryFn(supabase);
  } catch (error) {
    console.error('Supabase query error:', error);
    return fallback;
  }
}

export default supabase;

export type Profile = {
  id: string;
  learner_name: string;
  default_declaration: string;
  last_template_path: string;
  created_at: string;
};

export type Template = {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type: 'docx' | 'pdf';
  created_at: string;
}; 