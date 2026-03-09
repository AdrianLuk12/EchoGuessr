## Context

Currently, the `src/app/api/game/generate/route.ts` API generates audio by calling the ElevenLabs API directly for every request, even if the same audio text and voice parameters are used. This incurs high credit usage on the ElevenLabs account. By storing the generated audio buffers and associated metadata locally, we can serve repeat requests instantly and free of charge.

## Goals / Non-Goals

**Goals:**
- Implement a local cache using the file system (e.g., in a `.cache` or `public/cache` directory, or just a temporary local directory).
- Hash the input parameters (phrase, language, location) to create a unique identifier for each generated audio clip.
- Store the audio file (e.g., MP3) and a metadata JSON file (containing the game info) under this hash.
- Add an environment toggle (`USE_LOCAL_CACHE`) to easily disable/enable caching.
- If the cache is hit, return the cached audio and metadata without hitting ElevenLabs.
- If the cache is missed, fetch from ElevenLabs, serve the response, and save it to the cache for subsequent requests.

**Non-Goals:**
- A distributed cache (e.g., Redis) or cloud storage (e.g., S3). We are using a simple local file system cache for now.
- Automatic cache invalidation or expiration. Since generated audio for a given text/location is deterministic and static, it shouldn't need expiration.

## Decisions

- **Cache Storage Location**: A directory within the project, such as `data/cache` or `.next/cache/elevenlabs`, to ensure it is ignored by git (we should update `.gitignore` if needed) but persists locally.
- **Cache Key Generation**: We will use a hashing algorithm (like SHA-256) on a normalized string combining the phrase, language, and location. This ensures consistency and avoids path-name issues with long or special characters.
- **Cache Format**: For a given hash `H`, we store `H.mp3` (the audio buffer) and `H.json` (the game generation JSON metadata returned by backboard/generate function).

## Risks / Trade-offs

- **Risk: Disk space usage** → Mitigation: Since it's a local development or small-scale deployment, disk space for a few hundred audio clips is negligible. We can manually clear the cache folder if needed.
- **Risk: Concurrency issues (two requests generating the same audio simultaneously)** → Mitigation: Simple file-write operations; we will rely on Node.js atomic file writes or just overwrite, which is fine since the generated content is identical.