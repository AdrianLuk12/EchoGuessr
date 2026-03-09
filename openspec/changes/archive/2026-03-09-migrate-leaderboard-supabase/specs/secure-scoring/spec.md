## ADDED Requirements

### Requirement: Server-Side Score Calculation
The system SHALL compute scores on the backend to prevent client-side manipulation.

#### Scenario: Validating a guess
- **WHEN** a client submits a guess for a specific location
- **THEN** the server computes the distance and awards points based on the scoring logic

### Requirement: Game Completion Notification
The system SHALL notify the client of the final result status (e.g., new high score) so the UI can update appropriately.

#### Scenario: Beating a high score
- **WHEN** the user completes the final round and their accumulated score is higher than their prior best in Supabase
- **THEN** the server includes a flag in its response indicating a new high score was achieved

#### Scenario: Replacing the manual save button
- **WHEN** the game ends
- **THEN** the client displays a "Play Again" button and does not provide an explicit "Save Score" action
