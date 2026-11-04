# Couchbase AI learning lab

An evidence-based learning audit, conducted November 3, 2026. This is an experimental lab, not a production application or a Couchbase performance benchmark.

## What works today

- This assistant can select tools in response to ordinary language.
- The original read-only Couchbase MCP connector queries travel-sample.
- A separate paid learning cluster contains 50 hotel documents and a Search vector index.
- Local BAAI/bge-small-en-v1.5 embeddings (384 dimensions) power those hotel searches.
- Live Capella UI vector searches, hybrid queries, and strict pre-filters were tested.

## Connection boundaries

The MCP connector still targets the original database. The paid hotel vector collection was tested through the Capella UI, with queries prepared by the assistant. No successful paid Model Service generation or autonomous Capella-model tool-selection run has been demonstrated. A direct agent-to-paid-cluster connector remains unfinished and needs a scoped database credential.

## Findings

| Check | Observation |
|---|---|
| Five answerable semantic questions | Appropriate first result in each small hand-selected test |
| France AND pets | Exactly three expected records |
| France AND pets AND parking | Exactly one expected record; repeat consistent |
| Nonexistent country | Zero results |
| No-answer semantic query: hotel on Mars | Still returned Earth hotels |
| Campsite requiring water | Third-ranked result explicitly had no water |
| Source contradiction | Description said Dogs admitted while pets_ok was false; filter followed the flag |
| Three-dimensional query against 384D index | UI displayed zero results without a visible error; underlying API error handling not established |
| Country in ordinary hybrid query | Returned France plus US/UK vector hits; not a mandatory filter |
| Lowercase france exact term | Zero results with keyword-analyzed country field |
| Singular kitchen keyword | Zero results; vector search found a full-kitchens property |

## How to ask in chat

Example: Find a peaceful hotel in France that allows pets and has free parking.

The assistant should show the selected retrieval operation, semantic query, mandatory structured filters, returned source IDs, and evidence for its answer. If no hotel satisfies the request, it should say so. Similarity scores are not probabilities or proof that every requirement is satisfied.

## Reproduce the vector setup

1. Create a separate test collection, vector-learning.demo.hotels.
2. Select hotel descriptions from Couchbase travel-sample; the tested corpus contains 50 records and is not representative.
3. Embed names plus descriptions using BAAI/bge-small-en-v1.5 passage embeddings. Embed questions with the same model using query embeddings.
4. Import records with embedding arrays and source_id document keys.
5. Import setup/hotel-search-index.json. It indexes vectors using 384 dimensions and cosine similarity, text for retrieval, and structured fields for filtering.
6. Replay requests saved in results/vector-strict-filter-tests.json. Requests include the query vectors; source hotel records must match the original sample to reproduce exact results.

## Evidence and limits

results/ contains sanitized observations and requests. The initial UI evidence is partial, so it is not a complete replay log of every initial search. Local baseline results are explicitly separate from live Couchbase results. UI server-side timings on 50 documents do not establish production latency or throughput. These are retrieval checks, not tests of authorization isolation, Agent Memory, large-scale indexing, or an end-to-end generative agent.

No credentials, account screenshots, or original console URLs are included. Configure connections privately. Do not commit secrets.
