## 1. Backend API - Pagination

- [x] 1.1 Update leaderboard API endpoint to accept page and per_page query parameters
- [x] 1.2 Implement OFFSET-based pagination logic using LIMIT and OFFSET
- [x] 1.3 Add pagination metadata to response (page, per_page, total_pages, total_entries)
- [x] 1.4 Implement maximum page size validation (cap at 100 entries per page)
- [x] 1.5 Handle edge cases: page 0, negative page, page beyond total pages

## 2. Backend API - User Rank Endpoint

- [x] 2.1 Create new endpoint GET /api/leaderboard/rank for authenticated users
- [x] 2.2 Implement rank calculation using PostgreSQL window function (RANK() OVER)
- [x] 2.3 Add authentication middleware to user rank endpoint
- [x] 2.4 Handle case where user has no recorded score (return null rank)
- [x] 2.5 Add proper error handling for unauthenticated requests (401)

## 3. Database Optimization

- [x] 3.1 Add index on score column for efficient sorting (if not exists)
- [x] 3.2 Create composite index on (score DESC, user_id) for pagination performance
- [ ] 3.3 Test query performance with 500+ entries and verify sub-100ms response times

## 4. Frontend - Pagination UI

- [x] 4.1 Update leaderboard fetch to use paginated API endpoint
- [x] 4.2 Add pagination controls: previous/next buttons and page numbers
- [x] 4.3 Implement page state management (current page, total pages)
- [x] 4.4 Add loading states during page transitions
- [x] 4.5 Handle empty state when page has no data

## 5. Frontend - User Rank Section

- [x] 5.1 Create new UserRank component for displaying personal rank
- [x] 5.2 Fetch user rank on leaderboard page load (authenticated users only)
- [x] 5.3 Style user rank section as sticky/fixed at top of leaderboard
- [x] 5.4 Add "Sign in to see your rank" message for unauthenticated users
- [x] 5.5 Handle loading and error states for rank fetch

## 6. Testing & Validation

- [ ] 6.1 Write unit tests for pagination logic (edge cases, boundary conditions)
- [ ] 6.2 Write integration tests for paginated leaderboard API
- [ ] 6.3 Write tests for user rank endpoint (authenticated, unauthenticated, no score)
- [x] 6.4 Manual testing: verify pagination with 500+ entries
- [x] 6.5 Manual testing: verify user rank accuracy across different score scenarios

## 7. Documentation & Cleanup

- [x] 7.1 Update API documentation with new pagination parameters
- [x] 7.2 Document user rank endpoint in API reference
- [x] 7.3 Add migration notes for breaking API changes
- [ ] 7.4 Remove any unused legacy leaderboard code
