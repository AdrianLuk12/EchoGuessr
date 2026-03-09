## Why

Users currently have no secure authentication and can use any username. This leads to impersonation and unverified users on the leaderboard. Implementing a proper login system with Supabase allows for authenticated, secure user sessions and improves platform integrity.

## What Changes

- Replace open username input with a structured registration and login flow.
- Integrate Supabase Authentication for secure credential management.
- Add password creation for new usernames and password verification for existing ones.
- Require passwords to be at least 8 characters long, validated on both frontend and backend.
- Persist session data in local storage so users don't need to re-login constantly on the same device.
- Add a banlist for offensive usernames located in `./data/`, rejecting any registration containing banned words.
- Route all authentication and registration actions through the Next.js backend API rather than calling Supabase directly from the client.

## Capabilities

### New Capabilities
- `user-auth`: Covers user registration, login, password validation, and session persistence using Supabase.
- `username-validation`: Covers the rejection of offensive usernames based on a local banlist.

### Modified Capabilities
- `leaderboard-persistence`: Update to associate leaderboard entries with authenticated users instead of arbitrary unverified usernames.
- `secure-scoring`: Update to ensure scores are tied to the authenticated session.

## Impact

- Changes to the Next.js API routes to handle authentication requests securely.
- Changes to the frontend screens (e.g., `WelcomeScreen`) to include password input forms and manage login state.
- Integration with Supabase Auth services.
- Need for a new `./data/banned-words.json` or similar file to hold the offensive username list.