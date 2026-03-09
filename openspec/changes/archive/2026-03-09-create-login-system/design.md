## Context

The current application lacks authentication; users simply enter a username which isn't verified or protected. This presents a problem for maintaining accurate leaderboards and securing user scores. We want to implement a login system using Supabase, which currently might be used for the leaderboard. The login logic has specific requirements: a single input field or flow that checks if the username exists; if it does, it prompts for a password, and if not, it prompts to create an account with an 8-character password. All auth logic must route through the Next.js API, and sessions must be persisted locally. A list of offensive words will be used to ban inappropriate usernames.

## Goals / Non-Goals

**Goals:**
- Implement Supabase Auth integrated with a Next.js backend API.
- Support seamless registration and login through a unified flow (check username existence, then password).
- Reject registration of usernames containing banned offensive words.
- Securely store and persist sessions on the client side (e.g., using secure cookies or local storage) to avoid constant re-login.
- Update leaderboard functionality to link scores to authenticated Supabase users.

**Non-Goals:**
- Implementing OAuth or third-party login providers (e.g., Google, GitHub).
- Email verification or password reset flows (for now, simple username/password).
- Complex user profiles beyond basic username registration.

## Decisions

**1. Authentication Flow:**
*Decision:* A unified login/registration component that first submits the username to an API endpoint (`/api/auth/check-username`). If the user exists, the frontend transitions to a "login" state requiring a password. If not, it transitions to a "register" state requiring an 8-character password.
*Rationale:* This matches the user's specific request for the UI flow and abstracts Supabase away from the frontend.

**2. Next.js API Routes for Auth:**
*Decision:* All Supabase Auth operations (`signUp`, `signInWithPassword`) will happen within `/api/auth/*` route handlers in Next.js. The client calls these endpoints.
*Rationale:* Ensures sensitive credentials and logic are kept server-side, adhering to the requirement "All actions should be routed through the nextjs backend".

**3. Banned Username Validation:**
*Decision:* Create a `banned-words.json` in `./data/`. The `/api/auth/register` route will load this JSON and perform a case-insensitive substring check on the requested username before proceeding with Supabase registration.
*Rationale:* Simple, fast, and meets the requirement to reject offensive usernames on the backend.

**4. Session Persistence:**
*Decision:* Use Supabase's built-in session management with a custom storage adapter or simply rely on cookies set by the Next.js API, which naturally persists sessions in the browser. Since the Next.js server needs to verify the user for API calls (like saving a score), we will return a session token/cookie to the client that is stored and sent with subsequent requests.
*Rationale:* Fulfills the "Store information on local storage" requirement securely, allowing for seamless device-level persistence while keeping the backend authenticated.

## Risks / Trade-offs

- **[Risk] Username uniqueness:** If multiple users try to register the same username concurrently, there might be a race condition.
  **Mitigation:** The database should enforce unique usernames. Supabase can handle this via unique constraints or relying on email fields (if mapped to usernames).
- **[Risk] Supabase Email Requirement:** Supabase Auth requires an email by default.
  **Mitigation:** We can generate a dummy email (e.g., `[username]@echoguessr.local`) under the hood to satisfy Supabase Auth while only exposing the username to the user, or configure Supabase to allow phone/custom auth, but dummy email is easiest out of the box.