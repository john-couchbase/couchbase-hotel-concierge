> **Historical November 4 review.** Use the [expanded November 5 audit](FULL-AUDIT.md) and [updated priorities](MARKETING-PRIORITIES.md) for current recommendations. The expanded review corrects earlier content-gap assumptions and adds SDK evidence.

# Couchbase AI Data Plane: technical marketing gap audit

**Research date: November 4, 2026. First broad public-evidence audit, not an exhaustive product certification.**

## Executive finding

The main opportunity is not simply to publish more introductory AI content. Couchbase already has technical tutorials, demos, evaluation material, benchmark reports and customer stories. The larger gap is a reliable path from understanding the components to choosing a configuration, running it successfully, measuring its benefit and operating it safely.

Fix documentation and expectation mismatches first. Then package the strongest existing assets into task-based journeys and add reproducible proof of quality, cost and operational behavior. Several findings are product questions for PM, not defects established by this audit.

## Scope and evidence

This review covers public product messaging, component references, SDK/package interfaces, repositories, selected technical articles, benchmark publications and YouTube metadata. The source register contains 42 entries, including the research framework. The channel inventory contains 30 visible video cards; 11 videos received deeper metadata/description review. These are not a complete channel census and the videos were not watched end to end. Descriptions and chapters support topic and navigation assessment, not judgments about presentation quality.

One current SDK interface mismatch was reproduced locally. Earlier lab results are clearly marked as prior evidence; the managed-memory service and its economics have not been tested. No paid deployment or model call was started for this audit. The existing $30 cumulative budget remains the constraint; this report does not certify the historical invoice total.

Priority means: **P1** addresses failed onboarding, materially ambiguous promises, operational risk or missing proof for a central claim; **P2** improves choice, adoption or evaluation; **P3** establishes measurement. These are editorial priorities, not security severity ratings. “Not found” means not found in the reviewed sources, not proof that an asset or feature does not exist.

## Coverage map

| Area | What was reviewed | Remaining boundary |
|---|---|---|
| Agent Memory | Product promises, API, deployment comparison, demo repository, benchmark claims | No live managed-memory run; no measured ROI |
| MCP and Agent Catalog | Setup references, package versions, Catalog interface, earlier tracing evidence | No full SDK code/security audit or managed-service certification |
| Model Service | Serving modes, credentials, integrations, inference positioning | No new model quality or latency benchmark |
| Vectorization Workflows | Source/chunk lifecycle and integration renewal | Recovery behavior documented, not reproduced |
| Cache and AI Functions | Prerequisites, billing boundaries, quality/cost controls | No new live cache or SQL model-call test |
| Lexical/vector/hybrid | Index families, scoring and filtering examples, competitive reference, benchmark paper | No full native sparse/multivector support determination |
| Operational NoSQL/SQL++ | Existing tutorial/lab positioning and application opportunities | Not an exhaustive database SDK, transactions or durability audit |
| Videos/articles/customer proof | Sampled public assets and their next steps | No private conversion data or complete video transcript review |
| Mobile/edge, Operational Insights and other adjacent areas | Identified as additional portfolio coverage | Detailed capability and content audit remains open |

## Highest-value immediate actions

1. Repair and continuously execute the Agent Catalog quickstart (G01).
2. Clarify mandatory filtering in the hybrid example (G02).
3. Resolve memory immutability, security and responsibility wording with PM (G03–G05).
4. Publish a single component, credential, eligibility and cost map (G07, G11, G17).
5. Obtain a reproducible memory benchmark and total-cost comparison (G08–G09).
6. Resolve or document credential rotation and trace delivery behavior (G06, G10).

## Content assessment

These are editorial assessments of the reviewed assets, not measured conversion rankings.

| Asset | What is strong | What to improve |
|---|---|---|
| Launch article | Clear business framing around moving agents beyond pilots | Route readers to a concrete component choice and runnable evaluation |
| Memory Lane article | Substantial implementation detail and a real document-retrieval application | Explicitly distinguish document RAG from the Agent Memory service |
| LangChain / Model Service tutorial | Pinned dependencies, model calls, data loading and index choices | Clean supported runtime; explain minimum topology and teardown cost |
| Semantic Kernel tutorial | Valuable .NET coverage and multiple vector-index paths | Use it in the engine-choice journey; keep version validation visible |
| Ragas tutorial | Actual retrieval and answer evaluation already exists | Extend with held-out datasets, filter correctness and changing-data tests |
| Hotel memory demo repository | Concrete application with multiple agents and recalled preferences | Label application logic versus service behavior; disclose prerequisites and cost |
| Hyperscale benchmark whitepaper | Hardware, methodology, index definitions and recall evidence | Add current GA manifests, raw reruns and production mutation/cost workloads |
| FanKave customer story | Genuine application evidence and business context | Do not stretch it into proof of Agent Memory ROI |


