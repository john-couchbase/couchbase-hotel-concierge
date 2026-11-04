# Agent operations audit

Native Capella and official Python SDK tests, November 4, 2026. This extends the NoSQL, vector, and lexical audits. It is an exploratory learning lab, not a production benchmark.

## What actually ran

- **16 live MCP regression cases: 16 passed.** A custom local FastMCP server called native Capella Search and KV. No managed MCP deployment or paid model was involved.
- **5 additional MCP edge probes** exposed argument handling and unsupported-filter behavior.
- **15 Agent Catalog core tracing checks: 14 matched expectations; 1 documented import failed.** The unmodified `agentc-core` 1.1.5 `DBLogger` wrote to the real Capella `agent_activity.logs` collection. This is a lower-level tracing integration, not a complete Catalog installation or agent deployment.
- **3 local Catalog preflight probes** compared the installed package with documented entry points.
- Read-only Management API inventory returned HTTP 200 and **zero learning-cluster deployments** for Agent Memory, workflows, and managed MCP.

The MCP cases use fixed test inputs. They verify execution, not autonomous model tool-selection accuracy. The tracing messages are explicit fixtures, not claimed LLM generations. No test here proves Capella-hosted reasoning, managed agent orchestration, or memory extraction.

## Wins

| Capability | Verified result | Evidence |
|---|---|---|
| Live MCP retrieval | Exact list returned all 50 hotels; country aliases normalized correctly | `mcp-live-results.json` |
| Strict filters | Country, parking true/false, and combined country/pets/parking conditions held | same |
| Semantic tool | Local 384-D embedding sent to native Search with France and parking restrictions; returned source fetched through KV | same |
| Invalid operations | Missing IDs, traversal IDs, excessive limit, blank semantic question, invalid boolean, and nonexistent booking tool returned errors | same |
| No-match behavior | Mars returned zero records; quoted query-like country text was treated as a literal and returned zero | live and edge results |
| Trace persistence | User message, tool-call arguments, and tool-result payload were written and read back | `tracer-results.json` |
| Trace attribution | Explicit version, span path, session identifiers, and annotations survived persistence | same |
| Retention | Three-second trace TTL: readable immediately, absent after four seconds | same |
| Data access scope | Trace-only credential could write/read its logs but the SDK denied access to the hotel collection (`AuthenticationException`) | same |

## Losses, issues, and trade-offs

### 1. Our MCP transport was stale — fixed

The hotel wrapper still called the disabled Data API endpoint and failed DNS resolution. It now uses native Search HTTPS and SDK KV. The 16 live checks passed after the transport change. This was an integration defect in this lab, not a Couchbase search failure.

### 2. An unsupported filter can be silently ignored — unresolved in this wrapper

Calling `filter_hotels(country="France", max_price=50)` succeeded and returned six French hotels. Its applied filter contained only country. The tool does not support prices; the extra `max_price` argument was dropped by the tool validation path rather than rejected.

An agent must not describe those hotels as under $50. Follow-up hardening: reject unknown arguments and require an explicit unsupported-constraint response. Exposing a tool schema alone is not proof that all requested restrictions were enforced.

### 3. Boolean input is coerced before the Python function sees it

The MCP path accepted the string `"false"` as boolean false, and the number `1` as boolean true. This is convenient for permissive inputs but does not constitute strict input typing. Whitespace-only country became an empty term with zero results. These are observed behaviors, not security exploits.

### 4. Tracing favors application availability over guaranteed audit delivery

We forced a real duplicate-document insertion failure by reusing a trace ID. The SDK logger returned a log object, emitted a warning, and incremented `dropped_log_count`; it did not raise to the caller. The existing trace was not overwritten.

This protects the application from a logging failure, but a returned log object is not proof of persistence. Monitor dropped logs and provide whatever retry/delivery guarantees the application requires. This test covers a duplicate insertion, not an outage or broad fault-tolerance benchmark.

### 5. Logged content is not automatically redacted

A synthetic marker (`SYNTHETIC_SECRET_DO_NOT_USE`, not a real secret) was stored unchanged in user content. Application-side logging policy and redaction matter. TTL worked when explicitly configured; do not mistake TTL for automatic redaction or memory governance.

