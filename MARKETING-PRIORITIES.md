# AI Data Plane: prioritized marketing content roadmap

November 4, 2026 • Recommendations based on the [public-evidence audit](AI-DATA-PLANE-AUDIT.md).

**Start with three packages: a clear starting path, a practical Agent Memory decision guide, and a working agent demo.** Each package needs an article, a short video and runnable code. Publish the evidence benchmark after those paths are reliable.

“Gap” below means incomplete, unclear or not found in the sampled public materials. It does not mean Couchbase has never produced content on the subject. Existing demos, Ragas evaluation material, framework guides and customer stories should be reused. Video review covered titles, descriptions and chapters, not every recording end to end.

## Simple priority list

| Order | Package | Article / guide | Video | Demo or benchmark | Why first |
|---|---|---|---|---|---|
| 1 | Start here: choose your AI Data Plane components | What you need for search, agents and memory; plans, keys, models, regions and costs | 5–7 minute tour of one working architecture | Smallest supported working setup, with teardown | People cannot evaluate value while confused about setup |
| 2 | Agent Memory: when to use it and how to configure it | Use-case decision tree and configuration workbook | Same user, three sessions: recall, correction and forgetting | Compare current context, saved profile and Agent Memory | Addresses the largest value and customization question |
| 3 | Your first agent with real business data | Plain-English request → tool → filters → source records → answer | Show the actual tool arguments and results | Current order lookup plus policy search, with memory optional | Makes the platform's combined value visible |
| 4 | Choose lexical, dense or hybrid search | Analyzer/index/model decision guide, with strict filters | Same questions across all three retrieval modes | Labeled BEIR companion and operational filter fixtures | Helps evaluators coming from vector databases make decisions |
| 5 | Show that memory earns its cost | Reproducible quality and total-cost methodology | Show a case where memory helps and one where it does not | No-memory vs full-history vs profile vs Agent Memory | Converts claims into defensible proof |
| 6 | Choose and operate inference/vectorization | Serving-mode, embedding and ingestion lifecycle guide | Change a model or source document and inspect consequences | Updates, deletes, re-embedding and credential recovery | Covers the work after the initial happy path |
| 7 | Run agents reliably | MCP/Catalog/tracing, cache and SQL++ AI Functions guides | Failure-and-recovery clips | Dropped logs, cache false hits, bounded SQL model calls | Answers production objections with observable behavior |

Before recording new walkthroughs, fix the Catalog SDK examples and hybrid filter guidance identified in the audit. A polished video pointing to a failing quickstart makes the journey worse.

## 1. Starting path: the first content package

**Proposed article:** “Which AI Data Plane components do I actually need?”

Provide three explicit routes: search an existing dataset; let an agent use tools; add continuity across conversations. For every route identify the database, model provider, SDK/framework, optional MCP, optional memory, optional tracing and which process runs each step. Include a credential legend and list every billing party before the first provisioning instruction.

**Proposed video:** “AI Data Plane in seven minutes: follow one request.” Animate the request, then show the real trace. Avoid a tour of every console menu. Finish with links to the matching quickstart and supported configuration.

**Demo acceptance:** A new evaluator can follow a clean, version-pinned setup, retrieve a known record, see the tool arguments, estimate charges and tear down resources. The guide must distinguish minimum requirements from recommendations. Do not promise a fixed completion time or cost until measured.

