# leaderboard-persistence Delta Specification

## MODIFIED Requirements

### Requirement: Read Top Scores
The system SHALL return paginated leaderboard data when queried, including pagination metadata.

#### Scenario: Read paginated top scores
- **WHEN** a client requests the leaderboard data with pagination parameters
- **THEN** the system returns a paginated list of scores sorted descending with metadata including page, per_page, total_pages, and total_entries

#### Scenario: Read with default pagination
- **WHEN** a client requests the leaderboard data without pagination parameters
- **THEN** the system returns page 1 with default page size (50 entries) and full pagination metadata

#### Scenario: Request invalid page
- **WHEN** a client requests page 0 or negative page number
- **THEN** the system returns page 1 or an appropriate error response
