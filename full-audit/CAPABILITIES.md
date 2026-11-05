# Capability and SDK review

November 5, 2026. **Documented** means a primary source describes a capability; it does not mean we tested it. **Prior live** refers to the bounded November 3–4 learning labs. **Offline** means package inspection or local method execution with mocked services.

## What the platform gives an application

| Area | Available path / useful controls | Evidence and practical limit | Marketing implication |
|---|---|---|---|
| Operational JSON data | KV by ID, SQL++ predicates/joins/arrays, indexes, CAS, subdocuments, transactions and TTL | Prior live NoSQL lab: 55 checks; a primary scan at 1m documents timed out while a covering query was much faster. This is one workload, not universal performance | Show how schema flexibility and index design affect the same business app |
| Lexical search | Analyzers, stop words, stemming, synonyms, phrase/term/range queries and scoring | Prior live fixtures showed stop-word removal can destroy important terms; synonyms need curation. Earlier `tfidf` rejection used the wrong spelling; `tf-idf` still needs a corrected live retest | Teach exact identifiers versus analyzed text before blending vectors |
| Search vector index | Search-service vector retrieval combined with text/geo; explicit prefilters and per-query tuning | Current architecture documents automatic Flat/IVF choices and quantization by segment size/optimization. Do not assume universal HNSW graph settings | Name the engine and version when explaining a knob |
| Composite vector index | SQL++ vector retrieval combined with scalar indexes and predicates | Prior native scale tests; filter correctness and recall are separate measures | Use a selective operational-filter example |
| Hyperscale vector index | Disk-oriented vector indexing; dimensions, metric, centroids and quantization configuration | Prior 10k/50k synthetic tests exposed recall trade-offs and reproducible SQ8 anomalies. No billion-vector or RAM-exhaustion test was performed | Present equal-quality trade-offs, not a universal speed claim |
| Embeddings | Application-supplied vectors or managed/external model workflows | Same model/compatible embedding space required for document and query embeddings; dimensions and metric must match index configuration | Explain embedding model choice separately from generation model choice |
| Hybrid retrieval | Search-service text/vector combinations and adapter-specific APIs | Prior eight mandatory-country checks passed; public sample and adapter-switch risks remain. Union ranking is not a mandatory eligibility filter | Show both ranking and eligibility in the demo |
| Sparse / multivector / reranking | Some behavior can be assembled in application/framework code | Native learned-sparse, late-interaction and fusion coverage was not conclusively established in this review | PM should classify native, integrated, application-built and unsupported instead of letting readers infer |
| Model Service | Serverless token-billed models or provisioned GPU-backed models; regional Model Service keys | Documented mode differences; no successful hosted generation established by the retained audit evidence | “Managed” and “serverless” are not synonyms for every component |
| Vectorization workflows | Structured/unstructured sources, chunking, embeddings, metadata and Eventing-backed processing | Documented; not live tested. Credential and metadata changes can require recovery/recreation | Show update/delete freshness and failed ingestion, not only first load |
| MCP | Self-hosted tools over stdio/HTTP or separately managed deployment | Prior custom hotel MCP tested retrieval, not the current official managed service. Agent chooses tools; MCP supplies protocol/tool access | Separate discovery, permissions and execution from reasoning |
| Catalog / Tools Hub / Prompts Hub | Versioned discovery and inspection of tool/prompt artifacts | Local package mismatch reproduced; Hub guides exist. Full publish/discover lifecycle not run | Repair the starting path, then show a version change |
| Tracer / auditing | Instrumented application spans; SQL++ inspection; separate MCP 1.1 audit logs | Prior native DBLogger persisted traces and TTL; dropped logs and unredacted fixtures observed. Current MCP audit defaults differ | No claim that every event is automatically captured or that recording proves correctness |
| Agent Memory | User/session storage, recall, annotations, prompts, update/delete/TTL, monitoring | SDK validation inspected; actual extraction, corrections, isolation and net cost not tested | A recipe and measured baseline are needed to justify adoption |
| Cache | Standard/semantic/conversational options depend on deployment | Documented; false hits, freshness and net savings untested | Cache hit rate alone is not success |
| Guardrails | Supported provisioned-model content/jailbreak controls | Documented; not an authorization system or tested guarantee | Show false positives and misses separately from data-access controls |
| SQL++ AI Functions | Call supported models from bounded SQL++ workflows | Documented plan/topology/model prerequisites; no live evaluation | State rows processed, retries and model charges |
| Operational Insights | Separate analytical deployment and SDK paths | Enterprise uses Operational Insights SDKs; Capella uses Columnar SDKs. MCP 1.1 Insights support is self-managed only | A single SDK/connection instruction is insufficient |
| Mobile / edge | Lite local vector search with platform-specific Enterprise extension | Documentation only; no device/offline/sync test | Local retrieval does not establish offline hosted-model or memory availability |

