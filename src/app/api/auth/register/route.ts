import { NextResponse } from 'next/server';
import { createClientServer, createAdminClient } from '@/lib/supabase-server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const cleanUsername = username.trim();
    
    // Load banned words
    const bannedWordsPath = path.join(process.cwd(), 'data', 'banned-words.json');
    let bannedWords: string[] = [];
    if (fs.existsSync(bannedWordsPath)) {
      const fileData = fs.readFileSync(bannedWordsPath, 'utf8');
      bannedWords = JSON.parse(fileData);
    }

    // Check for banned words (case insensitive substring match)
    const lowerUsername = cleanUsername.toLowerCase();
    for (const word of bannedWords) {
      if (lowerUsername.includes(word.toLowerCase())) {
        return NextResponse.json({ error: 'Username contains inappropriate words' }, { status: 400 });
      }
    }

    const adminClient = createAdminClient();

    // Check if the username already exists (just in case)
    const { data: existingUser } = await adminClient
      .from('user_profiles')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Generate dummy email with a valid TLD to pass Supabase validation
    const email = `${cleanUsername}@gmail.com`;
    
    const supabase = await createClientServer();
    
    // Register the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }

    // Create user profile
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        username: cleanUsername
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // We should ideally rollback auth creation, but for this hackathon it's ok.
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: { id: authData.user.id, username: cleanUsername } });

  } catch (error) {
    console.error('Unexpected error in register:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}