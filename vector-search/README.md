# Vector Search — native learning tests

Separate from [NoSQL](../nosql/README.md). Exploratory single-node tests, not a production benchmark.

## Native scale audit

Couchbase 8.0.3, one 4-vCPU / 16-GiB node, 50-GB disk. Deterministic synthetic 384-dimensional vectors: 10,000 and 50,000 documents. COSINE, Hyperscale IVF64, SQ4 and SQ8, probes and full-vector reranking varied. No semantic-quality claim for synthetic vectors.

1,564 main native query cases and 48 scalar-filter exact comparisons completed. No predicate violations; this does not mean perfect recall.

| Observation | Result |
|---|---|
| 50k SQ4, 8 probes, no reranking | 80% recall, 112 ms median client latency |
| Same, reranking enabled | 100% recall, 116 ms |
| 50k rare filter, SQ4, 64 probes + reranking | 100% recall, 120 ms |
| Same, SQ8 | 84.38% recall, 139 ms |
| Rare filter, 1 probe | Around 8–9% recall |
| SQ4 vs SQ8 total index disk | SQ4 about 17% smaller; full vectors and metadata retained |
| Exact baseline at 50k | Primary scan timed out at 60 s; covering index completed around 14.5 s |

SQ8 retrieval anomalies remained after full training and larger candidate/probe settings. Index statistics showed all items indexed, none pending. These are observations requiring investigation, not a confirmed product defect. Diagnostic IVF1 did not solve them.

For selective predicates, scalar filtering then exact distance returned 100% recall: 50 eligible documents at 50k took about 112 ms.

## Limits

Index memory statistics are not peak process memory or OS cache. Disk-backed operation was observed; OOM, failover, sustained production load and multi-node scaling were not tested. Client measurements include the Mac-to-cloud network. Earlier root-level hotel results are historical; direct SDK connectivity now works.

The native evidence archive includes queries, plans, exact baselines, index statistics, scripts and detailed report.
