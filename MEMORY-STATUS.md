# Agent Memory: untested status and packaging concern

Updated November 4, 2026. This is a setup finding and learning note, not a memory-performance result.

## Verified test status

**Actual Agent Memory has not been tested.** We have no evidence yet for extraction quality, recall across sessions, handling changed preferences, or conflicting memories. Earlier database TTL and Agent Catalog tracing tests do not test Agent Memory.

The learning-cluster Management API returned zero Agent Memory deployments. Its deployment check reported the paused cluster as ineligible with reason `unhealthy`; this is not evidence of a fault in a running cluster. The installed Python client is `couchbase-agent-memory` 1.1.0, but installing a client does not deploy the service.

The account contains shared OpenAI integrations. No shared key was used for these tests. The user explicitly wants a company-approved billing connection and does not want to use a personal key. An approved company OpenAI integration is still needed for the managed path. No memory deployment or memory model call was made. The deployment price and exact remaining cumulative budget have not been verified; the itemized billing request returned HTTP 403. The $30 limit remains cumulative, not a fresh allowance per test.

## Whose memory is it?

This is **Couchbase Agent Memory**, not ChatGPT memory or an OpenAI-hosted memory store. For the current managed deployment, OpenAI models provide embeddings and language processing; Couchbase supplies the memory service and underlying storage. The application sends the interactions it wants remembered and requests memories later. It does not inherit anyone's ChatGPT conversations.

Current [Couchbase documentation](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html) distinguishes managed Agent Memory, using OpenAI integrations, from self-managed Agent Memory, which supports an OpenAI-compatible embedding model and LLM. Self-managed operation adds infrastructure and operational work; it is not automatically free.

## Are all the components required?

No. The AI Data Plane is a product family of cooperating capabilities, not a mandatory sequence of separately invoked layers.

- An application can query Couchbase through an SDK or API without MCP or Agent Memory.
- MCP is a standard interface for exposing tools to an AI application. It is not a model, memory store, login mechanism, or inherently a per-call paid service. Running a managed MCP server can have infrastructure/service costs; local hosting also has operational costs.
- Agent Memory is optional persistent context for applications that need it. A stateless retrieval application can omit it. Developers can also build their own memory logic, accepting that implementation and maintenance work.
- The application's reasoning model and the models used to process memory have different jobs. They do not necessarily require two separately hosted dedicated models, but additional model requests may occur.
- Tracing and access controls address observability and permissions. They do not automatically require another generative model call for every operation.

## User concern: integration feels fragmented

The user's concern is that an offering presented under one umbrella requires separate provider credentials, service configuration, and potentially multiple cost centers before a basic memory demo works. That is a genuine onboarding observation from this lab. It is **not yet evidence that the finished system is expensive or uncompetitive**.

Potential benefit of modularity: adopt only needed capabilities, reuse an existing database or provider account, and retain application/framework choice. Potential cost: more setup, permissions, billing ownership, troubleshooting boundaries, and responsibility for coordinating services.

An integrated product experience can still contain multiple internal components. A simpler guided setup or bundled sandbox could reduce customer friction without making every capability mandatory. This is a product-experience opportunity, not a claim about Couchbase's internal reasons for its architecture.

## Cost questions to resolve before a live test

Account for the database compute/storage, Agent Memory service compute, embedding/extraction requests, application reasoning requests, and any optional managed MCP deployment. Do not assume every component is invoked on every user turn or that all costs scale the same way. Measure cost per stored interaction and per later recall, plus idle cost, using an actual approved deployment and observed billing.

Requested follow-up tests remain: store a preference; retrieve it through differently worded questions and a new session; add a contradictory newer statement; separately update the original block; check whether old and new facts coexist; inspect timestamps; test deletion, TTL, and user isolation. No outcomes are claimed until these run against the actual service.
