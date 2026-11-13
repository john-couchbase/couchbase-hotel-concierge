# Hotel backend walkthrough

Local presentation update. Not deployed.

The activity sequence now covers meaning grouping, catalog selection, a prompt record, calls and the decision, animated trace events, and an SQL++ query preview. Opening a stage manually stops automatic stage advancement. Starting another request cancels the prior presentation timers.

## Evidence boundaries

- The available catalog contains the 12 application contracts in tool-manifest.js, not the reference video's 50.
- Word grouping and relevance bars are explanatory illustrations, not embedding calculations or hidden model reasoning.
- Prompt JSON is a presentation of public policy content, its content hash, and selected tool bindings. It is not a verbatim remote catalog export.
- Trace roles match lib/integrations.py: request is UserContent, selection is SystemContent, tool starts/results use ToolCallContent/ToolResultContent, and replies use AssistantContent.
- Live trace payloads retain backend persistence verification. Simulation payloads remain labeled browser samples.
- Query results are computed locally from captured Running tool events. The displayed SQL++ accepts the same events as an array parameter. No cluster query is executed, and no database connection success is implied.

## Validation

- Trace contract tests pass.
- Backend-story tests cover repeated calls, excluding returned/failed duplicate events, empty runs, policy versions, and selected bindings.
- Browser checks: upgrade prompt record, animated trace, query preview returning three one-call rows; dinner catalog selects hours and reservation tools; phone query controls and bounded content.
- No live model calls or Capella changes were made for this presentation update.
