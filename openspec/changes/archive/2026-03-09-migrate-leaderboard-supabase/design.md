## Context

Currently, the leaderboard uses a local JSON file (`leaderboard.json`) alongside an in-memory Set (`submittedSessions`) to store high scores and prevent duplicate submissions per session. This limits deployment to environments with persistent file systems, effectively ruling out serverless platforms like Vercel. Furthermore, the client controls when a score is submitted by clicking "save score to leaderboard" and the score might be manipulated before submission. By migrating to Supabase PostgreSQL, we enable serverless deployment. By auto-submitting the backend-computed score at the end of a session, we harden the application against cheating.

## Goals / Non-Goals

**Goals:**
- Persist leaderboard entries to a Supabase PostgreSQL database.
- Secure score submissions by calculating the final score on the server and automatically writing it to the database at the end of the game, rather than trusting the client.
- Simplify the UX by automatically submitting the score and replacing the "save" button with a "Play Again" button.
- Provide clear notifications to the user upon a game's completion: indicating whether it's a new personal high score or just a successful score submission.

**Non-Goals:**
- Real-time leaderboard updates using Supabase subscriptions (standard polling or refresh is sufficient).
- Complex user authentication. The system will continue to use the provided username strings to uniquely identify users in the leaderboard.
- Complete overhaul of the frontend UI beyond replacing the save button and adding notifications.

## Decisions

- **Database**: Use Supabase PostgreSQL table `leaderboard` with columns: `id` (UUID), `username` (VARCHAR, UNIQUE), `score` (INTEGER), `updated_at` (TIMESTAMP).
- **Backend Score Calculation**: The server must calculate the score for each guess and accumulate it over the session. The existing session state must track the user's progress. Once all rounds are complete, the server automatically executes the upsert operation against Supabase.
- **Supabase Client**: We will use `@supabase/supabase-js` on the Next.js API side. This hides the `SUPABASE_SERVICE_ROLE_KEY` (or similar) from the client and gives the server full rights to upsert score data. The client does not get any Supabase keys.
- **SQL Migration**: We will provide a simple `.sql` file that users can execute in their Supabase SQL editor to create the necessary schema.
- **Notifications**: The server's response upon completing the final round will include a flag (e.g., `isNewHighScore`, `isNewUser`) so the frontend can display the appropriate notification without making an extra database query itself.

## Risks / Trade-offs

- [Risk] If the final guess API call fails, the user's final score might not be recorded. -> Mitigation: Keep the frontend state in sync and allow a retry of the final submission, though auto-submission generally happens as part of the final guess validation.
- [Trade-off] Relying solely on the `username` string as a unique identifier means anyone can claim a username or overwrite its score if they perform better. This was already true in the JSON version, so we accept this for the sake of simplicity.
