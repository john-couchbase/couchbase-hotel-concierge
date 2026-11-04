# Couchbase AI Data Plane learning lab

An evidence-based learning audit. Native tests run against an isolated Capella learning cluster; results distinguish verified behavior, limitations and untested product areas. These are exploratory tests, not a production application or vendor performance benchmark.

## Start here

- **[NoSQL: documents, SQL++, indexes and data correctness](nosql/README.md)** — JSON orders, known-key reads, filtering, nested arrays, transactions, concurrency and scale trade-offs.
- **[Vector Search: recall, filters and quantization](vector-search/README.md)** — native 10k/50k synthetic-vector tests, SQ4/SQ8 trade-offs, exact baselines and unresolved retrieval anomalies.
- **[Lexical and hybrid search](lexical-search/README.md)** — native tests of stop words, stemming, synonyms, phrases, typos, accents, hybrid filters and input validation.

## Current connection status

Direct SDK access to the paid learning cluster now works. A network-route/IP-allowlist mismatch caused the earlier timeouts; the corrected narrow allow rule is temporary. The original read-only MCP connector still targets the original travel-sample cluster. A separate scoped learning server supports hotel retrieval. The assistant can select exposed tools from plain English; this is distinct from proving a Capella-hosted model or managed agent chose those tools.

No successful paid Model Service generation or end-to-end Capella-model tool-selection run is claimed. Managed MCP deployment did not succeed and was removed. Data API is disabled. Agent Memory, managed-agent operations and production governance require their own verified tests.

## Evidence

Download the [native NoSQL audit](native-nosql-audit.zip) , [native vector scale audit](native-vector-scale-audit.zip), or [native lexical audit](native-lexical-audit.zip). The NoSQL cluster was confirmed paused after the batch.

The NoSQL folder contains the current guide, native results, query plans and reproducible test scripts. The vector evidence archive contains detailed native reports, queries, ground truth, plans, measurements and scripts. Earlier root-level hotel/search JSON files and couchbase-ai-learning.zip remain historical evidence; vector-local-baseline.json is explicitly local, not native Couchbase performance.

## Interpretation and budget

One 4-vCPU / 16-GiB node with zero replicas was used. Client latency includes the laptop-to-cloud network. Synthetic data and small timing samples do not establish production performance, failover, sustained capacity or a competitor comparison. Reports retain losses and unexpected results instead of treating successful query execution as successful retrieval quality.

The cumulative authorized budget is $30. Tests reuse the learning hardware, do not resize it and pause it between batches. Retained storage still has a cost; actual billed totals are delayed. Credentials and account screenshots are excluded from the evidence bundles.
