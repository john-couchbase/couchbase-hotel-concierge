# Decision trace implementation plan

Goal: Connect guest decisions to policies, executed tools, returned evidence and verified Couchbase trace records.
Architecture: Preserve chat and existing activity layout. Add a compact expandable trace inspector, fed by the same live events, with a separately labeled simulation adapter. Do not invent model reasoning or semantic ranking scores.

- [x] Expose run IDs, timestamps and per-event trace readback status without credentials. Test saved/failed trace metadata and history preservation.
- [x] Record candidate policy descriptions and selected IDs. Explain selection as observable routing, not private reasoning or confidence scores.
- [x] Add a responsive inspector with Policy, Tools, Results and Trace stages; show selection versus execution, arguments/results, and saved record references on demand.
- [x] Connect local simulation and live streams; preserve manual inspection during updates and distinguish simulation records.
- [x] Test selection, trace failures, repeated calls and switching requests. Check desktop/phone and publish after the approved live backend verification.
