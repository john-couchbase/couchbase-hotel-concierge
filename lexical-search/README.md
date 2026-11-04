# Lexical and hybrid search: native audit

[NoSQL](../nosql/README.md) · [Vector Search](../vector-search/README.md) · [Evidence archive](../native-lexical-audit.zip)

## What lexical search means

Lexical search matches words or tokens. An analyzer turns text into tokens at indexing time and for analyzed queries. An inverted index maps those tokens to matching documents. Relevance scoring orders the matches. A `match` query analyzes input; a `term` query looks for an exact indexed token. Vector search instead compares embeddings. Combining them does not make either signal a mandatory business filter.

The current hotel index was read live: `name` and `description` use `standard`; country/city/source ID use `keyword`; its mapping has no custom analysis or synonym source, and no explicit scoring override. Standard analysis lowercases, splits words and removes English stop words, but does not provide English stemming. Keyword fields preserve a whole value such as `France`.

These Search-service indexes are separate from the SQL++ Hyperscale vector indexes tested in the vector-scale audit. The lexical tests do not establish lexical behavior inside a Hyperscale index.

## Native results

All searches below ran on the existing Couchbase 8.0.3 Capella learning cluster. Seventeen deliberately small text documents, one synonym document, and two separate Search indexes were used. Embeddings were generated locally with cached BAAI/bge-small-en-v1.5 (384 dimensions); indexing and retrieval ran in Couchbase. No paid model generation was used. This is a behavior audit, not a scale or latency benchmark.

| Capability | Observed result | Trade-off |
|---|---|---|
| English stemming | Standard `kitchen` matched only singular; `en` matched kitchen and kitchens. `run` also matched running with `en`. | More recall; a stem is not full semantic understanding. |
| Stop words | Standard query `The Who` returned nothing. A custom analyzer preserving stop words found the band record. | Removing common words can destroy names or meaningful wording. |
| Case handling | Analyzed `KITCHEN` matched; exact uppercase term did not. `France` matched the keyword country field; `france` did not. | Normalize identifiers deliberately; choose match vs term consciously. |
| Phrase matching | `free parking` as a phrase matched the adjacent words only. AND matching also found `free covered parking`. | Phrase precision can miss legitimate paraphrases. |
| Typo tolerance | `kithen` returned nothing normally; fuzziness 1 found kitchen. | Fuzzy expansion can introduce unwanted matches; tune by field. |
| Synonyms | With the configured car/automobile mapping, either term found both documents; without it, only the literal term matched. | Domain mappings need curation. They are not automatically inferred by an LLM. |
| Custom buzzword removal | Removing innovative/seamless made innovative alone match nothing; innovative platform then matched both platform documents. | An ignored term stops narrowing the result set; no automatic buzzword detector was tested. |
| Accent folding | Default cafe missed café; a custom ASCII-folding analyzer matched both. | Can merge distinctions that matter in some languages/names. |
| Identifiers | Exact AB-123 matched the code field; partial AB did not. | Identifier fields need different treatment from prose. |
| Prefix/wildcard | kitch and kitch* queries found both kitchen forms. | This checks matching behavior only; broad-pattern performance was not measured. |
| Highlighting/facets | Matching phrase positions were highlighted; country counts were returned for parking results. | Only mapped/stored fields and appropriate term vectors are available. |

## Important losses and surprises

**Negation is not a reliable lexical constraint.** `no parking` matched no-parking, free-parking and covered-parking documents. The actual token analysis removed `no`. An explicit parking=true predicate excluded the no-parking record. Similarly, a good vector score did not prevent the no-parking record appearing among nearest neighbors.

**Hybrid search is a union of signals unless constrained.** A France keyword query plus vector retrieval returned UK documents. Restricting only vector candidates still allowed an unrestricted UK keyword match. Restricting both branches to France returned only France. Adding parking=true to both branches honored both flags. An impossible Mars restriction on both branches returned zero. Filters establish eligibility, not semantic relevance; some eligible vector neighbors were still weak text matches.

**Validation matters.** A nonexistent field quietly returned zero without validation and returned HTTP 400 with `ctl.validate=true`. A 3-D query vector sent to the 384-D index similarly returned HTTP 200 with zero hits by default; validation produced HTTP 400. A zero-result response alone cannot distinguish no matches from malformed inputs. Validate vector dimensions in the application too.

**Synonym collection boundary:** unrestricted match-all returned 18 records, including the synonym document. Explicit `collections:["texts"]` returned the intended 17. The synonym collection was not configured as a searchable type mapping. This is a reproducible boundary behavior to investigate; do not infer a security defect from this one setup. The harness now selects the intended collection explicitly.

**Scoring configuration:** this server rejected explicit `scoring_model:"tfidf"` as unsupported, although the Capella Search Index Features documentation lists that spelling. Omitting the setting worked; `bm25` worked. Raw rejection evidence is retained. Default and BM25 produced the same parking-only order on this small corpus, but changed positions in a hybrid result. This does not show one ranking model is generally better.

**Permissions:** scoped basic data read/write access could query but could not create Search indexes (403). A temporary role with bucket-scoped `ftsManage` created the two lab indexes; its credential and role were removed after testing. Existing hotel indexes were not modified. An initial SDK bootstrap attempt shortly after resume timed out; a later probe succeeded with both credentials, and an explicit bootstrap timeout was used. No new IP rule or relaxed TLS setting was needed.

## What the existing hotel search does today

Live hotel baselines returned zero for kitchen, one for kitchens, zero for the stop word the, zero for lowercase country france, and six for exact country France. These confirm that analyzer/normalization choices explain real misses in the current hotel demo. The country count is the current live dataset observation, not a universal dataset count.

## Evidence and limits

41 main searches succeeded; 29 exact expected-result-set checks and eight hybrid country-behavior checks passed. Five existing-hotel baselines and 13 follow-up requests cover validation, boundaries, tokens, facets and highlighting. Expected error responses are useful findings, not successful searches. The initial analyzeDoc request used the wrong type field and returned an empty token list; using the configured `type` field produced actual server-side token analysis. That harness correction is retained in the evidence.

The archive includes JSON definitions, source text/embeddings, requests, scores/explanations, expected sets, raw responses, token analysis, scripts and shutdown evidence. Collection readiness checks and administrative requests are not included in the search-case count. Performance at scale, multilingual quality, synonym maintenance under concurrent writes, tenant isolation, production relevance, sustained latency, and failover were not evaluated. No corpus-wide quality score or statistical improvement is claimed.

## How to use the controls

Use keyword fields for exact codes/countries, an appropriate language analyzer for prose, and preserve words when names or negation matter. Keep mandatory restrictions as explicit predicates on every hybrid retrieval branch. Curate synonyms for business vocabulary; do not assume synonym configuration rewrites vectors. Use validation and inspect returned source records before making claims.

## Sources

- [Default analyzers](https://docs.couchbase.com/cloud/search/default-analyzers-reference.html)
- [Index configuration and scoring options](https://docs.couchbase.com/cloud/search/customize-index.html)
- [Index JSON properties](https://docs.couchbase.com/cloud/search/search-index-params.html)
- [Synonym documents](https://docs.couchbase.com/cloud/search/synonyms/create-synonym-collection-docs.html)
- [Synonym behavior and vector limitations](https://docs.couchbase.com/server/current/search/synonyms/synonyms-search.html)
- [Query validation](https://docs.couchbase.com/server/current/search/simple-search-ui.html)
- [Collection-scoped search options](https://docs.couchbase.com/python-sdk/current/howtos/full-text-searching-with-sdk.html)