Sources: [operational SDKs](https://docs.couchbase.com/home/sdk.html), [Search architecture](https://docs.couchbase.com/server/current/vector-search/vector-search-index-architecture.html), [Search tuning](https://docs.couchbase.com/server/current/vector-search/fine-tune-vector-search.html), [vector index choices](https://docs.couchbase.com/server/current/vector-index/vectors-and-indexes-overview.html), [Hyperscale guide](https://docs.couchbase.com/server/current/vector-index/hyperscale-vector-index.html), [model modes](https://docs.couchbase.com/ai/build/model-service/model-service.html), [AI index](https://docs.couchbase.com/llms-ai-data-plane.txt), [Insights SDK selector](https://docs.couchbase.com/home/operational-insights-sdk.html), [Lite vector guide](https://docs.couchbase.com/couchbase-lite/current/swift/vector-search.html).

## SDK coverage and differences

| SDK / integration | Checked in this audit | What is available / finding | Limit |
|---|---|---|---|
| Python operational | Overview/vector guide, snippet parsing; earlier native SDK tests | Query + Search routes; two broken Query code blocks | No exhaustive SDK method/security audit |
| Java, .NET, Node.js, Go | Overview and vector guides | Query + Search entry points; Hyperscale example displays a record lookup | Not compiled or run |
| Scala, PHP, Ruby, C++ | Overview and vector guides | Same mislabeled lookup pattern | Not compiled or run |
| Kotlin | Overview and vector HTML | JVM alignment and vector entry point reviewed | Markdown retrieval failed; not a missing-feature finding; not run |
| agentc / agentc-core 1.1.5 | Metadata, offline interfaces; prior live DBLogger | Catalog API mismatch; Python >=3.11,<3.14 | No full publish/discover run |
| Agent Memory 1.1.0 | Metadata/interfaces, six local validation probes | Python >=3.12; writes, searches, updates, prompts; contradictory custom-prompt guidance | Mocked HTTP, no memory-service behavior |
| MCP server 1.1.0 | Wheel interfaces, readme/release/audit/tool docs, dependency resolution | Python >=3.11,<3.15; multiple tool groups, permissions, audit controls | No official-server live tool sweep or managed deployment |
| LangChain 1.2.0 | Installed/imported, source, four request-contract probes | Python >=3.11,<4; Query and Search stores, cache, semantic cache, chat history | Mocked database; filter mismatch reproduced; no live adapter recall tests |
| LlamaIndex adapter 0.8.0 | Package source/interface inventory | Python >=3.10,<4; Query and Search classes; legacy class remains | No runtime/service execution |
| Haystack 2.1.2 | Metadata, source/interfaces and README | Query/Search stores and retrievers; README says two index types but later describes both Query families plus Search | No runtime/service execution; wording should distinguish two service paths from three index families |
| Semantic Kernel | Maintainer connector reference and Couchbase tutorial | Search/Query choices; reference labels vector-store functionality Preview | No .NET compilation; do not imply stable API parity |
| Agno | Maintainer integration reference | Additional integration path exists | No package/runtime validation; do not extrapolate support entitlements |

Package versions were checked against registry metadata on November 5. Package compatibility is not a promise that every combination of dependencies works. See [metadata](evidence/package-metadata.json), [request probes](evidence/adapter-probes.json) and [resolver output](evidence/dependency-resolution.txt).

The exact MCP 1.1.0 and LangChain 1.2.0 pair cannot resolve in one environment because their `reo-census` constraints do not overlap. Run the MCP server separately from the app while maintainers confirm a supported combined dependency set. This is not proof that MCP cannot communicate with a LangChain application.

LangChain's Query adapter takes `where_str`; Search takes a Couchbase SearchQuery filter object. Do not pass an untrusted user or model-generated SQL fragment directly into `where_str`. Build restrictions through trusted application logic and verify the resulting request. Adapter filtering is not a replacement for database permissions.

## Prior live evidence: what we can and cannot claim

| Evidence | Win | Loss / constraint |
|---|---|---|
| [NoSQL](../nosql/) | Atomicity, CAS, transactions, TTL and indexed queries worked in recorded tests | The unindexed/primary-scan path timed out; one small setup does not establish production throughput |
| [Vector](../vector-search/) | Native index/query plans and strict-filter checks exercised | 1,564 query cases and 48 exact filter comparisons are not 1,612 perfect-recall cases; SQ8 anomalies need engineering triage |
| [Lexical](../lexical-search/) | Expected-set tests, synonyms and hybrid restrictions worked | Analyzer choices can erase meaningful words; one prior scoring error was invalid test input |
| [Agent operations](../agent-operations/) | 16 custom MCP cases and native trace persistence verified | Fixed inputs did not test autonomous model decisions; unsupported wrapper arguments could be ignored |
| [Memory status](../MEMORY-STATUS.md) | Deployment prerequisites and SDK surface identified | No managed memory extraction, correction-quality or ROI result yet |

These are learning-lab observations with retained configurations and limitations, not production claims. No prior result is silently upgraded to a current-version retest.
