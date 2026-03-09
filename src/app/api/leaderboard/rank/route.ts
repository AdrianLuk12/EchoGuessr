import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getUserRank } from "@/lib/leaderboard";

export async function GET() {
  try {
    // Verify authentication
    const { user, error } = await verifyAuth();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to see your rank." },
        { status: 401 }
      );
    }

    // Get user's rank
    const result = await getUserRank(user.id);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to retrieve user rank" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
