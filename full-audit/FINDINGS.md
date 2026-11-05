# Detailed findings

November 5, 2026. Priorities are proposed, not agreed team commitments. P1 blocks a trustworthy first run; P2 improves evaluation or production readiness; P3 is a later segment or measurement task. Older findings have been revised where the wider review found existing content.

## G01 · P1 · Catalog guide and latest SDK disagree

**Evidence:** Offline reproduced. **Affected reader:** Application developers.

The guide uses from agentc import tool and Catalog.get_item. Local recheck of agentc 1.1.5, also the current PyPI version, finds neither; agentc.catalog.tool and Catalog.find are present.

**Why it matters:** A developer can fail before reaching the value demonstration.

**Action:** Correct the snippets, pin a tested environment, and execute documentation snippets in release CI.

**Proposed owner:** Docs + SDK.

**Done when:** Clean-environment quickstart imports, indexes, publishes and retrieves one tool; retain the package lock and CI result.

**Sources:** [Agent Catalog integration guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html); [agentc package metadata](https://pypi.org/project/agentc/).


**Local evidence:** [catalog-interface-checks.json](evidence/catalog-interface-checks.json).

## G02 · P1 · Hybrid example does not enforce global restrictions

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The global_scoring example restricts category and price in query but has no corresponding knn filter. The scoring reference describes the default combination as OR.

**Why it matters:** A reader may treat ranking eligibility as a mandatory business restriction. This is sample-design risk, not proof of an authorization bypass.

**Action:** Show an unrestricted union example separately from an eligibility-filtered example; apply mandatory restrictions to both branches.

**Proposed owner:** Search Docs + DevRel.

**Done when:** Fixtures outside the category and price range never appear in the mandatory-filter version.

**Sources:** [Capella UI vector search example](https://docs.couchbase.com/cloud/vector-search/run-vector-search-ui.html); [Search scoring and hybrid query semantics](https://docs.couchbase.com/cloud/search/run-searches.html).

## G03 · P2 · Qualify the scope of immutable memory

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Earlier product-page wording described immutable blocks. The current REST API supports content updates. Ask PM what is immutable: a version, event, or block. This does not prove a storage defect; the product page refresh was blocked in this environment.

**Why it matters:** Buyers may infer append-only history or historical reconstruction guarantees that the API description does not establish.

**Action:** Define which objects or versions are immutable; document history preservation and its limits; align product copy with the actual update contract.

**Proposed owner:** Memory PM + Docs + PMM.

**Done when:** A documented update example explains old-content availability and exactly what a historical query can recover.

**Sources:** [AI Data Plane product page](https://www.couchbase.com/products/ai-data-plane/); [Agent Memory REST API 1.1.0](https://docs.couchbase.com/agent-mem/current/agent-memory-api-reference/rest-api.html).

## G04 · P2 · Explain security controls by deployment

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Managed Memory documents API keys and allowed IPs; self-managed documents identity-provider authentication. Shared security goals do not imply identical controls. Earlier broad product wording needs a deployment-specific explanation.

**Why it matters:** A customer can underestimate migration and identity integration work.

**Action:** Publish an authentication and authorization matrix; scope the parity statement.

**Proposed owner:** Security PM + PMM.

**Done when:** Each deployment has its identity source, credentials, isolation boundary and migration steps specified.

**Sources:** [AI Data Plane product page](https://www.couchbase.com/products/ai-data-plane/); [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html).

## G05 · P2 · Demo autonomy can be mistaken for service autonomy

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The memory video description presents conflict reconciliation without developer intervention. Reference docs exclude reasoning logic; the hotel demo has application agents and retrieval tooling.

**Why it matters:** A successful application demonstration can be mistaken for an automatic service guarantee.

**Action:** Annotate the demo with what the service does, what the LLM does, and what application code configures.

**Proposed owner:** Memory PM + DevRel.

**Done when:** Publish one changed-preference example with source memory blocks, prompts, update path and failure outcome.

**Sources:** [Agent Memory demo video](https://www.youtube.com/watch?v=cihkYnuEh6M); [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html); [Agent Memory hotel demo repository](https://github.com/couchbaselabs/agentmemory-demo).

## G06 · P2 · Bedrock key renewal can require workflow recreation

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Integration docs require short-term Bedrock keys, at most 12 hours, and say an expired-key workflow cannot automatically use updated credentials; recovery requires deletion and recreation.

**Why it matters:** Long-running or recurring ingestion needs a clear operational recovery story. This limitation is documented, not reproduced in this audit.

**Action:** Prioritize credential refresh/resumability with PM; immediately add a renewal runbook and idempotent re-ingestion guidance.

**Proposed owner:** Workflows PM + Engineering.

**Done when:** A key rotation exercise records whether processing resumes without duplicate or missing chunks.

**Sources:** [AI integration credentials and renewal](https://docs.couchbase.com/ai/admin/manage-ai-integrations.html).

## G07 · P1 · Connect existing prerequisites and cost guidance

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Component setup, planning, pricing and credential guides exist. The missing deliverable is a short route from the intended task to its required components, credentials and billing units; do not claim there is no getting-started content.

**Why it matters:** The user must discover plan, region, API key and model dependencies during setup.

**Action:** Add a use-case selector with required versus optional services, credential type, region, plan, price unit and teardown.

**Proposed owner:** PMM + Product UX + Docs.

**Done when:** A new evaluator can identify a valid configuration and all billing parties before provisioning anything.

**Sources:** [AI Data Plane documentation overview](https://docs.couchbase.com/ai/get-started/intro.html); [Couchbase pricing](https://www.couchbase.com/pricing/); [Capella billing](https://docs.couchbase.com/cloud/billing/billing.html); [Managed MCP requirements](https://docs.couchbase.com/mcp-server/current/about-managed-mcp.html); [SQL++ AI Functions](https://docs.couchbase.com/ai/build/ai-functions.html).

## G08 · P2 · Memory benchmark claims need a reproducibility package

**Evidence:** Documentation / content assessment. **Affected reader:** Architects, buyers and marketing leadership.

Public material reports LoCoMo and LongMemEval scores and the announcement reports 33–45% fewer tokens versus alternatives. The reviewed claim surfaces do not supply enough configuration, raw outputs and cost accounting to reproduce the comparison.

**Why it matters:** Useful vendor evidence exists, but total-cost savings and cross-system superiority cannot be inferred from a headline.

**Action:** Link a versioned protocol, dataset subsets, models, judges, baselines, token categories, repeated runs and raw results directly from every claim.

**Proposed owner:** Performance Engineering + PMM.

**Done when:** A third party can rerun the experiment and distinguish retrieval, answer quality and total cost.

**Sources:** [Public AI Data Plane reference and benchmark claims](https://github.com/couchbase/operational-data-platform-for-ai/blob/main/ai-data-plane.md); [October 20 announcement and token claims](https://www.prnewswire.com/news-releases/couchbase-ai-data-plane-cuts-the-cost-of-running-production-ai-agents-at-enterprise-scale-302913871.html).

## G09 · P2 · Memory economics and no-memory alternatives

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The Memory developer guide and customization material are substantial. A use-case decision guide should connect them to current-context and saved-profile alternatives, with measured outcomes and total cost. Actual managed-memory economics remain untested.

**Why it matters:** Buyers may see an expensive extra component without a decision rule.

**Action:** Create a memory/no-memory/profile comparison and total-cost worksheet with explicit ingestion, extraction, embedding, retrieval, model and infrastructure costs.

**Proposed owner:** Technical Marketing + Memory PM.

**Done when:** Show a workload where memory helps and one where it adds cost without useful quality improvement.

**Sources:** [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html); [Capella billing](https://docs.couchbase.com/cloud/billing/billing.html); [Memory developer guide](https://docs.couchbase.com/agent-mem/current/develop/develop-agent-mem.html); [Memory custom prompts](https://docs.couchbase.com/agent-mem/current/develop/customize-prompts-agent-mem.html).

## G10 · P2 · Governance needs a delivery and redaction contract

**Evidence:** Prior live lab. **Affected reader:** Application developers.

Prior local agentc-core 1.1.5 tests persisted synthetic sensitive text unchanged; a duplicate insert incremented dropped_log_count without raising to the application. These are scoped tracing observations, not a full security audit.

**Why it matters:** Trace availability is not the same as guaranteed audit delivery or automatic redaction.

**Action:** Document redaction ownership, failure monitoring, delivery guarantees and instrumented coverage; demonstrate dropped-log handling.

**Proposed owner:** Catalog PM + SDK + Security.

**Done when:** A trace demo exposes successful writes, failed writes, redaction policy and retention verification.

**Sources:** [Agent Catalog integration guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html).

## G11 · P2 · Managed memory model choice is narrower

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Managed Agent Memory uses OpenAI integrations; self-managed accepts OpenAI-compatible models.

**Why it matters:** A user with a working Capella model deployment may still need another provider integration.

**Action:** Explain this before the memory setup CTA; ask PM about additional managed providers and approved company integration workflows.

**Proposed owner:** Memory PM + Product UX.

**Done when:** Setup clearly identifies who supplies and pays for each required model connection.

**Sources:** [Agent Memory capabilities and deployment comparison](https://docs.couchbase.com/agent-mem/current/about-agent-mem.html).

## G12 · P2 · Older videos need version-specific routes

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Descriptions for older AI Services videos now use AI Data Plane branding. Their publication dates predate current managed services.

**Why it matters:** A current title can lead viewers to an older UI or deployment path.

**Action:** Keep useful videos; add tested version, serving mode, current replacement links and matching sample repository.

**Proposed owner:** Video Marketing + DevRel.

**Done when:** Each prioritized video has a date/version notice and a verified current next step.

**Sources:** [Couchbase YouTube channel videos](https://www.youtube.com/channel/UCGUDXCRwJi-fuQp7sJyIZmg/videos).

## G13 · P2 · Turn broad videos into task-based learning paths

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The channel contains brand stories, architecture panels, demos, SQL/JSON education and customer stories. It is not empty.

**Why it matters:** A beginner still needs a route from overview to a working, evaluated application.

**Action:** Curate Learn → Choose → Build → Evaluate → Operate playlists; link each video to a precise tutorial and code revision.

**Proposed owner:** Video Marketing.

**Done when:** Measure tutorial click-through and successful first-run events, not views alone.

**Sources:** [Couchbase YouTube channel videos](https://www.youtube.com/channel/UCGUDXCRwJi-fuQp7sJyIZmg/videos).

## G14 · P2 · TF-IDF spelling needs a corrected retest

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Our earlier lab rejected tfidf. Current docs specify tf-idf. The earlier rejection alone is not a demonstrated product defect.

**Why it matters:** An incorrect internal bug claim would weaken the audit.

**Action:** Reclassify that earlier finding as an invalid-input observation until the documented spelling is tested.

**Proposed owner:** Technical Marketing + Test owner.

**Done when:** A future live check uses tf-idf exactly and records the response. No live retest claimed here.

**Sources:** [Search index scoring configuration](https://docs.couchbase.com/server/current/search/search-index-params.html).

## G15 · P2 · Publish a vector-engine decision matrix

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Three index families and their controls are documented, but evaluators need a translation into workload choices.

**Why it matters:** HNSW, IVF, quantization and hybrid search can be conflated.

**Action:** Compare Search, Composite and Hyperscale by filtering, lexical features, tuning, memory, updates and deployment limits.

**Proposed owner:** Search PM + Technical Marketing.

**Done when:** Link each cell to a supported version and demonstrate a workload where each family is appropriate.

**Sources:** [Vector algorithms and index families](https://docs.couchbase.com/server/current/vector-index/vectors-and-indexes-overview.html); [Search vector architecture](https://docs.couchbase.com/server/current/vector-search/vector-search-index-architecture.html).

## G16 · P2 · Clarify sparse and late-interaction support

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

This audit did not find an explicit Couchbase matrix classifying learned sparse retrieval, multivectors, fusion and multistage reranking as native, integrated, application-built or unsupported.

**Why it matters:** A missing explanation may be mistaken for a missing feature, or an application workaround for native support.

**Action:** Ask PM to classify sparse/SPLADE, multivectors, RRF/DBSF and rerankers as native, connector-supported, application-built or unsupported.

**Proposed owner:** Search PM + Technical Marketing.

**Done when:** Publish source-backed classifications; do not label features absent solely from search results.

**Sources:** [Search scoring and hybrid query semantics](https://docs.couchbase.com/cloud/search/run-searches.html); [Vector algorithms and index families](https://docs.couchbase.com/server/current/vector-index/vectors-and-indexes-overview.html).

## G17 · P2 · Hosted inference and workflow models need distinct explanations

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Model Service distinguishes serverless Bedrock from provisioned NIM. Workflows also accept external OpenAI/Bedrock integrations; only provisioned Model Service deployments are workflow-eligible in the serving-mode table.

**Why it matters:** Saying all workflows require provisioned models would itself be misleading.

**Action:** Add separate diagrams for inference API calls, managed vectorization, and externally generated embeddings.

**Proposed owner:** Model PM + Docs.

**Done when:** An evaluator can choose a supported path without confusing an external Bedrock integration with a serverless Capella model.

**Sources:** [Model Service serving-mode comparison](https://docs.couchbase.com/ai/build/model-service/model-service.html); [Data processing and vectorization workflows](https://docs.couchbase.com/ai/build/vectorization-service/data-processing.html).

## G18 · P2 · Update the scale benchmark package

**Evidence:** Documentation / content assessment. **Affected reader:** Architects, buyers and marketing leadership.

The vector-scale whitepaper includes methodology, hardware, index definitions and recall curves, but its Couchbase build is a prerelease on EC2. A current GA, repeatable deployment recipe would make the study easier to apply to a Capella evaluation.

**Why it matters:** It is useful evidence for its setup, not current Capella or universal production proof.

**Action:** Publish GA versions, repeatable scripts, raw runs, equal-recall comparisons, costs and concurrent-mutation workloads.

**Proposed owner:** Performance Engineering.

**Done when:** A benchmark manifest identifies versions, hardware, dataset, filter selectivity, concurrency and cost boundaries.

**Sources:** [Hyperscale VectorDBBench whitepaper](https://info.couchbase.com/rs/302-GJY-034/images/COU_1372%20-%208.0%20Benchmarks%20for%20Hyperscale%20Vector%20Search%20-%20WP.pdf).

## G19 · P2 · Separate database success from memory ROI

**Evidence:** Documentation / content assessment. **Affected reader:** Architects, buyers and marketing leadership.

FanKave is a real customer story with operational and AI use cases. It does not establish measured Agent Memory benefits. The commissioned ESG report predates the current memory release.

**Why it matters:** Broad customer logos can be overextended into claims about newly released components.

**Action:** Build component-specific customer proof: architecture, baseline, outcome, timeline, measurement and approved attribution.

**Proposed owner:** Customer Marketing + PMM.

**Done when:** A memory-specific case shows before/after task success and full cost, with customer approval.

**Sources:** [FanKave customer case study](https://info.couchbase.com/rs/302-GJY-034/images/COU_1378-FanKave_Customer_case_study.pdf?version=0); [Commissioned ESG technical validation January 2025](https://info.couchbase.com/rs/302-GJY-034/images/ESG-Technical-Validation-Couchbase-Capella-FINAL-Jan-2025.pdf).

## G20 · P2 · Memory Lane is RAG, not proof of Agent Memory

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The detailed Memory Lane article implements document retrieval using Hyperscale and model calls. Its name can collide with the Agent Memory product category.

**Why it matters:** Readers may infer that any stored document search exercises managed memory.

**Action:** Label the article as a document-RAG reference and link a short comparison with Agent Memory.

**Proposed owner:** Blog editor + DevRel.

**Done when:** Architecture labels identify exactly which products are and are not used.

**Sources:** [Memory Lane technical article](https://www.couchbase.com/blog/build-a-personal-memory-search-with-couchbase-ai-services-and-hyperscale-vector-index/).

## G21 · P2 · Tutorial environment hygiene needs tightening

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The LangChain tutorial pins libraries but displays Python 3.14/Pydantic compatibility warnings and describes multi-node prerequisites.

**Why it matters:** Warnings and unexplained deployment sizing reduce confidence and increase setup cost.

**Action:** Publish a clean tested runtime, distinguish minimum from recommended topology, and add setup/teardown validation.

**Proposed owner:** DevRel + SDK.

**Done when:** Fresh execution has an explicit supported Python version and no unexplained compatibility warnings.

**Sources:** [Capella Model Service and LangChain tutorial](https://developer.couchbase.com/tutorial-capella-model-services-langchain-rag-with-hyperscale-or-composite-vector-index/).

## G22 · P2 · Version and machine-readable documentation drift

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The legacy MCP site and current 1.1 package expose different versioned starting paths. The official AI documentation index successfully linked 71 retrievable pages in this pass. Some separately attempted Markdown URLs returned 403 while HTML worked; those are not established broken public links.

**Why it matters:** Search engines and coding assistants can land on older or non-navigable instructions.

**Action:** Add current-version banners/canonical links; validate generated Markdown links as well as HTML.

**Proposed owner:** Docs platform.

**Done when:** A link checker resolves MCP and overview links from both HTML and Markdown entry points.

**Sources:** [MCP version 1.0 documentation entry point](https://mcp-server.couchbase.com/); [MCP package](https://pypi.org/project/couchbase-mcp-server/); [AI Data Plane documentation overview](https://docs.couchbase.com/ai/get-started/intro.html).

## G23 · P2 · Extend existing Ragas material instead of duplicating it

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

An actual Ragas tutorial already covers retrieval and generation evaluation.

**Why it matters:** Another generic evaluation introduction adds less value than runnable comparisons.

**Action:** Build a BEIR-based companion comparing lexical, dense and hybrid search, and add changing-data, negative-query and filter correctness suites.

**Proposed owner:** Technical Marketing + DevRel.

**Done when:** Publish labeled datasets, fixed models, held-out queries, metrics and both wins and losses.

**Sources:** [Ragas evaluation tutorial](https://developer.couchbase.com/tutorial-evaluate-rag-responses-using-ragas/).

## G24 · P2 · Demonstrate freshness and recovery

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Workflows document chunking, metadata collections and generated Eventing functions. The reviewed starting materials do not demonstrate a full update/delete/key-expiry recovery acceptance test.

**Why it matters:** Production users need to know when removed or changed content stops influencing answers.

**Action:** Publish an ingestion lifecycle lab: insert, update, delete, retry, deduplicate, re-embed and recover.

**Proposed owner:** Workflows PM + DevRel.

**Done when:** Record source-to-search lag, duplicates, stale chunks and recovery results rather than only workflow completion.

**Sources:** [Data processing and vectorization workflows](https://docs.couchbase.com/ai/build/vectorization-service/data-processing.html); [AI integration credentials and renewal](https://docs.couchbase.com/ai/admin/manage-ai-integrations.html).

## G25 · P2 · Cache savings need false-hit and freshness examples

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Value Adds docs acknowledge semantic caching can increase cost and expose threshold controls.

**Why it matters:** A cache hit is not automatically a correct answer or a net saving.

**Action:** Publish a break-even and false-hit lab with changing records, tenant boundaries and cache bypass.

**Proposed owner:** Model PM + Technical Marketing.

**Done when:** Report incorrect hit rate, latency and net cost including embedding/cache resources.

**Sources:** [LLM caching and value adds](https://docs.couchbase.com/ai/build/model-service/configure-value-adds.html); [Capella billing](https://docs.couchbase.com/cloud/billing/billing.html).

## G26 · P2 · Do not describe Catalog as managed agent execution

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

The Catalog guide explicitly leaves tool execution to the chosen framework.

**Why it matters:** Agent management language can imply an agent runtime or orchestrator.

**Action:** Add a responsibility diagram for model, framework, tool execution, MCP, memory and tracing.

**Proposed owner:** PMM + Catalog PM.

**Done when:** An example identifies the process that actually executes each operation and enforces authorization.

**Sources:** [Agent Catalog integration guide](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html).

## G27 · P2 · AI Functions need bounded operational examples

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

SQL++ AI Functions have paid-cluster, multi-AZ and model prerequisites; model and query charges still apply.

**Why it matters:** A simple SQL example may conceal deployment requirements and per-row model cost.

**Action:** Publish a limited-row support-ticket classification example with cost estimation, error handling, validation and repeat-run behavior.

**Proposed owner:** AI Functions PM + DevRel.

**Done when:** Show billed model work, failed rows, output validation and the effect of rerunning a query.

**Sources:** [SQL++ AI Functions](https://docs.couchbase.com/ai/build/ai-functions.html).

## G28 · P2 · Model-key sign-out needs an engineering case

**Evidence:** User report; engineering record pending. **Affected reader:** Application developers.

John reports engineering confirmed the Model Service key-creation sign-out as a bug. We still lack an incident ID, exact affected model and verified workaround. It is not evidence that multiple browsers or an IP rule caused the issue.

**Why it matters:** Onboarding friction is real to the evaluator; its root cause is not established.

**Action:** Collect request ID, timestamp, region, exact model, response status and engineering ticket; avoid attributing it to multiple browsers or AI filtering.

**Proposed owner:** Capella UX + Support.

**Done when:** Engineering confirms the incident, workaround and fixed release; no speculative diagnosis becomes marketing fact.

**Sources:** [Management and Model Service APIs](https://docs.couchbase.com/ai/api-guide/api-intro.html).

## G29 · P3 · Public content cannot establish conversion performance

**Evidence:** Documentation / content assessment. **Affected reader:** Architects, buyers and marketing leadership.

Video metadata and public content are available; retention, Search Console, CRM attribution and funnel conversion are not.

**Why it matters:** Low views or abundant content alone cannot identify the business bottleneck.

**Action:** Request read-only content analytics and connect video/tutorial entry to first successful query and qualified evaluation.

**Proposed owner:** Marketing Ops + Web Analytics.

**Done when:** Separate measured channel performance from editorial judgment; report baselines before setting numeric targets.

**Sources:** [Couchbase YouTube channel videos](https://www.youtube.com/channel/UCGUDXCRwJi-fuQp7sJyIZmg/videos).

## G30 · P2 · Show operational data plus retrieval in one application

**Evidence:** Documentation / content assessment. **Affected reader:** Application developers.

Existing SQL/JSON and AI material offers the pieces, but the evaluator needs to see why the combination changes an application.

**Why it matters:** A vector-only comparison misses Couchbase operational strengths.

**Action:** Build a support assistant that combines current orders via KV/SQL++, policy search via hybrid retrieval, explicit write approval and trace inspection; add memory only as an optional extension.

**Proposed owner:** Technical Marketing + Solutions Engineering.

**Done when:** Trace one request, show current versus stale records, enforce customer scope and measure the outcome with and without each optional service.

**Sources:** [AI Services hands-on lab](https://github.com/couchbaselabs/ais-hol); [Semantic Kernel vector search tutorial](https://developer.couchbase.com/tutorial-csharp-semantic-kernel-vector-search-with-hyperscale-or-composite-vector-index/).

## G31 · P1 · Python vector quickstart has two unclosed calls

**Evidence:** Offline reproduced. **Affected reader:** Developers and architects.

The first two Python Query-service code blocks fail ast.parse after common indentation is removed: an opening parenthesis is never closed. A signature-only block is not counted as a runnable-example failure.

**Why it matters:** Python developers cannot paste and run these examples.

**Action:** Correct both blocks and execute complete samples against the declared server version.

**Proposed owner:** Docs + Python SDK.

**Done when:** Two clean-environment runs produce expected output; include the test revision.

**Sources:** [Python vector guide](https://docs.couchbase.com/python-sdk/current/howtos/vector-searching-with-sdk.html).


**Local evidence:** [python-snippet-checks.json](evidence/python-snippet-checks.json).

## G32 · P1 · Nine Hyperscale examples do not perform similarity search

**Evidence:** Static source inspection. **Affected reader:** Developers and architects.

Python, Java, .NET, Node.js, Go, Scala, PHP, Ruby and C++ guides label an ID lookup as a Hyperscale example. The displayed SQL selects an existing record and vector slice, without a distance calculation or nearest-neighbor ordering.

**Why it matters:** Readers do not learn the operation the section promises.

**Action:** Keep the lookup as inspection, then add an actual ANN query and verified query plan.

**Proposed owner:** SDK Docs + Search DevRel.

**Done when:** Each language example returns nearest neighbors and its plan uses the intended index.

**Sources:** [Python vector guide](https://docs.couchbase.com/python-sdk/current/howtos/vector-searching-with-sdk.html); [Java vector guide](https://docs.couchbase.com/java-sdk/current/howtos/vector-searching-with-sdk.html).


**Local evidence:** [sdk-doc-checks.json](evidence/sdk-doc-checks.json).

## G33 · P1 · Switching LangChain adapters can silently lose a filter

**Evidence:** Offline reproduced. **Affected reader:** Developers and architects.

In langchain-couchbase 1.2.0, Query accepts where_str. Passing the Search adapter filter argument is accepted via kwargs but omitted from generated SQL. A mocked-database probe reproduced it. Search rejects a plain dictionary filter.

**Why it matters:** A developer may believe a mandatory restriction survived an adapter switch. This is not proof of a server authorization bypass.

**Action:** Show each filter API explicitly; reject or warn on unsupported arguments; add negative filter fixtures.

**Proposed owner:** Integration maintainer + DevRel.

**Done when:** Wrong adapter arguments fail clearly; valid restrictions survive in the generated request and live results.

**Sources:** [LangChain adapter source](https://github.com/Couchbase-Ecosystem/langchain-couchbase/tree/main/langchain_couchbase/vectorstores); [LangChain Couchbase package](https://pypi.org/project/langchain-couchbase/).


**Local evidence:** [adapter-probes.json](evidence/adapter-probes.json).

## G34 · P2 · MCP and LangChain require separate environments at these versions

**Evidence:** Offline dependency resolution. **Affected reader:** Developers and architects.

Resolution of couchbase-mcp-server 1.1.0 plus langchain-couchbase 1.2.0 fails: the former requires reo-census <0.2.0 and the latter >=0.2.0. LangChain imports successfully in its own environment.

**Why it matters:** A combined tutorial environment fails installation; separate MCP and app processes remain a practical path.

**Action:** Document environment isolation and ask maintainers to align compatible dependency ranges.

**Proposed owner:** SDK maintainers + DevRel.

**Done when:** Both independently locked environments run, or a supported combined lock resolves.

**Sources:** [MCP package](https://pypi.org/project/couchbase-mcp-server/); [LangChain Couchbase package](https://pypi.org/project/langchain-couchbase/).


**Local evidence:** [dependency-resolution.txt](evidence/dependency-resolution.txt), [package-metadata.json](evidence/package-metadata.json), [langchain-runtime.txt](evidence/langchain-runtime.txt).

## G35 · P1 · Custom Memory prompt example contradicts its validation note

**Evidence:** Documentation mismatch plus offline probe. **Affected reader:** Developers and architects.

The prompt guide says omitting context_required with prompt_id causes validation failure, but its own examples omit it. SDK 1.1.0 forwards the omitted value; it rejects explicit False. Server behavior was not tested.

**Why it matters:** A customization recipe leaves the reader unsure which contract to follow.

**Action:** Confirm server default and align SDK, example and warning; show context_required=True if required.

**Proposed owner:** Memory PM + Docs + SDK.

**Done when:** Run the shown request against service 1.1.0 and document omitted/true/false outcomes.

**Sources:** [Memory custom prompts](https://docs.couchbase.com/agent-mem/current/develop/customize-prompts-agent-mem.html); [Memory developer guide](https://docs.couchbase.com/agent-mem/current/develop/develop-agent-mem.html).


**Local evidence:** [memory-validation-probes.json](evidence/memory-validation-probes.json).

## G36 · P2 · Make integration support status visible before installation

**Evidence:** Documented policy. **Affected reader:** Developers and architects.

LangChain and Haystack README support policies direct issues to GitHub and describe community maintenance. That differs from paid AI Data Plane support for named components.

**Why it matters:** Enterprise evaluators need to know who owns incidents.

**Action:** Add owner, support route, tested versions and index coverage to integration cards.

**Proposed owner:** Partner Engineering + Docs + Technical Marketing.

**Done when:** Every promoted adapter names its maintainer and support route.

**Sources:** [LangChain Couchbase package](https://pypi.org/project/langchain-couchbase/); [Haystack integration](https://github.com/Couchbase-Ecosystem/couchbase-haystack); [AI Data Plane documentation overview](https://docs.couchbase.com/ai/get-started/intro.html).


**Local evidence:** [package-metadata.json](evidence/package-metadata.json).

## G37 · P2 · LangChain Query initialization attempts primary-index creation

**Evidence:** Static source inspection. **Affected reader:** Developers and architects.

The 1.2.0 Query adapter constructor issues CREATE PRIMARY INDEX IF NOT EXISTS. It raises on failure. This was source-inspected, not tested with a read-only live credential.

**Why it matters:** A retrieval app may unexpectedly need index-management privileges during setup.

**Action:** Separate provisioning from retrieval credentials in the guide; maintainer should consider an explicit initialization option.

**Proposed owner:** Integration maintainer + DevRel.

**Done when:** A documented least-privilege retrieval setup initializes and queries without unexpected DDL.

**Sources:** [LangChain adapter source](https://github.com/Couchbase-Ecosystem/langchain-couchbase/tree/main/langchain_couchbase/vectorstores).


**Local evidence:** [langchain-couchbase-interfaces.json](evidence/langchain-couchbase-interfaces.json).

## G38 · P2 · MCP 1.1 has its own audit controls

**Evidence:** Documentation plus source inspection. **Affected reader:** Developers and architects.

Current MCP docs describe opt-in audit logging, omitted arguments by default, optional verbatim argument capture, and counters for failed/dropped records. This is separate from the earlier Catalog DBLogger tests.

**Why it matters:** Calling all activity recording one audit layer hides different setup and delivery guarantees.

**Action:** Create one logging map and a recovery demo; do not claim automatic redaction or guaranteed delivery.

**Proposed owner:** MCP Engineering + Technical Marketing.

**Done when:** Show which process records each event, where it goes, and how a dropped record is detected.

**Sources:** [MCP audit logging](https://docs.couchbase.com/mcp-server/1.1/configuration/audit-logging.html); [MCP 1.1 release notes](https://docs.couchbase.com/mcp-server/1.1/reference/release-notes.html).


**Local evidence:** [couchbase-mcp-server-interfaces.json](evidence/couchbase-mcp-server-interfaces.json).

## G39 · P2 · Operational Insights needs its own SDK and MCP explanation

**Evidence:** Documented boundary. **Affected reader:** Developers and architects.

Official documentation distinguishes Enterprise Operational Insights SDKs, Capella Columnar SDKs and operational-cluster Analytics APIs. MCP 1.1 Operational Insights support is self-managed only.

**Why it matters:** The shared product name can lead developers to the wrong endpoint or package.

**Action:** Add a deployment-to-SDK selector and a supported analytical-agent recipe.

**Proposed owner:** Operational Insights Docs + PM.

**Done when:** Every example names its deployment, connection type and supported MCP route.

**Sources:** [Operational Insights SDK choices](https://docs.couchbase.com/home/operational-insights-sdk.html); [Operational Insights MCP prerequisites](https://docs.couchbase.com/mcp-server/1.1/get-started-oi/prerequisites-oi.html).

## G40 · P3 · Cloud-to-edge positioning needs a separate runnable proof

**Evidence:** Documentation assessment; no device test. **Affected reader:** Developers and architects.

Lite documents local vector search and an Enterprise-only extension. Local retrieval is not proof that model generation, managed memory or all cloud services work offline.

**Why it matters:** Mobile architects need explicit offline boundaries and deployment requirements.

**Action:** Add an airplane-mode retrieval demo with model location, sync/reconnect and hardware requirements.

**Proposed owner:** Mobile DevRel + Technical Marketing.

**Done when:** Show what works offline, what fails, and how data changes after reconnect.

**Sources:** [Lite vector search](https://docs.couchbase.com/couchbase-lite/current/swift/vector-search.html); [Lite vector extension installation](https://docs.couchbase.com/couchbase-lite/current/objc/gs-install.html).

## G41 · P2 · Tracer and Tools/Prompts Hub already have guides

**Evidence:** Existing content verified. **Affected reader:** Developers and architects.

The official index includes trace instrumentation, trace viewing, SQL++ trace queries and Tools/Prompts Hub navigation.

**Why it matters:** A generic request to create governance guides would duplicate existing work.

**Action:** Link these guides to a versioned tool-change demo and explain instrumentation prerequisites.

**Proposed owner:** Technical Marketing + Catalog Docs.

**Done when:** A reader can connect a tool version, a request trace and its source revision.

**Sources:** [Agent Tracer guide](https://docs.couchbase.com/ai/build/agent-tracer/agent-tracer.html); [Tools and Prompts Hub](https://docs.couchbase.com/ai/build/tools-prompts-hub.html).

## G42 · P2 · Serverless model settings have a redeployment lifecycle

**Evidence:** Documented limitation. **Affected reader:** Developers and architects.

The serverless guide says deployed models cannot be edited or turned off; changing configuration requires deletion and redeployment. Regional keys and embedding/cache dependencies are documented.

**Why it matters:** Serverless removes GPU sizing, not every operational decision.

**Action:** Add a small lifecycle and cost-unit diagram to the inference guide.

**Proposed owner:** Model Service PM + Technical Marketing.

**Done when:** Demonstrate safe configuration change and cleanup of dependent models; show token charges separately.

**Sources:** [Serverless model deployment](https://docs.couchbase.com/ai/build/model-service/deploy-serverless-model.html).

## G43 · P2 · RAG guidance should separate retrieval k from model sampling

**Evidence:** Documentation ambiguity. **Affected reader:** Developers and architects.

The RAG blueprint refers to a higher Top K on the LLM while discussing retrieved supporting context. These are different controls and should be named separately.

**Why it matters:** Readers may tune sampling when they mean to retrieve more documents.

**Action:** Label retrieval top-k and generation sampling top-k separately with one concrete example.

**Proposed owner:** AI Docs + Search DevRel.

**Done when:** The guide identifies which API receives each value and what metric it affects.

**Sources:** [RAG blueprints](https://docs.couchbase.com/ai/agent-tutorial/rag-patterns.html).

## G44 · P2 · Higher embedding dimensions do not guarantee better accuracy

**Evidence:** Technical editorial finding. **Affected reader:** Developers and architects.

Lite guidance presents increasing dimensions as increasing accuracy. Quality depends on the model, data and retrieval setup; dimension count alone does not establish it.

**Why it matters:** Readers can choose more expensive embeddings without evidence of benefit.

**Action:** Qualify the statement and connect it to a measured quality/storage trade-off.

**Proposed owner:** Mobile Docs + Search PM.

**Done when:** Compare supported embedding configurations on held-out queries at stated quality targets.

**Sources:** [Lite vector search](https://docs.couchbase.com/couchbase-lite/current/swift/vector-search.html).

## G45 · P2 · Templates need a maintenance process to prevent repeated drift

**Evidence:** Repository process assessment. **Affected reader:** Developers and architects.

The repository has article templates and author/reviewer skills. Automated snippet checks, link/version checks, corporate publication routing and named ownership have not been implemented.

**Why it matters:** A reusable template alone will not keep docs, code and videos aligned.

**Action:** Assign owners and add a release checklist with executable sample checks and dated evidence.

**Proposed owner:** Technical Marketing + Docs tooling.

**Done when:** Every promoted asset has an owner, tested revision, review date, companion links and a maintained validation job.

**Sources:** [Official AI documentation inventory](https://docs.couchbase.com/llms-ai-data-plane.txt).
