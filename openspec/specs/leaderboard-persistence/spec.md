# leaderboard-persistence Specification

## Purpose
TBD - created by archiving change migrate-leaderboard-supabase. Update Purpose after archive.

## Requirements

### Requirement: Database Persistence
The system SHALL persist user high scores in a Supabase PostgreSQL database.

#### Scenario: Read paginated top scores
- **WHEN** a client requests the leaderboard data with pagination parameters
- **THEN** the system returns a paginated list of scores sorted descending with metadata including page, per_page, total_pages, and total_entries

#### Scenario: Read with default pagination
- **WHEN** a client requests the leaderboard data without pagination parameters
- **THEN** the system returns page 1 with default page size (50 entries) and full pagination metadata

#### Scenario: Request invalid page
- **WHEN** a client requests page 0 or negative page number
- **THEN** the system returns page 1 or an appropriate error response

### Requirement: Automatic Database Insertion
The system SHALL automatically upsert the score into Supabase upon game completion, explicitly linking the score to the authenticated user's session.

#### Scenario: Submitting a new high score
- **WHEN** the backend processes the final round for an authenticated user and the final score is greater than the user's previously recorded score
- **THEN** the system updates the Supabase record for that authenticated user with the new score

#### Scenario: Submitting a lower score
- **WHEN** the backend processes the final round for an authenticated user and the final score is lower than or equal to the user's previously recorded score
- **THEN** the system leaves the Supabase record unchanged
