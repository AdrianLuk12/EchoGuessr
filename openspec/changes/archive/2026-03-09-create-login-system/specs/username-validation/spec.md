## ADDED Requirements

### Requirement: Offensive Username Filtering
The system SHALL reject any registration attempt where the requested username contains any word listed in the local banned words dictionary.

#### Scenario: Banned word in username
- **WHEN** a user attempts to register a username containing a word from `./data/banned-words.json`
- **THEN** the backend API rejects the registration with an appropriate error message and does not create an account

#### Scenario: Clean username
- **WHEN** a user attempts to register a username with no banned words
- **THEN** the backend API proceeds with the registration process