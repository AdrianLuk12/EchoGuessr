import { createClientServer, createAdminClient } from '@/lib/supabase-server';

export async function verifyAuth() {
  try {
    const supabase = await createClientServer();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: error || new Error('Not authenticated') };
    }

    // Optionally fetch the username from user_profiles
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        username: profile?.username || user.email?.split('@')[0] 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error in verifyAuth:', error);
    return { user: null, error };
  }
}
