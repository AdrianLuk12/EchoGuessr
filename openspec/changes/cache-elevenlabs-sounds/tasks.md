## 1. Setup

- [x] 1.1 Add `USE_LOCAL_CACHE=true` to `.env.example` and `.env` (if exists locally).
- [x] 1.2 Update `.gitignore` to ignore the cache directory (e.g., `data/cache/` or `.next/cache/elevenlabs/`).

## 2. Core Implementation

- [x] 2.1 Create a utility module (e.g., `src/lib/cache.ts`) for hashing input parameters (phrase, language, location) to a unique key (e.g., using `crypto` SHA-256).
- [x] 2.2 Implement cache read functionality in the utility module to check if the audio and metadata files exist for a given key and return them.
- [x] 2.3 Implement cache write functionality in the utility module to save an audio buffer and metadata object to the file system using the generated key.
- [x] 2.4 Update `src/app/api/game/generate/route.ts` to check `USE_LOCAL_CACHE`.
- [x] 2.5 If `USE_LOCAL_CACHE` is enabled, generate the cache key and attempt to read from the cache before calling ElevenLabs.
- [x] 2.6 If a cache hit occurs, return the cached data immediately.
- [x] 2.7 If a cache miss occurs (or `USE_LOCAL_CACHE` is disabled), proceed with the standard ElevenLabs generation.
- [x] 2.8 After successful ElevenLabs generation, if `USE_LOCAL_CACHE` is enabled, write the new audio buffer and metadata to the cache before returning the response to the client.