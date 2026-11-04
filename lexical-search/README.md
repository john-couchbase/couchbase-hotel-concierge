# Lexical and hybrid search

[NoSQL](../nosql/README.md) · [Vector Search](../vector-search/README.md)

Native Couchbase tests cover stop words, stemming, synonyms, phrases, typos, accents, identifiers, hybrid filters and validation. The current hotel index uses standard analysis for descriptions and keyword analysis for countries.

Key findings: English stemming recovers kitchen/kitchens; preserving stop words recovers The Who; configured synonyms connect car/automobile. Text search does not reliably enforce negation. Mandatory restrictions must apply to both hybrid branches. Invalid vectors and unknown fields need validation to distinguish malformed requests from no matches.

The detailed report and evidence archive preserve successes, failures and reproducibility limits.
