import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:54321'; // Из вывода supabase start
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // Из вывода supabase start

export const supabase = createClient(supabaseUrl, supabaseAnonKey);