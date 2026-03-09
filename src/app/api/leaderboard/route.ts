import { NextResponse } from "next/server";
import { readLeaderboard } from "@/lib/leaderboard";

export async function GET() {
  try {
    const entries = await readLeaderboard();
    return NextResponse.json(entries);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
