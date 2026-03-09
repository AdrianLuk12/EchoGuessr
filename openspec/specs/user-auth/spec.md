# user-auth Specification

## Purpose
TBD - created by syncing change create-login-system. Update Purpose after archive.
## Requirements
### Requirement: User Registration
The system SHALL allow users to register a new account by providing a unique username and an 8-character minimum password via the backend API.

#### Scenario: Successful Registration
- **WHEN** a user submits a valid new username and an 8-character minimum password to the registration endpoint
- **THEN** the system creates a new user account in Supabase and returns a successful authentication session

### Requirement: User Login
The system SHALL allow users with existing accounts to authenticate using their username and password via the backend API.

#### Scenario: Successful Login
- **WHEN** a user submits their existing username and correct password to the login endpoint
- **THEN** the system authenticates the user with Supabase and returns a valid session

### Requirement: Session Persistence
The system SHALL securely persist the user session so the user remains logged in across browser sessions.

#### Scenario: Returning User
- **WHEN** a user reopens the application after previously logging in
- **THEN** the client reads the persisted session cookie/token and authenticates the user without prompting for credentials
