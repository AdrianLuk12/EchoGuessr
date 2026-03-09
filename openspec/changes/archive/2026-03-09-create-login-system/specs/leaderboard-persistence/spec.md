## MODIFIED Requirements

### Requirement: Automatic Database Insertion
The system SHALL automatically upsert the score into Supabase upon game completion, explicitly linking the score to the authenticated user's session.

#### Scenario: Submitting a new high score
- **WHEN** the backend processes the final round for an authenticated user and the final score is greater than the user's previously recorded score
- **THEN** the system updates the Supabase record for that authenticated user with the new score

#### Scenario: Submitting a lower score
- **WHEN** the backend processes the final round for an authenticated user and the final score is lower than or equal to the user's previously recorded score
- **THEN** the system leaves the Supabase record unchanged