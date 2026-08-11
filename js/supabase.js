const SUPABASE_URL = 'https://ibuayshomcaqyjiecxam.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_h-3cyLEliB4tnz3K5DgDiw_1bQ2nJ2k';

const { createClient } = supabase;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabaseClient;
window.Supabase = supabaseClient;
window.Supabase = supabaseClient;
