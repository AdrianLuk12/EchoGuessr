import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
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

    const supabase = createAdminClient();

    // Check if the username exists in the user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (error) {
      console.error('Error checking username:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({ exists: true });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Unexpected error in check-username:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}