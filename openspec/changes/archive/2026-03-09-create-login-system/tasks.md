## 1. Setup and Preparation

- [x] 1.1 Create `./data/banned-words.json` and populate it with a list of banned offensive usernames.
- [x] 1.2 Verify Supabase Auth configuration and ensure environment variables for Next.js are properly loaded.

## 2. Backend Authentication API

- [x] 2.1 Implement `/api/auth/check-username` route to check if a user exists in Supabase.
- [x] 2.2 Implement `/api/auth/register` route that validates the username against `banned-words.json`, enforces an 8-character password, creates the Supabase user, and sets a secure session cookie.
- [x] 2.3 Implement `/api/auth/login` route that authenticates the user with Supabase and sets a secure session cookie.
- [x] 2.4 Implement a utility or middleware to verify the session cookie on protected API routes.

## 3. Frontend Authentication UI

- [x] 3.1 Update `WelcomeScreen.tsx` to include a dynamic form that first asks for a username.
- [x] 3.2 Add logic to `WelcomeScreen.tsx` to call `/api/auth/check-username` and determine whether to show a login password input or a register password input.
- [x] 3.3 Add frontend validation for the 8-character password requirement.
- [x] 3.4 Integrate form submission with `/api/auth/login` and `/api/auth/register`, handling errors (like banned words or wrong passwords) gracefully.
- [x] 3.5 Update app initialization logic to automatically authenticate returning users if a valid session exists.

## 4. Leaderboard & Scoring Integration

- [x] 4.1 Update `/api/game/guess` route to extract and verify the user's session token from cookies before processing the guess.
- [x] 4.2 Update `/api/game/generate` and scoring logic to link generated games and ongoing progress to the authenticated user.
- [x] 4.3 Update `/api/leaderboard` route (or relevant database insertion logic) to use the authenticated user's ID for saving high scores.
- [x] 4.4 Verify that scores are securely updated in Supabase upon game completion.