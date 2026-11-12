# Session trace audit

The original walkthrough's 95–105 second frames show a versioned prompt and its rules. At 115 seconds, a dinner request switches the selected prompt and tools. At 125–135 seconds, the Agent Tracer session log shows User, System, Tool Call, Tool Result, and Assistant records. The new visualization follows that event order inside Activity details.

## Alignment

- Upgrade and dinner simulation policy names, content hashes, and selected tools come from the current backend manifest.
- Dinner has two tools in the current backend. The video's third menu tool is not present, so the simulation no longer claims it is selected.
- Both modes render one event vocabulary: request, policy selection, tool call, tool result, response.
- Simulation has labeled sample inputs/results and browser-only record IDs. It does not claim actual model inference, database persistence, or verified Agent Tracer writes.
- Live mode shows returned run/call/trace IDs and verified readback status. The guest request is now streamed and retained alongside the response.
- The latest handoff highlights as records arrive. Manual scrolling or expanding a record pauses following.

## Boundaries

This is a visual interpretation of the Tracer workflow, not a replica of the Capella console. The backend uses model-based policy selection and exact catalog lookup, not the video's illustrated vector ranking. The model can select extra tools; simulation represents the canonical supported path, not a promise that every live response will match it. Managed Memory remains disconnected.

Reference: https://docs.couchbase.com/ai/build/agent-tracer/view-traces.html
