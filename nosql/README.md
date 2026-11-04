# NoSQL learning lab

Couchbase stores application objects as JSON documents and gives each document a unique key. NoSQL is a broad category; JSON is Couchbase's document model, not the definition of all NoSQL databases.

An order can contain its customer snapshot, shipping address and line-item array in one document. The application can fetch that whole order by its key, change a few fields atomically, or use SQL++ to find many matching orders. SQL++ resembles SQL and adds ways to work with nested JSON and arrays.

```json
{"order_id":42,"status":"paid","shipping":{"country":"FR"},"items":[{"sku":"SKU7","qty":2}]}
```

```sql
SELECT o.order_id, o.total_cents
FROM orders o
WHERE o.status = $status AND o.shipping.country = $country
ORDER BY o.order_id LIMIT 20;
```

## What the two access paths mean

- **Known key:** `get("order::42")` directly fetches one document using the key-value service. It does not need a query index.
- **Find by properties:** SQL++ uses query indexes to find matching documents. A primary index lists document keys; a selective secondary index helps locate matches. A covering index contains all fields required by a query, avoiding document fetches.
- **Nested fields and arrays:** query an address inside an order or find orders containing a SKU. Array indexes can support the latter.
- **Partial update:** change an address or increment a counter within a document without shipping the whole document back.

## Wins and costs to understand

| Choice | Win | Cost or responsibility |
|---|---|---|
| Embedded order document | One read retrieves related fields; single-document atomic updates | Large documents cost more bandwidth; a copied customer profile can become stale |
| Referenced customer document | One current customer profile | Extra lookup or join when needed |
| Flexible schema | Add fields gradually without rewriting every record | Applications must handle absent fields, nulls, old versions and type differences |
| Covering secondary index | Efficient filters and projections | Extra storage, build time and maintenance on writes; designed around access patterns |
| CAS version check | Rejects an update based on an obsolete document | App must resolve or retry the conflict |
| Multi-document transaction | Commit related changes together or roll them back | More coordination and latency than independent operations |
| Default query consistency | Avoid waiting for index catch-up | Recently written data may not yet appear in indexed queries |
| REQUEST_PLUS query consistency | Wait for indexes to catch up before evaluating | Can add latency under write pressure |

## Low scale versus larger scale

At low scale, an embedded document can simplify application code, and slow scan patterns may look acceptable. For a small application, operating a separate managed cluster and maintaining indexes can be unnecessary overhead compared with an existing relational service.

At larger scale, known-key access and well-designed indexes become valuable. Costs come from working-set size, document sizes, access skew, concurrency, index count and write volume—not document count alone. Distributed data placement and replicas help support growth and availability, but these tests use one node with zero replicas. A million small documents does not demonstrate production-scale capacity, failover or multi-node linear scaling.

The lab compares four deterministic order datasets on the existing hardware. Raw results and query plans accompany the measured report. Client timings include the laptop-to-cloud network. Results are exploratory, with small timing samples and synthetic data, not a vendor benchmark or a relational-database comparison.

## Separate tracks

[Vector search](../vector-search/README.md) has its own findings. Lexical/full-text search is the next queued topic: inspect actual analyzers, tokenization, stop words, stemming, synonyms, domain vocabulary, phrase/fuzzy matching and hybrid retrieval. That lexical audit has not been run in this NoSQL batch.

## Sources

- [Couchbase document model](https://docs.couchbase.com/server/current/learn/data/document-data-model.html)
- [Python SDK key-value operations](https://docs.couchbase.com/python-sdk/current/howtos/kv-operations.html)
- [Subdocument operations](https://docs.couchbase.com/python-sdk/current/howtos/subdocument-operations.html)
- [Query consistency](https://docs.couchbase.com/python-sdk/current/concept-docs/n1ql-query.html)
- [Transactions](https://docs.couchbase.com/python-sdk/current/howtos/distributed-acid-transactions-from-the-sdk.html)

## Measured results

Native Couchbase tests on November 3, 2026 (Pacific time). All times below are client measurements, including the network.

| Documents | Bulk load seconds | Primary scan ms | Covering query ms | Known-key read ms |
|---:|---:|---:|---:|---:|
| 100 | 0.2 | 85.7 | 81.8 | 77.7 |
| 10,000 | 1.3 | 401.3 | 82.3 | 77.6 |
| 100,000 | 10.5 | 2849.0 | 84.0 | 77.3 |
| 1,000,000 | 102.4 | TIMEOUT 60s | 80.5 | 77.1 |

Filtered-query values are medians of five runs, KV values of twenty reads. Data is synthetic, roughly 300-byte JSON orders, with controlled filters. Load uses four workers and batches of 250. Concurrent read sweeps use 160 reads each, not sustained capacity testing. Primary and covering queries return identical ordered results; EXPLAIN confirms intended indexes. Index-build time is excluded from the query measurements.

**55 recorded checks passed**, plus the intentional lost-update demonstration (120 instead of 130 without CAS). This is a count of recorded scenarios, not every individual database operation.

**Loss:** the first 1-million-document primary-scan request timed out at 60 seconds. The original runner stopped; a targeted follow-up continued with a covering index and the remaining checks. The follow-up harness also had a missing Python variable in its final join step; that harness error was corrected and the join rerun separately. Missing/null aggregation and array-index tests were limited to 100k to avoid more expensive scans.

### Behavior observed

- Stale CAS writes rejected; atomic partial updates and rollback on a failed subdocument path worked.
- Duplicate insert rejected and a three-second TTL expired.
- Missing and null fields had distinct, correct counts.
- Mixed numeric/string/null/missing fields were accepted; schema flexibility leaves validation to the application. A 100-operation, eight-worker atomic counter lost no increments.
- Bound injection-like input returned no records; array-index results matched exact expected counts.
- Multi-document transfer committed both balances or rolled both back on intentional rejection. Single-node transaction success does not prove failover durability.
- Read-after-write: default consistency was stale in 0/40 trials; REQUEST_PLUS saw the current write in 40. No observed default staleness in this light workload is not a freshness guarantee.
- Updating the referenced customer to platinum left the embedded order snapshot at gold: copying data requires a freshness policy.

### Index and concurrency costs

At one million records, the primary index reported 5.2 MiB disk and 39.7 MiB accounted memory; the covering index reported 27.2 MiB disk and 154.4 MiB accounted memory. Both had one million indexed items and zero pending documents at capture. This is an index snapshot, not peak process memory. The speedup requires additional storage and maintenance; write amplification was not separately measured.

Across the read sweeps, eight client workers achieved roughly 96–102 reads/second at the first three sizes, compared with roughly 8–13 for one worker. The 10k single-worker run had latency outliers (p95 about 318 ms). These short WAN client tests are not a database throughput ceiling or evidence of linear server scaling.


### Evidence and reproducibility

[Raw results](results.json), [query plans](plans.json), [transactions](transactions.json), [index statistics](index-stats.json), [runner](nosql_runner.py), [transaction runner](nosql_transactions.py). These scripts are exploratory lab code. Provision the isolated scope and collections, supply a private scoped credential, and change the example endpoint for your environment. Running the main script writes documents and creates indexes; use fresh collections to rerun. Do not commit credentials. The raw timing arrays are retained.

### Not tested

Multi-node scale-out, failover, backups/restores, cross-region replication, long-running hot-key contention, production-sized documents, schema-validation enforcement, sustained saturation, and comparison against a relational database. No new node or paid service was provisioned for this batch. Cluster shutdown limits compute charges; retained storage still costs money. The full $30 cap remains cumulative; delayed billing prevents an exact live invoice total.