### 6. Documentation and package interface differ

With `agentc==1.1.5`:

- The documented `from agentc import tool` raised `ImportError`; `from agentc.catalog import tool` worked.
- `Catalog.get_item` was absent; `Catalog.find` was present.
- Omitting `conn_root_certificate` from TLS configuration raised a validation error. Supplying Capella's public CA certificate allowed the native tracing tests to run. The docs describe that parameter as optional.

These are reproducible onboarding mismatches against the [official integration page](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html), not evidence that the whole Catalog is broken. Full catalog initialization, publication, version switching, semantic tool discovery, and framework adapters remain untested.

### 7. Laptop and wrapper overhead are visible

Exact MCP calls in this small sequential sample took roughly 0.62–1.03 seconds end to end. The first semantic call took 4.45 seconds including local embedding initialization; first source hydration took 1.94 seconds including SDK startup. Trace write-plus-read pairs took roughly 0.16–0.34 seconds in the recorded run.

The wrapper starts a curl process and establishes an HTTPS connection per Search call. These are client observations over a WAN, not pure Couchbase service latency or warmed throughput measurements. A persistent client and warm embedding model are reasonable next comparisons.

## Remaining capability coverage

| Area | Current evidence | Next meaningful test / prerequisite |
|---|---|---|
| Full Agent Catalog | Native core tracing and local API preflight only | Initialize/index/publish a small versioned catalog, then retrieve tool and prompt versions; compatible Git/runtime setup needed |
| Managed MCP | No deployment; prior deployment attempt failed and was removed | Confirm supported plan/configuration and price before another deployment; do not count local MCP as managed |
| Agent Memory | Inventory only; no server | Actual ingestion/extraction, contradictory facts, user isolation, annotation filters, TTL, and deletion. Managed deployment requires an OpenAI integration per current [docs](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html) |
| Model Service | Previous inventory; no successful authenticated generation established by this audit | One bounded generation with a working model-specific key, then tool calling and structured output |
| Exact/semantic cache | Not exercised | Hit/miss, paraphrase false positives, stale answers, TTL and tenant separation on an actual configured service. [Value Adds docs](https://docs.couchbase.com/ai/build/model-service/configure-value-adds.html) describe model deployment dependencies and an embedding model for semantic cache |
| Guardrails/keyword filtering | Not exercised | Benign vs blocked prompts, paraphrase bypasses, false positives; a working configured model endpoint is required |
| Ingest & Embed / workflows | Zero workflows in learning cluster | Small document ingestion, chunking, update/delete propagation, idempotency, and error recovery after integration/cost checks |
| Eventing / Functions | Not exercised | Native document-change trigger and retries with an available Eventing service; do not emulate with a polling script and call it Eventing |
| Operational Insights / distributed scaling | Not exercised | Separately priced deployment and representative multi-node workload; outside this small single-node run |

Zero deployments means untested, not unsupported. Database TTL and stored JSON are not substitutes for testing the Agent Memory product. Likewise, synthetic embeddings do not demonstrate managed vectorization quality.

## Reproduction and budget

Scripts and sanitized raw outputs are included here and in the archive. Credentials must be supplied privately in the referenced local files; none are included. Public CA is not bundled; retrieve it from your Capella cluster. The native endpoint placeholders in published helpers must be replaced with your own learning cluster.

Use Python 3.12 with `agentc==1.1.5`, Couchbase SDK, `mcp<2`, fastembed, and truststore as appropriate. The hotel semantic tool needs its cached `BAAI/bge-small-en-v1.5` model and the existing hotel Search index. These tests assume the learning dataset and scopes from earlier audits. The scripts are not a one-command installer.

No new paid deployment, resize, or paid model call was made. Existing hardware was resumed briefly and confirmed paused afterward. The activation-to-confirmed-pause window was 5.87 minutes, approximately $0.035 at the previously observed $0.36/hour rate (compute estimate only). See `budget-cleanup.json` for final verified state and estimated active-window cost. The $30 budget is cumulative. Invoice totals remain unverified because billing access was previously denied and usage reporting can lag. Retained storage continues to cost money while paused.
