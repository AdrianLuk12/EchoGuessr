import { createClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

const MAX_ENTRIES = 100;

// Track session IDs that have already submitted a score (in-memory, per process)
const submittedSessions = new Set<string>();

export async function readLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!supabaseUrl || !supabaseKey || !supabase) {
    console.warn('Supabase credentials not configured. Returning empty leaderboard.');
    return [];
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, score, updated_at')
    .order('score', { ascending: false })
    .limit(MAX_ENTRIES);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data.map((entry) => ({
    username: entry.username,
    score: entry.score,
    date: entry.updated_at,
  }));
}

export async function addScore(
  username: string,
  score: number,
  sessionId?: string
): Promise<{ entries: LeaderboardEntry[]; isNewHighScore: boolean; isNewUser: boolean } | null> {
  if (sessionId) {
    if (submittedSessions.has(sessionId)) return null; // already submitted
    submittedSessions.add(sessionId);
  }

  if (!supabaseUrl || !supabaseKey || !supabase) {
    console.warn('Supabase credentials not configured. Cannot save score.');
    return null;
  }

  // First, check if the user exists and what their current score is
  const { data: existingUser, error: fetchError } = await supabase
    .from('leaderboard')
    .select('score')
    .eq('username', username)
    .single();

  let isNewHighScore = false;
  let isNewUser = false;

  if (fetchError && fetchError.code === 'PGRST116') {
    // User does not exist, insert new record
    isNewUser = true;
    isNewHighScore = true;
    const { error: insertError } = await supabase
      .from('leaderboard')
      .insert([{ username, score, updated_at: new Date().toISOString() }]);
      
    if (insertError) {
      console.error('Error inserting new user score:', insertError);
    }
  } else if (!fetchError && existingUser) {
    // User exists, update if the new score is higher
    if (score > existingUser.score) {
      isNewHighScore = true;
      const { error: updateError } = await supabase
        .from('leaderboard')
        .update({ score, updated_at: new Date().toISOString() })
        .eq('username', username);
        
      if (updateError) {
        console.error('Error updating user score:', updateError);
      }
    }
  } else if (fetchError) {
    console.error('Error fetching existing user:', fetchError);
  }

  const entries = await readLeaderboard();
  return { entries, isNewHighScore, isNewUser };
}
