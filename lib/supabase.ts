import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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