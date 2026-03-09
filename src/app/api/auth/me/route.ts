import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  const { user, error } = await verifyAuth();

  if (error || !user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ 
    authenticated: true, 
    user: { id: user.id, username: user.username } 
  });
}