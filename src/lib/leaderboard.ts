import { createClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

export interface PaginatedLeaderboardResponse {
  data: LeaderboardEntry[];
  meta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_entries: number;
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const MAX_ENTRIES = 100;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Track session IDs that have already submitted a score (in-memory, per process)
const submittedSessions = new Set<string>();

/**
 * Read paginated leaderboard entries with metadata
 */
export async function readLeaderboardPaginated(
  page: number = 1,
  perPage: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedLeaderboardResponse> {
  if (!supabaseUrl || !supabaseKey || !supabase) {
    console.warn('Supabase credentials not configured. Returning empty leaderboard.');
    return {
      data: [],
      meta: { page: 1, per_page: DEFAULT_PAGE_SIZE, total_pages: 0, total_entries: 0 }
    };
  }

  // Validate and normalize parameters
  const validPage = Math.max(1, page || 1);
  const validPerPage = Math.min(MAX_PAGE_SIZE, Math.max(1, perPage || DEFAULT_PAGE_SIZE));

  // Calculate offset for pagination
  const offset = (validPage - 1) * validPerPage;

  // Get total count
  const { count, error: countError } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting leaderboard entries:', countError);
    throw new Error('Failed to get total leaderboard count');
  }

  const totalEntries = count || 0;
  const totalPages = Math.ceil(totalEntries / validPerPage);

  // Fetch paginated data
  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, score, updated_at')
    .order('score', { ascending: false })
    .range(offset, offset + validPerPage - 1);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Failed to fetch leaderboard entries');
  }

  const entries = data.map((entry) => ({
    username: entry.username,
    score: entry.score,
    date: entry.updated_at,
  }));

  return {
    data: entries,
    meta: {
      page: validPage,
      per_page: validPerPage,
      total_pages: totalPages,
      total_entries: totalEntries,
    },
  };
}

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

export interface UserRankResponse {
  user_id: string;
  username: string;
  score: number;
  rank: number | null;
  timestamp: string;
}

/**
 * Get the authenticated user's rank and score
 */
export async function getUserRank(userId: string): Promise<UserRankResponse | null> {
  if (!supabaseUrl || !supabaseKey || !supabase) {
    console.warn('Supabase credentials not configured. Cannot get user rank.');
    return null;
  }

  // First, get the user's score from user_profiles linked to leaderboard
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user profile:', profileError);
    return null;
  }

  // Get the user's score from leaderboard
  const { data: scoreData, error: scoreError } = await supabase
    .from('leaderboard')
    .select('score')
    .eq('username', profile.username)
    .single();

  if (scoreError || !scoreData) {
    // User has no score recorded
    return {
      user_id: userId,
      username: profile.username,
      score: 0,
      rank: null,
      timestamp: new Date().toISOString(),
    };
  }

  // Calculate rank using window function
  // Count how many users have a higher score
  const { count, error: countError } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .gt('score', scoreData.score);

  if (countError) {
    console.error('Error calculating rank:', countError);
    throw new Error('Failed to calculate user rank');
  }

  // Rank is count of higher scores + 1
  const rank = (count || 0) + 1;

  return {
    user_id: userId,
    username: profile.username,
    score: scoreData.score,
    rank,
    timestamp: new Date().toISOString(),
  };
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
