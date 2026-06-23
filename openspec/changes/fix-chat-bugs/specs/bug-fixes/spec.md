## ADDED Requirements

### Requirement: Momentum scroll updates follow state

The auto-scroll system SHALL update `userScrolledAwayRef` when momentum scroll ends, not only on drag end.

#### Scenario: User flicks up from near bottom
- **WHEN** user drags from near bottom and releases, then momentum carries list upward past the threshold
- **THEN** `userScrolledAwayRef` SHALL be set to true, scroll-to-bottom arrow SHALL appear, and auto-follow SHALL stop

### Requirement: Error boundary has retry limit

The `ChatErrorBoundary` SHALL limit automatic reset attempts to a maximum of 3 within a cooldown window.

#### Scenario: Recurring MessageRepository error
- **WHEN** a MessageRepository error occurs more than 3 times consecutively
- **THEN** the boundary SHALL stop auto-resetting and display a fallback error message

### Requirement: Reasoning cache is cleaned after use

The `reasoningCache` SHALL delete entries after they are injected into a request body.

#### Scenario: Reasoning injected for tool call continuation
- **WHEN** `injectReasoningContent` matches and injects a cached reasoning entry
- **THEN** the matched cache entry SHALL be deleted immediately

### Requirement: Failed responses are consumed on retry

The `customFetch` retry logic SHALL consume or cancel the response body of failed requests before retrying.

#### Scenario: 500 error triggers retry
- **WHEN** a request returns status >= 500 and a retry will be attempted
- **THEN** `res.body.cancel()` SHALL be called before the next attempt

### Requirement: Reasoning part auto-expands on completion

The `ReasoningPart` component SHALL automatically expand when thinking completes, preserving the content the user was reading.

#### Scenario: AI finishes thinking
- **WHEN** reasoning status changes from `running` to complete and text content exists
- **THEN** the expanded state SHALL be set to true automatically
