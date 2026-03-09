# leaderboard-pagination Specification

## Purpose

Defines the pagination behavior for leaderboard queries, allowing clients to retrieve leaderboard entries in manageable pages rather than fetching all entries at once.

## Requirements

### Requirement: Paginated Leaderboard Query
The system SHALL support paginated queries for leaderboard entries with configurable page size.

#### Scenario: Request first page of leaderboard
- **WHEN** a client requests the leaderboard with page=1 and per_page=50
- **THEN** the system returns the top 50 scores sorted by score descending

#### Scenario: Request subsequent page
- **WHEN** a client requests the leaderboard with page=2 and per_page=50
- **THEN** the system returns entries 51-100 sorted by score descending

#### Scenario: Request with custom page size
- **WHEN** a client requests the leaderboard with page=1 and per_page=25
- **THEN** the system returns exactly 25 entries (or fewer if total entries < 25)

#### Scenario: Request page beyond available data
- **WHEN** a client requests a page number that exceeds total available pages
- **THEN** the system returns an empty data array with valid pagination metadata

#### Scenario: Default pagination parameters
- **WHEN** a client requests the leaderboard without page or per_page parameters
- **THEN** the system returns page 1 with default page size of 50 entries

### Requirement: Pagination Metadata Response
The system SHALL include pagination metadata in every leaderboard response.

#### Scenario: Include page information
- **WHEN** the system returns paginated leaderboard data
- **THEN** the response includes current page number and per_page value

#### Scenario: Include total counts
- **WHEN** the system returns paginated leaderboard data
- **THEN** the response includes total_entries count and total_pages count

### Requirement: Maximum Page Size Limit
The system SHALL enforce a maximum page size to prevent excessive data retrieval.

#### Scenario: Request within limit
- **WHEN** a client requests per_page=100 and max is 100
- **THEN** the system returns 100 entries

#### Scenario: Request exceeds limit
- **WHEN** a client requests per_page=500 but max is 100
- **THEN** the system caps per_page at 100 and returns maximum 100 entries
