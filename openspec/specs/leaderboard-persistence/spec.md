# leaderboard-persistence Specification

## Purpose
TBD - created by archiving change migrate-leaderboard-supabase. Update Purpose after archive.
## Requirements
### Requirement: Database Persistence
The system SHALL persist user high scores in a Supabase PostgreSQL database.

#### Scenario: Read top scores
- **WHEN** a client requests the leaderboard data
- **THEN** the server returns a list of top scores sorted descending

### Requirement: Automatic Database Insertion
The system SHALL automatically upsert the score into Supabase upon game completion.

#### Scenario: Submitting a new high score
- **WHEN** the backend processes the final round and the final score is greater than the user's previously recorded score
- **THEN** the system updates the Supabase record for that user with the new score

#### Scenario: Submitting a lower score
- **WHEN** the backend processes the final round and the final score is lower than or equal to the user's previously recorded score
- **THEN** the system leaves the Supabase record unchanged