**Existing material to reuse:** [AI Data Plane overview](https://docs.couchbase.com/ai/get-started/intro.html), [hands-on lab](https://github.com/couchbaselabs/ais-hol), and current component documentation. The missing value is the decision path joining them, not another general introduction.

## 2. Agent Memory: adaptable guidance, not one universal configuration

**Proposed cornerstone article:** “Do you need agent memory? Choose the simplest approach that fits your application.”

Start with this decision tree:

1. Is the answer already in current business records? Retrieve those authoritative records.
2. Does the information matter only during this conversation? Conversation context may be sufficient.
3. Is it a small, explicit and structured preference? A saved profile may be sufficient.
4. Does useful information arrive across many conversations and need selective recall? Evaluate Agent Memory.
5. Does the information authorize a consequential action? Verify the current source of truth or ask for confirmation; retrieved memory alone is not authorization.

These are application design recommendations, not claims that Couchbase automatically makes each decision.

### Three starter recipes

| Recipe | Potential memory | Current source of truth | What changes | Demo success |
|---|---|---|---|---|
| Customer support | Prior troubleshooting steps and unresolved context | Current account, order and ticket state | Ticket resolved or a diagnosis corrected | Agent avoids repeating completed steps and uses the current ticket |
| Personalization | Explicit preferences expressed in conversation | User profile and current request | Preference revoked or overridden for one trip | Correct scope and preference applied without leaking another user's memory |
| Internal project assistant | Prior decisions with source and date | Approved current project documents | Decision superseded or access revoked | Current decision wins; historical context remains distinguishable |

Do not prescribe universal retention periods. Supply a worksheet that asks what can become stale, who may correct it, how long it is useful, and what deletion obligations apply. If the answer is unknown, make that uncertainty visible and evaluate on a bounded dataset before scaling.

### Configuration workbook every recipe should include

| Decision | Guidance to supply | Verification |
|---|---|---|
| Identity and scope | Define tenant, user and session boundaries | Cross-user and cross-tenant negative tests |
| What enters memory | Define allowed information and exclusions; distinguish raw history from extracted facts | Irrelevant/sensitive synthetic inputs handled under declared policy |
| Retrieval | Define when recall runs, search scope and context budget | Useful recall and irrelevant recall measured separately |
| Corrections | Distinguish a permanent change from a temporary exception | Old, new and conflicting facts tested |
| Freshness | Identify current authoritative records and when to recheck them | Stale memory cannot silently override current operational data |
| Retention/deletion | Explain supported TTL/deletion behavior and limits; do not imply backup erasure without evidence | Expiration, deletion and historical access tested separately |
| Cost | Account for extraction, embeddings, retrieval, generation and infrastructure | Total cost per completed task, not just prompt-token reduction |
| Operations | Define monitoring, failure handling and human escalation | Missing memory and provider failures have a documented fallback |

PM and engineering must verify which controls are native service settings, SDK behavior or application logic. The workbook must never imply that all are built-in switches.

### Video and demo sequence

- **Video A:** “What memory adds that database search does not.” Show the same request with current context, a profile and recalled conversational information.
- **Video B:** “I changed my preference. What happens next?” Show session one, a later recall, a correction, a temporary exception and conflicting statements.
- **Video C:** “Configure memory for your application.” Use the workbook with support and personalization examples rather than copying one hotel's settings.
- **Video D:** “When memory is wrong or unnecessary.” Show irrelevant recall, unknown facts, user isolation and a task solved just as well without memory.

Each video links to one shared runnable demo with scenario switches and expected outcomes. Show raw inputs, returned memory and the application decision. Do not hide failed cases behind a polished answer.

**Existing asset:** [Hotel Agent Memory demo](https://github.com/couchbaselabs/agentmemory-demo). Extend its explanation and evaluation rather than pretending no demo exists. Managed-memory behavior and cost remain untested in our lab; company-approved model access is required before claiming results.

## 3. Getting-started coverage for each component

The following is a target content checklist, not a claim that every listed guide is absent. The audit found fragments and examples; each row needs a verified start-to-finish route.

| Component | Guide needed or improved | Short video / runnable proof |
|---|---|---|
| Operational database | JSON, key-value reads and SQL++: which to use, indexes and current data | Fetch an order by ID, query related orders, update it and verify freshness |
| Lexical search | Tokenization, stop words, stemming, synonyms, phrases and exact identifiers | Show why a product code or negated phrase can fail under the wrong analyzer |
| Dense / hybrid retrieval | Embedding choice, index family, dimensions, distances, mandatory filters and fusion | Compare lexical/dense/hybrid on the same labeled queries |
| Model Service | Serverless/provisioned decision, model availability, keys, regions and cost units | One generation call and one embedding call with visible inputs/outputs |
| Vectorization Workflows | Sources, chunking, embedding model, updates/deletes and recovery | Change a source and measure when its new content becomes searchable |
| MCP | Local versus managed, tool discovery, permissions and framework responsibilities | Agent selects a read tool, passes filters and handles an unsupported request |
| Agent Catalog / tracing | Tested SDK setup, tool catalog lookup, execution ownership and trace inspection | Publish/discover a tool; show execution in the framework and a failed log write |
| Agent Memory | Decision tree, recipe workbook, corrections and cost | Three-session recall/correction test with no-memory/profile baselines |
| Semantic cache | Applicability, similarity threshold, freshness, bypass and net cost | Correct hit, wrong hit and changed-data example |
| SQL++ AI Functions | Supported deployment, bounded rows, model charges and output validation | Classify a small ticket set; show rerun and partial-failure behavior |

For every guide: tested date/version, prerequisites, minimum supported topology, sample dataset, complete code, expected output, common failures, cost units and cleanup. For every video: link the exact code revision and current written guide. This checklist applies to future components too; mobile/edge and Operational Insights need a separate detailed pass before declaring their content gaps.

## 4. Benchmark roadmap

| Priority | Benchmark | Comparisons | Required measures | Main caveat |
|---|---|---|---|---|
| First | Retrieval quality | Lexical vs dense vs hybrid; selected BEIR subsets plus operational fixtures | nDCG@10, recall@k, zero-result rate, filter violations, p50/p95 latency, cost | BEIR alone does not test changing business records or authorization |
| First | Memory usefulness and economics | Current context, full history, structured profile, Agent Memory | Task success, correct updates, stale/irrelevant recall, isolation failures, total tokens/cost, latency | Give each baseline equivalent information; count memory-building costs |
| Next | Vector scale and compression | Appropriate Search/Composite/Hyperscale configurations and quantization settings | Equal-recall latency, index build time/size, RAM, ingestion/update behavior, full infrastructure cost | No universal winner; disclose hardware and version differences |
| Next | Cache economics | No cache, supported cache options, thresholds and changing data | Correct-hit rate, false-hit rate, stale answers, net cost and latency | Hits alone are not success |
| Next | Production lifecycle | Initial load, updates, deletes, retries and credential failures | Freshness lag, missing/duplicate chunks, recovery time and cost | Successful ingestion does not prove current retrieval |

Publish a versioned manifest, code, dataset/license, held-out queries, parameters, raw per-query outputs, repeated runs and limitations. Use fixed models and comparable quality targets. Separate retrieval metrics from LLM answer quality and separate generation tokens from total billed work. Do not tune on the held-out test set.

[The Ragas tutorial](https://developer.couchbase.com/tutorial-evaluate-rag-responses-using-ragas/) is an existing foundation. Extend it rather than making another generic “how to evaluate RAG” introduction. Public memory benchmark claims need their own reproducibility package; we have not reproduced them.

## 5. Publish and measure

**First release:** Starting-path guide/video, memory decision guide/workbook, and one end-to-end demo. Fix prerequisite documentation first. Reuse one codebase and dataset across these assets to reduce maintenance.

**Second release:** Search decision guide and labeled evaluation companion; then the memory economics study once approved provider access and valid baselines are available.

**Third release:** Operations series covering ingestion changes, credential recovery, cache mistakes and trace reliability.

Track successful first run, time to first verified answer, tutorial-to-demo completion, recurring setup failures and qualified evaluation progress. For videos, track completion and clicks into the runnable guide. Views alone are not evidence of product adoption. Establish baselines before numeric targets.

**Owners:** Technical Marketing owns the journey and demo story; DevRel owns runnable samples; Docs/SDK maintain tested examples; PM verifies capabilities and limits; Performance Engineering owns reproducible benchmark methodology; Video Marketing packages recordings; Marketing Ops measures outcomes. These are proposed responsibilities, not assignments already agreed with those teams.

## Audit links and status

- [Full audit: 30 findings and source register](AI-DATA-PLANE-AUDIT.md)
- [Structured evidence bundle](ai-data-plane-marketing-audit.zip)
- [Existing memory lab status](MEMORY-STATUS.md)

No new live tests or paid deployments were performed to create this roadmap. The recommendations are proposed work, not completed videos, articles or benchmarks. Absence conclusions are limited to the reviewed public sample.
