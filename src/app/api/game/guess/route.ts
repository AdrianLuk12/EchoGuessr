import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import { haversineDistance, calculateScore } from "@/lib/scoring";
import { addScore } from "@/lib/leaderboard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, username, guessedCoordinates, stage } = body as {
      sessionId: string;
      username?: string;
      guessedCoordinates: [number, number];
      stage: number;
    };

    if (!sessionId || !guessedCoordinates || !stage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 404 }
      );
    }

    const [guessLat, guessLng] = guessedCoordinates;
    const { lat, lng, city, country } = session.location;

    const distance = haversineDistance(guessLat, guessLng, lat, lng);
    const score = calculateScore(distance, stage);

    // Auto-submit score to leaderboard
    let isNewHighScore = false;
    let isNewUser = false;
    if (username) {
      const result = await addScore(username, score, sessionId);
      if (result) {
        isNewHighScore = result.isNewHighScore;
        isNewUser = result.isNewUser;
      }
    }

    return NextResponse.json({
      score,
      distance: Math.round(distance),
      actualLocation: { lat, lng, city, country },
      guessedLocation: { lat: guessLat, lng: guessLng },
      stage,
      languagePhrase: session.languagePhrase,
      languageTranslation: session.languageTranslation,
      isNewHighScore,
      isNewUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