Article and evidence links: [AI Data Plane launch article](https://www.couchbase.com/blog/your-ai-agents-are-stuck-in-pilot-its-a-data-problem-not-a-model-problem/), [Memory Lane technical article](https://www.couchbase.com/blog/build-a-personal-memory-search-with-couchbase-ai-services-and-hyperscale-vector-index/), [Capella Model Service and LangChain tutorial](https://developer.couchbase.com/tutorial-capella-model-services-langchain-rag-with-hyperscale-or-composite-vector-index/), [Semantic Kernel vector search tutorial](https://developer.couchbase.com/tutorial-csharp-semantic-kernel-vector-search-with-hyperscale-or-composite-vector-index/), [Ragas evaluation tutorial](https://developer.couchbase.com/tutorial-evaluate-rag-responses-using-ragas/), [Agent Memory hotel demo repository](https://github.com/couchbaselabs/agentmemory-demo), [Hyperscale VectorDBBench whitepaper](https://info.couchbase.com/rs/302-GJY-034/images/COU_1372%20-%208.0%20Benchmarks%20for%20Hyperscale%20Vector%20Search%20-%20WP.pdf), [FanKave customer case study](https://info.couchbase.com/rs/302-GJY-034/images/COU_1378-FanKave_Customer_case_study.pdf?version=0).

## YouTube: what exists and what to add

The sampled channel includes brand films, architecture panels, feature explainers, short demonstrations, longer technical webinars, SQL/JSON education and customer stories. Examples include the Agent Memory demo, MCP Server in Action, Model Service/AI Data Plane demos, SQL for JSON, vector search with Bedrock, and FanKave. This is useful breadth; “Couchbase has no videos” would be incorrect.

The opportunity is to make a sequence a developer can follow: **Learn → Choose → Build → Evaluate → Operate**. Each selected video should identify its tested version, deployment mode, prerequisites, companion code revision and current next step. Older videos retitled from AI Services need a visible freshness note. Do not assume an older recording is broken simply because it is old.

Proposed short demonstrations should expose an observable result: a filter excludes an ineligible record; a changed preference supersedes an old one; an expired credential produces a recoverable failure; a cache hit saves money or returns a stale answer. Follow with the runnable example, not another generic overview.

See `channel-visible-videos.json` and `video-descriptions.json` for the sampled inventory. Public view counts cannot establish retention, lead quality or influenced revenue.

## Prioritized findings

Each finding includes an evidence classification, responsible team and a proposed acceptance check. Acceptance checks are future completion criteria, not tests claimed as passed.

### G01 · P1 · Catalog guide and latest SDK disagree

**Evidence:** Reproduced mismatch.

The guide uses from agentc import tool and Catalog.get_item. Local recheck of agentc 1.1.5, also the current PyPI version, finds neither; agentc.catalog.tool and Catalog.find are present.

**Why it matters:** A developer can fail before reaching the value demonstration.

**Action:** Correct the snippets, pin a tested environment, and execute documentation snippets in release CI.

**Suggested owner:** Docs + SDK.

**Acceptance check:** Clean-environment quickstart imports, indexes, publishes and retrieves one tool; retain the package lock and CI result.

**Sources:** [Agent Catalog integration guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html); [agentc package metadata](https://pypi.org/project/agentc/).

### G02 · P1 · Hybrid example does not enforce global restrictions

**Evidence:** Confirmed example risk.

The global_scoring example restricts category and price in query but has no corresponding knn filter. The scoring reference describes the default combination as OR.

**Why it matters:** A reader may treat ranking eligibility as a mandatory business restriction. This is sample-design risk, not proof of an authorization bypass.

**Action:** Show an unrestricted union example separately from an eligibility-filtered example; apply mandatory restrictions to both branches.

**Suggested owner:** Search Docs + DevRel.

**Acceptance check:** Fixtures outside the category and price range never appear in the mandatory-filter version.

**Sources:** [Capella UI vector search example](https://docs.couchbase.com/cloud/vector-search/run-vector-search-ui.html); [Search scoring and hybrid query semantics](https://docs.couchbase.com/cloud/search/run-searches.html).

### G03 · P1 · Memory immutability needs qualification

**Evidence:** Confirmed messaging mismatch.

The product page describes immutable memory blocks and point-in-time retrieval. The REST reference allows updating existing content, annotations and TTL.

**Why it matters:** Buyers may infer append-only history or historical reconstruction guarantees that the API description does not establish.

**Action:** Define which objects or versions are immutable; document history preservation and its limits; align product copy with the actual update contract.

**Suggested owner:** Memory PM + Docs + PMM.

**Acceptance check:** A documented update example explains old-content availability and exactly what a historical query can recover.

**Sources:** [AI Data Plane product page](https://www.couchbase.com/products/ai-data-plane/); [Agent Memory REST API 1.1.0](https://docs.couchbase.com/agent-mem/current/agent-memory-api-reference/rest-api.html).

### G04 · P1 · Security parity is overstated

**Evidence:** Confirmed deployment distinction.

The product page promises the same security model across deployment types. The Memory comparison instead specifies managed API keys/IP controls versus self-managed OIDC/OAuth2.

**Why it matters:** A customer can underestimate migration and identity integration work.

**Action:** Publish an authentication and authorization matrix; scope the parity statement.

**Suggested owner:** Security PM + PMM.

**Acceptance check:** Each deployment has its identity source, credentials, isolation boundary and migration steps specified.

**Sources:** [AI Data Plane product page](https://www.couchbase.com/products/ai-data-plane/); [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html).

### G05 · P1 · Demo autonomy can be mistaken for service autonomy

**Evidence:** Messaging ambiguity.

The memory video description presents conflict reconciliation without developer intervention. Reference docs exclude reasoning logic; the hotel demo has application agents and retrieval tooling.

**Why it matters:** A successful application demonstration can be mistaken for an automatic service guarantee.

**Action:** Annotate the demo with what the service does, what the LLM does, and what application code configures.

**Suggested owner:** Memory PM + DevRel.

**Acceptance check:** Publish one changed-preference example with source memory blocks, prompts, update path and failure outcome.

**Sources:** [Agent Memory demo video](https://www.youtube.com/watch?v=cihkYnuEh6M); [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html); [Agent Memory hotel demo repository](https://github.com/couchbaselabs/agentmemory-demo).

### G06 · P1 · Bedrock key renewal can require workflow recreation

**Evidence:** Documented operational limitation.

Integration docs require short-term Bedrock keys, at most 12 hours, and say an expired-key workflow cannot automatically use updated credentials; recovery requires deletion and recreation.

**Why it matters:** Long-running or recurring ingestion needs a clear operational recovery story. This limitation is documented, not reproduced in this audit.

**Action:** Prioritize credential refresh/resumability with PM; immediately add a renewal runbook and idempotent re-ingestion guidance.

**Suggested owner:** Workflows PM + Engineering.

**Acceptance check:** A key rotation exercise records whether processing resumes without duplicate or missing chunks.

**Sources:** [AI integration credentials and renewal](https://docs.couchbase.com/ai/admin/manage-ai-integrations.html).

### G07 · P1 · No single prerequisite and cost map

**Evidence:** Coverage gap.

Useful eligibility and billing facts exist, but span pricing, model modes, managed MCP and AI Functions references.

**Why it matters:** The user must discover plan, region, API key and model dependencies during setup.

**Action:** Add a use-case selector with required versus optional services, credential type, region, plan, price unit and teardown.

**Suggested owner:** PMM + Product UX + Docs.

**Acceptance check:** A new evaluator can identify a valid configuration and all billing parties before provisioning anything.

**Sources:** [AI Data Plane documentation overview](https://docs.couchbase.com/ai/get-started/intro.html); [Couchbase pricing](https://www.couchbase.com/pricing/); [Capella billing](https://docs.couchbase.com/cloud/billing/billing.html); [Managed MCP requirements](https://docs.couchbase.com/mcp-server/current/about-managed-mcp.html); [SQL++ AI Functions](https://docs.couchbase.com/ai/build/ai-functions.html).

### G08 · P1 · Memory benchmark claims need a reproducibility package

**Evidence:** Evidence gap.

Public material reports LoCoMo and LongMemEval scores and the announcement reports 33–45% fewer tokens versus alternatives. The reviewed claim surfaces do not supply enough configuration, raw outputs and cost accounting to reproduce the comparison.

**Why it matters:** Useful vendor evidence exists, but total-cost savings and cross-system superiority cannot be inferred from a headline.

**Action:** Link a versioned protocol, dataset subsets, models, judges, baselines, token categories, repeated runs and raw results directly from every claim.

**Suggested owner:** Performance Engineering + PMM.

**Acceptance check:** A third party can rerun the experiment and distinguish retrieval, answer quality and total cost.

**Sources:** [Public AI Data Plane reference and benchmark claims](https://github.com/couchbase/operational-data-platform-for-ai/blob/main/ai-data-plane.md); [October 20 announcement and token claims](https://www.prnewswire.com/news-releases/couchbase-ai-data-plane-cuts-the-cost-of-running-production-ai-agents-at-enterprise-scale-302913871.html).

### G09 · P1 · Memory economics and no-memory alternatives

**Evidence:** Content opportunity.

Capability explanations do not answer when a saved profile or current database records are sufficient. Our actual managed-memory economics remain untested.

**Why it matters:** Buyers may see an expensive extra component without a decision rule.

**Action:** Create a memory/no-memory/profile comparison and total-cost worksheet with explicit ingestion, extraction, embedding, retrieval, model and infrastructure costs.

**Suggested owner:** Technical Marketing + Memory PM.

**Acceptance check:** Show a workload where memory helps and one where it adds cost without useful quality improvement.

**Sources:** [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html); [Capella billing](https://docs.couchbase.com/cloud/billing/billing.html).

### G10 · P1 · Governance needs a delivery and redaction contract

**Evidence:** Prior live evidence.

Prior local agentc-core 1.1.5 tests persisted synthetic sensitive text unchanged; a duplicate insert incremented dropped_log_count without raising to the application. These are scoped tracing observations, not a full security audit.

**Why it matters:** Trace availability is not the same as guaranteed audit delivery or automatic redaction.

**Action:** Document redaction ownership, failure monitoring, delivery guarantees and instrumented coverage; demonstrate dropped-log handling.

**Suggested owner:** Catalog PM + SDK + Security.

**Acceptance check:** A trace demo exposes successful writes, failed writes, redaction policy and retention verification.

**Sources:** [Agent Catalog integration guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html).

### G11 · P1 · Managed memory model choice is narrower

**Evidence:** Documented product boundary.

Managed Agent Memory uses OpenAI integrations; self-managed accepts OpenAI-compatible models.

**Why it matters:** A user with a working Capella model deployment may still need another provider integration.

**Action:** Explain this before the memory setup CTA; ask PM about additional managed providers and approved company integration workflows.

**Suggested owner:** Memory PM + Product UX.

**Acceptance check:** Setup clearly identifies who supplies and pays for each required model connection.

**Sources:** [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html).

### G12 · P2 · Older videos need version-specific routes

**Evidence:** Content and freshness gap.

Descriptions for older AI Services videos now use AI Data Plane branding. Their publication dates predate current managed services.

**Why it matters:** A current title can lead viewers to an older UI or deployment path.

**Action:** Keep useful videos; add tested version, serving mode, current replacement links and matching sample repository.

**Suggested owner:** Video Marketing + DevRel.

**Acceptance check:** Each prioritized video has a date/version notice and a verified current next step.

**Sources:** [Couchbase YouTube channel videos](https://www.youtube.com/channel/UCGUDXCRwJi-fuQp7sJyIZmg/videos).

### G13 · P2 · Turn broad videos into task-based learning paths

**Evidence:** Packaging opportunity.

The channel contains brand stories, architecture panels, demos, SQL/JSON education and customer stories. It is not empty.

**Why it matters:** A beginner still needs a route from overview to a working, evaluated application.

**Action:** Curate Learn → Choose → Build → Evaluate → Operate playlists; link each video to a precise tutorial and code revision.

**Suggested owner:** Video Marketing.

**Acceptance check:** Measure tutorial click-through and successful first-run events, not views alone.

**Sources:** [Couchbase YouTube channel videos](https://www.youtube.com/channel/UCGUDXCRwJi-fuQp7sJyIZmg/videos).

### G14 · P2 · TF-IDF spelling needs a corrected retest

**Evidence:** Correction to prior lab interpretation.

Our earlier lab rejected tfidf. Current docs specify tf-idf. The earlier rejection alone is not a demonstrated product defect.

**Why it matters:** An incorrect internal bug claim would weaken the audit.

**Action:** Reclassify that earlier finding as an invalid-input observation until the documented spelling is tested.

**Suggested owner:** Technical Marketing + Test owner.

**Acceptance check:** A future live check uses tf-idf exactly and records the response. No live retest claimed here.

**Sources:** [Search index scoring configuration](https://docs.couchbase.com/server/current/search/search-index-params.html).

### G15 · P2 · Publish a vector-engine decision matrix

**Evidence:** Discovery and comparison gap.

Three index families and their controls are documented, but evaluators need a translation into workload choices.

**Why it matters:** HNSW, IVF, quantization and hybrid search can be conflated.

**Action:** Compare Search, Composite and Hyperscale by filtering, lexical features, tuning, memory, updates and deployment limits.

**Suggested owner:** Search PM + Technical Marketing.

**Acceptance check:** Link each cell to a supported version and demonstrate a workload where each family is appropriate.

**Sources:** [Vector algorithms and index families](https://docs.couchbase.com/server/current/vector-index/vectors-and-indexes-overview.html); [Search vector architecture](https://docs.couchbase.com/server/current/vector-search/vector-search-index-architecture.html).

### G16 · P2 · Clarify sparse and late-interaction support

**Evidence:** Capability documentation question.

This audit did not find an explicit Couchbase matrix classifying learned sparse retrieval, multivectors, fusion and multistage reranking as native, integrated, application-built or unsupported.

**Why it matters:** A missing explanation may be mistaken for a missing feature, or an application workaround for native support.

**Action:** Ask PM to classify sparse/SPLADE, multivectors, RRF/DBSF and rerankers as native, connector-supported, application-built or unsupported.

**Suggested owner:** Search PM + Technical Marketing.

**Acceptance check:** Publish source-backed classifications; do not label features absent solely from search results.

**Sources:** [Search scoring and hybrid query semantics](https://docs.couchbase.com/cloud/search/run-searches.html).

### G17 · P2 · Hosted inference and workflow models need distinct explanations

**Evidence:** Documentation clarity.

Model Service distinguishes serverless Bedrock from provisioned NIM. Workflows also accept external OpenAI/Bedrock integrations; only provisioned Model Service deployments are workflow-eligible in the serving-mode table.

**Why it matters:** Saying all workflows require provisioned models would itself be misleading.

**Action:** Add separate diagrams for inference API calls, managed vectorization, and externally generated embeddings.

**Suggested owner:** Model PM + Docs.

**Acceptance check:** An evaluator can choose a supported path without confusing an external Bedrock integration with a serverless Capella model.

**Sources:** [Model Service serving-mode comparison](https://docs.couchbase.com/ai/build/model-service/model-service.html); [Data processing and vectorization workflows](https://docs.couchbase.com/ai/build/vectorization-service/data-processing.html).

### G18 · P2 · Update the scale benchmark package

**Evidence:** Reproducibility and scope gap.

The VectorDBBench whitepaper provides methodology, hardware, index definitions and recall curves, but uses a Couchbase prerelease on EC2 in its published comparison.

**Why it matters:** It is useful evidence for its setup, not current Capella or universal production proof.

**Action:** Publish GA versions, repeatable scripts, raw runs, equal-recall comparisons, costs and concurrent-mutation workloads.

**Suggested owner:** Performance Engineering.

**Acceptance check:** A benchmark manifest identifies versions, hardware, dataset, filter selectivity, concurrency and cost boundaries.

**Sources:** [Hyperscale VectorDBBench whitepaper](https://info.couchbase.com/rs/302-GJY-034/images/COU_1372%20-%208.0%20Benchmarks%20for%20Hyperscale%20Vector%20Search%20-%20WP.pdf).

### G19 · P2 · Separate database success from memory ROI

**Evidence:** Customer evidence gap.

FanKave is a real customer story with operational and AI use cases. It does not establish measured Agent Memory benefits. The commissioned ESG report predates the current memory release.

**Why it matters:** Broad customer logos can be overextended into claims about newly released components.

**Action:** Build component-specific customer proof: architecture, baseline, outcome, timeline, measurement and approved attribution.

**Suggested owner:** Customer Marketing + PMM.

**Acceptance check:** A memory-specific case shows before/after task success and full cost, with customer approval.

**Sources:** [FanKave customer case study](https://info.couchbase.com/rs/302-GJY-034/images/COU_1378-FanKave_Customer_case_study.pdf?version=0); [Commissioned ESG technical validation January 2025](https://info.couchbase.com/rs/302-GJY-034/images/ESG-Technical-Validation-Couchbase-Capella-FINAL-Jan-2025.pdf).

### G20 · P2 · Memory Lane is RAG, not proof of Agent Memory

**Evidence:** Editorial ambiguity.

The detailed Memory Lane article implements document retrieval using Hyperscale and model calls. Its name can collide with the Agent Memory product category.

**Why it matters:** Readers may infer that any stored document search exercises managed memory.

**Action:** Label the article as a document-RAG reference and link a short comparison with Agent Memory.

**Suggested owner:** Blog editor + DevRel.

**Acceptance check:** Architecture labels identify exactly which products are and are not used.

**Sources:** [Memory Lane technical article](https://www.couchbase.com/blog/build-a-personal-memory-search-with-couchbase-ai-services-and-hyperscale-vector-index/).

### G21 · P2 · Tutorial environment hygiene needs tightening

**Evidence:** Developer experience.

The LangChain tutorial pins libraries but displays Python 3.14/Pydantic compatibility warnings and describes multi-node prerequisites.

**Why it matters:** Warnings and unexplained deployment sizing reduce confidence and increase setup cost.

**Action:** Publish a clean tested runtime, distinguish minimum from recommended topology, and add setup/teardown validation.

**Suggested owner:** DevRel + SDK.

**Acceptance check:** Fresh execution has an explicit supported Python version and no unexplained compatibility warnings.

**Sources:** [Capella Model Service and LangChain tutorial](https://developer.couchbase.com/tutorial-capella-model-services-langchain-rag-with-hyperscale-or-composite-vector-index/).

### G22 · P2 · Version and machine-readable documentation drift

**Evidence:** Documentation navigation.

The MCP legacy entry point identifies itself as version 1.0 while the package is 1.1.0. The downloaded AI overview Markdown contains unresolved Antora-style fragment links.

**Why it matters:** Search engines and coding assistants can land on older or non-navigable instructions.

**Action:** Add current-version banners/canonical links; validate generated Markdown links as well as HTML.

**Suggested owner:** Docs platform.

**Acceptance check:** A link checker resolves MCP and overview links from both HTML and Markdown entry points.

**Sources:** [MCP version 1.0 documentation entry point](https://mcp-server.couchbase.com/); [MCP package](https://pypi.org/project/couchbase-mcp-server/); [AI Data Plane documentation overview](https://docs.couchbase.com/ai/get-started/intro.html).

### G23 · P2 · Extend existing Ragas material instead of duplicating it

**Evidence:** Evaluation content opportunity.

An actual Ragas tutorial already covers retrieval and generation evaluation.

**Why it matters:** Another generic evaluation introduction adds less value than runnable comparisons.

**Action:** Build a BEIR-based companion comparing lexical, dense and hybrid search, and add changing-data, negative-query and filter correctness suites.

**Suggested owner:** Technical Marketing + DevRel.

**Acceptance check:** Publish labeled datasets, fixed models, held-out queries, metrics and both wins and losses.

**Sources:** [Ragas evaluation tutorial](https://developer.couchbase.com/tutorial-evaluate-rag-responses-using-ragas/).

### G24 · P2 · Demonstrate freshness and recovery

**Evidence:** Operational content opportunity.

Workflows document chunking, metadata collections and generated Eventing functions. The reviewed starting materials do not demonstrate a full update/delete/key-expiry recovery acceptance test.

**Why it matters:** Production users need to know when removed or changed content stops influencing answers.

**Action:** Publish an ingestion lifecycle lab: insert, update, delete, retry, deduplicate, re-embed and recover.

**Suggested owner:** Workflows PM + DevRel.

**Acceptance check:** Record source-to-search lag, duplicates, stale chunks and recovery results rather than only workflow completion.

**Sources:** [Data processing and vectorization workflows](https://docs.couchbase.com/ai/build/vectorization-service/data-processing.html); [AI integration credentials and renewal](https://docs.couchbase.com/ai/admin/manage-ai-integrations.html).

### G25 · P2 · Cache savings need false-hit and freshness examples

**Evidence:** Cost and quality trade-off.

Value Adds docs acknowledge semantic caching can increase cost and expose threshold controls.

**Why it matters:** A cache hit is not automatically a correct answer or a net saving.

**Action:** Publish a break-even and false-hit lab with changing records, tenant boundaries and cache bypass.

**Suggested owner:** Model PM + Technical Marketing.

**Acceptance check:** Report incorrect hit rate, latency and net cost including embedding/cache resources.

**Sources:** [LLM caching and value adds](https://docs.couchbase.com/ai/build/model-service/configure-value-adds.html); [Capella billing](https://docs.couchbase.com/cloud/billing/billing.html).

### G26 · P2 · Do not describe Catalog as managed agent execution

**Evidence:** Product versus content boundary.

The Catalog guide explicitly leaves tool execution to the chosen framework.

**Why it matters:** Agent management language can imply an agent runtime or orchestrator.

**Action:** Add a responsibility diagram for model, framework, tool execution, MCP, memory and tracing.

**Suggested owner:** PMM + Catalog PM.

**Acceptance check:** An example identifies the process that actually executes each operation and enforces authorization.

**Sources:** [Agent Catalog integration guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html).

### G27 · P2 · AI Functions need bounded operational examples

**Evidence:** Documentation and evaluation gap.

SQL++ AI Functions have paid-cluster, multi-AZ and model prerequisites; model and query charges still apply.

**Why it matters:** A simple SQL example may conceal deployment requirements and per-row model cost.

**Action:** Publish a limited-row support-ticket classification example with cost estimation, error handling, validation and repeat-run behavior.

**Suggested owner:** AI Functions PM + DevRel.

**Acceptance check:** Show billed model work, failed rows, output validation and the effect of rerunning a query.

**Sources:** [SQL++ AI Functions](https://docs.couchbase.com/ai/build/ai-functions.html).

### G28 · P2 · Model-key sign-out needs an engineering case

**Evidence:** Unverified incident.

The user experienced repeated sign-out during Model Service key creation and reports being told it is a known bug. No network trace or engineering incident ID is in this audit.

**Why it matters:** Onboarding friction is real to the evaluator; its root cause is not established.

**Action:** Collect request ID, timestamp, region, exact model, response status and engineering ticket; avoid attributing it to multiple browsers or AI filtering.

**Suggested owner:** Capella UX + Support.

**Acceptance check:** Engineering confirms the incident, workaround and fixed release; no speculative diagnosis becomes marketing fact.

**Sources:** [Management and Model Service APIs](https://docs.couchbase.com/ai/api-guide/api-intro.html).

### G29 · P3 · Public content cannot establish conversion performance

**Evidence:** Measurement gap.

Video metadata and public content are available; retention, Search Console, CRM attribution and funnel conversion are not.

**Why it matters:** Low views or abundant content alone cannot identify the business bottleneck.

**Action:** Request read-only content analytics and connect video/tutorial entry to first successful query and qualified evaluation.

**Suggested owner:** Marketing Ops + Web Analytics.

**Acceptance check:** Separate measured channel performance from editorial judgment; report baselines before setting numeric targets.

**Sources:** [Couchbase YouTube channel videos](https://www.youtube.com/channel/UCGUDXCRwJi-fuQp7sJyIZmg/videos).

### G30 · P2 · Show operational data plus retrieval in one application

**Evidence:** Use-case packaging.

Existing SQL/JSON and AI material offers the pieces, but the evaluator needs to see why the combination changes an application.

**Why it matters:** A vector-only comparison misses Couchbase operational strengths.

**Action:** Build a support assistant that combines current orders via KV/SQL++, policy search via hybrid retrieval, explicit write approval and trace inspection; add memory only as an optional extension.

**Suggested owner:** Technical Marketing + Solutions Engineering.

**Acceptance check:** Trace one request, show current versus stale records, enforce customer scope and measure the outcome with and without each optional service.

**Sources:** [AI Services hands-on lab](https://github.com/couchbaselabs/ais-hol); [Semantic Kernel vector search tutorial](https://developer.couchbase.com/tutorial-csharp-semantic-kernel-vector-search-with-hyperscale-or-composite-vector-index/).

## Content backlog

Effort is a relative editorial estimate, not a committed schedule. Success measures are proposed instrumentation; no baseline or numeric conversion target is invented.

| Asset | Audience / stage | Distinct value | Format | Success measure | Findings | Effort |
|---|---|---|---|---|---|---|
| Start here: what do I actually need? | Evaluator / choose | Component and credential map; show required vs optional and all billing parties | Diagram + selector | Correctly select a valid configuration | G07/G11/G17 | Medium |
| Your first working agent, with the boundaries visible | Developer / build | Current orders plus policy retrieval; show model, framework, tool, MCP and trace roles | Runnable app + short video | Successful first tool call | G01/G26/G30 | Large |
| Search, Composite or Hyperscale? | Search engineer / choose | Workload-based decision table and tuning translations for vector specialists | Guide + comparison lab | Reach appropriate index choice | G15/G16 | Medium |
| Hybrid search that obeys your filters | Developer / build | Positive and negative eligibility fixtures for both retrieval branches | Corrected docs + 5-minute demo | No ineligible results in acceptance suite | G02 | Small |
| Does memory earn its keep? | Architect / evaluate | Compare no memory, saved profile and managed memory, including failures and total cost | Benchmark + worksheet | Measured task benefit per total dollar | G08/G09 | Large |
| I changed my mind: what happens to old memory? | Developer / evaluate | Expose updates, conflict handling and application ownership | Trace walkthrough + runnable test | Changed facts retrieved correctly; stale cases disclosed | G03/G05 | Medium |
| From published benchmark to your own rerun | Performance engineer / evaluate | Versioned datasets, models, scripts, raw results and fair comparison boundaries | Reproducibility repository | Independent rerun within declared variance | G08/G18/G23 | Large |
| Keep ingestion correct when things change | Platform engineer / operate | Update/delete/retry/key-rotation and recovery behavior | Runbook + failure lab | Measured freshness and no silent missing/duplicate chunks | G06/G24 | Large |
| What your agent trace does and does not prove | Security/platform / operate | Redaction, dropped writes, retention and coverage ownership | Explainer + instrumented demo | Failures and sensitive fields handled under declared policy | G10 | Medium |
| When semantic caching loses money | Architect / evaluate | Wrong hits, stale records, bypass and all extra costs | Trade-off lab | Net savings and quality reported together | G25 | Medium |
| AI from SQL++ with a bounded bill | Database developer / build | Small classification workload with row limits, model charges and reruns | Tutorial + cost example | Reproducible outputs and bounded model work | G27 | Medium |
| Current learning paths from existing videos | Evaluator / learn | Versioned playlists and links to tested code; reuse strong assets | Playlist + description refresh | Tutorial click-through and first-run success | G12/G13/G21 | Small |

## Suggested first month

**Week 1:** Route P1 findings to their owners, fix the Catalog and hybrid examples, confirm memory wording, and inventory current quickstart environments. Collect analytics baselines and the engineering ticket for the sign-out incident.

**Week 2:** Publish the component/credential/cost map and vector-engine decision guide. Refresh the descriptions and next steps of the highest-priority existing videos. Do not wait for new video production to fix navigation.

**Week 3:** Assemble one working operational-data-plus-retrieval example and a reproducible lexical/dense/hybrid evaluation companion. Reuse the existing hands-on and Ragas material.

**Week 4:** Publish only validated memory economics and operational findings. If provider approval or benchmark data remains unavailable, publish the decision framework and mark results pending rather than inventing proof. Large benchmark and product changes will extend beyond this suggested first month.

## Questions to take to PM and engineering

- What exactly is immutable in Agent Memory, and what history remains queryable after an update or deletion?
- Which conflict-resolution behavior is service-owned versus application or model-owned?
- Can managed memory use approved providers beyond the currently documented integration path?
- What is the supported credential rotation/recovery path for persistent workflows?
- Which sparse retrieval, fusion, multivector and reranking options are native, integrated or application-built?
- Which benchmark scripts, raw outputs and cost breakdowns can be published?
- What trace delivery, redaction and coverage guarantees can marketing accurately promise?

## Limitations and corrections

This is a broad first pass. A complete SDK source audit, all-language compatibility matrix, full video viewing, private customer evidence, analytics, accessibility/SEO crawl, security certification and live validation of every product component remain outside this completed pass. No missing-feature claim should be derived solely from search failure.

The prior lexical lab's rejection of `tfidf` is **not sufficient evidence of a bug**: the documented value is `tf-idf`. That requires a corrected live retest. The model-key sign-out incident has no confirmed root cause in this audit; multiple browsers and an “AI filter” must not be presented as established explanations.

Memory token reductions, cache call reductions and overall billing savings are different measures. Do not add percentages across them or generalize a vendor benchmark to every application. A source establishing database or vector performance does not establish managed-memory economics.

## Evidence artifacts

- `findings.json`: 30 structured findings with source IDs and acceptance checks.
- `source-register.json`: 42 linked sources.
- `sdk-recheck.json`: current local Agent Catalog interface probe.
- `source-fetch.json`: downloaded-source status and hashes.
- `channel-visible-videos.json`: 30 sampled channel cards.
- `video-descriptions.json`: 11 detailed video metadata records.
- `sources/`: research snapshots. Raw HTML/temporary caption URLs are research inputs, not required publication assets.

Prior lab context: [agent operations](agent-operations/README.md) and its trace results; [lexical search](lexical-search/README.md). These are earlier scoped observations, not live tests repeated for this report.

The content-strategy framework found through the supplied directory was read and applied to buyer stages, unique information value and prioritization. It was not installed or executed. Search volume, revenue impact and conversion performance were not fabricated.

## Source register

- **product:** [AI Data Plane product page](https://www.couchbase.com/products/ai-data-plane/)
- **intro:** [AI Data Plane documentation overview](https://docs.couchbase.com/ai/get-started/intro.html)
- **memory:** [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html)
- **memory-api:** [Agent Memory REST API 1.1.0](https://docs.couchbase.com/agent-mem/current/agent-memory-api-reference/rest-api.html)
- **memory-video:** [Agent Memory demo video](https://www.youtube.com/watch?v=cihkYnuEh6M)
- **memory-demo:** [Agent Memory hotel demo repository](https://github.com/couchbaselabs/agentmemory-demo)
- **catalog:** [Agent Catalog integration guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html)
- **catalog-repo:** [Agent Catalog repository](https://github.com/couchbaselabs/agent-catalog)
- **catalog-pypi:** [agentc package metadata](https://pypi.org/project/agentc/)
- **memory-pypi:** [Agent Memory package](https://pypi.org/project/couchbase-agent-memory/)
- **mcp-pypi:** [MCP package](https://pypi.org/project/couchbase-mcp-server/)
- **langchain-pypi:** [LangChain Couchbase package](https://pypi.org/project/langchain-couchbase/)
- **mcp:** [MCP source and setup](https://github.com/couchbase/mcp-server-couchbase)
- **mcp-old:** [MCP version 1.0 documentation entry point](https://mcp-server.couchbase.com/)
- **mcp-managed:** [Managed MCP requirements](https://docs.couchbase.com/mcp-server/current/about-managed-mcp.html)
- **modes:** [Model Service serving-mode comparison](https://docs.couchbase.com/ai/build/model-service/model-service.html)
- **integrations:** [AI integration credentials and renewal](https://docs.couchbase.com/ai/admin/manage-ai-integrations.html)
- **apis:** [Management and Model Service APIs](https://docs.couchbase.com/ai/api-guide/api-intro.html)
- **workflow:** [Data processing and vectorization workflows](https://docs.couchbase.com/ai/build/vectorization-service/data-processing.html)
- **cache:** [LLM caching and value adds](https://docs.couchbase.com/ai/build/model-service/configure-value-adds.html)
- **functions:** [SQL++ AI Functions](https://docs.couchbase.com/ai/build/ai-functions.html)
- **billing:** [Capella billing](https://docs.couchbase.com/cloud/billing/billing.html)
- **pricing:** [Couchbase pricing](https://www.couchbase.com/pricing/)
- **vector:** [Vector algorithms and index families](https://docs.couchbase.com/server/current/vector-index/vectors-and-indexes-overview.html)
- **search-architecture:** [Search vector architecture](https://docs.couchbase.com/server/current/vector-search/vector-search-index-architecture.html)
- **hybrid:** [Search scoring and hybrid query semantics](https://docs.couchbase.com/cloud/search/run-searches.html)
- **hybrid-example:** [Capella UI vector search example](https://docs.couchbase.com/cloud/vector-search/run-vector-search-ui.html)
- **scoring:** [Search index scoring configuration](https://docs.couchbase.com/server/current/search/search-index-params.html)
- **launch:** [AI Data Plane launch article](https://www.couchbase.com/blog/your-ai-agents-are-stuck-in-pilot-its-a-data-problem-not-a-model-problem/)
- **memory-lane:** [Memory Lane technical article](https://www.couchbase.com/blog/build-a-personal-memory-search-with-couchbase-ai-services-and-hyperscale-vector-index/)
- **rag:** [Capella Model Service and LangChain tutorial](https://developer.couchbase.com/tutorial-capella-model-services-langchain-rag-with-hyperscale-or-composite-vector-index/)
- **net:** [Semantic Kernel vector search tutorial](https://developer.couchbase.com/tutorial-csharp-semantic-kernel-vector-search-with-hyperscale-or-composite-vector-index/)
- **ragas:** [Ragas evaluation tutorial](https://developer.couchbase.com/tutorial-evaluate-rag-responses-using-ragas/)
- **hol:** [AI Services hands-on lab](https://github.com/couchbaselabs/ais-hol)
- **bench:** [Hyperscale VectorDBBench whitepaper](https://info.couchbase.com/rs/302-GJY-034/images/COU_1372%20-%208.0%20Benchmarks%20for%20Hyperscale%20Vector%20Search%20-%20WP.pdf)
- **memory-bench:** [Public AI Data Plane reference and benchmark claims](https://github.com/couchbase/operational-data-platform-for-ai/blob/main/ai-data-plane.md)
- **press:** [October 20 announcement and token claims](https://www.prnewswire.com/news-releases/couchbase-ai-data-plane-cuts-the-cost-of-running-production-ai-agents-at-enterprise-scale-302913871.html)
- **esg:** [Commissioned ESG technical validation January 2025](https://info.couchbase.com/rs/302-GJY-034/images/ESG-Technical-Validation-Couchbase-Capella-FINAL-Jan-2025.pdf)
- **fankave:** [FanKave customer case study](https://info.couchbase.com/rs/302-GJY-034/images/COU_1378-FanKave_Customer_case_study.pdf?version=0)
- **directory:** [User-supplied AI TLDR tools directory](https://ai-tldr.dev/tools/?cat=productivity-writing&sub=writing-marketing)
- **skill:** [Content strategy skill used for prioritization](https://github.com/coreyhaines31/marketingskills/blob/main/skills/content-strategy/SKILL.md)
- **channel:** [Couchbase YouTube channel videos](https://www.youtube.com/channel/UCGUDXCRwJi-fuQp7sJyIZmg/videos)
