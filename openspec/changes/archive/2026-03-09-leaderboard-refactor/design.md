## Context

The current leaderboard implementation fetches and renders all entries in a single request, causing:
- Slow page load times with large datasets (500+ entries)
- Excessive memory usage on client side
- Poor UX as users must scroll to find their rank
- No efficient way to query "where am I?" in the rankings

This design addresses the pagination and user rank lookup features outlined in the proposal.

## Goals / Non-Goals

**Goals:**
- Implement server-side pagination for leaderboard queries (default 50 entries/page)
- Add dedicated endpoint for authenticated users to fetch their personal rank instantly
- Update frontend to display paginated leaderboard with navigation controls
- Add persistent user rank section at top of leaderboard page
- Maintain backward compatibility where possible (graceful degradation for unauthenticated users)

**Non-Goals:**
- Real-time leaderboard updates (WebSocket/polling) - future enhancement
- Filtering by time period (all-time vs weekly vs daily) - future enhancement
- Leaderboard caching layer - can be added later if performance requires

## Decisions

### Decision 1: OFFSET-based vs Cursor-based Pagination
**Chosen: OFFSET-based pagination**

**Rationale:**
- Simpler to implement with existing Supabase setup
- Adequate for leaderboard use case where users typically browse first few pages
- Easy to implement "jump to page N" navigation
- Supabase/PostgreSQL handles OFFSET efficiently with proper indexing

**Alternatives Considered:**
- Cursor-based (keyset) pagination: Better for deep pagination but more complex; unnecessary since users rarely go beyond page 10-20
- Infinite scroll: Could work but conflicts with "find my rank" use case; pagination provides clearer mental model

### Decision 2: User Rank Query Strategy
**Chosen: Window function with COUNT and POSITION**

**Rationale:**
- Single query to get user's rank without scanning entire table
- PostgreSQL window functions (RANK() or ROW_NUMBER()) are efficient
- Can combine with existing score lookup in one query

**Query Pattern:**
```sql
SELECT 
  user_id,
  score,
  RANK() OVER (ORDER BY score DESC) as rank
FROM leaderboard 
WHERE user_id = authenticated_user_id
```

### Decision 3: API Response Structure
**Chosen: Envelope pattern with metadata**

**Rationale:**
- Clear separation of pagination metadata and data
- Standard pattern familiar to frontend developers
- Allows future extensibility (add filters, sort options)

**Response Format:**
```json
{
  "data": [...entries],
  "meta": {
    "page": 1,
    "per_page": 50,
    "total_pages": 10,
    "total_entries": 500
  }
}
```

### Decision 4: User Rank Section Placement
**Chosen: Fixed/sticky section above paginated table**

**Rationale:**
- Always visible regardless of scroll position
- Doesn't interfere with leaderboard browsing
- Clear visual hierarchy: "Your Rank" → "Top Players"

## Risks / Trade-offs

**[Risk] OFFSET performance degradation on deep pages** → Mitigation: Set reasonable max page limit (e.g., 100 pages); most users won't need page 100+. Consider cursor-based pagination if this becomes a problem.

**[Risk] Rank calculation overhead on every user-rank query** → Mitigation: Add computed/cached rank column updated on score changes; or use materialized view refreshed periodically. Start with direct calculation, optimize if needed.

**[Trade-off] Breaking change to API response structure** → Mitigation: Version the API endpoint (`/api/leaderboard/v2`) or add query param (`?format=paginated`) for gradual migration.

**[Risk] Unauthenticated users cannot see personal rank** → Mitigation: Graceful degradation - show "Sign in to see your rank" message in user rank section.

## Open Questions

- What should the default page size be? (Proposed: 50, configurable via env)
- Should we cache user rank for X minutes to reduce DB queries?
- Do we need rate limiting on the user-rank endpoint?
