import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateLocationAndPrompts } from "@/lib/backboard";
import {
  generateSoundEffect,
  generateMusic,
  generateSpeech,
  deleteVoice,
} from "@/lib/elevenlabs";
import { setSession } from "@/lib/sessions";
import { generateCacheKey, readFromCache, writeToCache, getRandomFromCache } from "@/lib/cache";

export async function POST() {
  try {
    const useCache = process.env.USE_LOCAL_CACHE === "true";
    let cacheHit = false;

    let ambientBuf: Buffer = null as any;
    let musicBuf: Buffer = null as any;
    let languageBuf: Buffer = null as any;
    let location: any = null;

    // If caching is enabled, try to pick a random existing generated game
    if (useCache) {
      const cached = await getRandomFromCache();
      if (cached) {
        ambientBuf = cached.ambientBuf;
        musicBuf = cached.musicBuf;
        languageBuf = cached.languageBuf;
        location = cached.metadata;
        cacheHit = true;

        // Artificial delay to ensure the loading screen displays for a bit
        const delay = Math.floor(Math.random() * (11500 - 8000 + 1) + 8000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If cache missed or disabled, generate a new one from APIs
    if (!cacheHit) {
      location = await generateLocationAndPrompts();
      
      const results = await Promise.all([
        generateSoundEffect(location.ambientPrompt),
        generateMusic(location.musicPrompt),
        generateSpeech(location.languagePhrase, location.voiceDescription),
      ]);
      
      ambientBuf = results[0];
      musicBuf = results[1];
      const speechResult = results[2];
      languageBuf = speechResult.buffer;

      deleteVoice(speechResult.voiceId).catch(() => {});

      if (useCache) {
        const cacheKey = generateCacheKey(location.ambientPrompt, location.musicPrompt, location.languagePhrase);
        await writeToCache(cacheKey, ambientBuf, musicBuf, languageBuf, location);
      }
    }

    const sessionId = randomUUID();

    const toDataUri = (buf: Buffer, mime = "audio/mpeg") =>
      `data:${mime};base64,${buf.toString("base64")}`;

    const audioUrls = {
      ambient: toDataUri(ambientBuf),
      music: toDataUri(musicBuf),
      language: toDataUri(languageBuf),
    };

    setSession({
      id: sessionId,
      location: {
        city: location.city,
        country: location.country,
        lat: location.lat,
        lng: location.lng,
      },
      audioUrls,
      languagePhrase: location.languagePhrase,
      languageTranslation: location.languageTranslation,
    });

    return NextResponse.json({
      sessionId,
      audio: audioUrls,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
