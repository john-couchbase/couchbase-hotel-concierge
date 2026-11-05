# Content review: what exists and what to add

November 5, 2026. This review distinguishes **fix**, **connect/reuse**, and **new proof**. It does not treat every proposed article as missing content.

## Articles, guides and repositories

| Existing asset | Reader / stage | What it already does well | What to improve or add |
|---|---|---|---|
| [AI Data Plane overview](https://docs.couchbase.com/ai/get-started/intro.html) and [planning guide](https://docs.couchbase.com/ai/agent-tutorial/plan-agentic-app.html) | New evaluator / orientation | Introduce components and application design choices | Connect to the smallest working route; planning links emphasize provisioned models despite the newer serverless option |
| [Managed Memory quickstart](https://docs.couchbase.com/agent-mem/current/get-started/get-started-agent-mem-managed.html) | Developer / first run | Deployment, provider integration, allowed IP, service key and SDK example | Reuse it; attach cost ownership and a tested correction scenario rather than duplicate installation instructions |
| [Memory developer guide](https://docs.couchbase.com/agent-mem/current/develop/develop-agent-mem.html) | Developer / build | Substantial CRUD, recall, async and prompt-related guidance | Add use-case choices and measurable expected outcomes; separate API presence from behavioral proof |
| [Custom Memory prompts](https://docs.couchbase.com/agent-mem/current/develop/customize-prompts-agent-mem.html) | Developer / adapt | Named/versioned extraction instructions | Fix the context_required note/example inconsistency; demonstrate changed prompts and already-processed memories |
| [Memory metrics](https://docs.couchbase.com/agent-mem/current/reference/metrics-alerts-agent-mem-managed.html) | Operator / production | Queue, processing, errors and latency coverage | Explain that healthy extraction metrics do not measure useful or correct recall; add application-quality evaluation |
| [Hotel Memory demo](https://github.com/couchbaselabs/agentmemory-demo) | Evaluator / demonstration | Concrete multi-agent application to build upon | Identify application-owned correction logic; provide saved-profile baseline and costed cases |
| [Catalog guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html) | Python developer / first run | Explains discovery, tool/prompt organization and execution boundaries | Repair package interfaces before promotion; lock tutorial dependencies |
| [Tracer guide](https://docs.couchbase.com/ai/build/agent-tracer/agent-tracer.html) and [Tools/Prompts Hub](https://docs.couchbase.com/ai/build/tools-prompts-hub.html) | Developer/operator / troubleshoot | Instrumentation and UI inspection paths already exist | A linked tool-change story should show the exact version and trace, including missing instrumentation |
| [Model modes](https://docs.couchbase.com/ai/build/model-service/model-service.html) and [serverless setup](https://docs.couchbase.com/ai/build/model-service/deploy-serverless-model.html) | Architect/developer / configure | Explain deployment choices, regions and key paths | Bring these choices into earlier tutorials; show provider integration versus hosted-model key clearly |
| [Vectorization workflow guide](https://docs.couchbase.com/ai/build/vectorization-service/data-processing.html) | Data engineer / ingest | Sources, processing and model dependencies | Add an update/delete/recovery acceptance test and freshness measurements |
| [LangChain RAG tutorial](https://developer.couchbase.com/tutorial-capella-model-services-langchain-rag-with-hyperscale-or-composite-vector-index/) | Python developer / build | Actual dataset, pinned libraries and retrieval choices | Clean up runtime warnings and clarify minimum topology; validate against current adapter signatures |
| [.NET Semantic Kernel tutorial](https://developer.couchbase.com/tutorial-csharp-semantic-kernel-vector-search-with-hyperscale-or-composite-vector-index/) | .NET developer / build | Shows retrieval/index alternatives in a familiar ecosystem | Surface connector preview status, exact versions and equivalent strict-filter fixtures |
| [Ragas tutorial](https://developer.couchbase.com/tutorial-evaluate-rag-responses-using-ragas/) | Evaluator / measure | Existing retrieval and answer-evaluation foundation | Extend with lexical/dense/hybrid baselines, fixed test splits and operational eligibility/freshness tests |
| [AI hands-on lab](https://github.com/couchbaselabs/ais-hol) | Guided learner / evaluation | Exercises provide a useful existing progression | Confirm a current clean run, per-exercise cost and teardown; label mandatory versus optional components |
| [Memory Lane article](https://www.couchbase.com/blog/build-a-personal-memory-search-with-couchbase-ai-services-and-hyperscale-vector-index/) | Developer / application inspiration | Detailed document-search application | Label it document RAG; the name must not imply an Agent Memory benchmark. November 5 direct refresh was blocked; assessment uses prior review |
| [Launch article](https://www.couchbase.com/blog/your-ai-agents-are-stuck-in-pilot-its-a-data-problem-not-a-model-problem/) | Buyer / awareness | Explains the business problem and component story | Keep awareness material; route readers to current managed and self-managed instructions |

**Assessment:** the reviewed technical articles offer more than marketing descriptions. The weak point is consistency between the promoted journey, current package interfaces and what a reader can reproduce. Internal analytics are needed to judge whether a particular article attracts or converts the right audience.

The [document inventory](document-inventory.json) captures 71 indexed pages, headings and code-block counts. A fetched page is not a passed tutorial. The [SDK checks](evidence/sdk-doc-checks.json) and [snippet checks](evidence/python-snippet-checks.json) record the narrower executable/static evidence.

## Videos: reuse awareness, add current task walkthroughs

Twelve selected descriptions and metadata records were refreshed. The earlier channel sample contained 30 visible video cards. We did not watch every video, inspect all historical uploads or access audience retention, so this review does not rate production quality or declare a topic universally absent.

| Existing video group | Useful role | Recommended change |
|---|---|---|
| October 2026 brand and Operational Insights introductions | Awareness and product context | End with the exact current quickstart for the demonstrated deployment |
| July 2026 architecture, cost/security and production-agent discussions | Explain why the architecture matters | Segment by task and link to one executable proof per claim |
| June 2026 Agent Memory demo | Show continuity in an application | Add a current service-version companion; expose stored/retrieved memory and app-owned logic |
| December 2025 AI Services demonstration, now titled AI Data Plane | Historical end-to-end orientation | Clearly label recording version and direct viewers to current managed-service/key screens |
| April 2025 MCP demonstration | Early tool-access introduction | Add a 1.1/managed-specific companion; older recordings cannot establish new deployment behavior |
| SQL/JSON and vector/Bedrock education | Teach existing database and retrieval pieces | Connect both to the same current business-data demo |
| FanKave story | Customer context and credibility | Attribute results to the actual use case; do not reuse it as proof of Memory savings |

The [video inventory](video-inventory.json) includes verified links, dates, durations and whether descriptions contain docs/repository links. Those link flags measure navigation only, not whether the linked code runs.

## The first six recordings to commission

| Recording | Audience question | What must be visible | Companion |
|---|---|---|---|
| **Start here: follow one request** | What do I actually need? | Model, application, database and optional services; key and billing boundaries | Component chooser + first-run guide |
| **An agent chooses a tool** | What does MCP do versus the agent? | Tool list, selected tool, arguments, strict filters, source records and unsupported request | Current MCP/direct SDK demo with expected cases |
| **Lexical, dense or hybrid?** | Which retrieval option fits my data? | Identical labeled queries, exact identifiers, semantic matches and a filter failure | Search decision guide + benchmark harness |
| **Memory after a correction** | What happens when my information changes? | First session, later recall, permanent correction, temporary exception and deletion | Memory recipe + saved-profile baseline |
| **Where did the savings come from?** | Is Memory worth the extra work? | Quality, total tokens, extraction/embedding costs and a losing workload | Reproducible economics report |
| **Inspect a mistake** | Can I find and explain a bad agent action? | Tool/prompt version, trace, missing instrumentation and dropped-log signal | Governance guide + failure fixtures |

These are proposed additions or updates, not proven absences across the entire video library. Record only after the companion path passes. One tested codebase can supply several short clips.

## Standardization and measurement

Use the repository's [content system](../content-system/README.md). Every promoted article/video/demo package should identify its reader, task, owner, supported deployment, tested versions/date, costs, expected result, limitations, cleanup and exact companion revision.

Assign a review when a dependent SDK or service changes. Automate snippet parsing, clean installation and runnable sample checks where practical. Keep hand-written deployment and cost review because those cannot be inferred from a passing import.

Track first-run completion, time to first verified answer, recurring setup errors and qualified evaluation progression. Track video-to-guide clicks and completion alongside views. We have no internal analytics baseline, so this audit does not invent conversion losses, targets or ROI.
