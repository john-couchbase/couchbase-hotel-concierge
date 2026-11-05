# Evidence and benchmark plan

November 5, 2026. These are acceptance criteria for proposed work, not new benchmark results or authorization to exceed the remaining $30 budget.

## Claims we can responsibly use today

| Claim area | Available evidence | Safe conclusion | What is still needed |
|---|---|---|---|
| Operational data functionality | Native NoSQL lab with 55 recorded checks | These operations worked under the recorded configuration; index choice materially affected the tested query | Representative load, concurrency, failure recovery and environment-matched costs |
| Filtered vector retrieval | Native synthetic 10k/50k tests, plans and exact comparisons | Mandatory tested predicates held; recall varied | Real relevance labels, wider datasets and engineering review of SQ8 anomalies |
| Lexical/hybrid controls | Small labeled fixtures and native searches | Analyzer choices and both-branch restrictions matter | Larger held-out relevance evaluation and corrected `tf-idf` test |
| Memory quality and token reduction | Public claims plus documented service/SDK capabilities | Couchbase publishes results; our lab has not reproduced them | Dataset revision, model versions, prompts, baseline configuration, raw outputs and total-cost ledger |
| Hyperscale scale | Vendor whitepaper with method, hardware and recall curves | A scoped published study exists | Current GA reproducibility package and deployment-specific comparison at equal recall |
| Customer value | Customer story and separate commissioned technical validation | Existing customer/technical evidence has defined scope | Component-specific measured Memory or managed-agent outcome with customer permission |
| Governance | Prior Catalog logger tests; current MCP audit reference | Recording exists with setup and delivery limits | Full instrumentation coverage, failure handling and permission tests on the intended deployment |

Sources: [published Memory claims](https://github.com/couchbase/operational-data-platform-for-ai/blob/main/ai-data-plane.md), [cost announcement](https://www.prnewswire.com/news-releases/couchbase-ai-data-plane-cuts-the-cost-of-running-production-ai-agents-at-enterprise-scale-302913871.html), [vector whitepaper](https://info.couchbase.com/rs/302-GJY-034/images/COU_1372%20-%208.0%20Benchmarks%20for%20Hyperscale%20Vector%20Search%20-%20WP.pdf), [customer study](https://info.couchbase.com/rs/302-GJY-034/images/COU_1378-FanKave_Customer_case_study.pdf?version=0), [prior native reports](CAPABILITIES.md#prior-live-evidence-what-we-can-and-cannot-claim).

Token reduction, fewer model calls and lower total bill are different outcomes. Do not add percentages from unrelated workloads or extrapolate a small synthetic benchmark to production.

## Five studies that answer buyer questions

| Study | Comparison | Measures | Fairness controls / stop condition |
|---|---|---|---|
| **Retrieval choice** | Lexical, dense and hybrid on selected licensed BEIR subsets plus operational fixtures | nDCG@10, recall@k, zero results, predicate violations, p50/p95, cost | Same corpus and held-out questions; separate tuning/test splits; every mandatory-filter violation fails that case |
| **Memory usefulness** | Current context, full history, saved profile, Agent Memory | Task completion, correct recall, stale/irrelevant recall, permanent vs temporary corrections, deletion and isolation | Equivalent available history; deterministic expected facts; report missing/failed extraction rather than hiding it |
| **Memory economics** | Above baselines across short/repeated/long-running workloads | Full input/output tokens, extraction, embedding, retrieval, infrastructure and operator work | Count memory-building cost; amortize transparently; identify break-even assumptions rather than promise universal savings |
| **Vector scale/compression** | Applicable index families and quantization configurations | Equal-recall p50/p95, build time, index size, resident memory, ingestion/update cost | Fixed embeddings and ground truth; repeated warm/cold runs; disclose hardware/versions; do not expand data until cost estimate is approved within remaining budget |
| **Production lifecycle** | Cache thresholds, source updates/deletes, credential expiry, provider errors and audit-write failures | Correct/false/stale cache hits, freshness lag, recovery time, dropped logs, task success and total cost | Deliberate failure fixtures; explicit fallback; count retries and ongoing resources |

For Memory, use at least two contrasting scenarios: a support case where prior troubleshooting matters and a one-shot lookup where memory adds little. Include conflicting facts and a current system-of-record check. A successful API response does not prove useful memory.

For retrieval, BEIR provides relevance workloads; it does not replace tests of changing records, permission boundaries or business filters. Do not silently label a synthetic vector distance task as semantic relevance.

## Required publication bundle

1. A short conclusion that names who the result applies to.
2. Dataset source/license, revisions, queries, expected answers and exclusions.
3. Exact service/package/model versions, index definitions, configuration, hardware and region.
4. Reproduction commands, dependency locks and cleanup instructions.
5. Raw per-query outputs, errors, repeated runs and latency distributions.
6. Full cost assumptions and a statement of which charges were measured versus estimated.
7. Known limitations, losing cases and an owner/date for the next review.

The existing [Ragas tutorial](https://developer.couchbase.com/tutorial-evaluate-rag-responses-using-ragas/) and [benchmark template](../content-system/templates/benchmark.md) are foundations to extend.

## Engineering and PM questions

- What is the approved Memory benchmark reproduction package behind the public claims?
- Which object/version is intended to be immutable, and what is the supported behavior for contradictory or superseded facts?
- Is omitting `context_required` allowed with a custom prompt on the managed service? Which example is authoritative?
- What are the supported combined dependency versions for the current LangChain and MCP packages?
- Should unknown filter arguments fail rather than be ignored? Can retrieval initialization avoid DDL?
- Which learned-sparse, multivector, fusion and reranking capabilities are native, integrated, application-built or unsupported?
- What is the incident ID, exact affected model and verified workaround for the reported Model Service sign-out bug?
- Which published support entitlements apply to each promoted integration?
- Which scale/quantization anomalies from the retained native report are expected trade-offs versus defects?

These are questions to resolve, not assertions that the features are absent or broken. No messages have been sent to engineers as part of this audit.
