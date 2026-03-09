## Why

The current leaderboard displays all entries on a single page, causing performance issues and poor UX when there are hundreds of entries (e.g., 500+ rows). Users must scroll through endless pages to find their own rank, creating frustration and slowing down the application.

## What Changes

- **Add pagination** to the leaderboard endpoint and UI, displaying entries in configurable page sizes (default: 50 entries per page)
- **Add user rank endpoint** that returns the authenticated user's personal rank and score without requiring pagination
- **Add dedicated user rank section** in the UI that always displays the user's current rank and score at the top of the leaderboard page
- **BREAKING**: The leaderboard API response structure will change to include pagination metadata (page, per_page, total_pages, total_entries)

## Capabilities

### New Capabilities
- `leaderboard-pagination`: Paginated retrieval of leaderboard entries with configurable page size and sorting
- `user-rank-lookup`: Direct lookup of an authenticated user's rank and score without scanning the full leaderboard

### Modified Capabilities
- `leaderboard-persistence`: The read operation requirement is changing from returning all scores to supporting paginated queries. The API contract will include pagination parameters and metadata.

## Impact

- **Backend**: Leaderboard API endpoint will require pagination parameters (page, per_page) and return paginated responses. New endpoint needed for user rank lookup.
- **Frontend**: Leaderboard page component needs pagination controls (next/prev, page numbers). New UI section for displaying user's personal rank.
- **Database**: Queries will use LIMIT/OFFSET or cursor-based pagination for efficiency. May need index optimization on score column.
- **Dependencies**: Supabase connection already exists; no new external dependencies required.
