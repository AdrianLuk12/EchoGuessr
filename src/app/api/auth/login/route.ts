import { NextResponse } from 'next/server';
import { createClientServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const cleanUsername = username.trim();
    const email = `${cleanUsername}@gmail.com`;
    
    const supabase = await createClientServer();
    
    // Authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: { id: authData.user.id, username: cleanUsername } });

  } catch (error) {
    console.error('Unexpected error in login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}