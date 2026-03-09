## MODIFIED Requirements

### Requirement: Server-Side Score Calculation
The system SHALL compute scores on the backend to prevent client-side manipulation, verifying the authenticated session token for every guess.

#### Scenario: Validating a guess
- **WHEN** an authenticated client submits a guess for a specific location with a valid session
- **THEN** the server computes the distance, awards points based on the scoring logic, and associates the progress with the user's session

#### Scenario: Unauthenticated guess
- **WHEN** a client submits a guess without a valid session token
- **THEN** the server rejects the request with an authentication error