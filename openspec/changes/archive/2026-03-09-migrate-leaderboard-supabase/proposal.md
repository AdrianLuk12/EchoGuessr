## Why

The current leaderboard system relies on a local JSON file for data persistence. This approach does not scale or work in a serverless environment (like Vercel or AWS Lambda) because the filesystem is ephemeral and stateless. Furthermore, the current system is vulnerable to cheating since scores might be submitted directly from the client. Migrating to Supabase provides a robust, persistent database solution for leaderboards, while calculating scores on the backend prevents artificial score injection. 

## What Changes

- **BREAKING**: Replaced local JSON file-based leaderboard persistence with a Supabase PostgreSQL database.
- **BREAKING**: Removed "save score to leaderboard" button. Scores are now automatically submitted to Supabase after the user's game finishes.
- Added a "Play Again" button in place of the save score button.
- Score calculation is moved entirely to the backend (`Next.js API route`) to prevent client-side score manipulation.
- Actions interacting with Supabase are done exclusively through Next.js API routes to hide Supabase API keys from the client.
- Added UI notifications to indicate whether a newly submitted score beat the user's previous high score or if it's a new entry.
- Provided SQL migration scripts to set up the necessary Supabase tables.
- Updated `README.md` and `.env.example` with Supabase configuration instructions.

## Capabilities

### New Capabilities
- `leaderboard-persistence`: Defines the requirements for storing and retrieving leaderboard scores securely using Supabase.
- `secure-scoring`: Defines the requirements for calculating user scores securely on the backend and preventing artificial injection.

### Modified Capabilities


## Impact

- **Affected Code**: `src/lib/leaderboard.ts` (replaced), game API routes (e.g., `src/app/api/game/guess/route.ts`), UI components (`LeaderboardScreen`, `ResultScreen`).
- **APIs**: New or updated Next.js API endpoints to handle secure scoring and leaderboard fetching.
- **Dependencies**: Added `@supabase/supabase-js`.
- **Systems**: Requires a Supabase instance and environment variables.
