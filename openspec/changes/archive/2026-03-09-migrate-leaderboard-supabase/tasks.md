## 1. Setup & Configuration

- [x] 1.1 Add `@supabase/supabase-js` to project dependencies
- [x] 1.2 Update `.env.example` and `README.md` with Supabase environment variables
- [x] 1.3 Create a `supabase.sql` file containing the table schema creation script

## 2. Backend Data Layer

- [x] 2.1 Refactor `src/lib/leaderboard.ts` to initialize the Supabase client and implement new database read/write functions

## 3. Backend API Update

- [x] 3.1 Update `src/app/api/leaderboard/route.ts` to fetch leaderboard data using the new Supabase logic
- [x] 3.2 Update `src/app/api/game/guess/route.ts` to securely track and compute scores over the session
- [x] 3.3 Ensure the final guess API call automatically submits the total score to Supabase and returns notification status flags (e.g., `isNewHighScore`)

## 4. Frontend Update

- [x] 4.1 Update `LeaderboardScreen` to render data from the refactored API
- [x] 4.2 Update `ResultScreen` to remove the explicit "save score to leaderboard" button and add a "Play Again" button
- [x] 4.3 Update `ResultScreen` to display a notification if a new high score was reached based on the API response flags
